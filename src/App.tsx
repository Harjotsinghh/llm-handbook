import { useEffect, useState, useCallback, useRef } from "react";
import type { IndexData, ChapterIndex, Chapter } from "./types";
import Sidebar from "./components/Sidebar";
import ChapterView from "./components/ChapterView";
import "./index.css";

const ASSETS_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/assets`;

/** Read chapter id from URL hash, e.g. #ch5 → "ch5" */
function getHashChapterId(): string {
  const hash = window.location.hash.replace("#", "");
  return hash || "";
}

export default function App() {
  const [index, setIndex] = useState<IndexData | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string>("");
  const [chapterCache, setChapterCache] = useState<Record<string, Chapter>>({});
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const defaultChapterId = index?.chapters[0]?.id || "";

  // 1. Load the lightweight index on mount
  useEffect(() => {
    fetch(`${ASSETS_BASE}/index.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: IndexData) => {
        setIndex(d);
        // Restore chapter from URL hash, or default to first
        const hashId = getHashChapterId();
        const validHash = d.chapters.some((c) => c.id === hashId);
        setActiveChapterId(validHash ? hashId : d.chapters[0]?.id || "");
      })
      .catch((e) => setError(String(e)));
  }, []);

  // 2. Lazy-load a chapter's full data on demand
  const loadChapter = useCallback(
    async (entry: ChapterIndex) => {
      if (chapterCache[entry.id]) return;
      setLoadingChapter(true);
      try {
        const r = await fetch(`${ASSETS_BASE}/${entry.file}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const chapter: Chapter = await r.json();
        setChapterCache((prev) => ({ ...prev, [entry.id]: chapter }));
      } catch (e) {
        setError(String(e));
      } finally {
        setLoadingChapter(false);
      }
    },
    [chapterCache]
  );

  // 3. Load active chapter whenever it changes + update URL hash
  useEffect(() => {
    if (!index || !activeChapterId) return;
    // Keep the default landing chapter on a clean URL and hash-link the rest.
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(
      null,
      "",
      activeChapterId === defaultChapterId ? cleanUrl : `#${activeChapterId}`
    );
    const entry = index.chapters.find((c) => c.id === activeChapterId);
    if (entry) loadChapter(entry);
  }, [index, activeChapterId, defaultChapterId, loadChapter]);

  // Listen to hash changes (e.g. clicking a link to #ch5 in the TOC)
  useEffect(() => {
    const handleHashChange = () => {
      const hashId = getHashChapterId();
      if (!index) return;

      if (!hashId) {
        if (activeChapterId !== defaultChapterId && defaultChapterId) {
          setActiveChapterId(defaultChapterId);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (hashId !== activeChapterId) {
        const validHash = index.chapters.some((c) => c.id === hashId);
        if (validHash) {
          setActiveChapterId(hashId);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [index, activeChapterId, defaultChapterId]);

  useEffect(() => {
    const isCompactViewport = window.innerWidth <= 900;
    if (!isCompactViewport) return;

    const previousOverflow = document.body.style.overflow;
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  // 4. Save scroll position per chapter to sessionStorage
  useEffect(() => {
    const handleScroll = () => {
      if (activeChapterId) {
        sessionStorage.setItem(`scroll_${activeChapterId}`, String(window.scrollY));
      }
    };
    // Throttle
    let ticking = false;
    const throttled = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", throttled, { passive: true });
    return () => window.removeEventListener("scroll", throttled);
  }, [activeChapterId]);

  // 5. Restore scroll position when chapter loads
  const activeChapter = chapterCache[activeChapterId];
  useEffect(() => {
    if (!activeChapter) return;
    const saved = sessionStorage.getItem(`scroll_${activeChapterId}`);
    if (saved) {
      // Small delay to let DOM render
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(saved, 10) });
      });
    }
  }, [activeChapter, activeChapterId]);

  // Handle chapter selection
  const handleSelectChapter = (id: string) => {
    if (id === activeChapterId) return;
    setActiveChapterId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="error-screen">
        <h1>Error loading data</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Loading The LLM Engineer's Handbook…</p>
      </div>
    );
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        chapters={index.chapters}
        activeId={activeChapterId}
        onSelect={handleSelectChapter}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="main-content" ref={mainRef}>
        {loadingChapter && !activeChapter ? (
          <div className="loading-screen" style={{ height: "60vh" }}>
            <div className="loader" />
            <p>Loading chapter…</p>
          </div>
        ) : activeChapter ? (
          <>
            <ChapterView key={activeChapter.id} chapter={activeChapter} />
            <footer className="site-footer">
              <div className="footer-content">
                <div className="footer-copy">
                  <p className="footer-label">Educational Resource</p>
                  <p className="footer-note">
                    For educational purposes only. Content is curated from deep research
                    using <strong>Gemini</strong> and <strong>ChatGPT</strong>. Verify
                    important details independently before practical use.
                  </p>
                </div>
                <div className="footer-meta">
                  <p className="footer-tech-line">
                    Built with{" "}
                    <a
                      className="footer-tech-link"
                      href="https://react.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      React
                    </a>{" "}
                    and{" "}
                    <a
                      className="footer-tech-link"
                      href="https://vite.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Vite
                    </a>
                  </p>
                  <div className="footer-socials">
                    <a href="https://github.com/Harjotsinghh" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.166 6.84 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    </a>
                    <a href="https://www.linkedin.com/in/harjotsi/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </>
        ) : null}
      </main>
    </div>
  );
}
