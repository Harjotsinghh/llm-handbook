// ─── Index / Manifest types ───

export interface IndexData {
    meta: {
        title: string;
        subtitle: string;
        version: string;
        description: string;
    };
    chapters: ChapterIndex[];
}

export interface ChapterIndex {
    id: string;
    group?: string;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    file: string;  // relative path e.g. "chapters/ch1.json"
}

// ─── Full chapter data (loaded lazily) ───

export interface HandbookData {
    meta: {
        title: string;
        subtitle: string;
        version: string;
        description: string;
    };
    chapters: Chapter[];
}


export interface Chapter {
    id: string;
    title: string;
    subtitle?: string;
    icon?: string;
    color?: string;
    sections: Section[];
}

export type Section =
    | HeroSection
    | RoadmapSection
    | IntroSection
    | KeyTakeawaySection
    | ReferencesSection
    | ContentSection;

export interface HeroSection {
    type: "hero";
    heading: string;
    subheading: string;
    body: string;
}

export interface RoadmapSection {
    type: "roadmap";
    heading: string;
    items: { num: number; label: string; tag: string; desc?: string; url?: string }[];
}

export interface IntroSection {
    type: "intro";
    heading: string;
    body: string;
}

export interface KeyTakeawaySection {
    type: "keyTakeaway";
    points: string[];
}

export interface ReferencesSection {
    type: "references";
    items: { num: number; text: string; url: string | null }[];
}

export interface ContentSection {
    type: "section";
    id?: string;
    heading?: string;
    blocks: Block[];
}

export type Block =
    | TextBlock
    | EquationBlock
    | CalloutBlock
    | ComparisonBlock
    | StepsBlock
    | CodeBlock
    | DefinitionBlock
    | ListBlock
    | RunbookBlock
    | CaseStudyBlock
    | MermaidBlock
    | TableBlock
    | LinksBlock
    | ResourceBlock;

export interface TextBlock { type: "text"; content: string; }
export interface EquationBlock { type: "equation"; label?: string; tex: string; description?: string; }
export interface CalloutBlock { type: "callout"; style: "insight" | "concept" | "warning" | "important"; title: string; content: string; }
export interface ComparisonBlock {
    type: "comparison";
    items: { title: string; description: string; pros?: string[]; cons?: string[] }[];
}
export interface StepsBlock { type: "steps"; title?: string; items: string[]; }
export interface CodeBlock { type: "code"; language?: string; filename?: string; code: string; }
export interface DefinitionBlock { type: "definition"; term: string; definition: string; }
export interface ListBlock {
    type: "list";
    style: "detail" | "metric";
    items: { label: string; detail: string }[];
}
export interface RunbookBlock {
    type: "runbook";
    symptom: string;
    rootCause: string;
    fixes: string[];
}
export interface CaseStudyBlock {
    type: "caseStudy";
    goal: string;
    pipeline: { stage: string; detail: string }[];
    takeaway: string;
}
export interface MermaidBlock { type: "mermaid"; title?: string; code: string; }
export interface TableBlock {
    type: "table";
    title?: string;
    headers: string[];
    rows: string[][];
}
export interface LinksBlock {
    type: "links";
    items: { label: string; url: string }[];
}

export interface ResourceBlock {
    type: "resource";
    items: { label: string; description: string; url: string }[];
}
