import { Fragment, useMemo } from "react";
import { Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CountryPicker, type Country } from "./CountryPicker";
import { providerLogoUrl } from "@/lib/tmdb";
import { useSettings } from "@/stores/settings";
import { cn } from "@/lib/utils";
import type { CountryProviders, TitleDetails, WatchProvider } from "@/types";

let regionNames: Intl.DisplayNames | null = null;
function countryName(code: string): string {
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function dedupeById(list: WatchProvider[]): WatchProvider[] {
  const seen = new Set<number>();
  return list.filter((p) => (seen.has(p.id) ? false : seen.add(p.id)));
}

type GroupKey = "flatrate" | "free" | "rent" | "buy";
const GROUPS: { key: GroupKey; label: string }[] = [
  { key: "flatrate", label: "Stream" },
  { key: "free", label: "Free" },
  { key: "rent", label: "Rent" },
  { key: "buy", label: "Buy" },
];

function providersFor(cp: CountryProviders, key: GroupKey): WatchProvider[] {
  if (key === "free") return dedupeById([...cp.free, ...cp.ads]);
  return cp[key];
}

interface ProviderRow {
  provider: WatchProvider;
  /** Selected countries offering this provider for the group. */
  codes: Set<string>;
  /** JustWatch page of the first offering country. */
  link: string;
  inAll: boolean;
}

/** Collapse one access-type group across countries into one row per provider. */
function buildRows(
  details: TitleDetails,
  columns: Country[],
  key: GroupKey,
): ProviderRow[] {
  const map = new Map<
    number,
    { provider: WatchProvider; codes: Set<string>; link: string }
  >();

  for (const country of columns) {
    const cp = details.watchProviders[country.code];
    for (const provider of providersFor(cp, key)) {
      const existing = map.get(provider.id);
      if (existing) existing.codes.add(country.code);
      else {
        map.set(provider.id, {
          provider,
          codes: new Set([country.code]),
          link: cp.link,
        });
      }
    }
  }

  return [...map.values()]
    .map((v) => ({ ...v, inAll: columns.length >= 2 && v.codes.size === columns.length }))
    .sort(
      (a, b) =>
        b.codes.size - a.codes.size ||
        a.provider.name.localeCompare(b.provider.name),
    );
}

/** Availability matrix: providers as rows, selected countries as columns. */
export function WhereToWatch({ details }: { details: TitleDetails }) {
  const regions = useSettings((s) => s.regions);
  const toggleRegion = useSettings((s) => s.toggleRegion);

  const available: Country[] = useMemo(
    () =>
      Object.keys(details.watchProviders)
        .map((code) => ({ code, name: countryName(code) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [details.watchProviders],
  );

  if (available.length === 0) return null;

  const availableCodes = new Set(available.map((c) => c.code));
  const columns: Country[] = regions
    .filter((code) => availableCodes.has(code))
    .map((code) => ({ code, name: countryName(code) }));

  const multiCountry = columns.length >= 2;
  const attributionLink = columns[0]
    ? details.watchProviders[columns[0].code].link
    : details.watchProviders[available[0].code].link;

  const groups = GROUPS.map((group) => ({
    ...group,
    rows: buildRows(details, columns, group.key),
  })).filter((group) => group.rows.length > 0);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="eyebrow">Where to watch</h3>
        <CountryPicker available={available} selected={regions} onToggle={toggleRegion} />
      </div>

      {columns.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          None of your selected countries list this title. Pick one from the country
          menu above to see where it&rsquo;s available.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table containerClassName="max-h-80 overflow-y-auto scrollbar-thin">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky top-0 z-10 bg-card pl-3 text-xs uppercase tracking-wide text-muted-foreground">
                  Provider
                </TableHead>
                {multiCountry &&
                  columns.map((country) => (
                    <TableHead
                      key={country.code}
                      className="sticky top-0 z-10 bg-card text-center text-xs uppercase tracking-wide text-muted-foreground"
                    >
                      {country.name}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {groups.map((group) => (
                <Fragment key={group.key}>
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={multiCountry ? columns.length + 1 : 1}
                      className="bg-secondary/40 py-1.5 pl-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {group.label}
                    </TableCell>
                  </TableRow>

                  {group.rows.map((row) => (
                    <TableRow
                      key={row.provider.id}
                      className={cn(row.inAll && "bg-cyan/[0.07]")}
                    >
                      <TableCell className="pl-3">
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noreferrer"
                          title={`${row.provider.name} — open on JustWatch`}
                          className="flex items-center gap-2.5 hover:underline"
                        >
                          <ProviderLogo provider={row.provider} />
                          <span className="font-medium">{row.provider.name}</span>
                        </a>
                      </TableCell>

                      {multiCountry &&
                        columns.map((country) => (
                          <TableCell key={country.code} className="text-center">
                            {row.codes.has(country.code) ? (
                              <Check
                                className={cn(
                                  "mx-auto size-4",
                                  row.inAll ? "text-cyan" : "text-primary",
                                )}
                              />
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {multiCountry && (
          <>
            <span className="mr-1 inline-block size-2 rounded-full bg-cyan align-middle" />
            Highlighted rows are available in all {columns.length} countries.{" "}
          </>
        )}
        Availability data from{" "}
        <a
          href={attributionLink}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          JustWatch
        </a>
        .
      </p>
    </section>
  );
}

function ProviderLogo({ provider }: { provider: WatchProvider }) {
  const logo = providerLogoUrl(provider.logoPath);
  return (
    <span className="size-7 shrink-0 overflow-hidden rounded-md ring-1 ring-border/60">
      {logo ? (
        <img src={logo} alt="" className="size-full object-cover" />
      ) : (
        <span className="grid size-full place-items-center bg-secondary text-[9px] font-semibold text-muted-foreground">
          {provider.name.slice(0, 2)}
        </span>
      )}
    </span>
  );
}
