import {
  Bookmark,
  BookmarkX,
  CalendarDays,
  Copy,
  Download,
  Eye,
  Images,
  Link,
} from "lucide-react";
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { actionIcon } from "@/lib/icons";
import {
  copyTitle,
  copyPosterImage,
  copyPosterUrl,
  copyTitleAndYear,
  downloadPoster,
} from "@/lib/titleActions";
import type { ActionDef, LibraryItem, TitleDetails } from "@/types";

interface CurrentTitleCommandsProps {
  details: TitleDetails;
  libraryItem?: LibraryItem;
  actions: ActionDef[];
  onClosePalette: () => void;
  onToggleLibrary: () => void;
  onOpenWatchedDialog: () => void;
  onTriggerConfiguredAction: (action: ActionDef) => void;
}

function configuredActionLabel(action: ActionDef): string {
  switch (action.type) {
    case "open-url":
      return `Open in ${action.name}`;
    case "deep-link":
      return `Launch ${action.name}`;
    case "copy":
      return `Copy ${action.name}`;
    case "http-request":
      return `Run ${action.name}`;
  }
}

export function CurrentTitleCommands({
  details,
  libraryItem,
  actions,
  onClosePalette,
  onToggleLibrary,
  onOpenWatchedDialog,
  onTriggerConfiguredAction,
}: CurrentTitleCommandsProps) {
  return (
    <>
      <CommandGroup heading={`Current title · ${details.title}`}>
        <CommandItem
          value={`copy title only no year ${details.title}`}
          onSelect={() => {
            onClosePalette();
            void copyTitle(details);
          }}
        >
          <Copy />
          <span>Copy title</span>
        </CommandItem>
        <CommandItem
          value={`copy title year ${details.title}`}
          onSelect={() => {
            onClosePalette();
            void copyTitleAndYear(details);
          }}
        >
          <CalendarDays />
          <span>Copy title and year</span>
        </CommandItem>

        {details.posterPath ? (
          <>
            <CommandItem
              value={`copy poster image ${details.title}`}
              onSelect={() => {
                onClosePalette();
                void copyPosterImage(details);
              }}
            >
              <Images />
              <span>Copy poster image</span>
            </CommandItem>
            <CommandItem
              value={`download poster ${details.title}`}
              onSelect={() => {
                onClosePalette();
                void downloadPoster(details);
              }}
            >
              <Download />
              <span>Download poster</span>
            </CommandItem>
            <CommandItem
              value={`copy poster url link ${details.title}`}
              onSelect={() => {
                onClosePalette();
                void copyPosterUrl(details);
              }}
            >
              <Link />
              <span>Copy poster URL</span>
            </CommandItem>
          </>
        ) : null}

        <CommandItem
          value={`${libraryItem ? "remove library shortlist" : "add shortlist"} ${details.title}`}
          onSelect={onToggleLibrary}
        >
          {libraryItem ? <BookmarkX /> : <Bookmark />}
          <span>{libraryItem ? "Remove from library" : "Add to shortlist"}</span>
        </CommandItem>
        <CommandItem
          value={`${libraryItem?.status === "watched" ? "edit watched rating notes" : "mark watched"} ${details.title}`}
          onSelect={onOpenWatchedDialog}
        >
          <Eye />
          <span>
            {libraryItem?.status === "watched"
              ? "Edit watched entry"
              : "Mark as watched"}
          </span>
        </CommandItem>
      </CommandGroup>

      {actions.length > 0 ? (
        <>
          <CommandSeparator />
          <CommandGroup heading="Configured actions">
            {actions.map((action) => {
              const Icon = actionIcon(action.icon);
              const label = configuredActionLabel(action);
              return (
                <CommandItem
                  key={action.id}
                  value={`configured action ${label} ${action.group}`}
                  onSelect={() => onTriggerConfiguredAction(action)}
                >
                  <Icon />
                  <span>{label}</span>
                  <CommandShortcut>{action.group}</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </>
      ) : null}
    </>
  );
}
