// src/components/LessonPlanningNew.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

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
    section: '',
    search: '',
    ageGroup: '',
    level: '',
  })
  const [sidebarParts, setSidebarParts] = useState([])

  useEffect(() => {
    fetch('/api/lesson_planning')
      .then(r => r.json())
      .then(data => {
        console.log('API call received:', data.message)
        // TODO: setAllParts(data.parts)
      })
      .catch(console.error)
  }, [])

  const filtered = useMemo(() => {
    return allParts.filter(p => {
      if (filters.section && p.section_type !== filters.section) return false
      if (filters.ageGroup && p.age_group !== filters.ageGroup) return false
      if (filters.level && p.level !== filters.level) return false
      const text = `${p.title} ${p.body}`.toLowerCase()
      if (filters.search && !text.includes(filters.search.toLowerCase()))
        return false
      return true
    })
  }, [allParts, filters])

  function onDragEnd(result) {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === 'parts' && destination.droppableId === 'sidebar') {
      const part = allParts.find(p => String(p.id) === draggableId)
      if (part) {
        onAddToPlan(part)
        setSidebarParts(s => [...s, part])
      }
    }
  }

  const totalMinutes    = sidebarParts.reduce((sum, p) => sum + (p.time || 0), 0)
  const totalActivities = sidebarParts.length

  return (
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

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-6 mb-4">
          <div>{totalMinutes} min</div>
          <div>{totalActivities} activities</div>
        </div>

        {/* separator */}
        <div className="border-b border-gray-200 dark:border-dark-700 mb-6" />

        <div className="space-y-6">
          {Object.entries(SECTION_LABELS).map(([key, label]) => (
            <Droppable key={key} droppableId={`sidebar-${key}`}>
              {(prov, snap) => (
                <div
                  ref={prov.innerRef}
                  {...prov.droppableProps}
                  className={`
                    border-2 border-dashed border-gray-300 dark:border-dark-600 
                    rounded-lg p-6 flex flex-col items-center text-center space-y-4 
                    min-h-[14rem]
                    ${snap.isDraggingOver ? 'bg-gray-100 dark:bg-dark-700' : ''}
                  `}
                >
                  <span className="text-5xl">{SECTION_ICONS[key]}</span>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {label === 'Warm Ups'
                      ? 'Start with an energizing activity'
                      : label === 'Main Activities'
                      ? 'Core learning activities'
                      : label === 'End Of Lesson'
                      ? 'Wrap up and reflect'
                      : label === 'Bridge Activities'
                      ? 'Link warm-up to main'
                      : 'Attach scripts for actors'}
                  </p>
                  {prov.placeholder}
                </div>
              )}
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
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={filters.ageGroup}
            onChange={e => setFilters(f => ({ ...f, ageGroup: e.target.value }))}
            className="block w-1/4 px-3 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ages</option>
            <option value="young">Young</option>
            <option value="middle">Middle</option>
            <option value="older">Older</option>
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
            <option value="Seasoned Veteran">Seasoned Veteran</option>
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
        <div className="flex-1 p-4 overflow-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="parts">
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-3 gap-4"
                >
                  {filtered.map((p, idx) => (
                    <Draggable key={p.id} draggableId={String(p.id)} index={idx}>
                      {prov => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 shadow-sm cursor-pointer transition-colors duration-200"
                        >
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
          </DragDropContext>
        </div>
      </div>
    </div>
  )
}
