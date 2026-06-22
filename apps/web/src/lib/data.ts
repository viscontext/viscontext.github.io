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
    type: "static" | "interactive" | "dashboard" | "story";
    topic: "cities" | "climate" | "economy" | "energy" | "environment" | "health" | "mobility" | "society";
    visualKind: "bars" | "dashboard" | "line" | "map" | "scatter" | "small-multiples";
    title: string;
    year: number;
    fictional: boolean;
    canonicalUrl: string;
  };
  contributors: Array<{ displayName: string; role: string }>;
  visualizations: {
    totalCount: number;
    listingMode: "complete" | "sampled";
    items: Array<{
      id: string;
      title: string;
      visualKind: "bars" | "dashboard" | "line" | "map" | "scatter" | "small-multiples";
      description: string;
      context?: {
        chartType?: string;
        visualEncoding?: string;
        knownLimitations?: string;
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
