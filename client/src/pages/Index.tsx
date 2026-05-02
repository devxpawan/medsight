import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { MedicineCard } from "@/components/MedicineCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Pill } from "lucide-react";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

interface Medicine {
  _id: string;
  name: string | null;
  illness: string;
  image_urls: string[];
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "MedShare — Visual library of medicines for common illnesses";
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/medicines`);
        if (res.ok) {
          const data = await res.json();
          setMedicines(data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? medicines.filter(m =>
        m.illness.toLowerCase().includes(q) ||
        (m.name?.toLowerCase().includes(q) ?? false)
      )
    : medicines;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-soft border-b border-border/60">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl space-y-5 text-center">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              A visual library of <span className="text-primary">everyday medicines</span>
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Search by illness to see what others have used. Share your own to help the next person recognize it.
            </p>
            <div className="relative mx-auto max-w-lg">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by illness or medicine name…"
                className="h-12 rounded-full border-border bg-card pl-11 pr-4 shadow-card"
              />
            </div>
            <Button
              size="lg"
              className="rounded-full bg-gradient-warm shadow-soft"
              onClick={() => navigate(user ? "/upload" : "/auth")}
            >
              <Plus className="h-4 w-4" /> Share a medicine
            </Button>
          </div>
        </div>
      </section>

      <main className="container py-10">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Pill className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {medicines.length === 0 ? "No medicines yet — be the first to share one!" : "No matches found."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((m) => (
              <MedicineCard
                key={m._id}
                id={m._id}
                name={m.name}
                illness={m.illness}
                imageUrl={m.image_urls[0] ? (m.image_urls[0].startsWith('http') ? m.image_urls[0] : `${SERVER_URL}${m.image_urls[0]}`) : undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
