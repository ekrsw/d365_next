import { List } from "lucide-react";
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

interface Incident {
  callNumber: number;
  completedOn: string;
  completedOnJST: string;
  owner: string | null;
  title: string | null;
  incidentId: string;
}

interface IncidentTableProps {
  incidents: Incident[];
}

export function IncidentTable({ incidents }: IncidentTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="size-5 text-blue-500" />
            <div>
              <CardTitle>完了案件一覧</CardTitle>
              <CardDescription>案件の詳細情報</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {incidents.length} 件
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            データがありません
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">案件番号</TableHead>
                  <TableHead>完了日時 (JST)</TableHead>
                  <TableHead>オペレーター</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident, index) => (
                  <TableRow key={incident.incidentId || index}>
                    <TableCell>
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                        {incident.callNumber}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {incident.completedOnJST}
                    </TableCell>
                    <TableCell>
                      {incident.owner ? (
                        <span className="font-medium">{incident.owner}</span>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          未割当
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
