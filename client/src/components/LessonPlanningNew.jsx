import React, { useEffect, useState, useMemo } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd'

const SECTION_LABELS = {
  warm_up:         'Warm Ups',
  bridge_activity: 'Bridge Activities',
  main_activity:   'Main Activities',
  end_of_lesson:   'End Of Lesson',
  script:          'Scripts',
}

const SECTION_ICONS = {
  warm_up:         '🔥',
  bridge_activity: '🌉',
  main_activity:   '🎭',
  end_of_lesson:   '🏁',
  script:          '📜',
}

export default function LessonPlanningNew({ onAddToPlan }) {
  const [allParts, setAllParts] = useState([])
  const [filters, setFilters] = useState({
    section: '', ageGroup: '', level: '', search: ''
  })
  const [draggingType, setDraggingType] = useState(null)
  const [dragOverlayMessage, setDragOverlayMessage] = useState('')
  const [sectionParts, setSectionParts] = useState({
    warm_up: [], bridge_activity: [], main_activity: [], end_of_lesson: [], script: [],
  })
    const [invalidDrop, setInvalidDrop] = useState(false)
    const [invalidSection, setInvalidSection] = useState('')

  useEffect(() => {
    fetch('/api/lesson_planning')
      .then(r => {
        if (!r.ok) throw new Error(`Status ${r.status}`)
        return r.json()
      })
      .then(data => setAllParts(data.parts || []))
      .catch(err => console.error(err))
  }, [])

  const filtered = useMemo(() => {
    const selectedIds = new Set(
      Object.values(sectionParts).flat().map(p => p.id)
    )

    return allParts.filter(p => {
      if (selectedIds.has(p.id)) return false
      if (filters.section  && p.section_type !== filters.section) return false
      if (filters.ageGroup && p.age_group    !== filters.ageGroup) return false
      if (filters.level    && p.level        !== filters.level)     return false
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
      <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-dark-900 transition-colors duration-200">

        {/* Sidebar */}
        <aside className="w-96 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 p-6 overflow-auto flex flex-col">
<div className="mb-4">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Lesson Plan</h2>
  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
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


          <div className="border-b border-gray-200 dark:border-dark-700 mb-6" />
          <div className="space-y-6">
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <Droppable droppableId={key} key={key}>
                {(provided, snapshot) => {
                  const isMatchZone = draggingType === key
                  const hasItems = sectionParts[key]?.length > 0
                  const highlight = snapshot.isDraggingOver
                    ? isMatchZone
                      ? 'border-green-500 dark:border-green-400'
                      : 'border-red-500 dark:border-red-400'
                    : hasItems
                      ? 'border-green-500 dark:border-green-400'
                      : 'border-gray-300 dark:border-dark-600'

                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center text-center space-y-4 min-h-[14rem] ${highlight}`}
                    >
                      <span className="text-5xl">{SECTION_ICONS[key]}</span>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Add {label}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {key === 'warm_up' ? 'Start with an energizing activity'
                        : key === 'bridge_activity' ? 'Link warm-up to main'
                        : key === 'main_activity' ? 'Core learning activities'
                        : key === 'end_of_lesson' ? 'Wrap up and reflect'
                        : 'Attach scripts for actors'}
                      </p>

                      <div className="w-full space-y-2">
                        {sectionParts[key].map((p, idx) => (
                          <div
                            key={p.id}
                            className="relative w-full rounded-xl border border-green-500 bg-green-600/80 dark:bg-green-900/80 text-left p-5 shadow-lg transition duration-300"
                          >
                            <div className="absolute -top-2 -left-2 text-sm p-0.5 bg-green-200 dark:bg-green-800 rounded-full border border-white shadow-sm">
                              {SECTION_ICONS[p.section_type]}
                            </div>
                            <button
                              onClick={() => handleRemovePart(key, p.id)}
                              className="absolute top-1 right-2 text-xs text-red-500 hover:text-red-300 transition"
                            >
                              Remove
                            </button>
                            <h4 className="text-lg font-extrabold text-white mb-1">{p.title}</h4>
                            {p.body && (
                              <p className="text-sm text-green-100 mb-3 leading-snug">
                                {p.body}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {typeof p.time === 'number' && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white font-medium shadow-sm">
                                  {p.time} min
                                </span>
                              )}
                              <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white font-medium shadow-sm">
                                {p.age_group}
                              </span>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white font-medium shadow-sm">
                                {p.level}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )
                }}
              </Droppable>
            ))}
          </div>
        </aside>

        {/* Main panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="flex gap-2 items-center p-4 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
            <select
              value={filters.section}
              onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}
              className="block w-1/4 px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
            >
              <option value="">All Sections</option>
              {Object.entries(SECTION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={filters.ageGroup}
              onChange={e => setFilters(f => ({ ...f, ageGroup: e.target.value }))}
              className="block w-1/4 px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
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
              className="block w-1/4 px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
            >
              <option value="">All Levels</option>
              <option value="Toe Tipper">Toe Tipper</option>
              <option value="Green Horn">Green Horn</option>
              <option value="Semi-Pro">Semi-Pro</option>
              <option value="Seasoned Veteran(all)">Seasoned Veteran(all)</option>
            </select>
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search..."
              className="flex-1 px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Parts grid */}
          <div className="flex-1 p-4 overflow-auto relative">

            <Droppable droppableId="parts">
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-3 gap-4"
                >
                  {filtered.map((p, idx) => (
                            <Draggable key={p.id} draggableId={String(p.id)} index={idx}>
                            {(providedDr, snapshotDr) => (
                                <div
                                ref={providedDr.innerRef}
                                {...providedDr.draggableProps}
                                {...providedDr.dragHandleProps}
                                className={`relative bg-dark-800 border border-dark-600 rounded-xl p-5 shadow-md hover:shadow-lg transition duration-200 hover:border-blue-500 group`}
                                >
                                    {snapshotDr.isDragging && invalidDrop && draggingType === p.section_type && (
  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded shadow z-50">
    Must be dropped into {invalidSection}
  </div>
)}

                                {/* Section Badge — inconspicuous top-left */}
                                <div
                                    className={`absolute top-2 left-2 text-[11px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full border shadow-inner backdrop-blur-sm z-10 transition-all duration-200 ${
                                    p.section_type === 'warm_up'
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

                                {/* Section Icon — top-right, fades in on hover or drag */}
                                <div className={`absolute top-2 right-2 text-3xl transition-all duration-300 ${
                                    snapshotDr.isDragging ? 'text-white/80' : 'text-white/20 group-hover:text-white/80'
                                }`}>
                                    {SECTION_ICONS[p.section_type]}
                                </div>

                                <div className="mt-6 space-y-3">
                                    <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                                    {p.title}
                                    </h3>

                                    <div className="space-y-1 text-sm">
                                    <p className="text-gray-300">
                                        <span className="inline-block w-20 text-white/70 font-semibold">Age:</span>
                                        <span className="text-gray-100">{p.age_group}</span>
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="inline-block w-20 text-white/70 font-semibold">Level:</span>
                                        <span className="text-gray-100">{p.level}</span>
                                    </p>
                                    {typeof p.time === 'number' && (
                                        <p className="text-gray-300">
                                        <span className="inline-block w-20 text-white/70 font-semibold">Time:</span>
                                        <span className="text-gray-100">{p.time} min</span>
                                        </p>
                                    )}
                                    </div>

                                    {p.body && (
                                    <p className="text-sm text-gray-400 leading-relaxed tracking-wide border-t border-white/10 pt-3">
                                        {p.body}
                                    </p>
                                    )}
                                </div>
                                </div>
                            )}
                            </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}
