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
  const [invalidDrop, setInvalidDrop] = useState(false)
  const [invalidSection, setInvalidSection] = useState('')
  const [sectionParts, setSectionParts] = useState({
    warm_up: [],
    bridge_activity: [],
    main_activity: [],
    end_of_lesson: [],
    script: [],
  })

  useEffect(() => {
    fetch('/api/lesson_planning')
      .then(r => {
        if (!r.ok) throw new Error(`Status ${r.status}`)
        return r.json()
      })
      .then(data => setAllParts(data.parts || []))
      .catch(err => console.error(err))
  }, [])

    useEffect(() => {
    console.log("✅ Component mounted");
    }, []);


  const filtered = useMemo(() => {
    return allParts.filter(p => {
      if (filters.section  && p.section_type !== filters.section) return false
      if (filters.ageGroup && p.age_group    !== filters.ageGroup)  return false
      if (filters.level    && p.level        !== filters.level)     return false
      const text = `${p.title} ${p.body}`.toLowerCase()
      if (filters.search   && !text.includes(filters.search.toLowerCase()))
        return false
      return true
    })
  }, [allParts, filters])


    function onDragStart(start) {
    try {
        console.log("🟢 onDragStart", start)
        const part = allParts.find(p => String(p.id) === start.draggableId)
        setDraggingType(part?.section_type || null)
        setInvalidDrop(false)
        setInvalidSection('')
    } catch (error) {
        console.error("❌ Error in onDragStart:", error)
    }
    }


    function onDragUpdate(update) {
    try {
        console.log("🟡 onDragUpdate triggered", update)

        const dest = update.destination?.droppableId

        if (!dest) {
        setInvalidDrop(false)
        setInvalidSection('')
        return
        }

        if (Object.keys(SECTION_LABELS).includes(dest)) {
        if (dest !== draggingType) {
            setInvalidDrop(true)
            setInvalidSection(SECTION_LABELS[draggingType] || 'Unknown')
        } else {
            setInvalidDrop(false)
            setInvalidSection('')
        }
        } else {
        setInvalidDrop(false)
        setInvalidSection('')
        }
    } catch (error) {
        console.error("❌ Error in onDragUpdate:", error)
    }
    }


    function onDragEnd(result) {
        const { source, destination, draggableId } = result
        console.log('🟡 Drag Ended')
        console.log('Source:', source)
        console.log('Destination:', destination)
        console.log('Draggable ID:', draggableId)

        setDraggingType(null)
        setInvalidDrop(false)
        setInvalidSection('')

        // 🔴 Drop outside any droppable
        if (!destination) {
            console.warn('❌ Dropped outside a valid droppable area')
            return
        }

        // 🔴 Not from the pool to a section block
        if (source.droppableId !== 'parts') {
            console.warn('❌ Dragged from an invalid source:', source.droppableId)
            return
        }

        // 🔴 Not dropped into a valid section
        if (!Object.keys(SECTION_LABELS).includes(destination.droppableId)) {
            console.warn('❌ Dropped into an unknown section:', destination.droppableId)
            return
        }

        const part = allParts.find(p => String(p.id) === draggableId)
        if (!part) {
            console.warn('❌ Part not found for draggableId:', draggableId)
            return
        }

        // 🔴 Mismatched section drop
        if (destination.droppableId !== part.section_type) {
            console.warn(`❌ Invalid section drop. Expected ${part.section_type}, got ${destination.droppableId}`)
            return
        }

        // ✅ Valid drop – proceed
        console.log(`✅ Droppedd ${part.title} into correct section: ${destination.droppableId}`)
        // onAddToPlan(part)
        setSectionParts(prev => {
        const existing = prev[destination.droppableId]
        console.log("🧱 Current section parts before drop:", existing)
        console.log("📦 Incoming part:", part)

        const alreadyAdded = existing.some(p => p.id === part.id)
        if (alreadyAdded) {
            console.warn("⚠️ Part already added to this section. Skipping.")
            return prev
        }

        const updated = {
            ...prev,
            [destination.droppableId]: [...existing, part],
        }

        console.log("✅ Updated sectionParts after drop:", updated)
        return updated
        })

    }

    console.log("🔧 Hooking onDragEnd:", onDragEnd.name)

  return (
    <DragDropContext
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      onDragEnd={onDragEnd}
    >
      <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
        {/* Sidebar */}
        <aside className="w-96 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 p-6 overflow-auto flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Lesson Plan
            </h2>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              ←
            </button>
          </div>

          <div className="border-b border-gray-200 dark:border-dark-700 mb-6" />

          <div className="space-y-6">
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <Droppable droppableId={key} key={key}>
                {(provided, snapshot) => {
                  const isMatchZone = draggingType === key
                  const highlight = snapshot.isDraggingOver
                    ? isMatchZone
                      ? 'border-green-500 dark:border-green-400'
                      : 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-dark-600'

                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        relative border-2 border-dashed rounded-lg p-6
                        flex flex-col items-center text-center space-y-4
                        min-h-[14rem] ${highlight}
                      `}
                    >
                      <span className="text-5xl">{SECTION_ICONS[key]}</span>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Add {label}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {key === 'warm_up'          ? 'Start with an energizing activity'
                         : key === 'bridge_activity' ? 'Link warm-up to main'
                         : key === 'main_activity'   ? 'Core learning activities'
                         : key === 'end_of_lesson'   ? 'Wrap up and reflect'
                         :                             'Attach scripts for actors'}
                      </p>

                      {/* Render added parts */}
                      <div className="w-full space-y-2">
                        {sectionParts[key].map((p, idx) => (
                          <div
                            key={p.id}
                            className="w-full bg-green-50 dark:bg-green-900 p-2 rounded shadow text-sm text-left"
                          >
                            <strong>{p.title}</strong>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {p.age_group} · {p.level}
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
          {/* Filters bar */}
          <div className="flex gap-2 items-center p-4 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
            <select
              value={filters.section}
              onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}
              className="block w-1/4 px-3 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sections</option>
              {Object.entries(SECTION_LABELS).map(([k,v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <select
              value={filters.ageGroup}
              onChange={e => setFilters(f => ({ ...f, ageGroup: e.target.value }))}
              className="block w-1/4 px-3 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="block w-1/4 px-3 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 px-3 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Draggable parts grid */}
          <div className="flex-1 p-4 overflow-auto relative">
            <Droppable droppableId="parts">
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-3 gap-4"
                >
                  {filtered.map((p, idx) => (
                    <Draggable
                      key={p.id}
                      draggableId={String(p.id)}
                      index={idx}
                    >
                      {(providedDr, snapshotDr) => (
                        <div
                          ref={providedDr.innerRef}
                          {...providedDr.draggableProps}
                          {...providedDr.dragHandleProps}
                          className="relative p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 shadow-sm cursor-pointer transition-colors duration-200"
                        >
                          {snapshotDr.isDragging && invalidDrop && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-sm px-3 py-1 rounded shadow-lg">
                              Must drop into “{invalidSection}”
                            </div>
                          )}

                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {p.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {p.section_type}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {p.age_group} · {p.level}
                          </p>
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
