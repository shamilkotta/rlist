"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { BookOpen, Clock, CheckCircle2, Folder, TagIcon } from "lucide-react";
import type { ReadLaterItem, Group } from "@/lib/types";

interface StatsOverviewProps {
  items: ReadLaterItem[];
  groups: Group[];
}

export function StatsOverview({ items, groups }: StatsOverviewProps) {
  const totalItems = items.length;
  const readItems = items.filter((item) => item.is_read).length;
  const unreadItems = totalItems - readItems;
  const totalGroups = groups.length;

  const stats = [
    {
      label: "Total",
      value: totalItems,
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      label: "Unread",
      value: unreadItems,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      label: "Read",
      value: readItems,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: "Tags",
      value: totalGroups,
      icon: TagIcon,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-4 mb-8 overflow-auto w-auto">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="shadow-none min-w-[150px] sm:min-w-[0px] h-fit p-0 rounded-md"
        >
          <CardContent className="px-2 py-1">
            <div className="flex items-center gap-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div className="flex gap-1 lg:gap-2 items-center">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
