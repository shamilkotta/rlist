"use client";

import { useState } from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  ExternalLink,
  Clock,
  Folder,
  Tag,
  CheckCircle2,
  Circle,
  Trash2,
} from "lucide-react";
import type { ReadLaterItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getDomainFromUrl, truncateText } from "@/lib/url-metadata";
import { cn } from "@workspace/ui/lib/utils";

interface ReadingListProps {
  items: ReadLaterItem[];
  onUpdate: () => void;
}

export function ReadingList({ items, onUpdate }: ReadingListProps) {
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const supabase = createClient();

  const toggleReadStatus = async (item: ReadLaterItem) => {
    setUpdatingItems((prev) => new Set(prev).add(item.id));

    try {
      const { error } = await supabase
        .from("read_later_items")
        .update({ is_read: !item.is_read })
        .eq("id", item.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error("Error updating read status:", error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const { error } = await supabase
        .from("read_later_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTitleAndSubtitle = (item: ReadLaterItem) => {
    if (item.title) {
      return {
        mainTitle: item.title,
        subtitle: item.fetched_title || getDomainFromUrl(item.url),
      };
    } else if (item.fetched_title) {
      return {
        mainTitle: item.fetched_title,
        subtitle: getDomainFromUrl(item.url),
      };
    } else {
      return {
        mainTitle: getDomainFromUrl(item.url),
        subtitle: null,
      };
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">
            No items in your reading list yet
          </p>
          <p className="text-sm">Add your first URL to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const { mainTitle, subtitle } = getTitleAndSubtitle(item);

        return (
          <Card
            key={item.id}
            className={`shadow-none border border-border py-0 bg-card text-card-foreground transition-all duration-200 hover:border-foreground/20 ${item.is_read ? "opacity-60" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <button
                      onClick={() => toggleReadStatus(item)}
                      disabled={updatingItems.has(item.id)}
                      className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.is_read ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "flex items-center gap-2 mb-1",
                          item.is_read ? "line-through" : ""
                        )}
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "text-lg font-medium hover:text-primary transition-colors",
                            " text-balance  max-w-md text-ellipsis overflow-hidden",
                            "text-nowrap"
                          )}
                        >
                          {mainTitle}
                        </a>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>

                      {subtitle && (
                        <p className="text-sm text-muted-foreground truncate max-w-md text-ellipsis">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* {item.note && (
                    <p className="text-sm text-muted-foreground mb-2 text-pretty line-clamp-2">
                      {truncateText(item.note, 120)}
                    </p>
                  )} */}

                  {/* {!item.note && item.fetched_description && (
                    <p className="text-sm text-muted-foreground mb-2 text-pretty line-clamp-2">
                      {truncateText(item.fetched_description, 120)}
                    </p>
                  )} */}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.created_at)}
                    </div>

                    {item.group && (
                      <div className="flex items-center gap-1">
                        <Folder className="h-3 w-3" />
                        {item.group.name}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex  gap-1">
                        <Tag className="h-3 w-3" />
                        <div className="flex gap-1 flex-wrap">
                          {item.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs px-2 py-0 shadow-none"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    disabled={updatingItems.has(item.id)}
                    className="text-muted-foreground hover:text-destructive shadow-none"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
