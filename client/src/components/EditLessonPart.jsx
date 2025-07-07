import React, { useState, useEffect, useMemo } from 'react'

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

export default function EditLessonPart({ editingPart, setEditingPart }) {
  const [allParts, setAllParts] = useState([])
  const [filters, setFilters] = useState({
    section: '',
    ageGroup: '',
    level: '',
    search: ''
  })
  const [editFields, setEditFields] = useState({ title: '', body: '', age_group: '', level: '', time: '' })
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [tags, setTags] = useState([]);

    useEffect(() => {
    console.log("🔄 useEffect triggered with editingPart:", editingPart)

    if (editingPart) {
      setEditFields({
        title: editingPart.title,
        body: editingPart.body,
        age_group: editingPart.age_group,
        level: editingPart.level,
        time: editingPart.time,
      })

      console.log("📌 Setting tags from editingPart.tags:", editingPart.tags)
      setTags(editingPart.tags || [])
    }

    fetch('/api/lesson_planning')
      .then(res => res.json())
      .then(data => setAllParts(data.parts || []))
      .catch(console.error)
  }, [editingPart])

  const handleSave = () => {
    setLoading(true)
    fetch(`/api/lesson_parts/${editingPart.id}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lesson_part: { ...editFields, tags } }),
    })
        .then(res => res.json())
        .then(data => {
        setSuccessMessage(data.message || 'Update completed')
        setTimeout(() => setSuccessMessage(''), 3000)
        // Re-fetch parts
        fetch('/api/lesson_planning')
            .then(res => res.json())
            .then(data => {
            setAllParts(data.parts || [])
            setEditingPart(null)
            setLoading(false)
            })
        })
        .catch(err => {
        console.error(err)
        setSuccessMessage('❌ Update failed. Please try again.')
        setTimeout(() => setSuccessMessage(''), 3000)
        setLoading(false)
        })
    }



  const filteredParts = useMemo(() => {
    return allParts.filter(p => {
      if (filters.section && p.section_type !== filters.section) return false
      if (filters.ageGroup && p.age_group !== filters.ageGroup) return false
      if (filters.level && p.level !== filters.level) return false
      const text = `${p.title} ${p.body}`.toLowerCase()
      if (filters.search && !text.includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [allParts, filters])

  const handleEditClick = part => {
    setEditingPart(part)
    setEditFields({
      title: part.title,
      body: part.body,
      age_group: part.age_group,
      level: part.level,
      time: part.time,
    })
    setTags(part.tags || []);
  }

  const handleChange = e => {
    const { name, value } = e.target
    setEditFields(f => ({ ...f, [name]: value }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-900 p-6 space-y-6">
        {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-dark-800 p-4 rounded shadow text-blue-600 text-lg font-bold">
            Saving changes...
            </div>
        </div>
        )}

        {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow z-50">
            {successMessage}
        </div>
        )}

      {!editingPart && (
        <div className="flex gap-2 flex-wrap">
          <select
            value={filters.section}
            onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}
            className="px-3 py-2 rounded bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-sm text-gray-800 dark:text-gray-200"
          >
            <option value="">All Sections</option>
            {Object.entries(SECTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <select
            value={filters.ageGroup}
            onChange={e => setFilters(f => ({ ...f, ageGroup: e.target.value }))}
            className="px-3 py-2 rounded bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-sm text-gray-800 dark:text-gray-200"
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
            className="px-3 py-2 rounded bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-sm text-gray-800 dark:text-gray-200"
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
            className="flex-1 px-3 py-2 rounded bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-sm text-gray-800 dark:text-gray-200"
          />
        </div>
      )}

      {!editingPart && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredParts.map(p => (
            <div
              key={p.id}
              className="relative bg-dark-800 border border-dark-600 rounded-xl p-5 shadow-md hover:shadow-lg transition duration-200 hover:border-blue-500 group cursor-pointer"
              onClick={() => handleEditClick(p)}
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-white text-xs font-bold px-3 py-1 bg-blue-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition">
                ✏️ Edit
              </div>

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

              <div className="absolute top-2 right-2 text-3xl text-white/20 group-hover:text-white/80 transition">
                {SECTION_ICONS[p.section_type]}
              </div>

              <div className="mt-6 space-y-3">
                <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight">{p.title}</h3>

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
                  <div>
                </div>
                </div>

                {p.body && (
                  <p className="text-sm text-gray-400 leading-relaxed tracking-wide border-t border-white/10 pt-3">
                    {p.body}
                  </p>
                )}

               {Array.isArray(p.tags) && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-3 border-t border-white/10 mt-3">
                    {p.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-sm px-4 py-1.5 rounded-full font-medium text-white transition-shadow hover:shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #6b21a8, #9d174d)',
                          backgroundSize: '160% 160%',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow:
                            'inset 0 0 6px rgba(255, 255, 255, 0.05), 0 2px 6px rgba(109, 40, 217, 0.4)',
                          backdropFilter: 'blur(3px)',
                        }}
                      >
                        ✨ {tag}
                      </span>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

        {editingPart && (
        <div className="bg-dark-800 p-6 rounded-lg border border-blue-500 w-full max-w-3xl mx-auto">
            <h2 className="text-white text-2xl font-bold mb-4">
            Editing: {editFields.title || editingPart.title}
            </h2>

            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-white mb-1">Title</label>
                <input
                type="text"
                name="title"
                value={editFields.title}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-dark-700 text-white border border-dark-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-white mb-1">Body</label>
                <textarea
                name="body"
                value={editFields.body}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-dark-700 text-white border border-dark-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-white mb-1">Age Group</label>
                <select
                    name="age_group"
                    value={editFields.age_group}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-dark-700 text-white border border-dark-500"
                >
                    <option value="">Select Age Group</option>
                    <option value="Young">Young</option>
                    <option value="Middle">Middle</option>
                    <option value="Older">Older</option>
                    <option value="All">All</option>
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-white mb-1">Level</label>
                <select
                    name="level"
                    value={editFields.level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-dark-700 text-white border border-dark-500"
                >
                    <option value="">Select Level</option>
                    <option value="Toe Tipper">Toe Tipper</option>
                    <option value="Green Horn">Green Horn</option>
                    <option value="Semi-Pro">Semi-Pro</option>
                    <option value="Seasoned Veteran(all)">Seasoned Veteran(all)</option>
                </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-white mb-1">Time (minutes)</label>
                <input
                type="number"
                name="time"
                value={editFields.time}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-dark-700 text-white border border-dark-500"
                />
            </div>

              <label className="block text-sm font-medium text-white mb-1">Tags</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => {
                  const isSelected = tags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => {
                        setTags(prev =>
                          isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                        isSelected
                          ? 'text-white'
                          : 'text-gray-300 border border-gray-500 bg-dark-700 hover:bg-dark-600'
                      }`}
                      style={
                        isSelected
                          ? {
                              background: 'linear-gradient(135deg, #6b21a8, #9d174d)',
                              backgroundSize: '160% 160%',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              boxShadow:
                                'inset 0 0 6px rgba(255, 255, 255, 0.05), 0 2px 6px rgba(109, 40, 217, 0.4)',
                              backdropFilter: 'blur(3px)',
                            }
                          : {}
                      }
                    >
                      {isSelected ? '✨ ' : ''}
                      {tag}
                    </button>
                  );
                })}
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-4">
            <button
                onClick={() => setEditingPart(null)}
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
            >
                Save
            </button>
            </div>
        </div>
        )}

    </div>
  )
}
