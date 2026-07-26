import {
  Bookmark,
  Bot,
  Clapperboard,
  Copy,
  Database,
  Download,
  ExternalLink,
  Film,
  Globe,
  HardDrive,
  Link,
  type LucideIcon,
  Magnet,
  Play,
  Rocket,
  Search,
  Send,
  Server,
  Star,
  Tv,
  Youtube,
  Zap,
} from "lucide-react";

/** Curated icon set for actions — keys double as the values stored on disk. */
export const ACTION_ICONS: Record<string, LucideIcon> = {
  Download,
  Magnet,
  Search,
  Youtube,
  Film,
  Clapperboard,
  Copy,
  Star,
  Link,
  ExternalLink,
  Globe,
  Server,
  HardDrive,
  Database,
  Send,
  Play,
  Tv,
  Bookmark,
  Rocket,
  Bot,
  Zap,
};

export const ACTION_ICON_NAMES = Object.keys(ACTION_ICONS);

/** Resolve a stored icon name to a component, falling back to a safe default. */
export function actionIcon(name: string): LucideIcon {
  return ACTION_ICONS[name] ?? Zap;
}
