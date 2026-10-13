import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword, type ResetPasswordResponse } from "@/lib/alis";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");
  const email = searchParams.get("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!clientId && !email) {
      toast.error("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(
        clientId ? parseInt(clientId) : undefined,
        email || undefined,
        newPassword
      );
      toast.success(response.message);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (e) {
      toast.error((e as Error)?.message ?? "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been successfully updated. You will be redirected to login shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resetMethod = clientId ? `Client ID #${clientId}` : email ? email : "Unknown";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Resetting password for: <span className="font-medium">{resetMethod}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</> : "Reset Password"}
            </Button>
          </form>
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
