"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { GroupTable } from "@/components/groups/group-table";
import { GroupEditDialog } from "@/components/groups/group-edit-dialog";

interface Group {
  id: number;
  name: string;
  employeeCount: number;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="グループ管理"
        description={`${groups.length}件のグループ`}
        icon={<Building2 className="h-6 w-6" />}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            グループを追加
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">読み込み中...</div>
      ) : (
        <GroupTable groups={groups} onUpdate={fetchGroups} />
      )}

      <GroupEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchGroups}
      />
    </div>
  );
}
