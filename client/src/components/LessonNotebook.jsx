import React, { useEffect, useState, useMemo } from 'react'

export default function LessonNotebook({ userId }) {
  const [lessons, setLessons] = useState([])
  const [filters, setFilters] = useState({
    section: '',
    ageGroup: '',
    level: '',
    search: ''
  })

  useEffect(() => {
    fetch(`/api/lessons?user_id=${userId}`)
      .then(r => r.json())
      .then(data => setLessons(data.lessons || []))
  }, [userId])

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const searchText = `${lesson.title} ${lesson.objective} ${(lesson.tags || []).join(' ')}`.toLowerCase()
      if (filters.search && !searchText.includes(filters.search.toLowerCase())) return false
      if (filters.ageGroup && lesson.age_group !== filters.ageGroup) return false
      if (filters.level && lesson.level !== filters.level) return false
      if (filters.section && !lesson.lesson_parts?.some(p => p.section_type === filters.section)) return false
      return true
    })
  }, [lessons, filters])

  return (
<div className="flex w-full min-h-screen bg-dark-900 text-white">

      {/* Sidebar */}
<aside className="w-96 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 p-6">

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lesson Notebook</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Review and manage your saved lessons here.</p>
        <div className="border-b border-gray-200 dark:border-dark-700 my-6" />
      </aside>

      {/* Main Content */}
    <main className="flex-1 flex flex-col w-full px-0 py-6">


        <h2 className="text-2xl font-bold text-white mb-4 px-4">📓 Your Lesson Notebook</h2>

        {/* Filters */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 p-4 mb-6">
          <select
            value={filters.section}
            onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}
            className="w-full px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
          >
            <option value="">All Sections</option>
            <option value="warm_up">Warm Ups</option>
            <option value="bridge_activity">Bridge Activities</option>
            <option value="main_activity">Main Activities</option>
            <option value="end_of_lesson">End Of Lesson</option>
            <option value="script">Scripts</option>
          </select>

          <select
            value={filters.ageGroup}
            onChange={e => setFilters(f => ({ ...f, ageGroup: e.target.value }))}
            className="w-full px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
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
            className="w-full px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
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
            className="w-full px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Lesson Cards */}
        {filteredLessons.length === 0 ? (
          <p className="text-gray-400 px-4">You haven't saved any lessons yet or none match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredLessons.map(lesson => (
              <div
                key={lesson.id}
                className="bg-dark-800 border border-dark-600 p-5 rounded-xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-sky-300 mb-2">{lesson.title}</h3>
                <p className="text-sm text-gray-300 mb-2">{lesson.objective}</p>
                <p className="text-xs text-gray-400 mb-1">Age: {lesson.age_group}</p>
                <p className="text-xs text-gray-400 mb-1">Level: {lesson.level}</p>
                <p className="text-xs text-gray-400 mb-2">Parts: {lesson.lesson_parts?.length || 0}</p>
                {(lesson.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lesson.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-purple-700/40 text-white shadow-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
