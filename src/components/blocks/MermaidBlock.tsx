import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";

mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: {
        primaryColor: "#6366f1",
        primaryTextColor: "#f1f5f9",
        primaryBorderColor: "#4f46e5",
        lineColor: "#64748b",
        secondaryColor: "#1e293b",
        tertiaryColor: "#1a1f35",
        background: "#1a1f35",
        mainBkg: "#1a1f35",
        nodeBorder: "#4f46e5",
        clusterBkg: "rgba(99,102,241,0.08)",
        clusterBorder: "rgba(99,102,241,0.3)",
        titleColor: "#a5b4fc",
        edgeLabelBackground: "#0a0e1a",
        fontSize: "14px",
    },
    flowchart: { curve: "basis", padding: 16 },
});

interface Props {
    title?: string;
    code: string;
}

export default function MermaidBlock({ title, code }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string>("");
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const id = "mermaid-" + Math.random().toString(36).slice(2, 10);
        const render = async () => {
            try {
                const { svg } = await mermaid.render(id, code);
                setSvgContent(svg);
                if (ref.current) {
                    ref.current.innerHTML = svg;
                }
            } catch (e) {
                setError(String(e));
            }
        };
        render();
    }, [code]);

    const handleClose = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains("mermaid-modal-overlay")) {
            setModalOpen(false);
        }
    }, []);

    // Close on Escape
    useEffect(() => {
        if (!modalOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setModalOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [modalOpen]);

    return (
        <>
            <div className="mermaid-block compact">
                <div className="mermaid-header">
                    {title && <div className="mermaid-title">📊 {title}</div>}
                    {!error && (
                        <button
                            className="mermaid-expand-icon-btn"
                            onClick={() => setModalOpen(true)}
                            aria-label="Expand diagram"
                            title="Expand Diagram"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <polyline points="9 21 3 21 3 15"></polyline>
                                <line x1="21" y1="3" x2="14" y2="10"></line>
                                <line x1="3" y1="21" x2="10" y2="14"></line>
                            </svg>
                        </button>
                    )}
                </div>
                {error ? (
                    <div className="mermaid-error">
                        <pre>{code}</pre>
                        <small>Diagram render error</small>
                    </div>
                ) : (
                    <div className="mermaid-preview" ref={ref} />
                )}
            </div>

            {/* Full-size modal */}
            {modalOpen && (
                <div className="mermaid-modal-overlay" onClick={handleClose}>
                    <div className="mermaid-modal">
                        <div className="mermaid-modal-header">
                            <span className="mermaid-modal-title">{title || "Diagram"}</span>
                            <button className="mermaid-modal-close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div
                            className="mermaid-modal-body"
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
