"use client";

import { Fragment, useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ShiftCell } from "./shift-cell";
import { ShiftEditDialog } from "./shift-edit-dialog";
import { ShiftBulkEditBar } from "./shift-bulk-edit-bar";

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

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

interface EmployeeShifts {
  id: number;
  name: string;
  shifts: ShiftInfo[];
}

interface GroupData {
  id: number;
  name: string;
  employees: EmployeeShifts[];
}

interface ShiftCalendarGridProps {
  year: number;
  month: number;
  daysInMonth: number;
  groups: GroupData[];
  onUpdate: () => void;
}

export function ShiftCalendarGrid({
  year,
  month,
  daysInMonth,
  groups,
  onUpdate,
}: ShiftCalendarGridProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());
  const [editShift, setEditShift] = useState<{
    shift: ShiftInfo;
    employeeName: string;
    date: string;
  } | null>(null);
  const [createShift, setCreateShift] = useState<{
    employeeId: number;
    employeeName: string;
    date: string;
    dateStr: string;
  } | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month - 1, i + 1);
      return {
        day: i + 1,
        dayOfWeek: d.getDay(),
        dateStr: `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
        label: `${month}/${i + 1}`,
        weekLabel: dayLabels[d.getDay()],
      };
    });
  }, [year, month, daysInMonth]);

  const toggleGroup = (groupId: number) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const toggleCellSelection = (key: string) => {
    setSelectedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Collect selected shift IDs
  const selectedShiftIds = useMemo(() => {
    const ids: number[] = [];
    for (const group of groups) {
      for (const emp of group.employees) {
        for (const shift of emp.shifts) {
          const key = `${emp.id}-${shift.date}`;
          if (selectedCells.has(key)) {
            ids.push(shift.id);
          }
        }
      }
    }
    return ids;
  }, [selectedCells, groups]);

  return (
    <>
      <div className="overflow-x-auto border rounded-md">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="border px-3 py-2 text-left text-sm font-medium bg-muted sticky left-0 z-10 min-w-[120px]">
                従業員
              </th>
              {days.map((d) => (
                <th
                  key={d.day}
                  className={`border px-1 py-1 text-center text-xs font-medium min-w-[70px] ${
                    d.dayOfWeek === 0
                      ? "bg-red-50 text-red-600"
                      : d.dayOfWeek === 6
                        ? "bg-blue-50 text-blue-600"
                        : "bg-muted"
                  }`}
                >
                  <div>{d.label}</div>
                  <div className="text-[10px]">({d.weekLabel})</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.id}>
                <tr>
                  <td
                    colSpan={daysInMonth + 1}
                    className="border px-3 py-2 bg-muted/50 cursor-pointer hover:bg-muted"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center gap-2 font-medium text-sm">
                      {collapsedGroups.has(group.id) ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      {group.name}
                      <span className="text-xs text-muted-foreground">
                        ({group.employees.length}名)
                      </span>
                    </div>
                  </td>
                </tr>
                {!collapsedGroups.has(group.id) &&
                  group.employees.map((emp) => {
                    const shiftMap = new Map(
                      emp.shifts.map((s) => [s.date, s])
                    );
                    return (
                      <tr key={emp.id}>
                        <td className="border px-3 py-1 text-sm sticky left-0 bg-background z-10 whitespace-nowrap">
                          {emp.name}
                        </td>
                        {days.map((d) => {
                          const shift = shiftMap.get(d.dateStr);
                          const cellKey = `${emp.id}-${d.dateStr}`;
                          return (
                            <ShiftCell
                              key={d.day}
                              shift={shift}
                              dayOfWeek={d.dayOfWeek}
                              employeeName={emp.name}
                              dateStr={`${year}/${month}/${d.day}`}
                              onEdit={(s) =>
                                setEditShift({
                                  shift: s,
                                  employeeName: emp.name,
                                  date: `${year}/${month}/${d.day}`,
                                })
                              }
                              onCreate={() =>
                                setCreateShift({
                                  employeeId: emp.id,
                                  employeeName: emp.name,
                                  date: d.dateStr,
                                  dateStr: `${year}/${month}/${d.day}`,
                                })
                              }
                              selected={selectedCells.has(cellKey)}
                              onSelect={() => toggleCellSelection(cellKey)}
                            />
                          );
                        })}
                      </tr>
                    );
                  })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {editShift && (
        <ShiftEditDialog
          open={!!editShift}
          onOpenChange={(open) => !open && setEditShift(null)}
          shift={editShift.shift}
          employeeName={editShift.employeeName}
          date={editShift.date}
          onSuccess={onUpdate}
        />
      )}

      {createShift && (
        <ShiftEditDialog
          open={!!createShift}
          onOpenChange={(open) => !open && setCreateShift(null)}
          shift={null}
          employeeId={createShift.employeeId}
          employeeName={createShift.employeeName}
          date={createShift.date}
          onSuccess={onUpdate}
        />
      )}

      {selectedShiftIds.length > 0 && (
        <ShiftBulkEditBar
          selectedCount={selectedCells.size}
          shiftIds={selectedShiftIds}
          onCancel={() => setSelectedCells(new Set())}
          onSuccess={() => {
            setSelectedCells(new Set());
            onUpdate();
          }}
        />
      )}
    </>
  );
}
