// src/components/LessonPlanningNew.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

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

    if (
      source.droppableId === 'parts' &&
      destination.droppableId === 'sidebar'
    ) {
      const part = allParts.find(p => String(p.id) === draggableId)
      if (part) {
        onAddToPlan(part)
        setSidebarParts(s => [...s, part])
      }
    }
  }

  // compute totals
  const totalMinutes = sidebarParts.reduce((sum, p) => sum + (p.time || 0), 0)
  const totalActivities = sidebarParts.length

  return (
    <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 p-4 overflow-auto flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lesson Plan
          </h2>
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            ←
          </button>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4 mb-4">
          <div>{totalMinutes} min</div>
          <div>{totalActivities} activities</div>
        </div>
        <button
          className="w-full mb-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-2 rounded-lg transition-colors"
          onClick={() => {}}
        >
          View Activities
        </button>

        {/* Sections */}
        <div className="space-y-6">
          {/* Warm-up */}
          <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 flex flex-col items-center text-center space-y-2">
            <span className="text-3xl">🔥</span>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Add Warm-up
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Start with an energizing activity
            </p>
            <button className="text-pink-500 dark:text-pink-400 hover:underline text-sm">
              + Add Activity
            </button>
          </div>

          {/* Main Activities */}
          <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 flex flex-col items-center text-center space-y-2">
            <span className="text-3xl">🎭</span>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Add Main Activity
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Core learning activities
            </p>
            <button className="text-pink-500 dark:text-pink-400 hover:underline text-sm">
              + Add Activity
            </button>
          </div>

          {/* Cool-down */}
          <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 flex flex-col items-center text-center space-y-2">
            <span className="text-3xl">❄️</span>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Add Cool-down
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Wrap up and reflect
            </p>
            <button className="text-pink-500 dark:text-pink-400 hover:underline text-sm">
              + Add Activity
            </button>
          </div>
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filters bar */}
        <div className="flex gap-2 items-center p-4 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
          <select
            value={filters.section}
            onChange={e =>
              setFilters(f => ({ ...f, section: e.target.value }))
            }
            className="block w-1/4 px-3 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sections</option>
            {Object.entries({
              warm_up: 'Warm Ups',
              bridge_activity: 'Bridge Activities',
              main_activity: 'Main Activities',
              end_of_lesson: 'End Of Lesson',
              script: 'Scripts',
            }).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={filters.search}
            onChange={e =>
              setFilters(f => ({ ...f, search: e.target.value }))
            }
            placeholder="Search..."
            className="flex-1 px-3 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filters.ageGroup}
            onChange={e =>
              setFilters(f => ({ ...f, ageGroup: e.target.value }))
            }
            className="block w-1/4 px-3 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ages</option>
            <option value="young">Young</option>
            <option value="middle">Middle</option>
            <option value="older">Older</option>
          </select>

          <select
            value={filters.level}
            onChange={e =>
              setFilters(f => ({ ...f, level: e.target.value }))
            }
            className="block w-1/4 px-3 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="Toe Tipper">Toe Tipper</option>
            <option value="Green Horn">Green Horn</option>
            <option value="Semi-Pro">Semi-Pro</option>
            <option value="Seasoned Veteran">Seasoned Veteran</option>
          </select>
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
                    <Draggable
                      key={p.id}
                      draggableId={String(p.id)}
                      index={idx}
                    >
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
