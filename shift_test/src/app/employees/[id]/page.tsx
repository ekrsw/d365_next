"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/status-badge";
import { RoleTypeBadge } from "@/components/common/role-type-badge";
import { EmployeeBasicInfoForm } from "@/components/employees/employee-basic-info-form";
import { EmployeeRoleManager } from "@/components/employees/employee-role-manager";
import { EmployeeNameHistory } from "@/components/employees/employee-name-history";

interface EmployeeDetail {
  id: number;
  name: string;
  nameKana: string | null;
  group: { id: number; name: string } | null;
  groupId: number | null;
  assignmentDate: string | null;
  terminationDate: string | null;
  isActive: boolean;
  roles: {
    id: number;
    functionRoleId: number | null;
    roleName: string;
    roleCode: string;
    roleType: string;
    isPrimary: boolean | null;
    startDate: string | null;
    endDate: string | null;
  }[];
  nameHistory: {
    id: number;
    name: string;
    nameKana: string | null;
    validFrom: string;
    validTo: string | null;
    isCurrent: boolean | null;
    note: string | null;
    createdAt: string | null;
  }[];
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [functionRoles, setFunctionRoles] = useState<
    { id: number; roleCode: string; roleName: string; roleType: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployee = useCallback(async () => {
    const res = await fetch(`/api/employees/${id}`);
    if (res.ok) {
      setEmployee(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchEmployee();
    fetch("/api/groups").then((r) => r.json()).then(setGroups);
    fetch("/api/function-roles").then((r) => r.json()).then(setFunctionRoles);
  }, [fetchEmployee]);

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">読み込み中...</div>;
  }

  if (!employee) {
    return <div className="text-center py-12 text-muted-foreground">従業員が見つかりません</div>;
  }

  const currentRoles = employee.roles.filter((r) => !r.endDate);
  const pastRoles = employee.roles.filter((r) => r.endDate);

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/employees">
          <ArrowLeft className="mr-2 h-4 w-4" />
          従業員一覧に戻る
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{employee.name}</h1>
        {employee.nameKana && (
          <p className="text-sm text-muted-foreground">{employee.nameKana}</p>
        )}
        <div className="flex gap-2">
          {employee.group && (
            <RoleTypeBadge roleType="GROUP" roleName={employee.group.name} />
          )}
          <StatusBadge isActive={employee.isActive} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">基本情報</TabsTrigger>
          <TabsTrigger value="roles">役割管理</TabsTrigger>
          <TabsTrigger value="nameHistory">氏名履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <EmployeeBasicInfoForm
            employee={employee}
            groups={groups}
            onUpdate={fetchEmployee}
          />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <EmployeeRoleManager
            employeeId={employee.id}
            currentRoles={currentRoles}
            pastRoles={pastRoles}
            functionRoles={functionRoles}
            onUpdate={fetchEmployee}
          />
        </TabsContent>

        <TabsContent value="nameHistory" className="mt-6">
          <EmployeeNameHistory
            employeeId={employee.id}
            history={employee.nameHistory}
            onUpdate={fetchEmployee}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
