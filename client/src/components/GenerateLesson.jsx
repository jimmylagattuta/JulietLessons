// src/components/GenerateLesson.jsx

import React, { useState, useEffect } from 'react'
import './GenerateLesson.css'

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

/**
 * GenerateLesson component:
 *  - If `lessonId` prop is set, fetch that specific lesson once.
 *  - Otherwise, fetch random lessons from /api/lessons/random.
 *  - Calling onClearView() clears lessonId so subsequent generates are random.
 *
 * Props:
 *  - lessonId: string | null
 *  - onClearView: () => void
 */
export default function GenerateLesson({ lessonId = null, onClearView }) {
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showGlance, setShowGlance] = useState(false)
  const [showWarmUps, setShowWarmUps] = useState(false)
  const [showBridge, setShowBridge] = useState(false)
  const [showMain, setShowMain] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const [showScripts, setShowScripts] = useState(false)
  const [filters, setFilters] = useState({
    tags: [],
    ageGroups: [],
    levels: [],
    search: ''
  })
  const [unmetFilters, setUnmetFilters] = useState([])
  const [showUnmetModal, setShowUnmetModal] = useState(false)
  const [message, setMessage] = useState(null)
  const [tagResults, setTagResults] = useState({}) // ← Add this line

  // If we're viewing a saved lesson by ID, fetch it once.
  useEffect(() => {
    if (!lessonId) return
    setLoading(true)
    fetch(`/api/lessons/${lessonId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => setLesson(data))
      .catch(err => console.error('Error fetching lesson by ID:', err))
      .finally(() => setLoading(false))
  }, [lessonId])

  // Always fetch a new random lesson when you click
  const handleGenerate = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/lessons/random', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: filters.tags,
          ageGroups: filters.ageGroups,
          levels: filters.levels,
          search: filters.search,
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch lesson')
      const data = await response.json()
      console.log('data', data)
      setLesson(data.lesson || null)
      setMessage(data.message || null)
      setUnmetFilters(data.unmet || [])
      setTagResults(data.tag_results || {}) // ← Add this line
      setShowUnmetModal((data.unmet || []).length > 0)

    } catch (err) {
      console.error('❌ Error fetching lesson:', err)
    } finally {
      setLoading(false)
    }
  }


  // helpers for each section
  const warmUps = lesson?.lesson_parts?.filter(lp => lp.section_type === 'warm_up') || []
  const bridgeParts = lesson?.lesson_parts?.filter(lp => lp.section_type === 'bridge_activity') || []
  const mainActivities = lesson?.lesson_parts?.filter(lp => lp.section_type === 'main_activity') || []
  const endActivities = lesson?.lesson_parts?.filter(lp => lp.section_type === 'end_of_lesson') || []
  const scripts = lesson?.lesson_parts?.filter(lp => lp.section_type === 'script') || []

  const totalWarmUpTime = warmUps.reduce((sum, lp) => sum + (lp.time || 0), 0)
  const totalBridgeTime = bridgeParts.reduce((sum, lp) => sum + (lp.time || 0), 0)
  const totalMainTime = mainActivities.reduce((sum, lp) => sum + (lp.time || 0), 0)
  const totalEndTime = endActivities.reduce((sum, lp) => sum + (lp.time || 0), 0)

  const sortByPosition = arr =>
    arr.slice().sort((a, b) => (a.position || 0) - (b.position || 0))

  return (
    <div className="lesson-page">
      {showUnmetModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-100 rounded-2xl shadow-xl border border-gray-200 dark:border-dark-600">

            {/* Close Button */}
            <button
              onClick={() => setShowUnmetModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-2xl transition"
              aria-label="Close Modal"
            >
              &times;
            </button>

            {/* Title */}
            <h2 className="text-2xl font-semibold mb-2 text-center">🎯 Partial Match</h2>

            {/* Message */}
            {message && (
              <p className="text-center mb-4 text-sm text-gray-700 dark:text-gray-300">{message}</p>
            )}

            {/* Explanation */}
            <p className="text-sm mb-2 text-gray-600 dark:text-gray-400">
              Here's what we found:
            </p>

            {/* Matched Filters */}
            <div className="mb-3">
              {['tags', 'levels', 'age_groups', 'search_term'].map((key) => {
                const result = tagResults?.[key];
                if (!result) return null;
                return (
                  <div key={key} className="mb-2">
                    <h3 className="text-sm font-semibold capitalize text-green-500 mb-1">{key.replace('_', ' ')} matched:</h3>
                    {result.matched.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300">
                        {result.matched.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">None</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Unmatched Filters */}
            <div>
              {['tags', 'levels', 'age_groups', 'search_term'].map((key) => {
                const result = tagResults?.[key];
                if (!result) return null;
                return (
                  <div key={key} className="mb-2">
                    <h3 className="text-sm font-semibold capitalize text-red-500 mb-1">{key.replace('_', ' ')} not found:</h3>
                    {result.unmatched.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-red-500 dark:text-red-400">
                        {result.unmatched.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">None</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}



      <aside className="lesson-sidebar p-6 pt-4 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 w-80 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Juliet's Generator</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Choose filters or generate a random lesson.</p>

        {/* Tags */}
        <div className="w-full flex flex-wrap items-center gap-x-2 gap-y-3">
          <span className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">Tags:</span>
          {AVAILABLE_TAGS.map(tag => {
            const isSelected = filters.tags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    tags: isSelected
                      ? prev.tags.filter(t => t !== tag)
                      : [...prev.tags, tag]
                  }))
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-inner transition transform duration-150 ease-in-out
        ${isSelected
                    ? 'text-white bg-gradient-to-br from-orange-300 via-pink-500 to-violet-600 shadow-lg ring-2 ring-white/40 dark:ring-white/10 scale-105'
                    : 'text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 border border-gray-300 dark:border-gray-600 hover:scale-105 hover:shadow-md'}
      `}
              >
                {tag}
              </button>
            )
          })}
        </div>

        {/* Age Groups */}
        <div className="w-full flex flex-wrap items-center gap-x-2 gap-y-3">
          <span className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">Ages:</span>
          {['Young', 'Middle', 'Older', 'All'].map(age => {
            const isSelected = filters.ageGroups.includes(age)
            return (
              <button
                key={age}
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    ageGroups: isSelected
                      ? prev.ageGroups.filter(a => a !== age)
                      : [...prev.ageGroups, age]
                  }))
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-inner transition transform duration-150 ease-in-out
        ${isSelected
                    ? 'text-white bg-gradient-to-br from-blue-300 via-sky-400 to-teal-500 shadow-lg ring-2 ring-white/40 dark:ring-white/10 scale-105'
                    : 'text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 border border-gray-300 dark:border-gray-600 hover:scale-105 hover:shadow-md'}
      `}
              >
                {age}
              </button>
            )
          })}
        </div>

        {/* Levels */}
        <div className="w-full flex flex-wrap items-center gap-x-2 gap-y-3">
          <span className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">Level:</span>
          {['Toe Tipper', 'Green Horn', 'Semi-Pro', 'Seasoned Veteran(all)'].map(level => {
            const isSelected = filters.levels.includes(level)
            return (
              <button
                key={level}
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    levels: isSelected
                      ? prev.levels.filter(l => l !== level)
                      : [...prev.levels, level]
                  }))
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-inner transition transform duration-150 ease-in-out
                  ${isSelected
                    ? 'text-white bg-gradient-to-br from-yellow-300 via-rose-400 to-red-600 shadow-lg ring-2 ring-white/40 dark:ring-white/10 scale-105'
                    : 'text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 border border-gray-300 dark:border-gray-600 hover:scale-105 hover:shadow-md'}
                  `}
              >
                {level}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Search..."
          className="w-full px-3 py-2 bg-white dark:bg-dark-700 border rounded-lg text-gray-700 dark:text-gray-200"
        />

        {/* Generate Button */}
        <button
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-indigo-600 hover:from-fuchsia-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading
            ? 'Loading…'
            : filters.tags.length || filters.ageGroups.length || filters.levels.length || filters.search
              ? 'Generate Lesson'
              : 'Generate Random Lesson'}
        </button>
      </aside>




      <div className="lesson-content">
        {lesson && (
          <div className="lesson-details">
            {/* -- Title & Objective -- */}
            <div className="lesson-star-block">
              <h1 className="lesson-title showman">{lesson.title}</h1>
            </div>
            <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-sm mb-6 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Lesson Objective
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {lesson.objective}
              </p>
            </div>

            {/* -- At a Glance -- */}
            <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-sm mb-6 p-6">
              <h2
                className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer select-none flex justify-between"
                onClick={() => setShowGlance(!showGlance)}
              >
                At a Glance <span>{showGlance ? '▲' : '▼'}</span>
              </h2>
              {showGlance && (
                <ul className="mt-4 space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                  {lesson.at_a_glance.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* -- Warm Ups -- */}
            {warmUps.length > 0 && (
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-sm mb-6 p-6">
                <h2
                  className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer select-none flex justify-between"
                  onClick={() => setShowWarmUps(!showWarmUps)}
                >
                  Warm Ups — {totalWarmUpTime} min <span>{showWarmUps ? '▲' : '▼'}</span>
                </h2>
                {showWarmUps && (
                  <ul className="mt-4 space-y-4 text-gray-700 dark:text-gray-300">
                    {sortByPosition(warmUps).map((wp, i) => (
                      <li key={i}>
                        <strong>Part {i + 1}:</strong> {wp.title}
                        {wp.body && <p className="mt-1 italic text-gray-600 dark:text-gray-400">{wp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {/* PDF buttons */}
                <div className="mt-4 space-y-2">
                  {sortByPosition(warmUps).flatMap((wp, i) =>
                    (wp.file_infos || []).map((file, j) => (
                      <a
                        key={`warmup-pdf-${i}-${j}`}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        📄 {file.filename}
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* -- Bridge Activities -- */}
            {bridgeParts.length > 0 && (
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-sm mb-6 p-6">
                <h2
                  className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer select-none flex justify-between"
                  onClick={() => setShowBridge(!showBridge)}
                >
                  Bridge Activities — {totalBridgeTime} min <span>{showBridge ? '▲' : '▼'}</span>
                </h2>
                {showBridge && (
                  <ul className="mt-4 space-y-4 text-gray-700 dark:text-gray-300">
                    {sortByPosition(bridgeParts).map((bp, i) => (
                      <li key={i}>
                        <strong>Part {i + 1}:</strong> {bp.title}
                        {bp.body && <p className="mt-1 italic text-gray-600 dark:text-gray-400">{bp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 space-y-2">
                  {sortByPosition(bridgeParts).flatMap((bp, i) =>
                    (bp.file_infos || []).map((file, j) => (
                      <a
                        key={`bridge-pdf-${i}-${j}`}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        📄 {file.filename}
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* -- Main Activities -- */}
            {mainActivities.length > 0 && (
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-sm mb-6 p-6">
                <h2
                  className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer select-none flex justify-between"
                  onClick={() => setShowMain(!showMain)}
                >
                  Main Activities — {totalMainTime} min <span>{showMain ? '▲' : '▼'}</span>
                </h2>
                {showMain && (
                  <ul className="mt-4 space-y-4 text-gray-700 dark:text-gray-300">
                    {sortByPosition(mainActivities).map((mp, i) => (
                      <li key={i}>
                        <strong>Part {i + 1}:</strong> {mp.title}
                        {mp.body && <p className="mt-1 italic text-gray-600 dark:text-gray-400">{mp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 space-y-2">
                  {sortByPosition(mainActivities).flatMap((mp, i) =>
                    (mp.file_infos || []).map((file, j) => (
                      <a
                        key={`main-pdf-${i}-${j}`}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        📄 {file.filename}
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* -- End of Lesson -- */}
            {endActivities.length > 0 && (
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-sm mb-6 p-6">
                <h2
                  className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer select-none flex justify-between"
                  onClick={() => setShowEnd(!showEnd)}
                >
                  End of Lesson — {totalEndTime} min <span>{showEnd ? '▲' : '▼'}</span>
                </h2>
                {showEnd && (
                  <ul className="mt-4 space-y-4 text-gray-700 dark:text-gray-300">
                    {sortByPosition(endActivities).map((ep, i) => (
                      <li key={i}>
                        <strong>Part {i + 1}:</strong> {ep.title}
                        {ep.body && <p className="mt-1 italic text-gray-600 dark:text-gray-400">{ep.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 space-y-2">
                  {sortByPosition(endActivities).flatMap((ep, i) =>
                    (ep.file_infos || []).map((file, j) => (
                      <a
                        key={`end-pdf-${i}-${j}`}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        📄 {file.filename}
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* -- Scripts -- */}
            {scripts.length > 0 && (
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-sm mb-6 p-6">
                <h2
                  className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer select-none flex justify-between"
                  onClick={() => setShowScripts(!showScripts)}
                >
                  Scripts <span>{showScripts ? '▲' : '▼'}</span>
                </h2>
                {showScripts && (
                  <ul className="mt-4 space-y-4 text-gray-700 dark:text-gray-300">
                    {sortByPosition(scripts).map((sp, i) => (
                      <li key={i}>
                        <strong>Part {i + 1}:</strong> {sp.title}
                        {sp.body && <p className="mt-1 italic text-gray-600 dark:text-gray-400">{sp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 space-y-2">
                  {sortByPosition(scripts).flatMap((sp, i) =>
                    (sp.file_infos || []).map((file, j) => (
                      <a
                        key={`script-pdf-${i}-${j}`}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        📄 {file.filename}
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}