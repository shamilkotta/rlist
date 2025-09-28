"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import { X, Plus, Loader2 } from "lucide-react";
import { createReadLaterItem, createGroup } from "@/lib/database";
import { fetchUrlMetadata } from "@/lib/url-metadata";
import type { Group } from "@/lib/types";

interface AddUrlFormProps {
  groups: Group[];
  onSuccess: () => void;
}

export function AddUrlForm({
  groups: initialGroups,
  onSuccess,
}: AddUrlFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("none");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [groups, setGroups] = useState(initialGroups);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);

    if (newUrl.trim() && !title.trim() && isValidUrl(newUrl)) {
      setIsFetchingTitle(true);
      try {
        const metadata = await fetchUrlMetadata(newUrl.trim());
        if (metadata.title) {
          setTitle(metadata.title);
        }
      } catch (error) {
        console.error("Error fetching URL metadata:", error);
      } finally {
        setIsFetchingTitle(false);
      }
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    setIsCreatingGroup(true);
    try {
      const newGroup = await createGroup(
        newGroupName.trim(),
        newGroupDescription.trim() || undefined
      );
      setGroups([...groups, newGroup]);
      setSelectedGroupId(newGroup.id);
      setNewGroupName("");
      setNewGroupDescription("");
      setShowNewGroupDialog(false);
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      await createReadLaterItem({
        url: url.trim(),
        title: title.trim() || undefined,
        note: note.trim() || undefined,
        group_id: selectedGroupId === "none" ? undefined : selectedGroupId,
        tagNames: tags.length > 0 ? tags : undefined,
      });

      setUrl("");
      setTitle("");
      setNote("");
      setSelectedGroupId("none");
      setTags([]);
      setTagInput("");

      onSuccess();
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="url">URL *</Label>
        <div className="relative">
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            required
            className="shadow-none"
          />
          {isFetchingTitle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          placeholder="Article title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="shadow-none"
        />
        {isFetchingTitle && (
          <p className="text-xs text-muted-foreground">
            Fetching title from URL...
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          placeholder="Add a personal note about this article..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="shadow-none"
        />
      </div>

      <div className="space-y-2">
        <Label>Group (optional)</Label>
        <div className="flex gap-2">
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="flex-1 shadow-none">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent className="shadow-none border border-border bg-card">
              <SelectItem value="none">No group</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog
            open={showNewGroupDialog}
            onOpenChange={setShowNewGroupDialog}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shadow-none bg-transparent"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="shadow-none border border-border bg-card">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name *</Label>
                  <Input
                    id="group-name"
                    placeholder="e.g., Tech Articles"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="shadow-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-description">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="group-description"
                    placeholder="Brief description of this group..."
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    rows={2}
                    className="shadow-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewGroupDialog(false)}
                    className="shadow-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || isCreatingGroup}
                    className="shadow-none"
                  >
                    {isCreatingGroup ? "Creating..." : "Create Group"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags (optional)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 shadow-none"
          />
          <Button
            type="button"
            onClick={handleAddTag}
            variant="outline"
            className="shadow-none bg-transparent"
          >
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1 shadow-none"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={!url.trim() || isLoading || isFetchingTitle}
        className="w-full shadow-none"
      >
        {isLoading ? "Adding..." : "Add to Read Later"}
      </Button>
    </form>
  );
}
