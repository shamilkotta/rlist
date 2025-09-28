import type { ReadLaterItem } from "@/lib/types"
import type { FilterState } from "@/components/search-and-filters"

export function filterItems(items: ReadLaterItem[], filters: FilterState): ReadLaterItem[] {
  return items.filter((item) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = [item.title || "", item.url, item.note || "", ...(item.tags?.map((tag) => tag.name) || [])]
        .join(" ")
        .toLowerCase()

      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }

    // Group filter
    if (filters.groupId !== "all") {
      if (filters.groupId === "none") {
        if (item.group_id !== null) return false
      } else {
        if (item.group_id !== filters.groupId) return false
      }
    }

    // Read status filter
    if (filters.readStatus !== "all") {
      if (filters.readStatus === "read" && !item.is_read) return false
      if (filters.readStatus === "unread" && item.is_read) return false
    }

    // Tags filter
    if (filters.selectedTags.length > 0) {
      const itemTagIds = item.tags?.map((tag) => tag.id) || []
      const hasAllSelectedTags = filters.selectedTags.every((tagId) => itemTagIds.includes(tagId))
      if (!hasAllSelectedTags) return false
    }

    return true
  })
}

export function sortItems(items: ReadLaterItem[], sortBy: "newest" | "oldest" | "title"): ReadLaterItem[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "title":
        const titleA = (a.title || a.url).toLowerCase()
        const titleB = (b.title || b.url).toLowerCase()
        return titleA.localeCompare(titleB)
      default:
        return 0
    }
  })
}
