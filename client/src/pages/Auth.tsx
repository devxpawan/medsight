import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, X } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(100),
});
const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(1, "Name required").max(50),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = signInSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to sign in");
      
      signIn(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = signUpSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
      displayName: fd.get("displayName"),
    });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create account");
      
      signIn(data.token, data.user);
      toast.success("Welcome! You're signed in.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="relative w-full max-w-md space-y-6 rounded-3xl bg-card p-8 shadow-soft">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={() => navigate("/")}
            className="absolute right-3 top-3 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-warm shadow-soft">
              <Pill className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-semibold">Welcome to MedShare</h1>
            <p className="text-sm text-muted-foreground">
              Share medicines, help others recognize them.
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input id="displayName" name="displayName" required maxLength={50} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up">Email</Label>
                  <Input id="email-up" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-up">Password</Label>
                  <Input id="password-up" name="password" type="password" required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
