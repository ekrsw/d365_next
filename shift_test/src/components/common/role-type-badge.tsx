import { Badge } from "@/components/ui/badge";

const roleTypeConfig: Record<string, { label: string; className: string }> = {
  FUNCTION: {
    label: "業務役割",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  AUTHORITY: {
    label: "監督権限",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  POSITION: {
    label: "役職",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
};

interface RoleTypeBadgeProps {
  roleType: string;
  roleName?: string;
}

export function RoleTypeBadge({ roleType, roleName }: RoleTypeBadgeProps) {
  const config = roleTypeConfig[roleType] || roleTypeConfig.FUNCTION;
  return (
    <Badge variant="outline" className={config.className}>
      {roleName || config.label}
    </Badge>
  );
}
