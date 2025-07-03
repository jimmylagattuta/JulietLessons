// src/components/LessonPlanningNew.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import './LessonPlanning.css' // or reuse NewLesson.css

export default function LessonPlanningNew({ lessonPartsApi, onAddToPlan }) {
  const [allParts, setAllParts] = useState([])
  const [filters, setFilters] = useState({ section: '', search: '', ageGroup: '', level: '' })
  const [sidebarParts, setSidebarParts] = useState([])

  // 1️⃣ Load parts
  useEffect(() => {
    fetch('/api/lesson_planning')
      .then((res) => res.json())
      .then((data) => {
        console.log('API call received:', data.message)
        // Eventually you'll setAllParts(data.parts)
      })
      .catch(console.error)
  }, [])
  
  // 2️⃣ Filtered list
  const filtered = useMemo(() => {
    return allParts.filter(p => {
      if (filters.section && p.section_type !== filters.section) return false
      if (filters.ageGroup && p.age_group !== filters.ageGroup) return false
      if (filters.level && p.level !== filters.level) return false
      const text = `${p.title} ${p.body}`.toLowerCase()
      if (filters.search && !text.includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [allParts, filters])

  // 3️⃣ Drag & Drop handlers
  function onDragEnd(result) {
    const { source, destination, draggableId } = result
    if (!destination) return

    // if dragged from list -> sidebar
    if (source.droppableId === 'parts' && destination.droppableId === 'sidebar') {
      const part = allParts.find(p => String(p.id) === draggableId)
      onAddToPlan(part)
      setSidebarParts(sp => [...sp, part])
    }
  }

  return (
    <div className="lesson-planning-new flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="sidebar w-1/4 bg-gray-100 p-4 overflow-auto">
        <h2 className="text-lg font-bold mb-2">Current Lesson</h2>
        <ul>
          {sidebarParts.map(p => (
            <li key={p.id} className="lesson-part-card mb-2">
              <strong>{p.title}</strong><br/>
              <small>{p.section_type}</small>
            </li>
          ))}
        </ul>
      </div>

      {/* Main area */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Filters */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          <select onChange={e => setFilters(f => ({...f, section: e.target.value}))}>
            <option value="">All Sections</option>
            {Object.entries({
              warm_up: 'Warm Ups',
              bridge_activity: 'Bridge Activities',
              main_activity: 'Main Activities',
              end_of_lesson: 'End Of Lesson',
              script: 'Scripts'
            }).map(([k,v])=> <option key={k} value={k}>{v}</option>)}
          </select>
          <input
            placeholder="Search..."
            onChange={e => setFilters(f => ({...f, search: e.target.value}))}
          />
          <select onChange={e => setFilters(f => ({...f, ageGroup: e.target.value}))}>
            <option value="">All Ages</option>
            <option value="young">young</option>
            <option value="middle">middle</option>
            <option value="older">older</option>
            <option value="all">all</option>
          </select>
          <select onChange={e => setFilters(f => ({...f, level: e.target.value}))}>
            <option value="">All Levels</option>
            <option value="Toe Tipper">Toe Tipper</option>
            <option value="Green Horn">Green Horn</option>
            <option value="Semi-Pro">Semi-Pro</option>
            <option value="Seasoned Veteran">Seasoned Veteran</option>
          </select>
        </div>

        {/* Draggable List */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            <Droppable droppableId="parts">
              {(provided) => (
                <div
                  className="parts-list"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {filtered.map((p, i) => (
                    <Draggable
                      key={p.id}
                      draggableId={String(p.id)}
                      index={i}
                    >
                      {(prov) => (
                        <div
                          className="lesson-part-card p-4 bg-white rounded shadow cursor-pointer mb-2"
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                        >
                          <h3 className="font-semibold">{p.title}</h3>
                          <p className="text-sm text-gray-600">{p.section_type}</p>
                          <p className="text-xs">{p.age_group} • {p.level}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}