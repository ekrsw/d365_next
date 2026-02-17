"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { toast } from "sonner";

interface HistoryEntry {
  id: number;
  shiftId: number;
  employee: { id: number | null; name: string };
  shiftDate: string;
  changeType: string;
  version: number;
  changedAt: string;
  note: string | null;
  previous: {
    shiftCode: string | null;
    startTime: string | null;
    endTime: string | null;
    isHoliday: boolean;
    isPaidLeave: boolean;
    isRemote: boolean;
  };
  current: {
    shiftCode: string | null;
    startTime: string | null;
    endTime: string | null;
    isHoliday: boolean;
    isPaidLeave: boolean;
    isRemote: boolean;
  } | null;
}

interface ShiftHistoryTableProps {
  entries: HistoryEntry[];
  onRestore: () => void;
}

function formatSummary(prev: HistoryEntry["previous"], curr: HistoryEntry["current"]) {
  const prevLabel = prev.isPaidLeave
    ? "有給"
    : prev.isHoliday
      ? "休日"
      : `${prev.shiftCode || "—"} ${prev.startTime || ""}${prev.startTime ? "-" : ""}${prev.endTime || ""}`;
  if (!curr) return prevLabel + " → 削除";
  const currLabel = curr.isPaidLeave
    ? "有給"
    : curr.isHoliday
      ? "休日"
      : `${curr.shiftCode || "—"} ${curr.startTime || ""}${curr.startTime ? "-" : ""}${curr.endTime || ""}`;
  return `${prevLabel} → ${currLabel}`;
}

function DiffValue({ label, prev, curr }: { label: string; prev: string; curr: string }) {
  const changed = prev !== curr;
  return (
    <tr>
      <td className="py-1 pr-4 text-muted-foreground">{label}</td>
      <td className="py-1 pr-4">{prev || "—"}</td>
      <td className={`py-1 ${changed ? "font-medium text-blue-700" : ""}`}>
        {curr || "—"}{changed && " ← 変更"}
      </td>
    </tr>
  );
}

export function ShiftHistoryTable({ entries, onRestore }: ShiftHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<HistoryEntry | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HistoryEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/shifts/history/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("履歴を削除しました");
        setDeleteTarget(null);
        onRestore();
      } else {
        toast.error("削除に失敗しました");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoreLoading(true);
    try {
      const res = await fetch(`/api/shifts/${restoreTarget.shiftId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: restoreTarget.version }),
      });
      if (res.ok) {
        toast.success("シフトを復元しました");
        setRestoreTarget(null);
        onRestore();
      } else {
        toast.error("復元に失敗しました");
      }
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>従業員</TableHead>
              <TableHead>シフト日付</TableHead>
              <TableHead>種別</TableHead>
              <TableHead>変更内容</TableHead>
              <TableHead>変更日時</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  変更履歴がありません
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                return (
                  <Fragment key={entry.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : entry.id)
                      }
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.employee.name}
                      </TableCell>
                      <TableCell>{entry.shiftDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            entry.changeType === "UPDATE"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-red-50 text-red-700"
                          }
                        >
                          {entry.changeType === "UPDATE" ? "更新" : "削除"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatSummary(entry.previous, entry.current)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(entry.changedAt).toLocaleString("ja-JP")}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30 p-4">
                          <div className="space-y-3">
                            <p className="text-sm font-medium">
                              変更詳細 (Version {entry.version})
                            </p>
                            <table className="text-sm">
                              <thead>
                                <tr>
                                  <th className="py-1 pr-4 text-left text-muted-foreground font-medium">
                                    項目
                                  </th>
                                  <th className="py-1 pr-4 text-left font-medium">
                                    変更前
                                  </th>
                                  <th className="py-1 text-left font-medium">
                                    変更後
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <DiffValue
                                  label="シフトコード"
                                  prev={entry.previous.shiftCode || ""}
                                  curr={entry.current?.shiftCode || ""}
                                />
                                <DiffValue
                                  label="開始時刻"
                                  prev={entry.previous.startTime || ""}
                                  curr={entry.current?.startTime || ""}
                                />
                                <DiffValue
                                  label="終了時刻"
                                  prev={entry.previous.endTime || ""}
                                  curr={entry.current?.endTime || ""}
                                />
                                <DiffValue
                                  label="休日"
                                  prev={entry.previous.isHoliday ? "あり" : "—"}
                                  curr={entry.current?.isHoliday ? "あり" : "—"}
                                />
                                <DiffValue
                                  label="有給休暇"
                                  prev={entry.previous.isPaidLeave ? "あり" : "—"}
                                  curr={entry.current?.isPaidLeave ? "あり" : "—"}
                                />
                                <DiffValue
                                  label="テレワーク"
                                  prev={entry.previous.isRemote ? "あり" : "—"}
                                  curr={entry.current?.isRemote ? "あり" : "—"}
                                />
                              </tbody>
                            </table>
                            {entry.note && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">メモ: </span>
                                {entry.note}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRestoreTarget(entry);
                                }}
                              >
                                <RotateCcw className="mr-2 h-3 w-3" />
                                このバージョンに復元
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(entry);
                                }}
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                この履歴を削除
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
        title="シフトの復元"
        description={
          restoreTarget
            ? `${restoreTarget.employee.name}さんの ${restoreTarget.shiftDate} のシフトを Version ${restoreTarget.version} の状態に復元しますか？`
            : ""
        }
        confirmLabel="復元する"
        onConfirm={handleRestore}
        loading={restoreLoading}
      >
        {restoreTarget && (
          <div className="rounded-md border p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">シフトコード</span>
              <span>{restoreTarget.previous.shiftCode || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">開始時刻</span>
              <span>{restoreTarget.previous.startTime || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">終了時刻</span>
              <span>{restoreTarget.previous.endTime || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">テレワーク</span>
              <span>{restoreTarget.previous.isRemote ? "あり" : "なし"}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              復元操作も変更履歴に記録されます。
            </p>
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="履歴の削除"
        description={
          deleteTarget
            ? `${deleteTarget.employee.name}さんの ${deleteTarget.shiftDate} の変更履歴（Version ${deleteTarget.version}）を削除しますか？この操作は取り消せません。`
            : ""
        }
        confirmLabel="削除する"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </>
  );
}
