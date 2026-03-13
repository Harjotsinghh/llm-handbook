import CodeMirror from "@uiw/react-codemirror";
import { json as jsonLanguage } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { oneDark } from "@codemirror/theme-one-dark";
import { useEffect, useMemo, useState } from "react";

interface Props {
    language?: string;
    filename?: string;
    code: string;
}

export default function CodeBlock({ language, filename, code }: Props) {
    const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
    const normalizedLanguage = language?.toLowerCase();
    const languageLabel = useMemo(() => {
        switch (normalizedLanguage) {
            case "ts":
            case "typescript":
                return "TypeScript";
            case "tsx":
                return "TSX";
            case "js":
            case "javascript":
                return "JavaScript";
            case "jsx":
                return "JSX";
            case "py":
            case "python":
                return "Python";
            case "json":
                return "JSON";
            case "bash":
            case "sh":
            case "shell":
                return "Shell";
            default:
                return language || "Code";
        }
    }, [language, normalizedLanguage]);

    const extensions = useMemo(() => {
        switch (normalizedLanguage) {
            case "ts":
            case "tsx":
            case "typescript":
                return [javascript({ typescript: true, jsx: normalizedLanguage === "tsx" })];
            case "js":
            case "jsx":
            case "javascript":
                return [javascript({ jsx: normalizedLanguage === "jsx" })];
            case "python":
            case "py":
                return [python()];
            case "json":
                return [jsonLanguage()];
            case "bash":
            case "sh":
            case "shell":
                return [StreamLanguage.define(shell)];
            default:
                return [];
        }
    }, [normalizedLanguage]);

    useEffect(() => {
        if (copyState === "idle") return;

        const timeout = window.setTimeout(() => setCopyState("idle"), 1800);
        return () => window.clearTimeout(timeout);
    }, [copyState]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopyState("copied");
        } catch {
            setCopyState("error");
        }
    };

    return (
        <div className="code-block">
            <div className="code-header">
                <div className="code-meta">
                    <span className="code-filename">{filename || "Snippet"}</span>
                    <span className="code-lang">{languageLabel}</span>
                </div>
                <button
                    type="button"
                    className={`code-copy-btn ${copyState !== "idle" ? copyState : ""}`}
                    onClick={handleCopy}
                >
                    {copyState === "copied" ? "Copied" : copyState === "error" ? "Retry" : "Copy"}
                </button>
            </div>
            <CodeMirror
                value={code}
                theme={oneDark}
                height="auto"
                className="code-editor"
                extensions={extensions}
                editable={false}
                readOnly
                basicSetup={{
                    lineNumbers: true,
                    foldGutter: false,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: false,
                    highlightActiveLine: false,
                    highlightActiveLineGutter: false,
                    autocompletion: false,
                    searchKeymap: false,
                }}
            />
        </div>
    );
}
