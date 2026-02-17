"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  History,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    section: null,
    items: [
      { label: "ダッシュボード", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    section: "ユーザー管理",
    items: [
      { label: "従業員", href: "/employees", icon: Users },
      { label: "グループ", href: "/groups", icon: Building2 },
    ],
  },
  {
    section: "シフト管理",
    items: [
      { label: "カレンダー", href: "/shifts", icon: Calendar },
      { label: "変更履歴", href: "/shifts/history", icon: History },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Calendar className="h-5 w-5" />
          シフト管理
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group, i) => (
          <SidebarGroup key={i}>
            {group.section && (
              <SidebarGroupLabel>{group.section}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
