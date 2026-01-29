"use client";

import mermaid from "mermaid";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  code: string;
}

export default function Mermaid({ code }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const modalContentRef = useRef<HTMLDivElement>(null);
  const portalRootRef = useRef<Element | null>(null);

  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    resetView();
    setTimeout(() => {
      mermaid.contentLoaded();
      modalContentRef.current?.focus();
    }, 100);
  }, [resetView]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetView();
  }, [resetView]);

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "0" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        resetZoom();
      } else if (e.key === "+" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        zoomOut();
      }
    },
    [isModalOpen, closeModal, resetZoom, zoomIn, zoomOut],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // Only handle left click
      setIsDragging(true);
      setStartPan({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      });
    },
    [panPosition],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPanPosition({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    },
    [isDragging, startPan],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = -Math.sign(e.deltaY) * 0.1;
        const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
        setZoomLevel(newZoom);
      } else {
        // Pan
        setPanPosition((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [zoomLevel],
  );

  // Handle scroll lock
  useEffect(() => {
    if (isModalOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty(
        "--scrollbar-width",
        `${scrollbarWidth}px`,
      );
      document.documentElement.classList.add("modal-open");
    } else {
      document.documentElement.classList.remove("modal-open");
      document.documentElement.style.removeProperty("--scrollbar-width");
    }

    return () => {
      document.documentElement.classList.remove("modal-open");
      document.documentElement.style.removeProperty("--scrollbar-width");
    };
  }, [isModalOpen]);

  // Initialize mermaid and event listeners
  useEffect(() => {
    if (typeof document === "undefined") return;

    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      themeVariables: {
        darkMode: document.documentElement.classList.contains("dark"),
      },
    });

    document.addEventListener("keydown", handleKeyDown);

    const handleContentChange = () => {
      mermaid.contentLoaded();
    };
    document.addEventListener("astro:after-swap", handleContentChange);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("astro:after-swap", handleContentChange);
    };
  }, [handleKeyDown]);

  // Find portal root
  useEffect(() => {
    portalRootRef.current = document.getElementById("portal-root");
  }, []);

  const transformStyle = {
    transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
    cursor: isDragging ? "grabbing" : "grab",
    transformOrigin: "center center" as const,
    willChange: "transform" as const,
  };

  return (
    <>
      <div
        className="bg-surface focus:ring-accent relative my-4 cursor-pointer overflow-hidden rounded-lg transition-transform duration-200 ease-in-out hover:scale-[1.01] focus:scale-[1.01] focus:ring-2 focus:outline-none"
        onClick={openModal}
        role="button"
        tabIndex={0}
        aria-label="Open diagram in modal"
        onKeyDown={(e) => e.key === "Enter" && openModal()}
      >
        <div className="mermaid">{code}</div>
      </div>

      {isModalOpen &&
        portalRootRef.current &&
        createPortal(
          <div
            className="animate-fadeIn fixed inset-0 grid place-items-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: "var(--color-overlay)" }}
            onClick={closeModal}
            role="presentation"
          >
            <div
              className="animate-slideIn bg-surface relative flex h-[90vh] max-h-[800px] w-[95vw] max-w-[1200px] flex-col overflow-hidden rounded-xl shadow-2xl outline-none"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              tabIndex={-1}
              ref={modalContentRef}
            >
              <div className="border-border bg-surface/95 flex items-center justify-between border-b p-4 backdrop-blur">
                <div className="bg-surface-muted text-muted-foreground rounded px-2 py-1 text-sm font-medium">
                  {Math.round(zoomLevel * 100)}%
                </div>
                <div className="flex gap-2">
                  <button
                    className="border-border hover:bg-surface-muted focus:ring-accent inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-transparent transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={zoomOut}
                    aria-label="Zoom out"
                    title="Zoom out (⌘-)"
                    disabled={zoomLevel <= 0.5}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>
                  <button
                    className="border-border hover:bg-surface-muted focus:ring-accent inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-transparent transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={resetZoom}
                    aria-label="Reset zoom"
                    title="Reset zoom (⌘0)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </button>
                  <button
                    className="border-border hover:bg-surface-muted focus:ring-accent inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-transparent transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={zoomIn}
                    aria-label="Zoom in"
                    title="Zoom in (⌘+)"
                    disabled={zoomLevel >= 3}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>
                  <button
                    className="border-border hover:bg-surface-muted focus:ring-accent inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-transparent transition-all duration-200 focus:ring-2 focus:outline-none"
                    onClick={closeModal}
                    aria-label="Close modal"
                    title="Close (Esc)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                className="flex-1 overflow-hidden p-8 select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={transformStyle}
              >
                <div className="mermaid">{code}</div>
              </div>
            </div>
          </div>,
          portalRootRef.current,
        )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn,
          .animate-slideIn,
          .transition-all,
          .transition-transform {
            animation: none !important;
            transition: none !important;
          }
        }

        :global(.mermaid) {
          background: transparent !important;
        }
      `}</style>
    </>
  );
}
