import { CalendarDays, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardsProps {
  date: string;
  totalCount: number;
  ownerCount: number;
}

export function SummaryCards({
  date,
  totalCount,
  ownerCount,
}: SummaryCardsProps) {
  const displayDate = date === "today" ? "本日" : date;

  const cards = [
    {
      title: "対象日",
      value: displayDate,
      icon: CalendarDays,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "完了案件数",
      value: `${totalCount}`,
      suffix: "件",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "対応者数",
      value: `${ownerCount}`,
      suffix: "名",
      icon: Users,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "平均処理数",
      value: ownerCount > 0 ? (totalCount / ownerCount).toFixed(1) : "0",
      suffix: "件/人",
      icon: TrendingUp,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="relative overflow-hidden transition-all hover:shadow-md"
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {card.value}
                  </span>
                  {card.suffix && (
                    <span className="text-sm text-muted-foreground">
                      {card.suffix}
                    </span>
                  )}
                </div>
              </div>
              <div className={`${card.bgColor} rounded-full p-2.5`}>
                <card.icon className={`size-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
