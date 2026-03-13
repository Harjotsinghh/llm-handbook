import katex from "katex";

/**
 * Renders a LaTeX string to HTML using KaTeX.
 * Returns the original string wrapped in a span if rendering fails.
 */
function renderMath(tex: string, displayMode: boolean): string {
    try {
        return katex.renderToString(tex, {
            displayMode,
            throwOnError: false,
            strict: false,
        });
    } catch {
        return `<span class="math-error">${tex}</span>`;
    }
}

/**
 * Converts inline markdown (bold, italic, code, math) to HTML.
 * Supports:
 *   - `$...$` for inline math
 *   - `$$...$$` for display math
 *   - `**bold**`, `*italic*`, `` `code` ``
 *   - `[N]` citation markers (when refs provided)
 */
export function inlineMd(
    text: string,
    refs?: Record<number, string>
): string {
    if (!text) return "";

    // First, process display math $$...$$ (before inline to avoid conflicts)
    let result = text.replace(/\$\$([^$]+)\$\$/g, (_match, tex) =>
        renderMath(tex.trim(), true)
    );

    // Then, process inline math $...$
    // Use a regex that avoids matching currency-like patterns (e.g., "$5")
    result = result.replace(/\$([^$\n]+?)\$/g, (_match, tex) =>
        renderMath(tex.trim(), false)
    );

    // Standard inline markdown
    result = result
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-link">$1</a>')
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Convert [N] citation markers to clickable superscript links
    if (refs) {
        result = result.replace(/\[(\d+)\]/g, (_match, num) => {
            const n = parseInt(num, 10);
            const url = refs[n];
            if (url) {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="citation-link" title="Reference ${n}"><sup>[${n}]</sup></a>`;
            }
            return `<sup class="citation-no-link">[${n}]</sup>`;
        });
    }

    return result;
}
