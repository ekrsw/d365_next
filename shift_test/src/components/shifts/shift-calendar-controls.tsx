"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ShiftCalendarControlsProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  group: string;
  onGroupChange: (value: string) => void;
  groups: Group[];
}

export function ShiftCalendarControls({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
  group,
  onGroupChange,
  groups,
}: ShiftCalendarControlsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold min-w-[140px] text-center">
          {year}年 {month}月
        </span>
        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
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

      <Button variant="outline" size="sm" onClick={onToday}>
        今月
      </Button>
    </div>
  );
}
