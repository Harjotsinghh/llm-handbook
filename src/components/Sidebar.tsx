import { useDeferredValue, useMemo, useState } from "react";
import type { ChapterIndex } from "../types";

interface Props {
    chapters: ChapterIndex[];
    activeId: string;
    onSelect: (id: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export default function Sidebar({
    chapters, activeId, onSelect, isOpen, onToggle, collapsed, onToggleCollapse
}: Props) {
    const [query, setQuery] = useState("");
    const deferredQuery = useDeferredValue(query);
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const filteredChapters = useMemo(() => {
        if (!normalizedQuery) return chapters;

        return chapters.filter((chapter) => {
            const haystack = [
                chapter.id,
                chapter.group,
                chapter.title,
                chapter.subtitle,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [chapters, normalizedQuery]);

    return (
        <>
            <button
                className={`mobile-menu-btn ${isOpen ? "open" : ""}`}
                onClick={onToggle}
                aria-label="Toggle Menu"
            >
                {isOpen ? "✕" : "☰"}
            </button>
            <button
                className={`sidebar-backdrop ${isOpen ? "visible" : ""}`}
                onClick={onToggle}
                aria-label="Close navigation"
                type="button"
            />

            <aside className={`sidebar ${isOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}>
                <div className="sidebar-header">
                    {!collapsed && (
                        <>
                            <h2 className="sidebar-title">LLM Handbook</h2>
                            <p className="sidebar-subtitle">The Not-So-Complete Guide</p>
                        </>
                    )}
                    <button
                        className="collapse-btn"
                        onClick={onToggleCollapse}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? "›" : "‹"}
                    </button>
                </div>

                {!collapsed && (
                    <div className="sidebar-search-wrap">
                        <label className="sidebar-search-label" htmlFor="sidebar-search">
                            Search chapters
                        </label>
                        <input
                            id="sidebar-search"
                            className="sidebar-search"
                            type="search"
                            placeholder="Try LoRA, inference, alignment..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        <div className="sidebar-search-meta">
                            {normalizedQuery
                                ? `${filteredChapters.length} result${filteredChapters.length === 1 ? "" : "s"}`
                                : `${chapters.length} chapters`}
                        </div>
                    </div>
                )}

                <nav className="sidebar-nav">
                    {filteredChapters.map((ch, idx) => {
                        const previousGroup = filteredChapters[idx - 1]?.group;
                        const showGroup = ch.group && (idx === 0 || previousGroup !== ch.group);
                        return (
                            <div key={ch.id} className="nav-item-wrapper">
                                {showGroup && !collapsed && (
                                    <div className="sidebar-group-label">{ch.group}</div>
                                )}
                                {showGroup && collapsed && (
                                    <div className="sidebar-group-divider" />
                                )}
                                <button
                                    className={`nav-item ${activeId === ch.id ? "active" : ""}`}
                                    onClick={() => {
                                        onSelect(ch.id);
                                        if (isOpen) onToggle();
                                    }}
                                    style={
                                        activeId === ch.id
                                            ? ({ "--nav-accent": ch.color || "#6366f1" } as React.CSSProperties)
                                            : undefined
                                    }
                                    title={collapsed ? ch.title : undefined}
                                >
                                    <span className="nav-icon" style={{ backgroundColor: ch.color || '#6366f1' }}>
                                        {ch.id === 'ch0' ? '•' : ch.id.replace('ch', '')}
                                    </span>
                                    {!collapsed && (
                                        <div className="nav-text">
                                            <span className="nav-title">{ch.title}</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}

                    {!collapsed && filteredChapters.length === 0 && (
                        <div className="sidebar-empty-state">
                            <p className="sidebar-empty-title">No chapters found</p>
                            <p className="sidebar-empty-copy">
                                Try a broader topic like training, serving, or evaluation.
                            </p>
                        </div>
                    )}
                </nav>
            </aside>
        </>
    );
}
