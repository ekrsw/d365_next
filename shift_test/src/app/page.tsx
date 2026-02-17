import { LayoutDashboard, Users, Calendar, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const [employeeCount, groupCount, shiftCount] = await Promise.all([
    prisma.employee.count({ where: { terminationDate: null } }),
    prisma.group.count(),
    prisma.shift.count(),
  ]);

  const stats = [
    {
      title: "在籍従業員数",
      value: employeeCount,
      icon: Users,
      href: "/employees",
    },
    {
      title: "グループ数",
      value: groupCount,
      icon: Building2,
      href: "/groups",
    },
    {
      title: "シフトデータ",
      value: shiftCount.toLocaleString(),
      icon: Calendar,
      href: "/shifts",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
