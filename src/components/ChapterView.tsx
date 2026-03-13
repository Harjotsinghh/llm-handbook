import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { Chapter } from "../types";
import { ReferencesContext } from "../context/ReferencesContext";
import SectionRenderer from "./sections/SectionRenderer";

interface Props {
    chapter: Chapter;
}

export default function ChapterView({ chapter }: Props) {
    const [tocOpen, setTocOpen] = useState(false);
    const [tocQuery, setTocQuery] = useState("");
    const [activeSectionId, setActiveSectionId] = useState<string>("");
    const isRoadmapChapter = chapter.id === "ch0";
    const deferredTocQuery = useDeferredValue(tocQuery);
    const normalizedTocQuery = deferredTocQuery.trim().toLowerCase();

    // Build a references map from the chapter's references section
    const refsMap = useMemo(() => {
        const map: Record<number, string> = {};
        for (const section of chapter.sections) {
            if (section.type === "references") {
                for (const ref of section.items) {
                    if (ref.url) {
                        map[ref.num] = ref.url;
                    }
                }
            }
        }
        return map;
    }, [chapter]);

    // Build table of contents from content sections
    const tocItems = useMemo(() => {
        return chapter.sections
            .filter((s): s is import("../types").ContentSection =>
                s.type === "section" && !!s.heading && !!(s as import("../types").ContentSection).id
            )
            .map((s) => {
                const heading = s.heading!;
                // Detect heading level from numbers like "1.", "1.1", "2.1.3"
                const match = heading.match(/^(\d+(?:\.\d+)*)\.?\s/);
                let level = 1;
                if (match) {
                    level = match[1].split('.').length;
                }
                return { id: s.id!, heading, level };
            });
    }, [chapter]);

    const filteredTocItems = useMemo(() => {
        if (!normalizedTocQuery) return tocItems;

        return tocItems.filter((item) => item.heading.toLowerCase().includes(normalizedTocQuery));
    }, [normalizedTocQuery, tocItems]);

    useEffect(() => {
        if (tocItems.length === 0) return;

        const sectionElements = tocItems
            .map((item) => ({ id: item.id, element: document.getElementById(item.id) }))
            .filter((entry): entry is { id: string; element: HTMLElement } => !!entry.element);

        if (sectionElements.length === 0) return;

        const updateActiveSection = () => {
            const activationLine = window.innerHeight * 0.28;
            let nextActiveId = sectionElements[0].id;

            for (const section of sectionElements) {
                if (section.element.getBoundingClientRect().top <= activationLine) {
                    nextActiveId = section.id;
                } else {
                    break;
                }
            }

            const reachedBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;

            if (reachedBottom) {
                nextActiveId = sectionElements[sectionElements.length - 1].id;
            }

            setActiveSectionId((current) => (current === nextActiveId ? current : nextActiveId));
        };

        let ticking = false;
        const handleScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                updateActiveSection();
                ticking = false;
            });
        };

        updateActiveSection();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [tocItems]);

    const handleTocClick = (sectionId: string) => {
        const el = document.getElementById(sectionId);
        if (el) {
            setActiveSectionId(sectionId);
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <ReferencesContext.Provider value={refsMap}>
            <article className={`chapter-view ${isRoadmapChapter ? "chapter-roadmap" : ""}`}>
                {!isRoadmapChapter && (
                    <header
                        className="chapter-header"
                        style={{ "--accent": chapter.color || "#6366f1" } as React.CSSProperties}
                    >
                        <div>
                            <h1 className="chapter-title">{chapter.title}</h1>
                            {chapter.subtitle && <p className="chapter-subtitle">{chapter.subtitle}</p>}
                        </div>
                    </header>
                )}

                {/* Collapsible mini Table of Contents */}
                {tocItems.length > 2 && (
                    <nav className="chapter-toc">
                        <button
                            className="toc-toggle"
                            onClick={() => setTocOpen(!tocOpen)}
                        >
                            <span className="toc-label">On this page</span>
                            <span className="toc-count">{filteredTocItems.length} sections</span>
                            <span className={`toc-chevron ${tocOpen ? "open" : ""}`}>▾</span>
                        </button>
                        {tocOpen && (
                            <>
                                {tocItems.length > 4 && (
                                    <div className="toc-search-wrap">
                                        <input
                                            className="toc-search"
                                            type="search"
                                            placeholder="Jump to a section..."
                                            value={tocQuery}
                                            onChange={(event) => setTocQuery(event.target.value)}
                                        />
                                    </div>
                                )}
                                <div className="toc-list">
                                    {filteredTocItems.map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={`toc-link ${activeSectionId === item.id ? "active" : ""}`}
                                            aria-current={activeSectionId === item.id ? "location" : undefined}
                                            style={{ paddingLeft: `${8 + (item.level - 1) * 16}px` }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleTocClick(item.id);
                                            }}
                                        >
                                            {item.heading}
                                        </a>
                                    ))}
                                    {filteredTocItems.length === 0 && (
                                        <p className="toc-empty-state">
                                            No section matches that search yet.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </nav>
                )}

                <div className="chapter-content">
                    {chapter.sections.map((section, i) => (
                        <SectionRenderer key={i} section={section} chapterColor={chapter.color} />
                    ))}
                </div>
            </article>
        </ReferencesContext.Provider>
    );
}
