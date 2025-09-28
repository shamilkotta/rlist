export interface Group {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

export interface ReadLaterItem {
  id: string
  url: string
  title?: string
  note?: string
  fetched_title?: string
  fetched_description?: string
  favicon_url?: string
  group_id?: string
  is_read: boolean
  created_at: string
  updated_at: string
  group?: Group
  tags?: Tag[]
}

export interface ItemTag {
  id: string
  item_id: string
  tag_id: string
  created_at: string
}
