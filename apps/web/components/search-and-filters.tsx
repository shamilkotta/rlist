"use client";

import { useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Search,
  Filter,
  X,
  Tag,
  Folder,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { Group, Tag as TagType } from "@/lib/types";

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
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="space-y-4">
          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="shadow-none text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

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
          </div>

          {/* Read Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Status
            </label>
            <Select
              value={filters.readStatus}
              onValueChange={(value) => updateFilters({ readStatus: value })}
            >
              <SelectTrigger className="shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-none border border-border bg-card">
                <SelectItem value="all">All items</SelectItem>
                <SelectItem value="unread">Unread only</SelectItem>
                <SelectItem value="read">Read only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
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

                {filters.readStatus !== "all" && (
                  <Badge variant="secondary" className="gap-1 shadow-none">
                    {filters.readStatus === "read" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {filters.readStatus === "read" ? "Read" : "Unread"}
                    <button
                      onClick={() => updateFilters({ readStatus: "all" })}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {filters.selectedTags.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  if (!tag) return null;

                  return (
                    <Badge
                      key={tagId}
                      variant="secondary"
                      className="gap-1 shadow-none"
                    >
                      <Tag className="h-3 w-3" />
                      {tag.name}
                      <button onClick={() => removeTag(tagId)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
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
