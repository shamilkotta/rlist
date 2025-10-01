"use client";

import { useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Search, X, Tag, Folder, Clock, CheckCircle2 } from "lucide-react";
import type { Group, Tag as TagType } from "@/lib/types";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

export interface FilterState {
  search: string;
  groupId: string;
  readStatus: string;
  selectedTags: string[];
}

interface SearchAndFiltersProps {
  groups: Group[];
  tags: TagType[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  variant?: "sidebar" | "search-only";
}

export function SearchAndFilters({
  groups,
  tags,
  filters,
  onFiltersChange,
  variant = "search-only",
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      groupId: "all",
      readStatus: "all",
      selectedTags: [],
    });
  };

  const toggleTag = (tagId: string) => {
    const newSelectedTags = filters.selectedTags.includes(tagId)
      ? filters.selectedTags.filter((id) => id !== tagId)
      : [...filters.selectedTags, tagId];

    updateFilters({ selectedTags: newSelectedTags });
  };

  const removeTag = (tagId: string) => {
    updateFilters({
      selectedTags: filters.selectedTags.filter((id) => id !== tagId),
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.groupId !== "all" ||
    filters.readStatus !== "all" ||
    filters.selectedTags.length > 0;

  if (variant === "sidebar") {
    return (
      <div className="">
        <div className="mb-4 flex flex-row justify-between items-center">
          <h3 className="font-semibold text-sm text-muted-foreground">
            Filters
          </h3>
          {hasActiveFilters && (
            <Button
              className={cn(
                "text-xs text-foreground",
                "h-fit px-2 py-0.5 cursor-pointer"
              )}
              variant={"ghost"}
              size={"sm"}
              onClick={clearAllFilters}
            >
              Clear all
            </Button>
          )}
        </div>
        {/* Filter Controls */}
        <div className="space-y-7">
          {/* Group Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Group
            </label>
            <Select
              value={filters.groupId}
              onValueChange={(value) => updateFilters({ groupId: value })}
            >
              <SelectTrigger className="shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-none border border-border bg-card">
                <SelectItem value="all">All groups</SelectItem>
                <SelectItem value="none">No group</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.groupId !== "all" && (
              <Badge variant="secondary" className="gap-1 shadow-none">
                <Folder className="h-3 w-3" />
                {filters.groupId === "none"
                  ? "No group"
                  : groups.find((g) => g.id === filters.groupId)?.name ||
                    "Unknown group"}
                <button onClick={() => updateFilters({ groupId: "all" })}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          {/* Read Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Status
            </label>

            <RadioGroup
              defaultValue={filters.readStatus}
              onValueChange={(value) => updateFilters({ readStatus: value })}
            >
              <div
                className={cn(
                  "flex items-center space-x-2",
                  filters.readStatus !== "unread" && "opacity-50"
                )}
              >
                <RadioGroupItem value="unread" id="select-unread" />
                <Label htmlFor="select-unread">Unread only</Label>
              </div>
              <div
                className={cn(
                  "flex items-center space-x-2",
                  filters.readStatus !== "read" && "opacity-50"
                )}
              >
                <RadioGroupItem value="read" id="select-read" />
                <Label htmlFor="select-read">Read only</Label>
              </div>
              <div
                className={cn(
                  "flex items-center space-x-2",
                  filters.readStatus !== "all" && "opacity-50"
                )}
              >
                <RadioGroupItem value="all" id="select-all" />
                <Label htmlFor="select-all">All items</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={
                      filters.selectedTags.includes(tag.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-accent shadow-none"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, URL or tags..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10 shadow-none focus-visible:ring-0"
        />
        {filters.search && (
          <button
            onClick={() => updateFilters({ search: "" })}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
