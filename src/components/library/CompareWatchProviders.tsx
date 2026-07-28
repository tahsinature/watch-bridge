import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { providerLogoUrl } from "@/lib/tmdb";
import type { CountryProviders, WatchProvider } from "@/types";

const PROVIDER_LIMIT = 4;

interface CompareWatchProvidersProps {
  region: string | undefined;
  providers: CountryProviders | undefined;
  loading: boolean;
  failed: boolean;
}

/** Compact regional availability cell for the shortlist comparison table. */
export function CompareWatchProviders({
  region,
  providers,
  loading,
  failed,
}: CompareWatchProvidersProps) {
  if (loading) {
    return <Skeleton className="h-12 w-36 rounded-none" />;
  }

  if (!region) {
    return <AvailabilityMessage>Select a country</AvailabilityMessage>;
  }

  if (failed) {
    return <AvailabilityMessage>Unavailable</AvailabilityMessage>;
  }

  const groups = providers
    ? [
        {
          label: "Stream",
          providers: dedupeProviders([
            ...providers.flatrate,
            ...providers.free,
            ...providers.ads,
          ]),
        },
        {
          label: "Rent/buy",
          providers: dedupeProviders([
            ...providers.rent,
            ...providers.buy,
          ]),
        },
      ].filter((group) => group.providers.length > 0)
    : [];

  if (!providers || groups.length === 0) {
    return <AvailabilityMessage>Not listed</AvailabilityMessage>;
  }

  return (
    <a
      href={providers.link}
      target="_blank"
      rel="noreferrer"
      className="group/watch block min-w-40 space-y-1.5"
      title={`Open ${region} availability on JustWatch`}
    >
      {groups.map((group) => (
        <span
          key={group.label}
          className="grid grid-cols-[3.25rem_1fr] items-center gap-2"
        >
          <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
            {group.label}
          </span>
          <ProviderLogos providers={group.providers} />
        </span>
      ))}
      <span className="sr-only">Open on JustWatch</span>
    </a>
  );
}

function dedupeProviders(providers: WatchProvider[]): WatchProvider[] {
  const unique = new Map<number, WatchProvider>();
  for (const provider of providers) unique.set(provider.id, provider);
  return [...unique.values()];
}

function ProviderLogos({ providers }: { providers: WatchProvider[] }) {
  const visible = providers.slice(0, PROVIDER_LIMIT);
  const remaining = providers.length - visible.length;

  return (
    <span className="flex min-w-0 items-center gap-1">
      {visible.map((provider) => (
        <ProviderLogo key={provider.id} provider={provider} />
      ))}
      {remaining > 0 ? (
        <span
          className="grid size-6 place-items-center border border-border bg-secondary text-[9px] text-muted-foreground"
          title={`${remaining} more provider${remaining === 1 ? "" : "s"}`}
        >
          +{remaining}
        </span>
      ) : null}
      <ExternalLink className="ml-0.5 size-3 text-muted-foreground opacity-0 transition-opacity group-hover/watch:opacity-100" />
    </span>
  );
}

function ProviderLogo({ provider }: { provider: WatchProvider }) {
  const logo = providerLogoUrl(provider.logoPath, "w45");

  return (
    <span
      className="grid size-6 shrink-0 place-items-center overflow-hidden border border-border bg-secondary text-[8px] font-semibold uppercase text-muted-foreground"
      title={provider.name}
    >
      {logo ? (
        <img
          src={logo}
          alt={provider.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        provider.name.slice(0, 2)
      )}
    </span>
  );
}

function AvailabilityMessage({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-muted-foreground">{children}</p>;
}
