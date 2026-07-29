import { Check, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CompareTableRow } from "./CompareTableRow";
import {
  COMPARE_FIELD_OPTIONS,
  DEFAULT_COMPARE_FIELDS,
  type CompareField,
} from "@/lib/compareFields";
import { cn } from "@/lib/utils";
import { useSettings } from "@/stores/settings";
import type { LibraryItem } from "@/types";

interface CompareViewProps {
  items: LibraryItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenDetail: (item: LibraryItem) => void;
}

export function CompareView({
  items,
  open,
  onOpenChange,
  onOpenDetail,
}: CompareViewProps) {
  const region = useSettings((state) => state.regions[0]);
  const compareFields = useSettings((state) => state.compareFields);
  const setCompareFields = useSettings((state) => state.setCompareFields);

  const toggleField = (field: CompareField) => {
    setCompareFields(
      compareFields.includes(field)
        ? compareFields.filter((current) => current !== field)
        : [...compareFields, field],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-none gap-0 overflow-hidden p-0 sm:w-[min(96vw,80rem)]">
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-border px-4 py-4 pr-14 sm:gap-4 sm:px-5">
          <DialogTitle>
            Compare{" "}
            <span className="font-normal text-muted-foreground">
              {items.length}
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Compare shortlisted titles in a configurable table.
          </DialogDescription>
          <CompareFieldPicker
            fields={compareFields}
            onToggle={toggleField}
            onReset={() => setCompareFields(DEFAULT_COMPARE_FIELDS)}
          />
        </DialogHeader>

        <CompareTable
          items={items}
          fields={compareFields}
          region={region}
          onOpenDetail={onOpenDetail}
        />
      </DialogContent>
    </Dialog>
  );
}

function CompareFieldPicker({
  fields,
  onToggle,
  onReset,
}: {
  fields: CompareField[];
  onToggle: (field: CompareField) => void;
  onReset: () => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 />
          Fields
          <span className="border-l border-border pl-2 text-muted-foreground">
            {fields.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="mb-1 flex items-center justify-between px-2 py-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Visible fields
          </p>
          <button
            type="button"
            onClick={onReset}
            className="text-[10px] uppercase tracking-wider text-primary hover:underline"
          >
            Reset
          </button>
        </div>
        {COMPARE_FIELD_OPTIONS.map((field) => {
          const selected = fields.includes(field.id);
          return (
            <button
              key={field.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(field.id)}
              className={cn(
                "flex w-full items-center gap-2 px-2 py-2 text-left text-xs transition-colors hover:bg-secondary",
                selected && "text-foreground",
                !selected && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-4 place-items-center border",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {selected ? <Check className="size-3" /> : null}
              </span>
              {field.label}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function CompareTable({
  items,
  fields,
  region,
  onOpenDetail,
}: {
  items: LibraryItem[];
  fields: CompareField[];
  region: string | undefined;
  onOpenDetail: (item: LibraryItem) => void;
}) {
  const visibleOptions = COMPARE_FIELD_OPTIONS.filter((field) =>
    fields.includes(field.id),
  );

  return (
    <Table
      containerClassName="max-h-[calc(92vh-4.5rem)] overflow-x-hidden overflow-y-auto scrollbar-thin sm:overflow-auto"
      className="block min-w-0 border-separate border-spacing-0 sm:table sm:min-w-max"
    >
      <TableHeader className="sticky top-0 z-30 hidden bg-popover shadow-[0_1px_0_hsl(var(--border))] sm:table-header-group">
        <TableRow className="hover:bg-transparent">
          <TableHead className="sticky left-0 z-40 min-w-64 border-r border-border bg-popover px-4 text-[10px] uppercase tracking-wider text-muted-foreground">
            Title
          </TableHead>
          {visibleOptions.map((field) => (
            <TableHead
              key={field.id}
              className={cn(
                "px-4 text-[10px] uppercase tracking-wider text-muted-foreground",
                field.id === "genres" && "min-w-44",
                field.id === "watchProviders" && "min-w-48",
              )}
            >
              {field.id === "watchProviders" && region
                ? `${field.label} · ${region}`
                : field.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="block space-y-3 p-3 [&_tr:last-child]:border sm:table-row-group sm:space-y-0 sm:p-0 sm:[&_tr:last-child]:border-0">
        {items.map((item) => (
          <CompareTableRow
            key={`${item.mediaType}-${item.id}`}
            item={item}
            fields={fields}
            region={region}
            onOpen={() => onOpenDetail(item)}
          />
        ))}
      </TableBody>
    </Table>
  );
}
