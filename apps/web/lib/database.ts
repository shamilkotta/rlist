import { createClient } from "@/lib/supabase/client"
import type { Group, Tag, ReadLaterItem } from "@/lib/types"
import { fetchUrlMetadata } from "@/lib/url-metadata"

const supabase = createClient()

export async function getGroups(): Promise<Group[]> {
  const { data, error } = await supabase.from("groups").select("*").order("name")

  if (error) throw error
  return data || []
}

export async function createGroup(name: string, description?: string): Promise<Group> {
  const { data, error } = await supabase.from("groups").insert({ name, description }).select().single()

  if (error) throw error
  return data
}

export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase.from("tags").select("*").order("name")

  if (error) throw error
  return data || []
}

export async function createTag(name: string): Promise<Tag> {
  const { data, error } = await supabase.from("tags").insert({ name: name.toLowerCase() }).select().single()

  if (error) throw error
  return data
}

export async function createReadLaterItem(item: {
  url: string
  title?: string
  note?: string
  group_id?: string
  tagNames?: string[]
}): Promise<ReadLaterItem> {
  const metadata = await fetchUrlMetadata(item.url)

  // Create the main item
  const { data: newItem, error: itemError } = await supabase
    .from("read_later_items")
    .insert({
      url: item.url,
      title: item.title,
      note: item.note,
      group_id: item.group_id,
      fetched_title: metadata.title,
      fetched_description: metadata.description,
      favicon_url: metadata.favicon,
    })
    .select()
    .single()

  if (itemError) throw itemError

  // Handle tags if provided
  if (item.tagNames && item.tagNames.length > 0) {
    for (const tagName of item.tagNames) {
      // Try to find existing tag or create new one
      let { data: existingTag } = await supabase.from("tags").select("*").eq("name", tagName.toLowerCase()).single()

      if (!existingTag) {
        const { data: newTag, error: tagError } = await supabase
          .from("tags")
          .insert({ name: tagName.toLowerCase() })
          .select()
          .single()

        if (tagError) throw tagError
        existingTag = newTag
      }

      // Link tag to item
      const { error: linkError } = await supabase.from("item_tags").insert({
        item_id: newItem.id,
        tag_id: existingTag.id,
      })

      if (linkError) throw linkError
    }
  }

  return newItem
}

export async function getReadLaterItems(): Promise<ReadLaterItem[]> {
  const { data, error } = await supabase
    .from("read_later_items")
    .select(`
      *,
      group:groups(*),
      item_tags(
        tag:tags(*)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) throw error

  // Transform the data to include tags array
  return (data || []).map((item) => ({
    ...item,
    tags: item.item_tags?.map((it: any) => it.tag) || [],
  }))
}
