import mermaid from "mermaid";
import type { Component } from "solid-js";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";

interface Props {
  code: string;
}

const Mermaid: Component<Props> = (props) => {
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [zoomLevel, setZoomLevel] = createSignal(1);
  const [panPosition, setPanPosition] = createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [startPan, setStartPan] = createSignal({ x: 0, y: 0 });
  const [modalContent, setModalContent] = createSignal<HTMLDivElement>();

  // Handle keyboard events for modal
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isModalOpen()) return;

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
  };

  // Handle scroll lock and cleanup
  createEffect(() => {
    if (isModalOpen()) {
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
  });

  onMount(() => {
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

    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("astro:after-swap", handleContentChange);
      document.documentElement.classList.remove("modal-open");
      document.documentElement.style.removeProperty("--scrollbar-width");
    });
  });

  const openModal = () => {
    setIsModalOpen(true);
    resetView();
    setTimeout(() => {
      mermaid.contentLoaded();
      const dialog = modalContent() as HTMLElement;
      dialog?.focus?.();
    }, 100);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetView();
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click
    setIsDragging(true);
    setStartPan({
      x: e.clientX - panPosition().x,
      y: e.clientY - panPosition().y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;
    setPanPosition({
      x: e.clientX - startPan().x,
      y: e.clientY - startPan().y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const delta = -Math.sign(e.deltaY) * 0.1;
      const newZoom = Math.max(0.5, Math.min(3, zoomLevel() + delta));
      setZoomLevel(newZoom);
    } else {
      // Pan
      setPanPosition((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  return (
    <>
      <div
        class="relative my-4 cursor-pointer overflow-hidden rounded-lg bg-white transition-transform duration-200 ease-in-out hover:scale-[1.01] focus:scale-[1.01] focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-900 dark:focus:ring-indigo-400"
        onClick={openModal}
        role="button"
        tabindex="0"
        aria-label="Open diagram in modal"
        onKeyDown={(e) => e.key === "Enter" && openModal()}
      >
        <div class="mermaid">{props.code}</div>
      </div>

      <Show when={isModalOpen()}>
        <Portal mount={document.getElementById("portal-root")!}>
          <div
            class="animate-fadeIn fixed inset-0 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={closeModal}
            role="presentation"
          >
            <div
              class="animate-slideIn relative flex h-[90vh] max-h-[800px] w-[95vw] max-w-[1200px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl outline-none dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              tabindex="-1"
              ref={setModalContent}
            >
              <div class="flex items-center justify-between border-b border-gray-200 bg-white/95 p-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
                <div class="rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {Math.round(zoomLevel() * 100)}%
                </div>
                <div class="flex gap-2">
                  <button
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-all duration-200 hover:bg-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:focus:ring-indigo-400"
                    onClick={zoomOut}
                    aria-label="Zoom out"
                    title="Zoom out (⌘-)"
                    disabled={zoomLevel() <= 0.5}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-gray-700 dark:text-gray-300"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>
                  <button
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-all duration-200 hover:bg-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:hover:bg-gray-800 dark:focus:ring-indigo-400"
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
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-gray-700 dark:text-gray-300"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </button>
                  <button
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-all duration-200 hover:bg-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:focus:ring-indigo-400"
                    onClick={zoomIn}
                    aria-label="Zoom in"
                    title="Zoom in (⌘+)"
                    disabled={zoomLevel() >= 3}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-gray-700 dark:text-gray-300"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>
                  <button
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-all duration-200 hover:bg-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:hover:bg-gray-800 dark:focus:ring-indigo-400"
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
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-gray-700 dark:text-gray-300"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                class="flex-1 overflow-hidden p-8 select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{
                  transform: `scale(${zoomLevel()}) translate(${panPosition().x}px, ${panPosition().y}px)`,
                  cursor: isDragging() ? "grabbing" : "grab",
                  transition: "transform 0.1s ease",
                  "transform-origin": "center center",
                  "will-change": "transform",
                }}
              >
                <div class="mermaid">{props.code}</div>
              </div>
            </div>
          </div>
        </Portal>
      </Show>

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
};

export default Mermaid;
