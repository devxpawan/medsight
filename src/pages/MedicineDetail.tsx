import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Medicine {
  id: string;
  name: string | null;
  illness: string;
  notes: string | null;
  image_urls: string[];
  created_at: string;
  user_id: string;
}

const MedicineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [uploader, setUploader] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    document.title = medicine?.name
      ? `${medicine.name} · ${medicine.illness} | MedShare`
      : "Medicine details | MedShare";
  }, [medicine]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("medicines").select("*").eq("id", id).maybeSingle();
      setMedicine(data);
      if (data) {
        const { data: profile } = await supabase
          .from("profiles").select("display_name").eq("id", data.user_id).maybeSingle();
        setUploader(profile?.display_name ?? null);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl py-8">
          <Skeleton className="aspect-video w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-12 text-center">
          <p className="text-muted-foreground">Medicine not found.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">← Back to library</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-4xl py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to library
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl bg-muted shadow-card">
              {medicine.image_urls[active] ? (
                <img src={medicine.image_urls[active]} alt={medicine.name || medicine.illness}
                  className="h-full w-full object-cover" />
              ) : null}
            </div>
            {medicine.image_urls.length > 1 && (
              <div className="flex gap-2">
                {medicine.image_urls.map((url, i) => (
                  <button key={i} onClick={() => setActive(i)}
                    className={`h-16 w-16 overflow-hidden rounded-lg transition-smooth ${
                      i === active ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
                    }`}>
                    <img src={url} alt={`${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <article className="space-y-5">
            <div className="space-y-2">
              <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">{medicine.illness}</Badge>
              <h1 className="text-3xl font-semibold tracking-tight">
                {medicine.name || "Unnamed medicine"}
              </h1>
            </div>

            {medicine.notes && (
              <div className="rounded-xl bg-muted/60 p-4">
                <h2 className="mb-1 text-sm font-medium text-muted-foreground">Notes</h2>
                <p className="whitespace-pre-wrap text-sm text-foreground">{medicine.notes}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{uploader || "Anonymous"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{new Date(medicine.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="rounded-xl bg-accent/60 p-3 text-xs text-accent-foreground">
              ⚠️ User-submitted information, not medical advice. Always consult a doctor.
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default MedicineDetail;
