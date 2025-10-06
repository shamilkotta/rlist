"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, Loader2, Plus } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useMemo } from "react";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

type SelectGroupProps = {
  allowCustom?: boolean;
  multiple?: boolean;
  isCreatingGroup?: boolean;
};

export function SelectGroup({
  isCreatingGroup,
  allowCustom,
  multiple,
}: SelectGroupProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | string[]>(
    multiple ? [] : ""
  );
  const [groupSearchVal, setGroupSearchVal] = React.useState("");

  const onSelect = (selected: string) => {
    if (multiple) {
      const newValue = value.includes(selected)
        ? (value as string[]).filter((v) => v !== selected)
        : [...value, selected];
      setValue(newValue);
    } else {
      setValue(selected === value ? "" : selected);
    }

    if (!multiple) setOpen(false);
  };

  const isSelected = (selected: string) => {
    if (multiple) {
      return value.includes(selected);
    }
    return value === selected;
  };

  const label = useMemo(() => {
    if (!value || !value.length) return "Select Group...";
    let firstSelected = multiple ? value[0] : value;
    firstSelected = frameworks.find(
      (framework) => framework.value === firstSelected
    )?.label;
    if (multiple) return `${firstSelected} and ${value.length - 1} more`;
    return firstSelected;
  }, [value, multiple]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between shadow-none font-normal"
        >
          {label}
          {isCreatingGroup ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
        <Command className="w-full">
          <CommandInput
            onValueChange={setGroupSearchVal}
            placeholder="Search group..."
          />
          <CommandList>
            <CommandEmpty className="px-2 py-3 flex flex-col justify-center">
              <div>
                {allowCustom && groupSearchVal.trim() && (
                  <Button
                    variant="ghost"
                    className="w-full items-center cursor-pointer gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Create <span className="font-bold">{groupSearchVal}</span>
                  </Button>
                )}
                <p className="mx-auto w-fit my-3 text-muted-foreground">
                  No group found.
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={onSelect}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected(framework.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
