import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Reset link sent! Check your inbox.");
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <>
      <Header />
      <main className="container py-24 sm:py-32">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-bold">Forgot password</h1>
          <p className="mt-3 text-muted-foreground">
            Enter your email address and we’ll send you a link to reset your password.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ForgotPassword;
