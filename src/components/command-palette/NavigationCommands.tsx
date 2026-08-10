import { Bookmark, Eye, Search, Settings } from "lucide-react";
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import type { View } from "@/types";

export function NavigationCommands({
  view,
  onNavigate,
  onOpenSettings,
}: {
  view: View;
  onNavigate: (view: View) => void;
  onOpenSettings: () => void;
}) {
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Navigate">
        <CommandItem
          value="navigate search home explore"
          onSelect={() => onNavigate("search")}
        >
          <Search />
          <span>Search and explore</span>
          {view === "search" ? <CommandShortcut>Current</CommandShortcut> : null}
        </CommandItem>
        <CommandItem
          value="navigate shortlist saved library"
          onSelect={() => onNavigate("shortlist")}
        >
          <Bookmark />
          <span>Open shortlist</span>
          {view === "shortlist" ? <CommandShortcut>Current</CommandShortcut> : null}
        </CommandItem>
        <CommandItem
          value="navigate watched history library"
          onSelect={() => onNavigate("watched")}
        >
          <Eye />
          <span>Open watched</span>
          {view === "watched" ? <CommandShortcut>Current</CommandShortcut> : null}
        </CommandItem>
        <CommandItem
          value="open settings preferences configure actions api key"
          onSelect={onOpenSettings}
        >
          <Settings />
          <span>Open settings</span>
        </CommandItem>
      </CommandGroup>
    </>
  );
}
