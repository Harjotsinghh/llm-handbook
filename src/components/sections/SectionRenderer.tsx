import { useState } from "react";
import type { Section } from "../../types";
import { inlineMd } from "../../utils/inlineMd";
import { useReferences } from "../../context/ReferencesContext";
import BlockRenderer from "../blocks/BlockRenderer";

interface Props {
    section: Section;
    chapterColor?: string;
}

const REFS_COLLAPSED_COUNT = 6;

export default function SectionRenderer({ section, chapterColor }: Props) {
    const refs = useReferences();
    const md = (t: string) => inlineMd(t, refs);
    const [refsExpanded, setRefsExpanded] = useState(false);

    switch (section.type) {
        case "hero":
            return (
                <div className="hero-section" style={{ "--accent": chapterColor } as React.CSSProperties}>
                    <h1 className="hero-heading">{section.heading}</h1>
                    <p className="hero-subheading">{section.subheading}</p>
                    <p className="hero-body" dangerouslySetInnerHTML={{ __html: md(section.body) }} />
                </div>
            );

        case "roadmap":
            return (
                <div className="roadmap-section">
                    <div className="roadmap-section-header">
                        <h2 className="section-heading roadmap-section-heading">{section.heading}</h2>
                        <span className="roadmap-section-count">{section.items.length} chapters</span>
                    </div>
                    <div className="roadmap-grid">
                        {section.items.map((item, i) => {
                            const Tag = item.url ? "a" : "div";
                            const props = item.url ? { href: item.url, className: "roadmap-item interactive" } : { className: "roadmap-item" };
                            return (
                                <Tag key={i} {...props}>
                                    <div className="roadmap-header">
                                        <span className="roadmap-num">{item.num}</span>
                                        <span className="roadmap-label" dangerouslySetInnerHTML={{ __html: md(item.label) }} />
                                        {item.tag && <span className="roadmap-tag">{item.tag}</span>}
                                    </div>
                                    {item.desc && (
                                        <div className="roadmap-desc" dangerouslySetInnerHTML={{ __html: md(item.desc) }} />
                                    )}
                                </Tag>
                            );
                        })}
                    </div>
                </div>
            );

        case "intro":
            return (
                <div className="intro-section">
                    <h2 className="section-heading">{section.heading}</h2>
                    <div className="intro-body" dangerouslySetInnerHTML={{ __html: md(section.body) }} />
                </div>
            );

        case "keyTakeaway":
            return (
                <div className="key-takeaway-section">
                    <h3 className="key-takeaway-title">🎯 Key Takeaways</h3>
                    <ul className="key-takeaway-list">
                        {section.points.map((pt, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: md(pt) }} />
                        ))}
                    </ul>
                </div>
            );

        case "references": {
            const total = section.items.length;
            const visible = refsExpanded ? section.items : section.items.slice(0, REFS_COLLAPSED_COUNT);
            const hasMore = total > REFS_COLLAPSED_COUNT;

            return (
                <div className="references-section">
                    <div className="references-header">
                        <h3 className="references-title">References</h3>
                        <span className="references-count">{total} sources</span>
                    </div>
                    <div className="references-grid-compact">
                        {visible.map((ref, i) => (
                            ref.url ? (
                                <a
                                    key={i}
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ref-card"
                                >
                                    <span className="ref-badge">{ref.num}</span>
                                    <span className="ref-card-text">{ref.text}</span>
                                    <span className="ref-card-arrow">↗</span>
                                </a>
                            ) : (
                                <div key={i} className="ref-card no-link">
                                    <span className="ref-badge">{ref.num}</span>
                                    <span className="ref-card-text">{ref.text}</span>
                                </div>
                            )
                        ))}
                    </div>
                    {hasMore && (
                        <button
                            className="refs-toggle-btn"
                            onClick={() => setRefsExpanded(!refsExpanded)}
                        >
                            {refsExpanded ? "Show less" : `Show all ${total} references`}
                            <span className={`refs-toggle-icon ${refsExpanded ? "expanded" : ""}`}>▼</span>
                        </button>
                    )}
                </div>
            );
        }

        case "section":
            return (
                <div className="content-section" id={section.id}>
                    {section.heading && <h2 className="section-heading">{section.heading}</h2>}
                    {section.blocks.map((block, i) => (
                        <BlockRenderer key={i} block={block} />
                    ))}
                </div>
            );

        default:
            return null;
    }
}
