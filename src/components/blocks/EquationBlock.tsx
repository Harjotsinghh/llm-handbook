import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { inlineMd } from "../../utils/inlineMd";
import { useReferences } from "../../context/ReferencesContext";

interface Props {
    label?: string;
    tex: string;
    description?: string;
}

export default function EquationBlock({ label, tex, description }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const refs = useReferences();

    useEffect(() => {
        if (ref.current) {
            try {
                katex.render(tex, ref.current, { displayMode: true, throwOnError: false });
            } catch {
                ref.current.textContent = tex;
            }
        }
    }, [tex]);

    return (
        <div className="equation-block">
            {label && <div className="equation-label">📐 {label}</div>}
            <div className="equation-tex" ref={ref} />
            {description && (
                <div
                    className="equation-desc"
                    dangerouslySetInnerHTML={{ __html: inlineMd(description, refs) }}
                />
            )}
        </div>
    );
}
