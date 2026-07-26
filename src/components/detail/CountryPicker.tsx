import { useCallback, useMemo, useState } from "react";
import { Check, ChevronDown, Globe, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface Country {
  code: string;
  name: string;
}

interface CountryPickerProps {
  available: Country[];
  selected: string[];
  onToggle: (code: string) => void;
}

/** Searchable multi-select for countries that have availability data. */
export function CountryPicker({ available, selected, onToggle }: CountryPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q,
    );
  }, [available, query]);

  // Selected countries stay pinned above the rest.
  const { chosen, rest } = useMemo(() => {
    const isSelected = (c: Country) => selected.includes(c.code);
    return {
      chosen: filtered.filter(isSelected),
      rest: filtered.filter((c) => !isSelected(c)),
    };
  }, [filtered, selected]);

  /**
   * Radix Dialog locks page scrolling (react-remove-scroll), which also
   * swallows wheel events for this portaled popover. Stopping them at the list
   * lets the browser scroll it natively. Callback ref so the listener attaches
   * when the popover content actually mounts.
   */
  const attachScrollFix = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const stop = (event: Event) => event.stopPropagation();
    node.addEventListener("wheel", stop, { passive: false });
    node.addEventListener("touchmove", stop, { passive: false });
  }, []);

  const label =
    selected.length === 0
      ? "Select countries"
      : selected.length === 1
        ? (available.find((c) => c.code === selected[0])?.name ?? selected[0])
        : `${selected.length} countries`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background/60 px-2.5 text-sm transition-colors hover:border-primary/50">
          <Globe className="size-4 text-muted-foreground" />
          <span className="max-w-[10rem] truncate">{label}</span>
          <ChevronDown className="size-4 opacity-60" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries…"
              className="h-9 pl-8"
            />
          </div>
        </div>

        <div
          ref={attachScrollFix}
          className="max-h-64 overflow-y-auto overscroll-contain p-1 scrollbar-thin"
        >
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No matches
            </p>
          ) : (
            <>
              {chosen.length > 0 && (
                <>
                  <SectionLabel>Selected</SectionLabel>
                  {chosen.map((country) => (
                    <CountryOption
                      key={country.code}
                      country={country}
                      isSelected
                      onToggle={onToggle}
                    />
                  ))}
                </>
              )}

              {rest.length > 0 && (
                <>
                  {chosen.length > 0 && <SectionLabel>All countries</SectionLabel>}
                  {rest.map((country) => (
                    <CountryOption
                      key={country.code}
                      country={country}
                      isSelected={false}
                      onToggle={onToggle}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function CountryOption({
  country,
  isSelected,
  onToggle,
}: {
  country: Country;
  isSelected: boolean;
  onToggle: (code: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(country.code)}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary"
    >
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded border",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border",
        )}
      >
        {isSelected && <Check className="size-3" />}
      </span>
      <span className="flex-1 truncate">{country.name}</span>
      <span className="text-[10px] uppercase text-muted-foreground">
        {country.code}
      </span>
    </button>
  );
}
