import type { Block } from "../../types";
import { inlineMd } from "../../utils/inlineMd";
import { useReferences } from "../../context/ReferencesContext";
import EquationBlock from "./EquationBlock";
import MermaidBlock from "./MermaidBlock";
import CodeBlock from "./CodeBlock";
import TableBlock from "./TableBlock";
import LinksBlock from "./LinksBlock";
import ResourceBlock from "./ResourceBlock";

interface Props {
    block: Block;
}

export default function BlockRenderer({ block }: Props) {
    const refs = useReferences();
    const md = (t: string) => inlineMd(t, refs);

    switch (block.type) {
        case "text":
            return (
                <p className="text-block" dangerouslySetInnerHTML={{ __html: md(block.content) }} />
            );

        case "equation":
            return (
                <EquationBlock label={block.label} tex={block.tex} description={block.description} />
            );

        case "mermaid":
            return <MermaidBlock title={block.title} code={block.code} />;

        case "table":
            return <TableBlock title={block.title} headers={block.headers} rows={block.rows} />;

        case "links":
            return <LinksBlock items={block.items} />;

        case "resource":
            return <ResourceBlock items={block.items} />;

        case "code":
            return <CodeBlock language={block.language} filename={block.filename} code={block.code} />;

        case "callout": {
            const calloutIcon = {
                insight: "💡",
                concept: "🔬",
                warning: "⚠️",
                important: "🔴",
            }[block.style || "insight"];

            return (
                <div className={`callout ${block.style || "insight"}`}>
                    <div className="callout-title">
                        <span className="callout-icon" aria-hidden="true">{calloutIcon}</span>
                        <span className="callout-title-text">{block.title}</span>
                    </div>
                    <div className="callout-content" dangerouslySetInnerHTML={{ __html: md(block.content) }} />
                </div>
            );
        }

        case "comparison":
            return (
                <div className="comparison-grid">
                    {block.items.map((item, i) => (
                        <div className="comparison-card" key={i}>
                            <h4>{item.title}</h4>
                            <div className="desc" dangerouslySetInnerHTML={{ __html: md(item.description) }} />
                            <div className="pros-cons">
                                {(item.pros || []).map((p, j) => (
                                    <div className="pro" key={`p${j}`} dangerouslySetInnerHTML={{ __html: md(p) }} />
                                ))}
                                {(item.cons || []).map((c, j) => (
                                    <div className="con" key={`c${j}`} dangerouslySetInnerHTML={{ __html: md(c) }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );

        case "steps":
            return (
                <div className="steps-block">
                    {block.title && <div className="steps-title">{block.title}</div>}
                    {block.items.map((step, i) => (
                        <div className="step-item" key={i}>
                            <div className="step-num">{i + 1}</div>
                            <div className="step-text" dangerouslySetInnerHTML={{ __html: md(step) }} />
                        </div>
                    ))}
                </div>
            );

        case "definition":
            return (
                <div className="definition-block">
                    <div className="definition-term">{block.term}</div>
                    <div className="definition-text" dangerouslySetInnerHTML={{ __html: md(block.definition) }} />
                </div>
            );

        case "list":
            return (
                <div className={block.style === "metric" ? "metric-list" : "detail-list"}>
                    {block.items.map((item, i) => (
                        <div className={block.style === "metric" ? "metric-item" : "detail-item"} key={i}>
                            <div className={block.style === "metric" ? "metric-label" : "detail-label"}>{item.label}</div>
                            <div
                                className={block.style === "metric" ? "metric-text" : "detail-text"}
                                dangerouslySetInnerHTML={{ __html: md(item.detail) }}
                            />
                        </div>
                    ))}
                </div>
            );

        case "runbook":
            return (
                <div className="runbook-block">
                    <div className="runbook-section symptom">
                        <div className="runbook-label">🔴 Symptom</div>
                        <div className="runbook-text" dangerouslySetInnerHTML={{ __html: md(block.symptom) }} />
                    </div>
                    <div className="runbook-section root-cause">
                        <div className="runbook-label">🔍 Root Cause</div>
                        <div className="runbook-text" dangerouslySetInnerHTML={{ __html: md(block.rootCause) }} />
                    </div>
                    <div className="runbook-section fixes">
                        <div className="runbook-label">🛠️ Fixes (In Order)</div>
                        {block.fixes.map((f, i) => (
                            <div className="runbook-fix-item" key={i}>
                                <span className="runbook-fix-num">{i + 1}.</span>
                                <span dangerouslySetInnerHTML={{ __html: md(f) }} />
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "caseStudy":
            return (
                <div className="case-study">
                    <div className="case-study-goal">
                        <div className="label">🎯 Goal</div>
                        <div className="text" dangerouslySetInnerHTML={{ __html: md(block.goal) }} />
                    </div>
                    <div className="case-study-pipeline">
                        {block.pipeline.map((s, i) => (
                            <div className="pipeline-stage" key={i}>
                                <span className="pipeline-stage-name">{s.stage}</span>
                                <span className="pipeline-stage-detail" dangerouslySetInnerHTML={{ __html: md(s.detail) }} />
                            </div>
                        ))}
                    </div>
                    <div className="case-study-takeaway">
                        <div className="label">💡 Key Takeaway</div>
                        <div className="text" dangerouslySetInnerHTML={{ __html: md(block.takeaway) }} />
                    </div>
                </div>
            );

        default:
            return <p className="text-block">[Unknown block type]</p>;
    }
}
