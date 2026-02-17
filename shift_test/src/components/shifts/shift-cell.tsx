"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Pencil, Plus } from "lucide-react";

interface ShiftInfo {
  id: number;
  date: string;
  shiftCode: string | null;
  startTime: string | null;
  endTime: string | null;
  isHoliday: boolean;
  isPaidLeave: boolean;
  isRemote: boolean;
}

interface ShiftCellProps {
  shift: ShiftInfo | undefined;
  dayOfWeek: number;
  employeeName: string;
  dateStr: string;
  onEdit: (shift: ShiftInfo) => void;
  onCreate?: () => void;
  selected?: boolean;
  onSelect?: () => void;
}

export function ShiftCell({
  shift,
  dayOfWeek,
  employeeName,
  dateStr,
  onEdit,
  onCreate,
  selected,
  onSelect,
}: ShiftCellProps) {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let bgClass = "";
  if (selected) bgClass = "bg-blue-100";
  else if (shift?.isHoliday) bgClass = "bg-gray-100";
  else if (shift?.isPaidLeave) bgClass = "bg-blue-50";
  else if (shift?.isRemote) bgClass = "bg-green-50";
  else if (dayOfWeek === 0) bgClass = "bg-red-50/30";
  else if (dayOfWeek === 6) bgClass = "bg-blue-50/30";

  if (!shift) {
    return (
      <td
        className={`border px-1 py-1 text-center text-xs min-w-[70px] h-16 cursor-pointer hover:bg-accent/50 transition-colors group ${bgClass} ${isWeekend ? "text-muted-foreground" : ""}`}
        onClick={onCreate}
      >
        <div className="flex items-center justify-center h-full">
          <Plus className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
        </div>
      </td>
    );
  }

  return (
    <td
      className={`border px-1 py-1 text-center text-xs min-w-[70px] h-16 cursor-pointer hover:bg-accent/50 transition-colors ${bgClass}`}
      onClick={onSelect}
    >
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex flex-col items-center gap-0.5 w-full" onClick={(e) => e.stopPropagation()}>
            <span className="font-bold text-sm">
              {shift.isPaidLeave ? "有" : shift.isHoliday ? "休" : shift.shiftCode || "—"}
            </span>
            {shift.startTime && shift.endTime && (
              <span className="text-[10px] text-muted-foreground">
                {shift.startTime}-{shift.endTime}
              </span>
            )}
            <div className="flex gap-0.5">
              {shift.isRemote && <Home className="h-3 w-3 text-green-600" />}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <p className="font-semibold text-sm">
              {employeeName} — {dateStr}
            </p>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">シフトコード</span>
                <span>{shift.shiftCode || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">時間</span>
                <span>
                  {shift.startTime && shift.endTime
                    ? `${shift.startTime} 〜 ${shift.endTime}`
                    : "—"}
                </span>
              </div>
              <div className="flex gap-1 justify-end">
                {shift.isRemote && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    テレワーク
                  </Badge>
                )}
                {shift.isPaidLeave && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    有給
                  </Badge>
                )}
                {shift.isHoliday && (
                  <Badge variant="outline" className="text-xs bg-gray-100">
                    休日
                  </Badge>
                )}
              </div>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={() => onEdit(shift)}
            >
              <Pencil className="mr-2 h-3 w-3" />
              編集する
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </td>
  );
}
