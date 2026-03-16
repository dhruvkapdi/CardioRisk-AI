import { useAuth } from "@/hooks/use-auth";
import { useHealthProfiles } from "@/hooks/use-health-profiles";
import { HealthProfilesPage } from "@/components/HealthProfilesPage";

export default function ProfilesRoute() {
  const { user } = useAuth();
  const {
    profiles, loading, activeProfileId, setActiveProfileId,
    createProfile, updateProfile, deleteProfile,
  } = useHealthProfiles(user?.id);

  if (!user) return null;

  return (
    <HealthProfilesPage
      userId={user.id}
      profiles={profiles}
      loading={loading}
      activeProfileId={activeProfileId}
      onSelectProfile={setActiveProfileId}
      onCreate={createProfile}
      onUpdate={updateProfile}
      onDelete={deleteProfile}
    />
  );
}
