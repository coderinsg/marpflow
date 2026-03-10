import React, { useMemo, useEffect } from 'react';
import { Marp } from '@marp-team/marp-core';
import { useStore } from '../store/useStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Preview: React.FC = () => {
  const markdown = useStore((state) => state.markdown);
  const theme = useStore((state) => state.theme);
  const isPreviewFullscreen = useStore((state) => state.isPreviewFullscreen);
  const currentSlide = useStore((state) => state.currentSlide);
  const setSlideCount = useStore((state) => state.setSlideCount);

  // 1. Render the full presentation (only when markdown changes)
  const renderResult = useMemo(() => {
    const marp = new Marp({
      container: false,
      html: true,
      inlineSVG: true,
    });

    const { html, css } = marp.render(markdown);
    
    // Robustly split HTML into individual slides using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const slides = Array.from(doc.body.children).map(child => child.outerHTML);

    return { html, css, slides };
  }, [markdown]);

  // ✅ Tell the store the slide count whenever it changes
  // Use a ref to prevent redundant updates during the same render cycle
  const lastSlideCount = React.useRef<number>(0);
  useEffect(() => {
    const count = renderResult.slides.length;
    if (count !== lastSlideCount.current) {
      lastSlideCount.current = count;
      // Use a microtask to ensure we're not updating state during another component's render
      Promise.resolve().then(() => {
        setSlideCount(count);
      });
    }
  }, [renderResult.slides.length, setSlideCount]);

  // 2. Apply theme and select current slide
  const { displayHtml, displayCss, slideCount } = useMemo(() => {
    const customStyle = `
      svg.marpit {
        background-color: ${theme.backgroundColor};
        margin-bottom: ${isPreviewFullscreen ? '0' : '4rem'};
        box-shadow: ${isPreviewFullscreen ? 'none' : '0 10px 30px rgba(0,0,0,0.1)'};
        transition: background-color 0.3s ease;
      }
      /* High specificity to beat theme defaults but allow inline style (directive) overrides */
      div.marpit section, div.marpit-fullscreen section, [class*="marpit"] section {
        background-color: ${theme.backgroundColor};
        color: ${theme.textColor};
        font-family: "${theme.fontFamily}", sans-serif !important;
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      /* Ensure body text elements inherit the section color */
      .marpit section p, .marpit section li, .marpit section blockquote, .marpit section span, .marpit section div,
      [class*="marpit"] section p, [class*="marpit"] section li, [class*="marpit"] section blockquote, [class*="marpit"] section span, [class*="marpit"] section div {
        color: inherit;
      }
      .marpit h1, .marpit h2, .marpit h3, .marpit strong,
      [class*="marpit"] h1, [class*="marpit"] h2, [class*="marpit"] h3, [class*="marpit"] strong {
        color: ${theme.primaryColor} !important;
        margin-top: 0 !important;
        margin-bottom: 0.5rem !important;
      }
      [class*="marpit"] ul {
        list-style: disc !important;
        margin-left: 2rem !important;
        padding-left: 0 !important;
      }
      [class*="marpit"] ol {
        list-style: decimal !important;
        margin-left: 2rem !important;
        padding-left: 0 !important;
      }
      [class*="marpit"] li {
        display: list-item !important;
        margin-bottom: 0.5rem !important;
      }
    `;

    return {
      displayHtml: isPreviewFullscreen
        ? (renderResult.slides[currentSlide] || renderResult.slides[0] || '')
        : renderResult.html,
      displayCss: renderResult.css + customStyle,
      slideCount: renderResult.slides.length,
    };
  }, [renderResult, theme, isPreviewFullscreen, currentSlide]);

  // Handle keyboard navigation in fullscreen
  useEffect(() => {
    if (!isPreviewFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { currentSlide: slide, setCurrentSlide } = useStore.getState();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide(slide + 1);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(slide - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewFullscreen]);

  if (isPreviewFullscreen) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
        <style>{displayCss}</style>
        <style>{`
          .marpit-fullscreen svg {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw;
            max-height: 100vh;
            display: block;
          }
        `}</style>
        <div
          className="marpit-fullscreen flex items-center justify-center w-full h-full"
          dangerouslySetInnerHTML={{ __html: displayHtml }}
        />

        {/* Navigation Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white/60 border border-white/10 opacity-0 hover:opacity-100 transition-opacity text-sm">
          <button
            disabled={currentSlide === 0}
            onClick={() => useStore.getState().setCurrentSlide(currentSlide - 1)}
            className="hover:text-white disabled:opacity-20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-xs font-bold tracking-widest uppercase min-w-[60px] text-center">
            {currentSlide + 1} / {slideCount}
          </span>
          <button
            disabled={currentSlide === slideCount - 1}
            onClick={() => useStore.getState().setCurrentSlide(currentSlide + 1)}
            className="hover:text-white disabled:opacity-20 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-neutral-100 p-8 flex justify-center">
      <div className="w-full max-w-4xl shadow-2xl bg-white min-h-full">
        <style>{displayCss}</style>
        <div
          className="marpit"
          dangerouslySetInnerHTML={{ __html: displayHtml }}
        />
      </div>
    </div>
  );
};
