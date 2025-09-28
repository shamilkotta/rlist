"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Plus, BookOpen } from "lucide-react";
import { AddUrlForm } from "@/components/add-url-form";
import { ReadingList } from "@/components/reading-list";
import { StatsOverview } from "@/components/stats-overview";
import {
  SearchAndFilters,
  type FilterState,
} from "@/components/search-and-filters";
import { ThemeToggle } from "@/components/theme-toggle";
import { getGroups, getTags, getReadLaterItems } from "@/lib/database";
import { filterItems, sortItems } from "@/lib/search-utils";
import type { Group, Tag, ReadLaterItem } from "@/lib/types";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { Button } from "@workspace/ui/components/button";

export default function HomePage() {
  const [items, setItems] = useState<ReadLaterItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    groupId: "all",
    readStatus: "all",
    selectedTags: [],
  });

  const loadData = async () => {
    try {
      const [itemsData, groupsData, tagsData] = await Promise.all([
        getReadLaterItems(),
        getGroups(),
        getTags(),
      ]);

      setItems(itemsData);
      setGroups(groupsData);
      setTags(tagsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadData();
  };

  const filteredItems = filterItems(items, filters);
  const sortedItems = sortItems(filteredItems, "newest");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading your reading list...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-background flex w-full">
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1">
              <h3 className="font-semibold text-sm">Filters</h3>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SearchAndFilters
              groups={groups}
              tags={tags}
              filters={filters}
              onFiltersChange={setFilters}
              variant="sidebar"
            />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <div>
                  <h1 className="text-3xl font-bold text-balance">
                    Read Later
                  </h1>
                  <p className="text-muted-foreground text-pretty">
                    Save articles and URLs to read when you have time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add URL
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add to Reading List</DialogTitle>
                    </DialogHeader>
                    <AddUrlForm groups={groups} onSuccess={handleAddSuccess} />
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {/* Stats Overview */}
            <StatsOverview items={items} groups={groups} />

            <div className="mb-6 md:hidden">
              <SearchAndFilters
                groups={groups}
                tags={tags}
                filters={filters}
                onFiltersChange={setFilters}
                variant="mobile"
              />
            </div>

            {/* Results Summary */}
            {(filters.search ||
              filters.groupId !== "all" ||
              filters.readStatus !== "all" ||
              filters.selectedTags.length > 0) && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredItems.length} of {items.length} items
                </p>
              </div>
            )}

            {/* Reading List */}
            <ReadingList items={sortedItems} onUpdate={loadData} />

            {/* Empty State for Filtered Results */}
            {filteredItems.length === 0 && items.length > 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-2">
                    No items match your current filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters({
                        search: "",
                        groupId: "all",
                        readStatus: "all",
                        selectedTags: [],
                      })
                    }
                  >
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
