// src/components/EditLesson.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

const SECTION_LABELS = {
    warm_up: 'Warm Ups',
    bridge_activity: 'Bridge Activities',
    main_activity: 'Main Activities',
    end_of_lesson: 'End Of Lesson',
    script: 'Scripts',
}

const SECTION_ICONS = {
    warm_up: '🔥',
    bridge_activity: '🌉',
    main_activity: '🎭',
    end_of_lesson: '🏁',
    script: '📜',
}

export default function EditLesson({ lesson, onClose, onSaved, onRunLesson }) {
    const [allParts, setAllParts] = useState([])
    const [filters, setFilters] = useState({ section: '', ageGroup: '', level: '', tag: '', search: '', createdBy: '' })
    const [draggingType, setDraggingType] = useState(null)
    const [showPreview, setShowPreview] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Pre-fill from the existing lesson
    const [title, setTitle] = useState(lesson?.title || '')
    const [objective, setObjective] = useState(lesson?.objective || '')
    const [bullets, setBullets] = useState(Array.isArray(lesson?.at_a_glance) && lesson.at_a_glance.length ? [...lesson.at_a_glance, ''] : [''])

    // Group existing lesson parts by section
    const initialSections = React.useMemo(() => {
        const groups = { warm_up: [], bridge_activity: [], main_activity: [], end_of_lesson: [], script: [] }
            ; (lesson?.lesson_parts || []).forEach(p => {
                if (groups[p.section_type]) groups[p.section_type].push(p)
            })
        return groups
    }, [lesson])

    const [sectionParts, setSectionParts] = useState(initialSections)

    // Load available parts for the catalog on left/bottom (like your planner)
    useEffect(() => {
        let mounted = true
        fetch('/api/lesson_planning')
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(data => { if (mounted) setAllParts(data?.parts || []) })
            .catch(() => { })
        return () => { mounted = false }
    }, [])

    // Filter: hide already selected, simple text + basic fields
    const selectedIds = useMemo(
        () => new Set(Object.values(sectionParts).flat().map(p => p.id)),
        [sectionParts]
    )

    const filtered = useMemo(() => {
        return (allParts || []).filter(p => {
            if (selectedIds.has(p.id)) return false
            if (filters.section && p.section_type !== filters.section) return false
            if (filters.ageGroup && p.age_group !== filters.ageGroup) return false
            if (filters.level && p.level !== filters.level) return false
            if (filters.tag && (!Array.isArray(p.tags) || !p.tags.includes(filters.tag))) return false
            if (filters.createdBy === 'admin' && !p.admin_created) return false
            if (filters.createdBy === 'user' && p.admin_created) return false
            const text = `${p.title} ${p.body || ''}`.toLowerCase()
            if (filters.search && !text.includes(filters.search.toLowerCase())) return false
            return true
        })
    }, [allParts, filters, selectedIds])

    // Totals
    const totalActivities = useMemo(
        () => Object.values(sectionParts).reduce((acc, arr) => acc + arr.length, 0),
        [sectionParts]
    )

    const totalMinutes = useMemo(
        () => Object.values(sectionParts).reduce(
            (acc, arr) => acc + arr.reduce((sum, p) => sum + (p.time || 0), 0),
            0
        ),
        [sectionParts]
    )

    function handleRemovePart(sectionKey, partId) {
        setSectionParts(prev => ({ ...prev, [sectionKey]: prev[sectionKey].filter(p => p.id !== partId) }))
    }

    function onDragStart(start) {
        const part = allParts.find(p => String(p.id) === start.draggableId)
        setDraggingType(part?.section_type || null)
    }

    function onDragEnd(result) {
        const { source, destination, draggableId } = result
        setDraggingType(null)
        if (!destination) return
        // only allow dragging from catalog -> section
        if (source.droppableId !== 'parts') return
        if (!Object.keys(SECTION_LABELS).includes(destination.droppableId)) return

        const part = allParts.find(p => String(p.id) === draggableId)
        if (!part) return
        // must drop into its own section type
        if (destination.droppableId !== part.section_type) return

        setSectionParts(prev => {
            const exists = prev[destination.droppableId].some(p => p.id === part.id)
            if (exists) return prev
            return { ...prev, [destination.droppableId]: [...prev[destination.droppableId], part] }
        })
    }

    async function save() {
        if (isSaving) return;
        setIsSaving(true);

        const payload = {
            title,
            objective,
            at_a_glance: bullets.filter(b => b.trim() !== ''),
            lesson_part_ids: Object.values(sectionParts).flat().map(p => p.id),
        };

        try {
            const res = await fetch(`/api/lessons/${lesson.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lesson: payload }), // ⬅️ key change
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const updated = await res.json().catch(() => ({ id: lesson.id, ...payload }));
            onSaved?.(updated);
            onClose();
        } catch (e) {
            alert('Failed to save lesson.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/70">
            <div className="absolute inset-0 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white dark:bg-dark-800 border-b border-black/10 dark:border-white/10">
                    <div className="flex flex-col">
                        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Edit Lesson</h2>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            ID: {lesson?.id} • ⏱ {totalMinutes} min • {totalActivities} activities
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {totalActivities > 0 && (
                            <button
                                onClick={() => setShowPreview(true)}
                                className="px-3 py-2 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Preview
                            </button>
                        )}
                        <button
                            onClick={save}
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-md text-sm font-semibold text-white inline-flex items-center gap-2 ${isSaving ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Saving…
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-3 py-2 rounded-md text-sm font-semibold bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-dark-700 dark:hover:bg-dark-600 dark:text-gray-100"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Title / Objective / Glance */}
                <div className="px-4 sm:px-6 py-4 bg-white dark:bg-dark-800 border-b border-black/10 dark:border-white/10">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Lesson Title</span>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white dark:bg-dark-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                placeholder="e.g., Exploring Imagination Through Movement"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Objective</span>
                            <input
                                value={objective}
                                onChange={e => setObjective(e.target.value)}
                                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white dark:bg-dark-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                placeholder="What students should achieve…"
                            />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">At a Glance</span>
                            <div className="mt-1 space-y-2">
                                {bullets.map((b, i) => (
                                    <input
                                        key={i}
                                        value={b}
                                        onChange={e => {
                                            const copy = [...bullets]; copy[i] = e.target.value
                                            if (i === copy.length - 1 && e.target.value.trim() !== '') copy.push('')
                                            setBullets(copy)
                                        }}
                                        className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-dark-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                        placeholder="• Add a key takeaway…"
                                    />
                                ))}
                            </div>
                        </label>
                    </div>
                </div>

                {/* Planner grid */}
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div className="flex-1 grid grid-rows-[auto,1fr] md:grid-cols-[1fr,380px] md:grid-rows-1 gap-0 h-full">
                        {/* Selected sections (drop zones) */}
                        <aside className="order-2 md:order-1 overflow-auto p-4 bg-gray-50 dark:bg-dark-900">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                {Object.keys(SECTION_LABELS).map((key) => (
                                    <Droppable droppableId={key} key={key}>
                                        {(provided, snapshot) => {
                                            const isMatch = draggingType === key
                                            const hasItems = sectionParts[key]?.length > 0
                                            const highlight = snapshot.isDraggingOver
                                                ? (isMatch ? 'border-green-500' : 'border-red-500')
                                                : (hasItems ? 'border-green-500' : 'border-gray-300')
                                            return (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`relative border-2 border-dashed rounded-lg p-4 min-h-[7rem] ${highlight} bg-white dark:bg-dark-800`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xl">{SECTION_ICONS[key]}</span>
                                                        <h3 className="font-semibold text-md text-gray-900 dark:text-white">
                                                            Add {SECTION_LABELS[key]}
                                                        </h3>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {(sectionParts[key] || []).map((p, idx) => (
                                                            <div
                                                                key={p.id}
                                                                className="relative rounded-xl border border-green-500 bg-green-600/80 dark:bg-green-900/80 text-left p-3 text-white"
                                                            >
                                                                <button
                                                                    onClick={() => handleRemovePart(key, p.id)}
                                                                    className="absolute top-1 right-2 text-xs text-red-200 hover:text-white"
                                                                >
                                                                    Remove
                                                                </button>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-base">{SECTION_ICONS[p.section_type]}</span>
                                                                    <h4 className="font-bold text-sm">{p.title}</h4>
                                                                </div>
                                                                {typeof p.time === 'number' && (
                                                                    <div className="text-xs mt-1 opacity-90">⏱ {p.time} min</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="invisible h-0">{provided.placeholder}</div>
                                                </div>
                                            )
                                        }}
                                    </Droppable>
                                ))}
                            </div>
                        </aside>

                        {/* Catalog (draggables) + filters */}
                        <main className="order-1 md:order-2 flex flex-col border-l border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
                            {/* Filters (minimal) */}
                            <div className="p-3 border-b border-gray-200 dark:border-dark-700 grid grid-cols-2 gap-2">
                                <select
                                    value={filters.section}
                                    onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}
                                    className="px-2 py-1.5 bg-white dark:bg-dark-700 border rounded text-sm"
                                >
                                    <option value="">All Sections</option>
                                    {Object.entries(SECTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                                <input
                                    value={filters.search}
                                    onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                                    placeholder="Search..."
                                    className="px-2 py-1.5 bg-white dark:bg-dark-700 border rounded text-sm"
                                />
                            </div>

                            <Droppable droppableId="parts" isDropDisabled={true}>
                                {provided => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-auto p-3 space-y-2">
                                        {filtered.map((p, idx) => (
                                            <Draggable key={p.id} draggableId={String(p.id)} index={idx}>
                                                {(providedDr, snapshotDr) => (
                                                    <div
                                                        ref={providedDr.innerRef}
                                                        {...providedDr.draggableProps}
                                                        {...providedDr.dragHandleProps}
                                                        className="rounded-lg border border-dark-600 bg-dark-800 text-white p-3"
                                                        style={{
                                                            ...(providedDr.draggableProps.style || {}),
                                                            willChange: 'transform',
                                                            zIndex: snapshotDr.isDragging ? 999 : 'auto',
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg opacity-80">{SECTION_ICONS[p.section_type]}</span>
                                                                <h4 className="font-bold text-sm">{p.title}</h4>
                                                            </div>
                                                            {typeof p.time === 'number' && (
                                                                <span className="text-xs opacity-80">⏱ {p.time} min</span>
                                                            )}
                                                        </div>
                                                        {p.body && (
                                                            <p className="text-xs text-gray-300 mt-1 line-clamp-2">{p.body}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    </div>
                                )}
                            </Droppable>
                        </main>
                    </div>
                </DragDropContext>

                {/* Preview modal */}
                {showPreview && (
                    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-12 px-6 pb-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <div className="relative w-full max-w-5xl rounded-2xl shadow-xl border border-sky-400/40 bg-gradient-to-br from-dark-700 via-dark-800 to-dark-700 p-8">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="absolute top-3 right-4 w-10 h-10 grid place-items-center rounded-full text-white/60 hover:text-white text-3xl"
                                aria-label="Close Preview"
                            >
                                ×
                            </button>

                            <h2 className="text-2xl font-extrabold text-white text-center">Finalize Lesson</h2>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-1">Lesson Title</label>
                                    <input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-sky-500 bg-dark-600 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-1">Objective</label>
                                    <input
                                        value={objective}
                                        onChange={e => setObjective(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-sky-500 bg-dark-600 text-white"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-white mb-2">At a Glance</label>
                                    {bullets.map((b, i) => (
                                        <input
                                            key={i}
                                            value={b}
                                            onChange={e => {
                                                const copy = [...bullets]; copy[i] = e.target.value
                                                if (i === copy.length - 1 && e.target.value.trim() !== '') copy.push('')
                                                setBullets(copy)
                                            }}
                                            placeholder="• Add a key takeaway..."
                                            className="w-full mb-2 px-4 py-2 rounded-lg border border-sky-400 bg-dark-600 text-white"
                                        />
                                    ))}
                                </div>
                            </div>

                            {Object.entries(sectionParts).map(([sectionType, parts]) => (
                                <div key={sectionType} className="mt-6">
                                    <h3 className="text-lg font-bold text-sky-300 uppercase tracking-wide mb-2">
                                        {SECTION_LABELS[sectionType]}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {parts.map(p => (
                                            <div key={p.id} className="rounded-xl bg-dark-800 border border-dark-600 p-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl">{SECTION_ICONS[p.section_type]}</span>
                                                        <h4 className="text-base font-bold text-white">{p.title}</h4>
                                                    </div>
                                                    {p.time && <span className="text-xs text-sky-300">⏱ {p.time} min</span>}
                                                </div>
                                                {p.body && <p className="text-sm text-gray-300">{p.body}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="flex gap-4 mt-8 justify-center">
                                <button
                                    onClick={save}
                                    disabled={isSaving}
                                    className={`px-6 py-3 rounded-lg text-white font-semibold inline-flex items-center gap-2 ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-500'}`}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                            Saving…
                                        </>
                                    ) : (
                                        'Save Lesson'
                                    )}
                                </button>
                                {onRunLesson && (
                                    <button
                                        onClick={async () => {
                                            await save()
                                            onRunLesson?.(lesson.id)
                                        }}
                                        className="px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-500"
                                    >
                                        ▶ Save & Run
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-6 py-3 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
