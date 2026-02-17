"use client";

import { SearchInput } from "@/components/common/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Group {
  id: number;
  name: string;
}

interface FunctionRole {
  id: number;
  roleName: string;
}

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  group: string;
  onGroupChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  groups: Group[];
  roles: FunctionRole[];
}

export function EmployeeFilters({
  search,
  onSearchChange,
  group,
  onGroupChange,
  status,
  onStatusChange,
  role,
  onRoleChange,
  groups,
  roles,
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-64">
        <SearchInput
          placeholder="氏名・フリガナで検索"
          value={search}
          onChange={onSearchChange}
        />
      </div>
      <Select value={group} onValueChange={onGroupChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="グループ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全グループ</SelectItem>
          {groups.map((g) => (
            <SelectItem key={g.id} value={String(g.id)}>
              {g.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="状態" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全て</SelectItem>
          <SelectItem value="active">在籍中</SelectItem>
          <SelectItem value="inactive">退職済</SelectItem>
        </SelectContent>
      </Select>
      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="役割" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全役割</SelectItem>
          {roles.map((r) => (
            <SelectItem key={r.id} value={String(r.id)}>
              {r.roleName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
