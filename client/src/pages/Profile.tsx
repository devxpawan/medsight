import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL + "/api" || "http://localhost:5000/api";

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Name required").max(50),
});

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  useEffect(() => {
    setDisplayName(user?.displayName || "");
  }, [user]);

  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = profileSchema.safeParse({
      displayName,
    });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(result.data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      const userData = {
        id: data._id,
        email: data.email,
        displayName: data.displayName,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      updateUser(userData);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-md py-12">
        <div className="space-y-6 rounded-2xl bg-card p-6 shadow-card">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-sm text-muted-foreground">Update your account details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : "Save changes"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;