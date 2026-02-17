"use client";

import { SearchInput } from "@/components/common/search-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShiftHistoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  changeType: string;
  onChangeTypeChange: (value: string) => void;
}

export function ShiftHistoryFilters({
  search,
  onSearchChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  changeType,
  onChangeTypeChange,
}: ShiftHistoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-56">
        <SearchInput
          placeholder="従業員名で検索"
          value={search}
          onChange={onSearchChange}
        />
      </div>
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <Label className="text-xs">開始日</Label>
          <Input
            type="date"
            className="w-40"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>
        <span className="pb-2 text-muted-foreground">〜</span>
        <div className="space-y-1">
          <Label className="text-xs">終了日</Label>
          <Input
            type="date"
            className="w-40"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>
      </div>
      <Select value={changeType} onValueChange={onChangeTypeChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="変更種別" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全て</SelectItem>
          <SelectItem value="UPDATE">更新</SelectItem>
          <SelectItem value="DELETE">削除</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
