import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  isActive: boolean;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  return isActive ? (
    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
      ● 在籍
    </Badge>
  ) : (
    <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-500">
      ○ 退職
    </Badge>
  );
}
