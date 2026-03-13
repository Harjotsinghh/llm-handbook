import { useReferences } from "../../context/ReferencesContext";
import { inlineMd } from "../../utils/inlineMd";

interface Props {
    items: { label: string; description: string; url: string }[];
}

export default function ResourceBlock({ items }: Props) {
    const refs = useReferences();
    const md = (t: string) => inlineMd(t, refs);
    const getDomainLabel = (url: string) => {
        try {
            return new URL(url).hostname.replace(/^www\./, "");
        } catch {
            return "External";
        }
    };

    return (
        <div className="resource-block">
            {items.map((item, i) => (
                <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-card"
                >
                    <div className="resource-header">
                        <span className="resource-icon">↗</span>
                        <span className="resource-label">{item.label}</span>
                    </div>
                    <p
                        className="resource-description"
                        dangerouslySetInnerHTML={{ __html: md(item.description) }}
                    />
                    <div className="resource-meta">
                        <span className="resource-domain">{getDomainLabel(item.url)}</span>
                        <span className="resource-open">Open resource</span>
                    </div>
                </a>
            ))}
        </div>
    );
}
