import siteData from "../../../../generated/data/site.json";

export interface PresentationField {
  id: string;
  label: string;
  help: string;
  valueType: "text" | "url";
}

export interface PresentationSection {
  id: string;
  label: string;
  description: string;
  fields: PresentationField[];
}

export interface ContextRecord {
  id: string;
  version: string;
  frameworkVersion: string;
  status: string;
  work: {
    type: "static" | "interactive" | "dashboard" | "story" | "video";
    topic: "cities" | "climate" | "economy" | "energy" | "environment" | "health" | "mobility" | "society";
    visualKind: "animation" | "bars" | "dashboard" | "line" | "map" | "scatter" | "small-multiples";
    title: string;
    year: number;
    fictional: boolean;
    canonicalUrl: string;
  };
  contributors: Array<{ displayName: string; role: string; affiliation?: string }>;
  provenance?: {
    mode: "imported";
    provider: string;
    externalId: string;
    sourceUrl: string;
    metadataUrl?: string;
    archivedUrl?: string;
    retrievedAt: string;
    sourceUpdatedAt?: string;
    attribution: string;
    normalizationNotes: string[];
  };
  visualizations: {
    totalCount: number;
    listingMode: "complete" | "sampled";
    items: Array<{
      id: string;
      title: string;
      visualKind: "animation" | "bars" | "dashboard" | "line" | "map" | "scatter" | "small-multiples";
      description: string;
      context?: {
        chartType?: string;
        visualEncoding?: string;
        knownLimitations?: string;
      };
      media?: {
        selection: "complete" | "representative";
        items: Array<{
          id: string;
          label: string;
          kind: "data" | "frame-set" | "image" | "interactive" | "metadata" | "video";
          url?: string;
          format?: string;
          dimensions?: string;
          fileSize?: string;
          itemCount?: number;
          description?: string;
        }>;
      };
    }>;
  };
  sections: Record<string, Record<string, unknown>>;
}

export interface SiteData {
  framework: {
    id: string;
    version: string;
    status: string;
    sections: Array<{ id: string; schema: string }>;
    terminology: {
      project: { name: string; description: string };
      terms: {
        record: { singular: string; plural: string };
        section: { singular: string; plural: string };
        work: { singular: string; plural: string };
      };
    };
    presentation: {
      record: { eyebrow: string; frameworkNotice: string };
      sections: PresentationSection[];
    };
  };
  records: ContextRecord[];
}

export const data = siteData as SiteData;
export const { framework, records } = data;
export const terminology = framework.terminology;

type Visualization = ContextRecord["visualizations"]["items"][number];

function getDisplayUrl(sourceUrl: string): string {
  const source = new URL(sourceUrl);
  if (source.hostname === "svs.gsfc.nasa.gov") {
    const params = new URLSearchParams({ url: sourceUrl, w: "1024" });
    return `https://images.weserv.nl/?${params.toString()}`;
  }
  return sourceUrl;
}

export function getVisualizationPreview(visualization: Visualization): string | undefined {
  const sourceUrl = visualization.media?.items.find((asset) => asset.kind === "image" && asset.url)?.url;
  return sourceUrl ? getDisplayUrl(sourceUrl) : undefined;
}

export function getRecordPreview(record: ContextRecord): string | undefined {
  return record.visualizations.items
    .map(getVisualizationPreview)
    .find((preview): preview is string => Boolean(preview));
}
