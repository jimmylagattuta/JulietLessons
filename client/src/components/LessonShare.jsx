import React, { useEffect, useRef, useState } from 'react';
import { Printer, Link2, Download } from 'lucide-react';

const JULIET_BG =
    'https://res.cloudinary.com/djtsuktwb/image/upload/v1751521032/ChatGPT_Image_Jul_2_2025_10_29_03_PM_1_ad024u.jpg';

const SECTION_LABELS = {
    warm_up: 'Warm Ups',
    bridge_activity: 'Bridge Activities',
    main_activity: 'Main Activities',
    end_of_lesson: 'End of Lesson',
    script: 'Scripts',
};

function printInNewWindow(sourceEl) {
    if (!sourceEl) return;

    // Minimal print CSS — no Tailwind required
    const PRINT_CSS = `
    @page { margin: 0.5in; }
    html,body { background:#fff !important; color:#111 !important; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
    .lesson-share-width { max-width:none !important; width:100% !important; margin:0 !important; box-shadow:none !important; border-radius:0 !important; }
    .juliet-watermark { display:none !important; }
    .time-pill { background:transparent !important; border:0 !important; box-shadow:none !important; padding:0 !important; height:auto !important; line-height:1.2 !important; color:#111 !important; }
    .print-spacer { height:12px !important; display:block !important; }
    /* avoid orphaned step cards across pages */
    li { break-inside: avoid; page-break-inside: avoid; }
    section { break-inside: avoid; page-break-inside: avoid; }
  `;

    // Open clean document (separate process from your app)
    const win = window.open('', '_blank', 'noopener,noreferrer');
    const doc = win.document;

    // Build a minimal HTML document with INLINE CSS only
    doc.open();
    doc.write(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Print</title>
      <style>${PRINT_CSS}</style>
    </head>
    <body></body>
  </html>`);
    doc.close();

    // Clone just the printable node; strip watermark nodes
    const clone = sourceEl.cloneNode(true);
    clone.querySelectorAll('.juliet-watermark').forEach(n => n.remove());
    doc.body.appendChild(clone);

    // Wait for fonts/images to settle, then print
    const ready = async () => {
        try { await doc.fonts?.ready; } catch { }
        // also give images a tick
        setTimeout(() => {
            win.focus();
            win.print();
            // auto-close if user cancels/prints
            setTimeout(() => win.close(), 500);
        }, 50);
    };

    if (doc.readyState === 'complete') ready();
    else doc.addEventListener('DOMContentLoaded', ready);
}



export default function LessonShare({ lessonId }) {
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const printRef = useRef(null);

    useEffect(() => {
        const ac = new AbortController();
        fetch(`/api/lessons/${lessonId}`, { signal: ac.signal })
            .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
            .then(setLesson)
            .finally(() => setLoading(false));
        return () => ac.abort();
    }, [lessonId]);

    // Simple, reliable print that also tags the DOM so print resets can apply
    // Replace your current handlePrint with this:
    // Reliable print that tags the DOM so print CSS can neutralize positioning
    const handlePrint = () => {
        printInNewWindow(printRef.current);
    };




    const handleDownload = async () => {
        if (!printRef.current) return;
        setDownloading(true);

        const el = printRef.current;
        el.classList.add('juliet-export');
        el.style.setProperty('--juliet-bg-url', `url("${JULIET_BG}")`);

        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const safeTitle = String(lesson?.title || 'lesson')
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '_');

            await html2pdf()
                .set({
                    margin: [0.5, 0.5],
                    filename: `${safeTitle}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        onclone: (doc) => {
                            const pill = doc.querySelector('#lesson-duration-pill');
                            if (pill) pill.style.display = 'inline-flex';
                        },
                    },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                })
                .from(el)
                .save();
        } catch (e) {
            console.error('PDF download failed', e);
            alert('Sorry, the PDF could not be generated.');
        } finally {
            el.classList.remove('juliet-export');
            el.style.removeProperty('--juliet-bg-url');
            setDownloading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied!');
        } catch {
            alert('Could not copy link');
        }
    };

    if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
    if (!lesson) return <div className="p-6 text-red-500">Lesson not found.</div>;

    const parts = (lesson.lesson_parts || [])
        .slice()
        .sort((a, b) => (a.position || 0) - (b.position || 0));
    const totalTime = parts.reduce((s, p) => s + (p.time || 0), 0);

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white">
            {/* Sticky actions (hidden in print) */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200 print:hidden">
                <div className="mx-auto max-w-4xl px-4 py-2 flex items-center justify-end gap-2">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
                        title="Download a PDF copy"
                    >
                        <Download className="h-4 w-4" />
                        {downloading ? 'Preparing…' : 'Download'}
                    </button>

                    <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <Link2 className="h-4 w-4" />
                        Copy Link
                    </button>
                </div>
            </div>

            {/* White card with watermark layer behind content */}
            <main
                ref={printRef}
                className="lesson-share-width relative z-0 bg-white shadow print:shadow-none my-6 print:my-0 rounded-xl print:rounded-none px-8 py-10 print:p-8 juliet-screen"
                style={{ '--juliet-bg-url': `url("${JULIET_BG}")` }}
            >
                {/* 👇 keeps the H1 from getting clipped off page 1 in print */}
                <div className="print-spacer" aria-hidden />

                <div className="juliet-watermark" aria-hidden />
                <header className="mb-8 text-center relative z-10">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-3">
                        {lesson.title}
                    </h1>
                    <div
                        id="lesson-duration-pill"
                        className="time-pill pill mx-auto gap-2 text-sm
                 bg-gradient-to-r from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10
                 text-gray-900 border border-indigo-200/50 shadow-sm"
                    >
                        ⏱ {totalTime} min
                    </div>
                </header>

                {/* Lesson Objective (solid white card) */}
                {lesson.objective && (
                    <section className="mb-8 relative z-10">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Lesson Objective</h2>
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 text-gray-900">
                            {lesson.objective}
                        </div>
                    </section>
                )}

                {/* At a Glance (solid white card) */}
                {Array.isArray(lesson.at_a_glance) && lesson.at_a_glance.length > 0 && (
                    <section className="mb-8 relative z-10">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">At a Glance</h2>
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3">
                            <ul className="list-disc list-inside text-gray-800 space-y-1">
                                {lesson.at_a_glance.map((it, i) => (
                                    <li key={i}>{it}</li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}

                {/* Sections */}
                {groupBy(parts, 'section_type').map(({ key, items }) => {
                    const sectionTime = items.reduce((s, p) => s + (p.time || 0), 0);
                    return (
                        <section key={key} className="mb-8 break-inside-avoid relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {SECTION_LABELS[key] || 'Activities'}
                                </h2>

                                <span className="time-pill inline-flex items-center justify-center leading-none text-xs px-2 py-0.5 rounded-full
                                 bg-gradient-to-r from-indigo-50 to-cyan-50
                                 text-gray-800 border border-indigo-200/70">
                                    ⏱ {sectionTime} min
                                </span>
                            </div>

                            <ol className="space-y-3">
                                {items.map((p, idx) => (
                                    <li
                                        key={idx}
                                        className="rounded-xl p-4 bg-white shadow-sm border border-gray-200/80
                               ring-1 ring-transparent hover:ring-indigo-200/70 transition
                               relative overflow-hidden"
                                    >
                                        <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-fuchsia-400/60 via-indigo-400/60 to-cyan-400/60"></span>

                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full
                                         bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                                                    {idx + 1}
                                                </span>
                                                <h3 className="text-base font-semibold text-gray-900">{p.title}</h3>
                                            </div>

                                            {typeof p.time === 'number' && (
                                                <span className="time-pill inline-flex items-center justify-center leading-none text-xs px-2 py-0.5 rounded-full
                                         bg-gradient-to-r from-indigo-50 to-cyan-50
                                         text-gray-800 border border-indigo-200/70">
                                                    ⏱ {p.time} min
                                                </span>
                                            )}
                                        </div>

                                        {p.body && (
                                            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{p.body}</p>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </section>
                    );
                })}
            </main>
        </div>
    );
}

function groupBy(arr, key) {
    const map = new Map();
    for (const it of arr) {
        const k = it[key] || 'other';
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(it);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
        key,
        items: items.sort((a, b) => (a.position || 0) - (b.position || 0)),
    }));
}
