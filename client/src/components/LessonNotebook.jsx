// src/components/LessonNotebook.jsx
import React, { useEffect, useState, useMemo } from 'react'

// Section labels & icons
const SECTION_LABELS = {
  warm_up: '🔥 Warm Up',
  bridge_activity: '🌉 Bridge Activity',
  main_activity: '🎭 Main Activity',
  end_of_lesson: '🏁 End of Lesson',
  script: '📜 Script'
}
const SECTION_ICONS = {
  warm_up: '🔥',
  bridge_activity: '🌉',
  main_activity: '🎭',
  end_of_lesson: '🏁',
  script: '📜'
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
]

export default function LessonNotebook({ userId }) {
  const [lessons, setLessons] = useState([])
  const [filters, setFilters] = useState({
    section: '',
    ageGroup: '',
    level: '',
    search: ''
  })
  const [showFavorites, setShowFavorites] = useState(false)
  const [openLessons, setOpenLessons] = useState({})
  const [confirmRemoveId, setConfirmRemoveId] = useState(null)
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [notification, setNotification] = useState('')

  // Fetch lessons + seed favorites
  useEffect(() => {
    fetch(`/api/lessons?user_id=${userId}`)
      .then(r => r.json())
      .then(data => {
        const list = data || []
        setLessons(list)
        setFavoriteIds(new Set(list.filter(l => l.favorite).map(l => l.id)))
      })
  }, [userId])

  // Filter logic, honoring favorites toggle
  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      if (showFavorites && !favoriteIds.has(lesson.id)) return false
      const allTags = (lesson.lesson_parts || []).flatMap(p => p.tags || [])
      if (filters.tag && !allTags.includes(filters.tag)) return false
      const text = (
        lesson.title +
        ' ' +
        lesson.objective +
        ' ' +
        (lesson.at_a_glance || []).join(' ') +
        ' ' +
        allTags.join(' ')
      ).toLowerCase()
      if (filters.search && !text.includes(filters.search.toLowerCase())) return false
      if (filters.ageGroup && !lesson.lesson_parts?.some(p => p.age_group === filters.ageGroup)) return false
      if (filters.level && !lesson.lesson_parts?.some(p => p.level === filters.level)) return false
      return true
    })
  }, [lessons, filters, showFavorites, favoriteIds])

  // Toggle open detail panel
  const toggleOpen = id =>
    setOpenLessons(prev => ({ ...prev, [id]: !prev[id] }))

  // Remove lesson
  const removeLesson = async id => {
    try {
      await fetch(`/api/lessons/${id}`, { method: 'DELETE' })
      setLessons(prev => prev.filter(l => l.id !== id))
      setNotification('Lesson was deleted')
      setTimeout(() => setNotification(''), 3000)
    } catch (err) {
      console.error('Failed to delete lesson', err)
    } finally {
      setConfirmRemoveId(null)
      setOpenLessons(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  // Favorite / unfavorite
  const favoriteLesson = async id => {
    try {
      await fetch(`/api/lessons/${id}/favorite`, { method: 'POST' })
      setFavoriteIds(prev => new Set(prev).add(id))
    } catch (err) {
      console.error('Failed to favorite lesson', err)
    }
  }
  const removeFavorite = async id => {
    try {
      await fetch(`/api/lessons/${id}/favorite`, { method: 'DELETE' })
      setFavoriteIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch (err) {
      console.error('Failed to remove favorite', err)
    }
  }

  return (
    <div className="flex w-full min-h-screen bg-dark-900 text-white">
      {/* Sidebar */}
      <aside className="w-96 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Lesson Notebook
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Review and manage your saved lessons here.
        </p>
        <div className="border-b border-gray-200 dark:border-dark-700 my-6" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full px-0 py-6">
        <h2 className="text-2xl font-bold text-white mb-4 px-4">
          📓 Your Lesson Notebook
        </h2>

        {/* Notification Banner */}
        {notification && (
          <div className="mx-4 mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow">
            {notification}
          </div>
        )}

        {/* Filters */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-5 gap-4 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 p-4 mb-6">
          {/* Favorites toggle */}
          <button
            onClick={() => setShowFavorites(f => !f)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition ${
              showFavorites
                ? 'bg-green-600 text-white'
                : 'border border-green-600 text-green-600'
            }`}
          >
            {showFavorites ? 'Show Only Favorites: On' : 'Show Only Favorites: Off'}
          </button>

          {/* Section Filter */}
         <select
            value={filters.tag}
            onChange={e => setFilters(f => ({ ...f, tag: e.target.value }))}
            className="w-full px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
          >
            <option value="">All Tags</option>
            {AVAILABLE_TAGS.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Age Filter */}
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

          {/* Level Filter */}
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

          {/* Search Input */}
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search..."
            className="w-full px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Lesson List */}
        {filteredLessons.length === 0 ? (
          <p className="text-gray-400 px-4">
            You haven't saved any lessons yet or none match your search.
          </p>
        ) : (
          <div className="flex flex-col gap-6 px-4">
            {filteredLessons.map(lesson => {
              const totalTime = (lesson.lesson_parts || []).reduce((sum, p) => sum + (p.time || 0), 0)
              const ageGroups = [...new Set(lesson.lesson_parts?.map(p => p.age_group).filter(Boolean))]
              const levels = [...new Set(lesson.lesson_parts?.map(p => p.level).filter(Boolean))]
              const lessonAge = ageGroups.length ? ageGroups.join(', ') : '—'
              const lessonLevel = levels.length ? levels.join(', ') : '—'
              const isOpen = !!openLessons[lesson.id]
              const isFavorited = favoriteIds.has(lesson.id)

              return (
                <div
                  key={lesson.id}
                  className="w-full bg-dark-800 border border-dark-600 p-6 pb-20 rounded-2xl shadow-md hover:shadow-xl transition duration-300 relative"
                >
                 {/* Title & favorite badge */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="flex items-center text-2xl font-extrabold text-sky-300">
                      {lesson.title}
                      {isFavorited && (
                        <span className="ml-3 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                          Favorited
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {lesson.lesson_parts?.length || 0} parts
                    </span>
                  </div>

                  {/* Objective */}
                  <p className="text-sm text-gray-300 mb-4">{lesson.objective}</p>

                  {/* At-a-Glance */}
                  {lesson.at_a_glance?.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-300 mb-4">
                      {lesson.at_a_glance.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  )}

                  {/* Age / Level / Time */}
                  <div className="flex flex-wrap gap-6 items-center text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><strong>Time:</strong> ⏱️ <span className="text-white">{totalTime} min</span></span>
                    <span className="flex items-center gap-1"><strong>Age:</strong> 📅 <span className="text-white">{lessonAge}</span></span>
                    <span className="flex items-center gap-1"><strong>Level:</strong> ✏️ <span className="text-white">{lessonLevel}</span></span>
                  </div>

                  {/* Toggle Details */}
                  <button onClick={() => toggleOpen(lesson.id)} className="flex items-center text-sm text-sky-300 mb-4 focus:outline-none">
                    {isOpen ? 'Hide Details' : 'Show Details'} <span className={`ml-2 inline-block transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {/* Favorite & Remove Buttons */}
                  {isOpen && (
                    <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                      {!isFavorited ? (
                        <button onClick={() => favoriteLesson(lesson.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded">Add to Favorites</button>
                      ) : (
                        <button onClick={() => removeFavorite(lesson.id)} className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded">Remove from Favorites</button>
                      )}
                      <button onClick={() => setConfirmRemoveId(lesson.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded">Remove</button>
                    </div>
                  )}

                  {/* Details Grid */}
                  {isOpen && lesson.lesson_parts?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {lesson.lesson_parts.map((p, idx) => (
                        <div key={idx} className="relative group bg-dark-700 border border-dark-600 p-4 rounded-2xl backdrop-blur-sm shadow-sm hover:shadow-lg transition duration-300">
                          {/* Section Label */}
                          <div className={`absolute top-2 left-2 text-[11px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full border shadow-inner backdrop-blur-sm z-10 ${
                            p.section_type === 'warm_up' ? 'bg-gradient-to-br from-pink-700/30 to-pink-500/20 text-pink-300 border-pink-500/40' :
                            p.section_type === 'bridge_activity' ? 'bg-gradient-to-br from-yellow-600/30 to-yellow-500/20 text-yellow-200 border-yellow-400/40' :
                            p.section_type === 'main_activity' ? 'bg-gradient-to-br from-indigo-600/30 to-indigo-500/20 text-indigo-200 border-indigo-400/40' :
                            p.section_type === 'end_of_lesson' ? 'bg-gradient-to-br from-teal-600/30 to-teal-500/20 text-teal-200 border-teal-400/40' :
                            'bg-gradient-to-br from-sky-600/30 to-sky-500/20 text-sky-200 border-sky-400/40'
                          }`}> {SECTION_LABELS[p.section_type]} </div>
                          {/* Icon */}
                          <div className="absolute top-2 right-2 text-2xl text-white">{SECTION_ICONS[p.section_type]}</div>
                          {/* Part Content */}
                          <div className="mt-6 space-y-2">
                            <h4 className="text-lg font-extrabold text-white">{p.title}</h4>
                            <div className="text-sm text-gray-300">
                              <p><strong>Age:</strong> <span className="text-gray-100">{p.age_group}</span></p>
                              <p><strong>Level:</strong> <span className="text-gray-100">{p.level}</span></p>
                              {typeof p.time === 'number' && (<p><strong>Time:</strong> <span className="text-gray-100">{p.time} min</span></p>)}
                            </div>
                            {p.body && (<p className="text-sm text-gray-300 border-t border-white/10 pt-2">{p.body}</p>)}
                          </div>
                          {/* Tags */}
                          {Array.isArray(p.tags) && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10 mt-3">
                              {p.tags.map(tag => (
                                <span key={tag} className="text-sm px-3 py-1 rounded-full font-medium text-white tracking-wide shadow-sm animate-pulse" style={{background: 'linear-gradient(145deg, #6b21a8, #a21caf, #7e22ce)',backgroundSize: '200% 200%',animation: 'shine 5s ease infinite',border: '1px solid rgba(255,255,255,0.05)',boxShadow: 'inset 0 0 6px rgba(255,255,255,0.05), 0 2px 6px rgba(126,34,206,0.3)',backdropFilter: 'blur(3px)',textTransform: 'none'}}>✨ {tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmRemoveId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Are you sure?</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">This will permanently remove that lesson.</p>
              <div className="flex justify-end gap-4">
                <button onClick={() => setConfirmRemoveId(null)} className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300">Cancel</button>
                <button onClick={() => removeLesson(confirmRemoveId)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Yes, Remove</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
