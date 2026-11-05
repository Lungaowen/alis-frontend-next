import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type RegistrationType = "DEAL_MAKER" | "LEGAL_PRACTITIONER";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [registrationType, setRegistrationType] = useState<RegistrationType>("DEAL_MAKER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [dealSpecialty, setDealSpecialty] = useState("");
  const [barNumber, setBarNumber] = useState("");
  const [lawFirm, setLawFirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const registrationData: any = {
        fullName,
        email,
        password,
        role: registrationType,
      };

      if (registrationType === "DEAL_MAKER") {
        registrationData.companyName = companyName;
        registrationData.dealSpecialty = dealSpecialty;
      } else if (registrationType === "LEGAL_PRACTITIONER") {
        registrationData.barNumber = barNumber;
        registrationData.lawFirm = lawFirm;
      }

      await register(registrationData);
      toast.success("Account created");
      try {
        await login(email, password);
        navigate("/dashboard", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register as a Deal Maker or Legal Practitioner"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="story-link font-medium text-foreground">
            Sign in
          </Link>
        </>
      }
    >
      <div className="flex gap-2 mb-6">
        <Button
          type="button"
          variant={registrationType === "DEAL_MAKER" ? "hero" : "outline"}
          size="lg"
          className="flex-1"
          onClick={() => setRegistrationType("DEAL_MAKER")}
        >
          Deal Maker
        </Button>
        <Button
          type="button"
          variant={registrationType === "LEGAL_PRACTITIONER" ? "hero" : "outline"}
          size="lg"
          className="flex-1"
          onClick={() => setRegistrationType("LEGAL_PRACTITIONER")}
        >
          Legal Practitioner
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Thandi Nkosi"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@firm.co.za"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>

        {registrationType === "DEAL_MAKER" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Blue Horizon Capital"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealSpecialty">Deal specialty</Label>
              <Input
                id="dealSpecialty"
                required
                value={dealSpecialty}
                onChange={(e) => setDealSpecialty(e.target.value)}
                placeholder="SME acquisitions"
              />
            </div>
          </>
        )}

        {registrationType === "LEGAL_PRACTITIONER" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="barNumber">Bar number</Label>
              <Input
                id="barNumber"
                required
                value={barNumber}
                onChange={(e) => setBarNumber(e.target.value)}
                placeholder="LP-2026-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lawFirm">Law firm</Label>
              <Input
                id="lawFirm"
                required
                value={lawFirm}
                onChange={(e) => setLawFirm(e.target.value)}
                placeholder="Mokoena Legal"
              />
            </div>
          </>
        )}

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            `Register as ${registrationType === "DEAL_MAKER" ? "Deal Maker" : "Legal Practitioner"}`
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
