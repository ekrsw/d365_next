import { Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface OwnerCount {
  owner: string;
  count: number;
}

interface OwnerTableProps {
  ownerCounts: OwnerCount[];
  totalCount: number;
}

function getRankStyle(index: number) {
  switch (index) {
    case 0:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case 1:
      return "bg-slate-300/10 text-slate-600 dark:text-slate-400 border-slate-400/20";
    case 2:
      return "bg-orange-600/10 text-orange-700 dark:text-orange-400 border-orange-600/20";
    default:
      return "bg-muted text-muted-foreground border-transparent";
  }
}

export function OwnerTable({ ownerCounts, totalCount }: OwnerTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-500" />
          <div>
            <CardTitle>オペレーター別完了件数</CardTitle>
            <CardDescription>担当者ごとの処理実績</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {ownerCounts.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            データがありません
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">順位</TableHead>
                <TableHead>オペレーター</TableHead>
                <TableHead className="text-right w-[80px]">件数</TableHead>
                <TableHead className="w-[200px]">割合</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownerCounts.map((item, index) => {
                const percentage = (item.count / totalCount) * 100;
                return (
                  <TableRow key={item.owner}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`w-8 justify-center font-mono ${getRankStyle(index)}`}
                      >
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.owner}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-bold tabular-nums">
                        {item.count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={percentage} className="h-2 flex-1" />
                        <span className="text-sm text-muted-foreground tabular-nums w-[48px] text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
