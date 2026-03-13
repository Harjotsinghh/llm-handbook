---
description: Update an existing chapter with new information, deduplicating and structuring it into the LLM handbook format
---

# Update Chapter Workflow

This workflow is designed to incrementally update an existing chapter's JSON payload with new information provided by the user (like new research, missing concepts, or fixes), ensuring data is cleanly synthesized, deduplicated, and properly formatted without rewriting the entire chapter from scratch.

## How to Invoke

Send a request like:
- `/update-chapter 5 with information about QLoRA from [URL/Text]`
- "Please update chapter 8 with the following new inference optimization techniques..."

## Steps

### 1. Identify Target Chapter & Information

Determine the target chapter number `{N}` and gather all raw text, URLs, or context the user has provided.

### 2. Read the Current Chapter Data

Read the existing chapter JSON. Use the `view_file` tool to read the complete JSON file at:
`/Users/harjotsingh/personal_projects/gemini_llms/llm-handbook/public/assets/chapters/ch{N}.json`

*Note: If the chapter JSON is very long, page through it using `StartLine` and `EndLine` to ensure you understand the existing structure.*

### 3. Analyze & Deduplicate

Review the existing `sections` and `blocks` inside the chapter JSON.
Compare the *new* information against the *existing* information:
- **Avoid Duplication:** Do not add information that already exists in the chapter.
- **Find the Insertion Point:** Determine if the new information belongs in an existing section (e.g., adding a block to "3.1 Inference") or requires a brand new section (e.g., "3.5 Speculative Decoding").
- **Update Existing Data:** If the user specifically requested a correction to an existing block, prepare to replace it.

### 4. Format New Information as JSON Blocks

Format the new information strictly adhering to the project's payload schema.

Choose the most appropriate block type:
| Type | Use Case | Required Fields |
|------|---------|-----------------|
| `text` | Standard paragraphs | `content` |
| `equation` | Math formulas | `tex`, `label`, `description` |
| `code` | Code snippets | `code`, `language` |
| `callout` | Warnings/Insights | `style` (insight/warning/important), `title`, `content` |
| `mermaid` | Architecture diagrams| `code`, `title` |

*(Refer to `parse-chapter.md` for the exhaustive schema if needed).*

### 5. Apply the Edits Programmatically

Use the `replace_file_content` or `multi_replace_file_content` tools to inject your new JSON objects into the target `ch{N}.json` file. 

**CRITICAL GUIDELINES FOR EDITING JSON:**
- Be extremely careful with JSON syntax (commas, brackets, braces).
- When appending a new section or block array, ensure trailing commas are valid.
- If editing a massive file, prefer targeting the exact `TargetContent` for just the array or block you are augmenting. 

### 6. Verify

// turbo
Run a quick JSON validation check to ensure your edits didn't break the syntax of the chapter:
```bash
python3 -m json.tool /Users/harjotsingh/personal_projects/gemini_llms/llm-handbook/public/assets/chapters/ch{N}.json > /dev/null && echo "JSON is valid." || echo "JSON ERROR! Fix immediately."
```

If it errors out, fix the JSON structure immediately. If it says "JSON is valid", your update is complete.
