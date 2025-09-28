"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { BookOpen, Clock, CheckCircle2, Folder } from "lucide-react";
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
      label: "Total Items",
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
      label: "Groups",
      value: totalGroups,
      icon: Folder,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
