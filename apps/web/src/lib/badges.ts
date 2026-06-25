import type { ContextRecord } from "./data";

export const siteOrigin = "https://viscontext.github.io";

export interface BadgeVariant {
  id: string;
  label: string;
  description: string;
  src: string;
  width: number;
  height: number;
}

export const badgeVariants: BadgeVariant[] = [
  {
    id: "standard",
    label: "Standard",
    description: "Default badge for web pages and project footers.",
    src: "/badges/viscontext.svg",
    width: 228,
    height: 36,
  },
  {
    id: "compact",
    label: "Compact",
    description: "Short badge for narrow layouts or figure captions.",
    src: "/badges/viscontext-compact.svg",
    width: 166,
    height: 32,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Inverted badge for light visualizations or white backgrounds.",
    src: "/badges/viscontext-dark.svg",
    width: 228,
    height: 36,
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Small text-first badge when space is tight.",
    src: "/badges/viscontext-minimal.svg",
    width: 126,
    height: 28,
  },
];

export function absoluteUrl(path: string): string {
  return new URL(path, siteOrigin).toString();
}

export function recordPageUrl(recordOrId: ContextRecord | string): string {
  const id = typeof recordOrId === "string" ? recordOrId : recordOrId.id;
  return absoluteUrl(`/records/${id}/`);
}

export function badgeAltText(): string {
  return "Context metadata available on VisContext";
}

export function htmlBadgeEmbed(targetUrl: string, variant: BadgeVariant): string {
  return `<a href="${targetUrl}">
  <img src="${absoluteUrl(variant.src)}" width="${variant.width}" height="${variant.height}" alt="${badgeAltText()}">
</a>`;
}

export function markdownBadgeEmbed(targetUrl: string, variant: BadgeVariant): string {
  return `[![${badgeAltText()}](${absoluteUrl(variant.src)})](${targetUrl})`;
}
