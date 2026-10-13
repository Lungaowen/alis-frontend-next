import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [clientId, setClientId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleClientIdSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) {
      toast.error("Please enter your Client ID");
      return;
    }

    const clientIdNum = parseInt(clientId);
    if (isNaN(clientIdNum) || clientIdNum <= 0) {
      toast.error("Please enter a valid Client ID");
      return;
    }

    setLoading(true);
    try {
      navigate(`/reset-password?clientId=${clientIdNum}`);
    } catch (e) {
      toast.error((e as Error)?.message ?? "Failed to proceed to password reset");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (e) {
      toast.error((e as Error)?.message ?? "Failed to proceed to password reset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Choose how you want to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="clientId" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clientId">By Client ID</TabsTrigger>
              <TabsTrigger value="email">By Email</TabsTrigger>
            </TabsList>
            <TabsContent value="clientId" className="mt-4">
              <form onSubmit={handleClientIdSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientId"
                      type="number"
                      placeholder="Enter your Client ID"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your Client ID can be found in your profile or account settings
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Proceeding...</> : "Continue to Reset Password"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="email" className="mt-4">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the email address associated with your account
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Proceeding...</> : "Continue to Reset Password"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
