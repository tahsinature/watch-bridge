const FALLBACK_REGION = "US";

// ISO 3166-1 regions represented in the IANA timezone database.
const REGION_CODES = `
  AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI
  BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO
  CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM
  FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HN HR
  HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR
  KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM
  MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU
  NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB
  SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH
  TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU
  WF WS YE YT ZA ZM ZW
`
  .trim()
  .split(/\s+/);

type LocaleWithTimeZones = Intl.Locale & {
  getTimeZones?: () => string[] | undefined;
  readonly timeZones?: string[];
};

function getLocaleRegion(languages: readonly string[]): string | null {
  for (const language of languages) {
    try {
      const locale = new Intl.Locale(language);
      const region = locale.region ?? locale.maximize().region;
      if (region?.length === 2) return region.toUpperCase();
    } catch {
      // Ignore malformed browser language entries and try the next one.
    }
  }
  return null;
}

function getTimeZones(region: string): readonly string[] | null {
  try {
    const locale = new Intl.Locale(`und-${region}`) as LocaleWithTimeZones;
    if (typeof locale.getTimeZones === "function") {
      return locale.getTimeZones() ?? null;
    }
    return locale.timeZones ?? null;
  } catch {
    return null;
  }
}

function getTimeZoneRegion(
  timeZone: string,
  localeRegion: string | null,
): string | null {
  // The locale is the cheapest likely match, but timezone remains authoritative.
  const candidates = localeRegion
    ? [localeRegion, ...REGION_CODES.filter((code) => code !== localeRegion)]
    : REGION_CODES;

  for (const region of candidates) {
    if (getTimeZones(region)?.includes(timeZone)) return region;
  }
  return null;
}

/**
 * Infer the user's country without network requests or location permission.
 * Timezone wins over browser language, so an en-US browser in Bangladesh
 * resolves to BD when its system timezone is Asia/Dhaka.
 */
export function detectBrowserRegion(): string {
  if (typeof navigator === "undefined") return FALLBACK_REGION;

  const browserLanguages = Array.isArray(navigator.languages)
    ? navigator.languages
    : [];
  const languages =
    browserLanguages.length > 0
      ? browserLanguages
      : typeof navigator.language === "string" && navigator.language
        ? [navigator.language]
        : [];
  const localeRegion = getLocaleRegion(languages);

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
      const timeZoneRegion = getTimeZoneRegion(timeZone, localeRegion);
      if (timeZoneRegion) return timeZoneRegion;
    }
  } catch {
    // Locale fallback below still gives a useful default.
  }

  return localeRegion ?? FALLBACK_REGION;
}
