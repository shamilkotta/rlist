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
import { Plus, BookOpen, Settings2 } from "lucide-react";
import { AddUrlForm } from "@/components/add-url-form";
import { ReadingList } from "@/components/reading-list";
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
import Tabs from "@/components/tabs";

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
        <Sidebar className="hidden bg-transparent md:flex border-r border-border sticky flex-0">
          <SidebarHeader className=" mt-5 p-4">
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
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

        <SidebarInset className="overflow-hidden">
          <div className="container mx-auto flex-1 pb-8 pt-4 min-sm:max-w-full">
            <header className="flex items-center px-4 justify-between mb-4 border-b pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-balance">rlist</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="md:hidden hidden">
                  <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 py-0" variant={"outline"}>
                        <Plus className="h-4 w-4" />
                        Add URL
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add to Reading List</DialogTitle>
                      </DialogHeader>
                      <AddUrlForm
                        groups={groups}
                        onSuccess={handleAddSuccess}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <ThemeToggle />
              </div>
            </header>

            <div className="px-4">
              <div className="mb-3 flex items-center gap-3">
                <SidebarTrigger
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded-md border border-border bg-background"
                  icon={<Settings2 className="w-7 h-7" />}
                />
                <SearchAndFilters
                  groups={groups}
                  tags={tags}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>

              <Tabs gropus={groups} />

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

              <ReadingList items={sortedItems} onUpdate={loadData} />

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
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
