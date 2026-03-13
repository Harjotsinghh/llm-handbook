---
description: Parse a chapter PDF text file into structured JSON for the LLM handbook
---

# Parse Chapter Workflow

This workflow converts a chapter's PDF into the structured JSON format used by the React handbook viewer, writing to  individual chapter files.

## How to Invoke

Say: `/parse-chapter` followed by the chapter number:
- Example: `/parse-chapter 3` — parses chapter 3
- Example: `/parse-chapter 5` — parses chapter 5

## Architecture

The app uses a **split data architecture**:
- `app/public/assets/index.json` — Lightweight manifest with chapter metadata (id, title, subtitle, icon, color, file path)
- `app/public/assets/chapters/ch{N}.json` — Individual chapter files with full section data

## Steps

### 1. Extract the chapter text from its PDF

// turbo
Extract text from the PDF at `/Users/harjotsingh/personal_projects/gemini_llms/chapters/chapter {N}.pdf` using pymupdf's `fitz` and save it to `/tmp/chapter_texts/chapter {N}.txt`:
```bash
mkdir -p /tmp/chapter_texts && python3 -c "import fitz; doc = fitz.open('/Users/harjotsingh/personal_projects/gemini_llms/chapters/chapter {N}.pdf'); text = ''; [(text := text + page.get_text()) for page in doc]; open('/tmp/chapter_texts/chapter {N}.txt', 'w').write(text)"
```

### 2. Read the FULL chapter text — EVERY LINE

**CRITICAL: You MUST read the ENTIRE text file, not just the first 800 lines.** 

Use `view_file` to read `/tmp/chapter_texts/chapter {N}.txt`. If the file has more than 800 lines, you MUST make additional `view_file` calls with `StartLine` and `EndLine` to read every remaining line. Do NOT skip any portion of the file. You need every single line to perform exhaustive extraction.

For example, if the file is 1200 lines:
1. `view_file` (lines 1-800)
2. `view_file` with `StartLine=801, EndLine=1200`

You should have seen every line of the chapter text before proceeding to Step 3.

### 3. Convert the chapter text to structured JSON

Using your understanding of the **complete** chapter content (from Step 2), convert it into a JSON object following this **exact schema**:

```typescript
{
  "id": "ch{N}",           // e.g. "ch3"  
  "title": "N. Chapter Title",
  "subtitle": "Short description",
  "icon": "emoji",          // Choose an appropriate emoji
  "color": "#hexcolor",     // Choose a distinct hex color
  "sections": Section[]     // Array of sections (see below)
}
```

#### Section Types

Each section MUST have a `type` field. Available types:

**`intro`** — Chapter introduction
```json
{ "type": "intro", "heading": "...", "body": "Markdown text with **bold** and `code`" }
```

**`section`** — Main content section (most common)
```json
{ "type": "section", "id": "s{N}-{num}", "heading": "Section Heading", "blocks": Block[] }
```

**`keyTakeaway`** — Summary points (put at end before references)
```json
{ "type": "keyTakeaway", "points": ["**Point 1** explanation", "**Point 2** explanation"] }
```

**`references`** — Works cited (MUST include ALL references with URLs)
```json
{ "type": "references", "items": [{ "num": 1, "text": "Title - Source", "url": "https://..." }] }
```

#### Block Types (inside `section.blocks[]`)

Use the MOST SPECIFIC block type that fits. Available types:

| Type | When to Use | Required Fields |
|------|------------|-----------------|
| `text` | Regular paragraphs | `content` (supports **bold**, `code`, *italic*, [N] citations) |
| `equation` | Mathematical formulas | `tex` (LaTeX), optional `label`, `description` |
| `code` | Code snippets | `code`, `language` (python/typescript/bash), optional `filename` |
| `mermaid` | Diagrams/flowcharts | `code` (valid Mermaid syntax), optional `title` |
| `table` | Tabular data | `headers` (string[]), `rows` (string[][]), optional `title` |
| `callout` | Important insights/warnings | `style` (insight/concept/warning/important), `title`, `content` |
| `comparison` | Side-by-side comparisons | `items` array with `title`, `description`, `pros[]`, `cons[]` |
| `steps` | Ordered processes | `items` (string[]), optional `title` |
| `list` | Labeled detail lists | `style` (detail/metric), `items` with `label` and `detail` |
| `definition` | Term definitions | `term`, `definition` |
| `runbook` | Troubleshooting guides | `symptom`, `rootCause`, `fixes` (string[]) |
| `caseStudy` | Real-world examples | `goal`, `pipeline` ({stage, detail}[]), `takeaway` |
| `links` | External resources | `items` with `label` and `url` |

### 4. Content Conversion Rules

Follow these rules strictly:

1. **EXHAUSTIVE EXTRACTION — ZERO INFORMATION LOSS:**
   - **DO NOT summarize, skip, condense, or paraphrase.** Every single paragraph, equation, concept, code snippet, table row, and bullet point from the original text MUST appear in the final JSON.
   - If a section in the PDF has 5 paragraphs, the JSON must have 5 corresponding `text` blocks (or equivalent structured blocks).
   - The resulting JSON should be **very long** — typically 200-500+ lines. If your output is short (under 100 lines of JSON), you are almost certainly summarizing.
   - When in doubt, include MORE content, not less.

2. **Inline citations**: Keep `[N]` markers in text — they become clickable links via the references section.

3. **Code blocks**: Extract all Python/code snippets with proper `language` field.

4. **Mermaid diagrams**: If the PDF contains `graph TD`, `graph LR`, `flowchart`, `sequenceDiagram`, etc., extract as `mermaid` blocks. Clean up any PDF artifacts (random line breaks, page markers).

5. **Equations**: Convert mathematical formulas to LaTeX (`tex` field). Add a human-readable `label` and `description`. **Important**: In JSON strings, backslashes must be double-escaped (e.g., `\\frac` not `\frac`). For underscores in LaTeX text commands, use `\\_` (which becomes `\\\\_` in JSON).

6. **Tables**: Extract tabular data with proper `headers` and `rows` arrays. All rows from the original must be included.

7. **References**: Extract **ALL** items from the "Works cited" section with their URLs. Every single reference must be included — do not skip any. Reassemble URLs that were broken across lines in the PDF.

8. **Bold key terms**: Use `**term**` for important concepts in text blocks.

9. **Section structure**: Follow the chapter's natural heading hierarchy (1., 1.1, 1.1.1, etc.).

10. **Callouts**: Use for engineering tips, important warnings, or notable insights.

11. **Comparisons**: Use when the text compares two or more approaches/tools/methods.

### 5. Write the chapter JSON file

Write the complete chapter JSON object directly to:

```
/Users/harjotsingh/personal_projects/gemini_llms/app/public/assets/chapters/ch{N}.json
```

Use `write_to_file` with `Overwrite: true`. This file is the **only** file the app loads for this chapter — it is self-contained.

### 6. Update the index manifest (if new chapter)

Check if the chapter **already exists** in the index:

// turbo
```bash
grep -c '"ch{N}"' /Users/harjotsingh/personal_projects/gemini_llms/app/public/assets/index.json
```

- **If the count is > 0** (chapter already in index): You may optionally update the title/subtitle/icon/color in `index.json` if they changed, using `replace_file_content`. Usually no changes needed.
- **If the count is 0** (new chapter): Add an entry to the `chapters` array in `index.json` using `replace_file_content`. The entry should look like:

```json
{
    "id": "ch{N}",
    "title": "N. Chapter Title",
    "subtitle": "Short description",
    "icon": "emoji",
    "color": "#hexcolor",
    "file": "chapters/ch{N}.json"
}
```

Insert it in the correct position (by chapter number) within the `chapters` array.

### 7. Verify

// turbo
Run a quick validation:
```bash
python3 -c "import json; ch=json.load(open('/Users/harjotsingh/personal_projects/gemini_llms/app/public/assets/chapters/ch{N}.json')); print(f'Chapter \"{ch[\"title\"]}\" has {len(ch[\"sections\"])} sections')"
```

A well-extracted chapter should typically have 8-15+ sections (intro + content sections + keyTakeaway + references).

## Example Output

Here's a minimal example of what a chapter file (`ch3.json`) should look like:

```json
{
  "id": "ch3",
  "title": "3. Continuous Pretraining",
  "subtitle": "Domain Adaptation, Data Engineering & Distributed Training",
  "icon": "🔄",
  "color": "#10b981",
  "sections": [
    {
      "type": "intro",
      "heading": "Continuous Pretraining for Domain Adaptation",
      "body": "When a general-purpose LLM needs **domain expertise** (finance, medicine, law), Continuous Pretraining (CPT) provides an efficient alternative to training from scratch. [1]"
    },
    {
      "type": "section",
      "id": "s3-1",
      "heading": "3.1 The Mathematical Foundation",
      "blocks": [
        { "type": "text", "content": "CPT uses the standard **causal language modeling** objective. [2]" },
        { "type": "equation", "label": "CLM Loss", "tex": "\\mathcal{L} = -\\sum_{t=1}^{T} \\log P(x_t | x_{<t}; \\theta)", "description": "Minimizes the negative log-likelihood of predicting the next token." },
        { "type": "mermaid", "title": "CPT Pipeline", "code": "graph LR\n  A[Base Model] --> B[Domain Corpus]\n  B --> C[CPT Training]\n  C --> D[Domain Expert]" }
      ]
    },
    {
      "type": "keyTakeaway",
      "points": [
        "**CPT** is 10x cheaper than training from scratch for domain adaptation.",
        "**Data mixing** (domain + general) prevents catastrophic forgetting."
      ]
    },
    {
      "type": "references",
      "items": [
        { "num": 1, "text": "Adapting LLMs to Domains - arXiv", "url": "https://arxiv.org/..." },
        { "num": 2, "text": "Language Modeling Objective - Wikipedia", "url": "https://en.wikipedia.org/..." }
      ]
    }
  ]
}
```
