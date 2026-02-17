"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NameChangeDialog } from "./name-change-dialog";
import { NameHistoryEditDialog } from "./name-history-edit-dialog";
import { toast } from "sonner";

interface NameHistoryEntry {
  id: number;
  name: string;
  nameKana: string | null;
  validFrom: string;
  validTo: string | null;
  isCurrent: boolean | null;
  note: string | null;
}

interface EmployeeNameHistoryProps {
  employeeId: number;
  history: NameHistoryEntry[];
  onUpdate: () => void;
}

export function EmployeeNameHistory({
  employeeId,
  history,
  onUpdate,
}: EmployeeNameHistoryProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NameHistoryEntry | null>(
    null
  );

  const handleDelete = async (entry: NameHistoryEntry) => {
    const confirmed = window.confirm(
      `「${entry.name}」の履歴を削除してもよろしいですか？`
    );
    if (!confirmed) return;

    const res = await fetch(
      `/api/employees/${employeeId}/name-history/${entry.id}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      toast.success("氏名履歴を削除しました");
      onUpdate();
    } else {
      toast.error("削除に失敗しました");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">氏名履歴</h3>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          改姓を登録
        </Button>
      </div>

      <div className="relative space-y-0">
        {history.map((entry, i) => (
          <div key={entry.id} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full border-2 ${
                  entry.isCurrent
                    ? "border-primary bg-primary"
                    : "border-muted-foreground bg-background"
                }`}
              />
              {i < history.length - 1 && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>
            {/* Content */}
            <div className="pb-6 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  {entry.isCurrent && (
                    <span className="text-xs font-medium text-primary mb-1 block">
                      現在
                    </span>
                  )}
                  <p className="font-medium">
                    {entry.name}
                    {entry.nameKana && (
                      <span className="text-sm text-muted-foreground ml-2">
                        （{entry.nameKana}）
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.validFrom} 〜 {entry.validTo || "現在"}
                  </p>
                  {entry.note && (
                    <p className="text-sm text-muted-foreground mt-1">
                      備考: {entry.note}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingEntry(entry)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <p className="text-muted-foreground text-sm">履歴はありません</p>
        )}
      </div>

      <NameChangeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employeeId={employeeId}
        onSuccess={onUpdate}
      />

      {editingEntry && (
        <NameHistoryEditDialog
          open={!!editingEntry}
          onOpenChange={(open) => {
            if (!open) setEditingEntry(null);
          }}
          employeeId={employeeId}
          entry={editingEntry}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
}
