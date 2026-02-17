"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useQueryState } from "nuqs";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { EmployeeFilters } from "@/components/employees/employee-filters";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeeCreateDialog } from "@/components/employees/employee-create-dialog";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function EmployeesContent() {
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const [group, setGroup] = useQueryState("group", { defaultValue: "all" });
  const [status, setStatus] = useQueryState("status", { defaultValue: "active" });
  const [role, setRole] = useQueryState("role", { defaultValue: "all" });
  const [page, setPage] = useQueryState("page", { defaultValue: "1" });

  const [employees, setEmployees] = useState<[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [roles, setRoles] = useState<{ id: number; roleName: string }[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (group !== "all") params.set("group", group);
    if (status !== "all") params.set("status", status);
    if (role !== "all") params.set("role", role);
    params.set("page", page);

    const res = await fetch(`/api/employees?${params}`);
    const data = await res.json();
    setEmployees(data.data);
    setPagination(data.pagination);
    setLoading(false);
  }, [search, group, status, role, page]);

  useEffect(() => {
    fetch("/api/groups").then((r) => r.json()).then(setGroups);
    fetch("/api/function-roles").then((r) => r.json()).then(setRoles);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="従業員一覧"
        description={`${pagination.total}名の従業員`}
        icon={<Users className="h-6 w-6" />}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        }
      />

      <EmployeeFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage("1"); }}
        group={group}
        onGroupChange={(v) => { setGroup(v); setPage("1"); }}
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage("1"); }}
        role={role}
        onRoleChange={(v) => { setRole(v); setPage("1"); }}
        groups={groups}
        roles={roles}
      />

      {loading ? (
        <div className="flex justify-center py-12 text-muted-foreground">読み込み中...</div>
      ) : (
        <EmployeeTable employees={employees} />
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPage(String(pagination.page - 1))}
          >
            前へ
          </Button>
          <span className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage(String(pagination.page + 1))}
          >
            次へ
          </Button>
        </div>
      )}

      <EmployeeCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        groups={groups}
        onSuccess={fetchEmployees}
      />
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12 text-muted-foreground">読み込み中...</div>}>
      <EmployeesContent />
    </Suspense>
  );
}
