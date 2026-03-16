import { User, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HealthProfile } from "@/hooks/use-health-profiles";

interface ProfileSelectorProps {
  profiles: HealthProfile[];
  activeProfileId: string | null;
  onSelect: (id: string | null) => void;
}

export function ProfileSelector({ profiles, activeProfileId, onSelect }: ProfileSelectorProps) {
  if (profiles.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
        <User className="w-4 h-4" />
        <span className="font-medium">Profile:</span>
      </div>
      <Select
        value={activeProfileId ?? "none"}
        onValueChange={v => onSelect(v === "none" ? null : v)}
      >
        <SelectTrigger className="bg-background max-w-xs">
          <SelectValue placeholder="Select a profile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No profile (manual entry)</SelectItem>
          {profiles.map(p => (
            <SelectItem key={p.id} value={p.id}>
              {p.profile_name} ({p.relation})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
