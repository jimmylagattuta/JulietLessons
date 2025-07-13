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

export default function EditLessonPart({ editingPart, setEditingPart, admin }) {
  const [allParts, setAllParts] = useState([])
  const [filters, setFilters] = useState({
    section: '',
    ageGroup: '',
    level: '',
    tag: '',
    onlyAdminCreated: false,
    search: ''
  })
  const [editFields, setEditFields] = useState({ title: '', body: '', age_group: [], level: [], time: '' })
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [tags, setTags] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [removeFileIds, setRemoveFileIds] = useState([]);

  // Set Edit Parts
  useEffect(() => {

    if (editingPart) {
      setEditFields({
        title: editingPart.title,
        body: editingPart.body,
        age_group: editingPart.age_group,
        level: editingPart.level,
        time: editingPart.time,
      })
      setTags(editingPart.tags || []);
      setExistingFiles(editingPart.file_infos || []);
      setRemoveFileIds([]);
      setNewFiles([])
    }

    fetch('/api/lesson_planning')
      .then(res => res.json())
      .then(data => setAllParts(data.parts || []))
      .catch(console.error)
  }, [editingPart])

  const handleSave = () => {
    setLoading(true)

    const fd = new FormData()

    // 1) scalar fields (everything except age_group & level)
    Object.entries(editFields)
      .filter(([k]) => !['age_group', 'level'].includes(k))
      .forEach(([k, v]) => {
        fd.append(`lesson_part[${k}]`, v)
      })

    // 2) age_group array
    if (Array.isArray(editFields.age_group)) {
      editFields.age_group.forEach(g =>
        fd.append('lesson_part[age_group][]', g)
      )
    }

    // 3) level array
    if (Array.isArray(editFields.level)) {
      editFields.level.forEach(l =>
        fd.append('lesson_part[level][]', l)
      )
    }

    // 4) tags array
    tags.forEach(tag =>
      fd.append('lesson_part[tags][]', tag)
    )

    // 5) newly-uploaded files
    newFiles.forEach(file =>
      fd.append('lesson_part[files][]', file)
    )

    // 6) removals
    removeFileIds.forEach(id =>
      fd.append('remove_file_ids[]', id)
    )

    fetch(`/api/lesson_parts/${editingPart.id}`, {
      method: 'PUT',
      body: fd,
    })
      .then(res => res.json())
      .then(data => {
        setSuccessMessage(data.message || 'Update completed')
        setTimeout(() => setSuccessMessage(''), 3000)

        // refresh list & close editor
        return fetch('/api/lesson_planning')
          .then(r => r.json())
          .then(d => {
            setAllParts(d.parts || [])
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

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this lesson part? This action cannot be undone.')) return;

    setLoading(true);

    fetch(`/api/lesson_parts/${editingPart.id}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        return res.json();
      })
      .then(() => {
        setSuccessMessage('Lesson part deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        setEditingPart(null);

        return fetch('/api/lesson_planning')
          .then(r => r.json())
          .then(d => {
            setAllParts(d.parts || []);
            setLoading(false);
          });
      })
      .catch(err => {
        console.error(err);
        setSuccessMessage('❌ Delete failed. Please try again.');
        setTimeout(() => setSuccessMessage(''), 3000);
        setLoading(false);
      });
  };


  const filteredParts = useMemo(() => {
    return allParts.filter(p => {
      // section_type stays the same
      if (filters.section && p.section_type !== filters.section) return false

      // ageGroup must be in the array
      if (filters.ageGroup && (
        !Array.isArray(p.age_group) ||
        !p.age_group.includes(filters.ageGroup)
      )) return false

      // level must be in the array
      if (filters.level && (
        !Array.isArray(p.level) ||
        !p.level.includes(filters.level)
      )) return false

      // tags unchanged
      if (filters.tag && (!Array.isArray(p.tags) || !p.tags.includes(filters.tag))) return false

      // text search
      const text = `${p.title} ${p.body}`.toLowerCase()
      if (filters.search && !text.includes(filters.search.toLowerCase())) return false

      if (filters.onlyAdminCreated && !p.admin_created) return false

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

      {/* Filters */}
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

          <select
            value={filters.tag}
            onChange={e => setFilters(f => ({ ...f, tag: e.target.value }))}
            className="px-3 py-2 rounded bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-sm text-gray-800 dark:text-gray-200"
          >
            <option value="">All Tags</option>
            {AVAILABLE_TAGS.map(t =>
              <option key={t} value={t}>{t}</option>
            )}
          </select>

          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search..."
            className="flex-1 px-3 py-2 rounded bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-sm text-gray-800 dark:text-gray-200"
          />

          {admin && (
            <button
              onClick={() => setFilters(f => ({ ...f, onlyAdminCreated: !f.onlyAdminCreated }))}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${filters.onlyAdminCreated
                  ? 'text-white'
                  : 'text-gray-300 border border-gray-500 bg-dark-700 hover:bg-dark-600'
                }`}
              style={
                filters.onlyAdminCreated
                  ? {
                    background: 'linear-gradient(135deg, #1e3a8a, #10b981)',
                    backgroundSize: '160% 160%',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow:
                      'inset 0 0 6px rgba(255,255,255,0.05), 0 2px 6px rgba(16,185,129,0.4)',
                    backdropFilter: 'blur(3px)',
                  }
                  : {}
              }
            >
              🛡️ Only Admin-Created
            </button>
          )}

        </div>
      )}

      {/* Cards */}
      {!editingPart && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredParts.filter(p => admin || !p.admin_created).map(p => {
            const canEdit = !p.admin_created || admin;

            return (
              <div
                key={p.id}
                className="relative bg-dark-800 border border-dark-600 rounded-xl p-5 shadow-md hover:shadow-lg transition duration-200 hover:border-blue-500 group cursor-pointer"
                onClick={() => canEdit && handleEditClick(p)}
              >
                {/* EDIT BADGE */}
                <div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-white text-xs font-bold px-3 py-1 bg-blue-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
                >
                  ✏️ Edit
                </div>

                {/* SECTION BADGE */}
                <div
                  className={`absolute top-2 left-2 text-[11px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full border shadow-inner backdrop-blur-sm z-10 transition-all duration-200
                    ${p.section_type === 'warm_up'
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

                {/* ICON */}
                <div className="absolute top-2 right-2 text-3xl text-white/20 group-hover:text-white/80 transition">
                  {SECTION_ICONS[p.section_type]}
                </div>

                <div className="mt-6 space-y-3">
                  <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight">{p.title}</h3>


                  <div className="space-y-1 text-sm">


                    {/* Age Group */}
                    <div className="flex items-center">
                      <span className="inline-block w-20 text-white/70 font-semibold">
                        Age:
                      </span>
                      <div className="flex space-x-1 ml-0">
                        {Array.isArray(p.age_group) &&
                          p.age_group.map(age => (
                            <span
                              key={age}
                              className="inline-block px-2 py-0.5 text-xs leading-none rounded-full font-medium text-white shadow-sm"
                              style={{
                                background: 'linear-gradient(135deg, #1e3a8a, #10b981)',
                                backgroundSize: '160% 160%',
                                boxShadow:
                                  'inset 0 0 6px rgba(255,255,255,0.05), 0 2px 6px rgba(16,185,129,0.4)',
                                backdropFilter: 'blur(3px)',
                                border: 'none',
                              }}
                            >
                              {age}
                            </span>
                          ))
                        }
                      </div>
                    </div>

                    {/* Level */}
                    <div className="flex items-center">
                      <span className="inline-block w-20 text-white/70 font-semibold">
                        Level:
                      </span>
                      <div className="flex space-x-1 ml-0">
                        {Array.isArray(p.level) &&
                          p.level.map(lvl => (
                            <span
                              key={lvl}
                              className="inline-block px-2 py-0.5 text-xs leading-none rounded-full font-medium text-white shadow-sm"
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6, #f97316)',
                                backgroundSize: '160% 160%',
                                boxShadow:
                                  'inset 0 0 6px rgba(255,255,255,0.05), 0 2px 6px rgba(59,130,246,0.4)',
                                backdropFilter: 'blur(3px)',
                                border: 'none',
                              }}
                            >
                              {lvl}
                            </span>
                          ))
                        }
                      </div>
                    </div>

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

                  {/* if there are any file_infos, show them */}
                  {Array.isArray(p.file_infos) && p.file_infos.length > 0 && (
                    <div className="mt-4 border-t border-white/10 pt-4">
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
                  {p.admin_created && (
                    <div className="mt-6 text-left">
                      <span className="inline-block px-3 py-0.5 text-xs font-medium rounded-full bg-white/5 text-gray-400 border border-white/10 shadow-sm">
                        🛡️ Admin Created
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

        </div>
      )}

      {/* Editing */}
      {editingPart && (
        <div className="bg-dark-800 p-6 rounded-lg border border-blue-500 w-full max-w-3xl mx-auto">
          <h2 className="text-white text-2xl font-bold mb-4">
            Editing: {editFields.title || editingPart.title}
          </h2>

          <div className="space-y-4">
            {/* Title */}
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

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">Body</label>
              <textarea
                name="body"
                value={editFields.body}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-dark-700 text-white border border-dark-500"
              />
            </div>

            {/* Age Group (pill–style multi-select) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-1">
                Age Group
              </label>
              <div className="flex flex-wrap gap-2">
                {['Young', 'Middle', 'Older', 'All'].map(group => {
                  const isSelected = editFields.age_group.includes(group)
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() =>
                        setEditFields(f => ({
                          ...f,
                          age_group: isSelected
                            ? f.age_group.filter(g => g !== group)
                            : [...f.age_group, group]
                        }))
                      }
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-shadow shadow-sm ${isSelected
                        ? 'text-white'
                        : 'text-gray-300 border border-gray-500 bg-dark-700 hover:bg-dark-600'
                        }`}
                      style={
                        isSelected
                          ? {
                            background: 'linear-gradient(135deg, #1e3a8a, #10b981)',
                            backgroundSize: '160% 160%',
                            boxShadow:
                              'inset 0 0 6px rgba(255,255,255,0.05), 0 2px 6px rgba(16,185,129,0.4)',
                            backdropFilter: 'blur(3px)',
                            border: 'none',
                          }
                          : {}
                      }
                    >
                      {group}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Level (pill–style multi-select) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-1">
                Level
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Toe Tipper',
                  'Green Horn',
                  'Semi-Pro',
                  'Seasoned Veteran(all)'
                ].map(lvl => {
                  const isSelected = editFields.level.includes(lvl)
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        setEditFields(f => ({
                          ...f,
                          level: isSelected
                            ? f.level.filter(l => l !== lvl)
                            : [...f.level, lvl]
                        }))
                      }
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-shadow shadow-sm ${isSelected
                        ? 'text-white'
                        : 'text-gray-300 border border-gray-500 bg-dark-700 hover:bg-dark-600'
                        }`}
                      style={
                        isSelected
                          ? {
                            background: 'linear-gradient(135deg, #3b82f6, #f97316)',
                            backgroundSize: '160% 160%',
                            boxShadow:
                              'inset 0 0 6px rgba(255,255,255,0.05), 0 2px 6px rgba(59,130,246,0.4)',
                            backdropFilter: 'blur(3px)',
                            border: 'none',
                          }
                          : {}
                      }
                    >
                      {lvl}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time */}
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

            {/* Scripts */}
            {existingFiles.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white font-medium mb-2">Existing Scripts</h3>
                <ul className="list-disc list-inside text-gray-200 space-y-1">
                  {existingFiles.map(f => (
                    <li key={f.id} className="flex justify-between items-center">
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {f.filename}
                      </a>
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600 text-sm"
                        onClick={() => {
                          setRemoveFileIds(ids => [...ids, f.id]);
                          setExistingFiles(files => files.filter(x => x.id !== f.id));
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upload Scripts */}
            {/* ————— Upload PDFs ————— */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-1">
                Upload Scripts
              </label>
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={e => {
                  const picked = Array.from(e.target.files);
                  setNewFiles(prev => [...prev, ...picked]);
                  e.target.value = null; // reset so you can pick again
                }}
                className="text-sm text-gray-300"
              />
              {newFiles.length > 0 && (
                <ul className="mt-2 text-sm text-gray-200 space-y-1">
                  {newFiles.map((file, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      {file.name}
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600"
                        onClick={() => setNewFiles(prev => prev.filter((_, i) => i !== idx))}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tags */}
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
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${isSelected
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

          {/* Save, Delete, Cancel */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
            >
              Save
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
            >
              Delete
            </button>
            <button
              onClick={() => setEditingPart(null)}
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
