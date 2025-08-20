import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd'
import './LessonPlanningNew.css';

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

const AVAILABLE_TAGS = [
  'Commedia Principals',
  'Character Dynamics',
  'Meisner',
  'Impro Games',
  'Vocal Acrobatics',
  'Physical Theater',
  'Planned Projects',
  'Shakespeare',
  'Pantomime',
  'Playmaking',
  'Acting Challenges',
  'Ensemble Work',
];

export default function LessonPlanningNew({ userId, onAddToPlan, onRunLesson }) {
  const [allParts, setAllParts] = useState([])
  const [filters, setFilters] = useState({
    section: '', ageGroup: '', level: '', tag: '', search: '', createdBy: ''
  })
  const [draggingType, setDraggingType] = useState(null)
  const [dragOverlayMessage, setDragOverlayMessage] = useState('')
  const [sectionParts, setSectionParts] = useState({
    warm_up: [], bridge_activity: [], main_activity: [], end_of_lesson: [], script: [],
  })
  const [invalidDrop, setInvalidDrop] = useState(false)
  const [invalidSection, setInvalidSection] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewObjective, setPreviewObjective] = useState('')
  const [previewBullets, setPreviewBullets] = useState([''])
  const [isSaving, setIsSaving] = useState(false)
  const droppableRefs = useRef([]);
  const [compact, setCompact] = useState(true); // default ON for small screens
  const [expandedBodyId, setExpandedBodyId] = useState(null);
  const [clampedBodies, setClampedBodies] = useState({}); // track per-card clamp


  // api /lesson_planning
  useEffect(() => {
    fetch('/api/lesson_planning')
      .then(r => {
        if (!r.ok) throw new Error(`Status ${r.status}`)
        return r.json()
      })
      .then(data => setAllParts(data.parts || []))
      .catch(err => console.error(err))
  }, [])

  useLayoutEffect(() => {
    const heights = droppableRefs.current.map(ref => ref?.offsetHeight || 0);
    const maxHeight = Math.max(...heights);
    console.log('Heights:', droppableRefs.current.map(ref => ref?.offsetHeight));

    droppableRefs.current.forEach(ref => {
      if (ref) ref.style.minHeight = `${maxHeight}px`;
    });
  }, [sectionParts]);

  // Filter lesson parts
  const filtered = useMemo(() => {
    const selectedIds = new Set(
      Object.values(sectionParts).flat().map(p => p.id)
    )

    return allParts.filter(p => {
      if (selectedIds.has(p.id)) return false
      if (filters.section && p.section_type !== filters.section) return false
      if (filters.ageGroup && p.age_group !== filters.ageGroup) return false
      if (filters.level && p.level !== filters.level) return false
      if (filters.tag && (!Array.isArray(p.tags) || !p.tags.includes(filters.tag))) return false
      if (filters.createdBy === 'admin' && !p.admin_created) return false;
      if (filters.createdBy === 'user' && p.admin_created) return false;

      const text = `${p.title} ${p.body}`.toLowerCase()
      if (filters.search && !text.includes(filters.search.toLowerCase()))
        return false
      return true

    })
  }, [allParts, filters, sectionParts])

  function onDragStart(start) {
    const part = allParts.find(p => String(p.id) === start.draggableId)
    const label = part?.section_type ? SECTION_LABELS[part.section_type] : ''
    setDraggingType(part?.section_type || null)
    setDragOverlayMessage(label ? `This must be dropped into ${label}` : '')
  }

  function onDragUpdate(update) {
    const dest = update.destination?.droppableId
    if (!dest || !draggingType) {
      setInvalidDrop(false)
      setInvalidSection('')
      return
    }

    if (Object.keys(SECTION_LABELS).includes(dest)) {
      if (dest !== draggingType) {
        setInvalidDrop(true)
        setInvalidSection(SECTION_LABELS[draggingType])
      } else {
        setInvalidDrop(false)
        setInvalidSection('')
      }
    }
  }

  const handleSaveLesson = async () => {
    setIsSaving(true);

    const lessonPartIds = Object.values(sectionParts)
      .flat()
      .map(part => part.id)
      .filter(Boolean);

    const payload = {
      lesson: {
        title: previewTitle,
        objective: previewObjective,
        at_a_glance: previewBullets.filter(b => b.trim() !== ''),
        lesson_part_ids: lessonPartIds,
      },
      user_id: userId,
    };

    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      alert("Lesson saved! 🎉");
      setShowPreview(false);
      return data;            // ◀︎ return the saved lesson object
    } catch (err) {
      console.error(err);
      alert("There was an error saving the lesson.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  function onDragEnd(result) {
    const { source, destination, draggableId } = result
    setDraggingType(null)
    setDragOverlayMessage('')
    setInvalidDrop(false)
    setInvalidSection('')

    if (!destination || source.droppableId !== 'parts') return
    if (!Object.keys(SECTION_LABELS).includes(destination.droppableId)) return

    const part = allParts.find(p => String(p.id) === draggableId)
    if (!part || destination.droppableId !== part.section_type) return

    setSectionParts(prev => {
      const existing = prev[destination.droppableId]
      if (existing.some(p => p.id === part.id)) return prev
      return {
        ...prev,
        [destination.droppableId]: [...existing, part],
      }
    })
  }

  function handleRemovePart(sectionKey, partId) {
    setSectionParts(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].filter(p => p.id !== partId)
    }))
  }

  const totalActivities = Object.values(sectionParts).reduce(
    (acc, arr) => acc + arr.length, 0
  )

  const totalMinutes = Object.values(sectionParts).reduce(
    (acc, arr) => acc + arr.reduce((sum, p) => sum + (p.time || 0), 0), 0
  )

  return (
    <DragDropContext onDragStart={onDragStart} onDragUpdate={onDragUpdate} onDragEnd={onDragEnd}>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center p-4 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
          <select
            value={filters.section}
            onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}
            disabled={showPreview}
            className="w-[14%] min-w-[120px] px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            <option value="">All Sections</option>
            {Object.entries(SECTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <select
            value={filters.ageGroup}
            onChange={e => setFilters(f => ({ ...f, ageGroup: e.target.value }))}
            disabled={showPreview}
            className="w-[12%] min-w-[100px] px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            <option value="">All Ages</option>
            <option value="Young">Young</option>
            <option value="Middle">Middle</option>
            <option value="Older">Older</option>
            <option value="All">All</option>
          </select>

          <select
            value={filters.level}
            onChange={e => setFilters(f => ({ ...f, level: e.target.value }))}
            disabled={showPreview}
            className="w-[14%] min-w-[120px] px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            <option value="">All Levels</option>
            <option value="Toe Tipper">Toe Tipper</option>
            <option value="Green Horn">Green Horn</option>
            <option value="Semi-Pro">Semi-Pro</option>
            <option value="Seasoned Veteran(all)">Seasoned Veteran(all)</option>
          </select>

          <select
            value={filters.tag}
            onChange={e => setFilters(f => ({ ...f, tag: e.target.value }))}
            disabled={showPreview}
            className="w-[14%] min-w-[120px] px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            <option value="">All Tags</option>
            {AVAILABLE_TAGS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search..."
            disabled={showPreview}
            className="flex-1 px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50"
          />

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-gray-400">Created By:</span>
            <button
              onClick={() =>
                setFilters(f => ({
                  ...f,
                  createdBy: f.createdBy === 'admin' ? '' : 'admin'
                }))
              }
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition ${filters.createdBy === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
                }`}
            >
              🛡️ Admin
            </button>

            <button
              onClick={() =>
                setFilters(f => ({
                  ...f,
                  createdBy: f.createdBy === 'user' ? '' : 'user'
                }))
              }
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition ${filters.createdBy === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
                }`}
            >
              🙋 User
            </button>

          </div>
        </div>
        {/* Sidebar */}
        <aside className="w-full bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 p-2 overflow-hidden">
          <div className="mb-4 col-span-5">
            <div className="flex justify-between items-center mb-4 px-4">

              {/* Left Column: Title, minutes, activities, warmups */}
              <div className="flex flex-row items-start space-y-1 gap-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lesson Plan</h2>
                <div className="flex items-start space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">⏱️</span>
                    <span className="font-medium">{totalMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">👥</span>
                    <span className="font-medium">{totalActivities} activities</span>
                  </div>
                </div>
              </div>
              {/* Right-side controls: Compact + (conditional) Preview */}
              <div className="flex items-center gap-2 ml-4 mt-2">
                {/* Compact view toggle (always shown) */}
                <button
                  type="button"
                  onClick={() => setCompact(c => !c)}
                  aria-pressed={compact}
                  title="Toggle compact card layout"
                  className={`px-3 py-2 rounded-md text-sm font-semibold border transition
                  ${compact
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-dark-700 text-gray-200 border-dark-600 hover:bg-dark-600'}`}
                >
                  {compact ? 'Compact View On' : 'Compact View Off'}
                </button>

                {/* Preview button (only when there are activities) */}
                {totalActivities > 0 && (
                  <button
                    onClick={() => setShowPreview(true)}
                    className="px-4 py-2 rounded-md text-sm font-semibold text-white
                 bg-gradient-to-r from-blue-500 to-indigo-500
                 hover:from-blue-400 hover:to-indigo-400 transition-shadow shadow-md"
                  >
                    Preview Lesson
                  </button>
                )}
              </div>

            </div>
            <div className="overflow-hidden w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
                {/* Warm Up */}
                <div
                  className="min-w-0"
                >
                  <Droppable droppableId='warm_up' key='warm_up'>
                    {(provided, snapshot) => {
                      const isMatchZone = draggingType === 'warm_up'
                      const hasItems = sectionParts['warm_up']?.length > 0
                      const highlight = snapshot.isDraggingOver
                        ? isMatchZone
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-red-500 dark:border-red-400'
                        : hasItems
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-gray-300 dark:border-dark-600'

                      return (
                        <div
                          ref={(el) => {
                            provided.innerRef(el);             // required for DnD
                            droppableRefs.current[0] = el; // required for height sync
                          }}
                          {...provided.droppableProps}
                          className={`relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center text-center space-y-2 min-h-[6rem] ${highlight}`}
                        >
                          <div className="flex flex-col items-center text-center">
                            {/* Row: icon + title */}
                            <div className="flex items-center space-x-2">
                              <span className="text-1xl">{SECTION_ICONS['warm_up']}</span>
                              <h3 className="font-semibold text-md text-gray-900 dark:text-white">
                                Add Warm Ups
                              </h3>
                            </div>

                            {/* Description below */}
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Start with an energizing activity
                            </p>
                          </div>


                          <div className="min-w-0 max-h-[7rem] overflow-y-auto p-3">
                            <div className="space-y-3 px-1">
                              {sectionParts['warm_up'].map((p, idx) => (
                                <div
                                  key={p.id}
                                  className="relative w-full rounded-xl border border-green-500 bg-green-600/80 dark:bg-green-900/80 text-left p-5 shadow-lg transition duration-300"
                                >
                                  <div className="absolute -top-2 -left-2 text-sm p-0.5 bg-green-200 dark:bg-green-800 rounded-full border border-white shadow-sm">
                                    {SECTION_ICONS[p.section_type]}
                                  </div>
                                  <button
                                    onClick={() => handleRemovePart('warm_up', p.id)}
                                    className="absolute top-1 right-2 text-xs text-red-500 hover:text-red-300 transition"
                                  >
                                    Remove
                                  </button>

                                  {/* Pills row: only time */}
                                  <div className="flex flex-col items-start gap-1">
                                    <h3 className="text-base text-sm font-extrabold text-white leading-snug">{p.title}</h3>
                                  </div>


                                  {/* remove the p.body block entirely */}

                                  {/* Scripts & Tags follow as before… */}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="invisible h-0">{provided.placeholder}</div>
                        </div>
                      )
                    }}
                  </Droppable>
                </div>
                {/* Bridge Activities */}
                <div
                  className="min-w-0"
                >
                  <Droppable droppableId="bridge_activity" key="bridge_activity">
                    {(provided, snapshot) => {
                      const isMatchZone = draggingType === 'bridge_activity';
                      const hasItems = sectionParts['bridge_activity']?.length > 0;
                      const highlight = snapshot.isDraggingOver
                        ? isMatchZone
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-red-500 dark:border-red-400'
                        : hasItems
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-gray-300 dark:border-dark-600';

                      return (
                        <div
                          ref={(el) => {
                            provided.innerRef(el);             // required for DnD
                            droppableRefs.current[1] = el; // required for height sync
                          }}
                          {...provided.droppableProps}
                          className={`
                            relative
                            border-2 border-dashed rounded-lg
                            p-4 flex flex-col items-center text-center
                            gap-y-4 min-h-[6rem]
                            ${highlight}
                          `}
                        >
                          <div className="flex flex-col items-center text-center">
                            {/* Row: icon + title */}
                            <div className="flex items-center space-x-2">
                              <span className="text-1xl">{SECTION_ICONS['bridge_activity']}</span>
                              <h3 className="font-semibold text-md text-mday-900 dark:text-white">
                                Add Bridge Activities
                              </h3>
                            </div>

                            {/* Description below */}
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Link warm-up to main
                            </p>
                          </div>


                          <div className="w-full space-y-2">
                            {sectionParts['bridge_activity'].map((p, idx) => (
                              <div
                                key={p.id}
                                className="
                                  relative w-full rounded-xl
                                  border border-green-500 bg-green-600/80 dark:bg-green-900/80
                                  text-left p-5 shadow-lg transition duration-300
                                "
                              >
                                <div className="
                                  absolute -top-2 -left-2 text-sm p-0.5
                                  bg-green-200 dark:bg-green-800 rounded-full
                                  border border-white shadow-sm
                                ">
                                  {SECTION_ICONS[p.section_type]}
                                </div>
                                <button
                                  onClick={() => handleRemovePart('bridge_activity', p.id)}
                                  className="absolute top-1 right-2 text-xs text-red-500 hover:text-red-300 transition"
                                >
                                  Remove
                                </button>

                                {/* Title & Time */}
                                <div className="flex flex-col items-start gap-1">
                                  <h4 className="text-base text-sm font-extrabold text-white leading-snug">
                                    {p.title}
                                  </h4>

                                </div>

                                {/* Scripts & Tags would go here if needed */}
                              </div>
                            ))}
                          </div>
                          <div className="invisible h-0">{provided.placeholder}</div>
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
                {/* Main Activity */}
                <div
                  className="min-w-0"
                >
                  <Droppable droppableId="main_activity" key="main_activity">
                    {(provided, snapshot) => {
                      const isMatchZone = draggingType === 'main_activity';
                      const hasItems = sectionParts['main_activity']?.length > 0;
                      const highlight = snapshot.isDraggingOver
                        ? isMatchZone
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-red-500 dark:border-red-400'
                        : hasItems
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-gray-300 dark:border-dark-600';

                      return (
                        <div
                          ref={(el) => {
                            provided.innerRef(el);             // required for DnD
                            droppableRefs.current[2] = el; // required for height sync
                          }}
                          {...provided.droppableProps}
                          className={`
                            relative
                            border-2 border-dashed rounded-lg
                            p-4 flex flex-col items-center text-center
                            space-y-2 min-h-[6rem]
                            ${highlight}
                          `}
                        >
                          <div className="flex flex-col items-center text-center">
                            {/* Row: icon + title */}
                            <div className="flex items-center space-x-2">
                              <span className="text-1xl">{SECTION_ICONS['main_activity']}</span>
                              <h3 className="font-semibold text-md texmdgray-900 dark:text-white">
                                Add Main Activities
                              </h3>
                            </div>

                            {/* Description below */}
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Core learning activities
                            </p>
                          </div>


                          <div className="w-full space-y-2">
                            {sectionParts['main_activity'].map((p) => (
                              <div
                                key={p.id}
                                className="
                                  relative w-full rounded-xl
                                  border border-green-500 bg-green-600/80 dark:bg-green-900/80
                                  text-left p-5 shadow-lg transition duration-300
                                "
                              >
                                <div className="
                                  absolute -top-2 -left-2 text-sm p-0.5
                                  bg-green-200 dark:bg-green-800 rounded-full
                                  border border-white shadow-sm
                                ">
                                  {SECTION_ICONS[p.section_type]}
                                </div>
                                <button
                                  onClick={() => handleRemovePart('main_activity', p.id)}
                                  className="absolute top-1 right-2 text-xs text-red-500 hover:text-red-300 transition"
                                >
                                  Remove
                                </button>

                                {/* Title & Time */}
                                <div className="flex flex-col items-start gap-1">
                                  <h4 className="text-base text-sm font-extrabold text-white leading-snug">
                                    {p.title}
                                  </h4>

                                </div>

                                {/* Scripts & Tags would go here if needed */}
                              </div>
                            ))}
                          </div>
                          <div className="invisible h-0">{provided.placeholder}</div>
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
                {/* End of Lesson */}
                <div
                  className="min-w-0"
                >
                  <Droppable droppableId="end_of_lesson" key="end_of_lesson">
                    {(provided, snapshot) => {
                      const isMatchZone = draggingType === 'end_of_lesson';
                      const hasItems = sectionParts['end_of_lesson']?.length > 0;
                      const highlight = snapshot.isDraggingOver
                        ? isMatchZone
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-red-500 dark:border-red-400'
                        : hasItems
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-gray-300 dark:border-dark-600';

                      return (
                        <div
                          ref={(el) => {
                            provided.innerRef(el);             // required for DnD
                            droppableRefs.current[3] = el; // required for height sync
                          }}
                          {...provided.droppableProps}
                          className={`
                            relative
                            border-2 border-dashed rounded-lg
                            p-4 flex flex-col items-center text-center
                            space-y-2 min-h-[6rem]
                            ${highlight}
                          `}
                        >
                          <div className="flex flex-col items-center text-center">
                            {/* Row: icon + title */}
                            <div className="flex items-center space-x-2">
                              <span className="text-1xl">{SECTION_ICONS['end_of_lesson']}</span>
                              <h3 className="font-semibold text-md texmdgray-900 dark:text-white">
                                Add End Of Lesson
                              </h3>
                            </div>

                            {/* Description below */}
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Wrap up and reflect
                            </p>
                          </div>


                          <div className="w-full space-y-2">
                            {sectionParts['end_of_lesson'].map((p) => (
                              <div
                                key={p.id}
                                className="
                                  relative w-full rounded-xl
                                  border border-green-500 bg-green-600/80 dark:bg-green-900/80
                                  text-left p-5 shadow-lg transition duration-300
                                "
                              >
                                <div className="
                                  absolute -top-2 -left-2 text-sm p-0.5
                                  bg-green-200 dark:bg-green-800 rounded-full
                                  border border-white shadow-sm
                                ">
                                  {SECTION_ICONS[p.section_type]}
                                </div>
                                <button
                                  onClick={() => handleRemovePart('end_of_lesson', p.id)}
                                  className="absolute top-1 right-2 text-xs text-red-500 hover:text-red-300 transition"
                                >
                                  Remove
                                </button>

                                {/* Title & Time */}
                                <div className="flex flex-col items-start gap-1">
                                  <h4 className="text-base text-sm font-extrabold text-white leading-snug">
                                    {p.title}
                                  </h4>

                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="invisible h-0">{provided.placeholder}</div>
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
                {/* Scripts */}
                <div
                  className="min-w-0"
                >
                  <Droppable droppableId="script" key="script">
                    {(provided, snapshot) => {
                      const isMatchZone = draggingType === 'script';
                      const hasItems = sectionParts['script']?.length > 0;
                      const highlight = snapshot.isDraggingOver
                        ? isMatchZone
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-red-500 dark:border-red-400'
                        : hasItems
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-gray-300 dark:border-dark-600';

                      return (
                        <div
                          ref={(el) => {
                            provided.innerRef(el);             // required for DnD
                            droppableRefs.current[4] = el; // required for height sync
                          }}
                          {...provided.droppableProps}
                          className={`
                            relative
                            border-2 border-dashed rounded-lg
                            p-4 flex flex-col items-center text-center
                            space-y-2 min-h-[6rem]
                            ${highlight}
                          `}
                        >
                          <div className="flex flex-col items-center text-center">
                            {/* Row: icon + title */}
                            <div className="flex items-center space-x-2">
                              <span className="text-1xl">{SECTION_ICONS['script']}</span>
                              <h3 className="font-semibold text-md text-gray-900 dark:text-white">
                                Add Scripts
                              </h3>
                            </div>

                            {/* Description below */}
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Attach scripts for actors
                            </p>
                          </div>


                          <div className="w-full space-y-2">
                            {sectionParts['script'].map((p) => (
                              <div
                                key={p.id}
                                className="
                                  relative w-full rounded-xl
                                  border border-green-500 bg-green-600/80 dark:bg-green-900/80
                                  text-left p-5 shadow-lg transition duration-300
                                "
                              >
                                <div className="
                                  absolute -top-2 -left-2 text-sm p-0.5
                                  bg-green-200 dark:bg-green-800 rounded-full
                                  border border-white shadow-sm
                                ">
                                  {SECTION_ICONS[p.section_type]}
                                </div>
                                <button
                                  onClick={() => handleRemovePart('script', p.id)}
                                  className="absolute top-1 right-2 text-xs text-red-500 hover:text-red-300 transition"
                                >
                                  Remove
                                </button>

                                {/* Title & Time */}
                                <div className="flex flex-col items-start gap-1">
                                  <h4 className="text-base text-sm font-extrabold text-white leading-snug">
                                    {p.title}
                                  </h4>

                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="invisible h-0">{provided.placeholder}</div>
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main panel */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Finalize Lesson and Cards */}
          <div className="flex-1 p-4 overflow-auto relative scrollbar-hidden">
            {/* Finalize Lesson */}
            {showPreview && (
              <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 scrollbar-hidden px-6 pb-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
                <div className="flex flex-col gap-6 px-10 py-10 border-2 border-sky-400/40 bg-gradient-to-br from-dark-700 via-dark-800 to-dark-700 rounded-2xl shadow-xl w-full max-w-6xl transition-all duration-300 relative">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="absolute top-3 right-4 w-10 h-10 flex items-center justify-center rounded-full text-white/40 hover:text-transparent bg-clip-text hover:bg-gradient-to-br hover:from-red-500 hover:via-pink-500 hover:to-yellow-500 text-5xl transition duration-300 z-50"
                    aria-label="Close Preview"
                  >
                    ×
                  </button>



                  <h2 className="text-3xl font-extrabold text-white text-center tracking-wide">
                    ✨ Finalize Your Lesson Plan
                  </h2>
                  {/* Editable title, objective, and bullets */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-1">Lesson Title</label>
                      <input
                        type="text"
                        value={previewTitle}
                        onChange={e => setPreviewTitle(e.target.value)}
                        placeholder="e.g. Exploring Imagination Through Movement"
                        className="w-full px-5 py-3 rounded-lg border border-sky-500 bg-dark-600 text-white placeholder-sky-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-1">Objective</label>
                      <textarea
                        value={previewObjective}
                        onChange={e => setPreviewObjective(e.target.value)}
                        rows={4}
                        placeholder="What should students learn or experience from this lesson?"
                        className="w-full px-5 py-3 rounded-lg border border-sky-500 bg-dark-600 text-white placeholder-sky-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    {/* At a Glance */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">At a Glance</label>
                      {previewBullets.map((b, i) => (
                        <input
                          key={i}
                          type="text"
                          value={b}
                          onChange={e => {
                            const copy = [...previewBullets]
                            copy[i] = e.target.value
                            if (i === copy.length - 1 && e.target.value.trim() !== '') {
                              copy.push('')
                            }
                            setPreviewBullets(copy)
                          }}
                          placeholder="• Add a key takeaway..."
                          className="w-full mb-2 px-5 py-2.5 rounded-lg border border-sky-400 bg-dark-600 text-white placeholder-sky-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                      ))}
                    </div>
                  </div>
                  {/* Lesson Parts */}
                  {Object.entries(sectionParts).map(([sectionType, parts]) => (
                    <div key={sectionType} className="mt-4">
                      <h3 className="text-lg font-bold text-sky-300 uppercase tracking-wide mb-3 border-b border-sky-600 pb-1">
                        {SECTION_LABELS[sectionType]}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {parts.map(p => (
                          <div
                            key={p.id || p.tempId}
                            className="rounded-xl bg-dark-800 border border-dark-600 hover:border-sky-500/40 transition-shadow duration-200 p-6 shadow-sm hover:shadow-md"
                          >
                            {/* Title & Time */}
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{SECTION_ICONS[p.section_type]}</span>
                                <h4 className="text-lg font-bold text-white">{p.title}</h4>
                              </div>
                              {p.time && (
                                <span className="flex items-center gap-1 text-sm text-sky-300 font-medium">
                                  ⏱ {p.time} min
                                </span>
                              )}
                            </div>
                            {/* Description */}
                            {p.body && (
                              <p className="text-sm text-gray-300 leading-relaxed mb-3">{p.body}</p>
                            )}
                            {/* Scripts */}
                            {Array.isArray(p.file_infos) && p.file_infos.length > 0 && (
                              <div className="mt-4 border-t border-white/10 pt-3">
                                <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-2">
                                  Scripts
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {p.file_infos.map(({ url, filename }) => (
                                    <a
                                      key={url}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-sm font-medium text-gray-900 shadow-sm hover:shadow-md transition"
                                    >
                                      <span className="text-lg leading-none">📜</span>
                                      <span>{filename}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Tags */}
                            {Array.isArray(p.tags) && p.tags.length > 0 && (
                              <div className="mt-4 border-t border-white/10 pt-3">
                                <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-2">
                                  Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {p.tags.map(tag => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-sm font-medium text-white shadow-sm hover:shadow-md transition"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Admin Created Badge */}
                            {p.admin_created && (
                              <div className="mt-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-blue-500 text-xs text-blue-300 bg-dark-700">
                                  🛡️ Admin Created
                                </span>
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Save • Save & Run • Cancel */}
                  <div className="flex gap-6 mt-10 justify-center">
                    {/* 1) Just Save */}
                    <button
                      onClick={async () => {
                        await handleSaveLesson();
                        setShowPreview(false);
                      }}
                      className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:from-blue-500 hover:to-indigo-500 transition"
                      disabled={isSaving}
                    >
                      Save Lesson
                    </button>

                    {/* 2) Save & Run */}
                    <button
                      onClick={async () => {
                        const saved = await handleSaveLesson();
                        if (saved && saved.id && onRunLesson) {
                          onRunLesson(saved.id);
                        }
                      }}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-semibold shadow-md transition"
                    >
                      ▶️ Save & Run Lesson
                    </button>


                    {/* 3) Cancel */}
                    <button
                      onClick={() => setShowPreview(false)}
                      className="flex-1 px-6 py-3 rounded-lg bg-gray-700 text-white font-semibold shadow-md hover:bg-gray-600 transition"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cards */}
            {!showPreview && (
              <Droppable droppableId="parts" isDropDisabled={true}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`relative grid gap-4
                    ${compact
                        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
                        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                      }`}
                  >

                    {filtered.map((p, idx) => (
                      <Draggable key={p.id} draggableId={String(p.id)} index={idx}>
                        {(providedDr, snapshotDr) => {
                          const dndStyle = providedDr.draggableProps.style || {};
                          const cardPadding = compact ? 'p-3' : 'p-5';
                          const cardMinH = compact ? 'min-h-[220px]' : 'min-h-[380px]';
                          const titleClasses = compact ? 'text-base w-40' : 'text-xl';
                          const pillText = compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
                          // helpers near top of component
                          const pillWrap = `flex flex-wrap items-center gap-1`;
                          const pillBase = compact
                            ? "inline-flex items-center justify-center px-1.5 text-[10px] h-5 rounded-full ring-1 ring-white/15 bg-white/10"
                            : "inline-flex items-center justify-center px-2 text-[11px] h-6 rounded-full ring-1 ring-white/15 bg-white/10";

                          const labelW = compact ? "w-16" : "w-20";

                          return (
                            <div
                              ref={providedDr.innerRef}
                              {...providedDr.draggableProps}
                              {...providedDr.dragHandleProps}
                              style={{
                                ...dndStyle,
                                // keep it on its own layer so it always repaints instantly
                                willChange: 'transform',
                                zIndex: snapshotDr.isDragging ? 999 : 'auto',
                              }}
                            >
                              <div
                                style={{
                                  transform: snapshotDr.isDragging
                                    ? (compact ? 'scale(0.9)' : 'scale(0.95)')
                                    : 'scale(1)',
                                  transformOrigin: 'center center',
                                  transition: snapshotDr.isDragging ? 'none' : 'transform 0.08s ease-out',
                                }}
                                className={`relative h-full flex flex-col justify-between bg-dark-800 border border-dark-600
                                rounded-xl shadow-md hover:shadow-lg hover:border-blue-500 ${cardPadding} ${cardMinH}`}
                              >
                                {snapshotDr.isDragging && invalidDrop && draggingType === p.section_type && (
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded shadow z-50">

                                  </div>
                                )}

                                {/* Section Badge */}
                                <div
                                  className={`absolute top-2 left-2 text-[11px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full border shadow-inner backdrop-blur-sm z-10 transition-all duration-200 ${p.section_type === 'warm_up'
                                    ? 'bg-gradient-to-br from-pink-700/30 to-pink-500/20 text-pink-300 border-pink-500/40'
                                    : p.section_type === 'bridge_activity'
                                      ? 'bg-gradient-to-br from-yellow-600/30 to-yellow-500/20 text-yellow-200 border-yellow-400/40'
                                      : p.section_type === 'main_activity'
                                        ? 'bg-gradient-to-br from-indigo-600/30 to-indigo-500/20 text-indigo-200 border-indigo-400/40'
                                        : p.section_type === 'end_of_lesson'
                                          ? 'bg-gradient-to-br from-teal-600/30 to-teal-500/20 text-teal-200 border-teal-400/40'
                                          : 'bg-gradient-to-br from-sky-600/30 to-sky-500/20 text-sky-200 border-sky-400/40'
                                    }`}
                                >
                                  {SECTION_LABELS[p.section_type]}
                                </div>

                                {/* Icon */}
                                <div
                                  className={`absolute top-2 right-2 text-3xl transition-all duration-300 ${snapshotDr.isDragging
                                    ? 'text-white/80'
                                    : 'text-white/20 group-hover:text-white/80'
                                    }`}
                                >
                                  {SECTION_ICONS[p.section_type]}
                                </div>

                                <div className="mt-6 space-y-3">
                                  {/* Tital */}
                                  <h3 className={`font-extrabold text-white tracking-tight leading-tight ${titleClasses}`}>
                                    {p.title}
                                  </h3>

                                  <div className="space-y-1 text-sm">
                                    {/* Age Group */}
                                    <div className="flex items-start">
                                      <span className={`inline-block ${labelW} text-white/70 font-semibold`}>Age:</span>
                                      <div className={pillWrap}>
                                        {(Array.isArray(p.age_group) ? p.age_group : [p.age_group]).filter(Boolean).map(age => (
                                          <span
                                            key={age}
                                            className={`${pillBase} text-white`}
                                            style={{
                                              background: 'linear-gradient(135deg, rgba(30,58,138,.35), rgba(16,185,129,.35))'
                                            }}
                                          >
                                            {age}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Level */}
                                    <div className="flex items-start mt-1">
                                      <span className={`inline-block ${labelW} text-white/70 font-semibold`}>Level:</span>
                                      <div className={pillWrap}>
                                        {(Array.isArray(p.level) ? p.level : [p.level]).filter(Boolean).map(lvl => (
                                          <span
                                            key={lvl}
                                            className={`${pillBase} text-white`}
                                            style={{
                                              background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(249,115,22,.35))'
                                            }}
                                          >
                                            {lvl}
                                          </span>
                                        ))}
                                      </div>
                                    </div>


                                    {/* Time */}
                                    {typeof p.time === 'number' && (
                                      <p className={compact ? 'text-xs text-gray-300' : 'text-gray-300'}>
                                        <span className="inline-block w-20 text-white/70 font-semibold">Time:</span>
                                        <span className="text-gray-100">{p.time} min</span>
                                      </p>
                                    )}
                                  </div>

                                  {/* Body */}
                                  {p.body && (
                                    <>
                                      <div
                                        className={`${compact ? "text-[12px] pt-2" : "text-sm pt-3"} 
                                                           text-gray-400 border-t border-white/10`}
                                      >
                                        <p
                                          ref={(el) => {
                                            if (el) {
                                              const clamped =
                                                el.scrollHeight > el.clientHeight;
                                              if (clampedBodies[p.id] !== clamped) {
                                                setClampedBodies((prev) => ({ ...prev, [p.id]: clamped }));
                                              }
                                            }
                                          }}
                                          className={compact ? "line-clamp-2" : "line-clamp-3"}
                                        >
                                          {p.body}
                                        </p>

                                        {clampedBodies[p.id] && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedBodyId(p.id);
                                            }}
                                            className="mt-1 text-xs font-semibold text-sky-300 hover:text-sky-200 underline underline-offset-2"
                                          >
                                            Read more
                                          </button>
                                        )}
                                      </div>

                                      {/* Inline body expander (inside the same card) */}
                                      {expandedBodyId === p.id && (
                                        <div
                                          className="absolute inset-0 z-50 pointer-events-none"
                                          onClick={() => setExpandedBodyId(null)}
                                        >
                                          <div
                                            className="absolute left-3 right-3 top-0 bottom-3
             pointer-events-auto rounded-xl border border-dark-600
             bg-dark-800 shadow-xl flex flex-col"
                                            onClick={(e) => e.stopPropagation()}
                                            role="dialog"
                                            aria-modal="true"
                                            aria-labelledby={`expanded-title-${p.id}`}
                                          >

                                            {/* Header (sticky) */}
                                            <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3
                      rounded-t-xl bg-dark-800/95 backdrop-blur
                      border-b border-white/10">
                                              <span className="text-xl">{SECTION_ICONS[p.section_type]}</span>
                                              <h4
                                                id={`expanded-title-${p.id}`}
                                                className="font-bold text-white flex-1 text-base sm:text-[15px] md:text-[14px] truncate"
                                              >
                                                {p.title}
                                              </h4>

                                              <button
                                                type="button"
                                                onClick={() => setExpandedBodyId(null)}
                                                aria-label="Close"
                                                className="ml-2 h-7 w-7 grid place-items-center rounded-full
                     bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
                                              >
                                                ×
                                              </button>
                                            </div>

                                            {/* Body (fills remaining space; scrolls) */}
                                            <div className="px-4 pb-4 pt-3 overflow-y-auto
                      h-[calc(100%-48px)]
                      text-sm text-gray-200 leading-relaxed whitespace-pre-wrap
                      scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                              {p.body}
                                            </div>
                                          </div>
                                        </div>
                                      )}





                                    </>
                                  )}

                                  {/* Scripts */}
                                  {Array.isArray(p.file_infos) && p.file_infos.length > 0 && (
                                    <>
                                      {/* Full detail (not compact) */}
                                      {!compact && (
                                        <div className="mt-3 border-t border-white/10 pt-3">
                                          <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-2">
                                            Scripts
                                          </h4>
                                          <div className="flex flex-wrap gap-2">
                                            {p.file_infos.map(({ url, filename }) => (
                                              <a
                                                key={url}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center space-x-1 px-3 py-1 rounded-full
                                                bg-gradient-to-r from-yellow-600 to-yellow-400
                                                text-sm font-medium text-gray-900 shadow-sm hover:shadow-md transition"
                                              >
                                                <span className="text-lg leading-none">📜</span>
                                                <span>{filename}</span>
                                              </a>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Compact summary */}
                                      {compact && (
                                        <div className="mt-2 text-[11px] text-yellow-300/90">
                                          📜 {p.file_infos.length} script{p.file_infos.length > 1 ? 's' : ''}
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {/* Tags */}
                                  {Array.isArray(p.tags) && p.tags.length > 0 && (
                                    <>
                                      {/* Full detail (not compact) */}
                                      {!compact && (
                                        <div className="mt-4 border-t border-white/10 pt-4">
                                          <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-2">
                                            Tags
                                          </h4>
                                          <div className="flex flex-wrap gap-2">
                                            {p.tags.map(tag => (
                                              <span
                                                key={tag}
                                                className="inline-flex items-center px-3 py-1 rounded-full 
                                                bg-gradient-to-r from-purple-600 to-pink-500 
                                                text-sm font-medium text-white shadow-sm hover:shadow-md transition"
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Compact summary */}
                                      {compact && (
                                        <div className="mt-2 text-[11px] text-purple-300/90 truncate">
                                          🎭 {p.tags.slice(0, 2).join(', ')}
                                          {p.tags.length > 2 && ` +${p.tags.length - 2} more`}
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {/* Admin Created */}
                                  {p.admin_created && (
                                    <>
                                      {!compact && (
                                        <div className="inline-flex items-center px-2 py-0.5 rounded-full 
                      border border-white/20 bg-white/5 
                      text-xs text-white/60 gap-1 w-max">
                                          <span className="text-blue-400">🛡</span> Admin Created
                                        </div>
                                      )}

                                      {compact && (
                                        <div className="inline-flex items-center px-1.5 py-0.5 rounded-full 
                                                        border border-blue-400/40 bg-blue-500/10 
                                                        text-[10px] text-blue-300 gap-1 w-max">
                                          🛡 Admin
                                        </div>
                                      )}
                                    </>
                                  )}

                                </div>
                              </div>
                            </div>
                          )
                        }}
                      </Draggable>
                    ))}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        </div>


      </div>
    </DragDropContext>
  )
}
