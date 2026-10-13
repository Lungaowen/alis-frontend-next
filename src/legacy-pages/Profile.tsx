import { useEffect, useState } from "react";
import { User, Mail, Building2, Briefcase, Calendar, Shield, CheckCircle, XCircle } from "lucide-react";
import { PortalLayout } from "@/components/app/PortalLayout";
import { Spinner, EmptyState } from "@/components/app/Primitives";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientProfile, type ClientProfile } from "@/lib/alis";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getClientProfile();
        setProfile(data);
      } catch (e) {
        toast.error((e as Error)?.message ?? "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <PortalLayout title="Profile"><Spinner /></PortalLayout>;
  if (!profile) return <PortalLayout title="Profile"><EmptyState title="Profile not found" description="Unable to load your profile information." /></PortalLayout>;

  const isLegal = profile.role === "LEGAL_PRACTITIONER";
  const isDealMaker = profile.role === "DEAL_MAKER";

  return (
    <PortalLayout
      title="My Profile"
      eyebrow={profile.role.replace("_", " ")}
      description="View and manage your account information"
    >
      <div className="space-y-6">
        {/* Account Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {profile.active ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">Active</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">Inactive</span>
                </>
              )}
              {profile.deactivatedAt && (
                <span className="text-sm text-muted-foreground ml-4">
                  Deactivated: {new Date(profile.deactivatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileField icon={<User className="h-4 w-4" />} label="Full Name" value={profile.fullName} />
            <ProfileField icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
            <ProfileField icon={<User className="h-4 w-4" />} label="Username" value={profile.username} />
            <ProfileField icon={<Calendar className="h-4 w-4" />} label="Member Since" value={format(new Date(profile.createdAt), "PPP")} />
            <ProfileField icon={<Shield className="h-4 w-4" />} label="Role" value={<Badge variant="outline">{profile.role.replace("_", " ")}</Badge>} />
          </CardContent>
        </Card>

        {/* Role-Specific Information Card */}
        {(isLegal || isDealMaker) && (
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Your role-specific details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLegal && (
                <>
                  <ProfileField icon={<Briefcase className="h-4 w-4" />} label="Bar Number" value={profile.barNumber || "Not provided"} />
                  <ProfileField icon={<Building2 className="h-4 w-4" />} label="Law Firm" value={profile.lawFirm || "Not provided"} />
                </>
              )}
              {isDealMaker && (
                <>
                  <ProfileField icon={<Building2 className="h-4 w-4" />} label="Company Name" value={profile.companyName || "Not provided"} />
                  <ProfileField icon={<Briefcase className="h-4 w-4" />} label="Deal Specialty" value={profile.dealSpecialty || "Not provided"} />
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base">{value}</p>
      </div>
    </div>
  );
}
