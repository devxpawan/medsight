import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";

const MAX_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 3;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  illness: z.string().trim().min(1, "Illness is required").max(100),
  notes: z.string().trim().max(1000).optional(),
});

interface PreviewFile { file?: File; url: string; }

const EditMedicinePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);
  
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/medicines/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user_id !== user.id) {
            toast.error("Not authorized to edit this medicine");
            navigate("/");
            return;
          }
          setInitialData(data);
          
          if (data.image_urls) {
            setFiles(data.image_urls.map((url: string) => ({ 
              url: url.startsWith('http') ? url : `${SERVER_URL}${url}` 
            })));
          }
        } else {
          toast.error("Medicine not found");
          navigate("/");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid: PreviewFile[] = [];
    for (const f of selected) {
      if (!ACCEPTED.includes(f.type)) { toast.error(`${f.name}: only JPG, PNG, WEBP`); continue; }
      if (f.size > MAX_SIZE) { toast.error(`${f.name}: max 5MB`); continue; }
      valid.push({ file: f, url: URL.createObjectURL(f) });
    }
    const merged = [...files, ...valid].slice(0, MAX_IMAGES);
    setFiles(merged);
    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    if (files[idx].file) {
      URL.revokeObjectURL(files[idx].url);
    }
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const fd = new FormData(e.currentTarget);
    const result = schema.safeParse({
      name: (fd.get("name") as string) || undefined,
      illness: fd.get("illness"),
      notes: (fd.get("notes") as string) || undefined,
    });
    if (!result.success) { toast.error(result.error.issues[0].message); return; }

    setSubmitting(true);
    try {
      const uploadData = new FormData();
      if (result.data.name) uploadData.append("name", result.data.name);
      uploadData.append("illness", result.data.illness);
      if (result.data.notes) uploadData.append("notes", result.data.notes);
      
      const newFiles = files.filter(f => f.file);
      newFiles.forEach(({ file }) => {
        uploadData.append("images", file as File);
      });

      const existingImages = files.filter(f => !f.file).map(f => f.url);
      uploadData.append("existingImages", JSON.stringify(existingImages));

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/medicines/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: uploadData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      toast.success("Medicine updated!");
      navigate(`/medicine/${id}`);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-2xl py-8">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl py-8">
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Edit medicine</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-card p-6 shadow-card">
          <div className="space-y-3">
            <Label>Photos</Label>
            <div className="grid grid-cols-3 gap-3">
              {files.map((f, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <img src={f.url} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button" onClick={() => removeFile(i)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-soft transition-smooth hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {files.length < MAX_IMAGES && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground transition-smooth hover:border-primary hover:bg-primary-soft hover:text-primary">
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Add photo</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Up to {MAX_IMAGES} photos · Max 5MB each · JPG, PNG, WEBP.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="illness">Illness <span className="text-destructive">*</span></Label>
            <Input id="illness" name="illness" defaultValue={initialData.illness} placeholder="e.g. Fever, Cold, Headache" required maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Medicine name <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="name" name="name" defaultValue={initialData.name || ""} placeholder="e.g. Paracetamol 500mg" maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea id="notes" name="notes" defaultValue={initialData.notes || ""} placeholder="Dosage, when to take, anything helpful…" rows={4} maxLength={1000} />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : "Save changes"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default EditMedicinePage;
