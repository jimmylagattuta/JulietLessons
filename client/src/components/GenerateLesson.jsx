// src/components/GenerateLesson.jsx

import React, { useState, useEffect } from 'react'
import './GenerateLesson.css'

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
    // if we were viewing a specific one, clear that first
    onClearView && onClearView()
    setLoading(true)
    try {
      const res = await fetch('/api/lessons/random')
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()
      setLesson(data)
    } catch (err) {
      console.error('Error fetching random lesson:', err)
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
      <aside className="lesson-sidebar">
        <button
          className="sidebar-generate-btn"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading
            ? 'Loading…'
            : lesson
              ? 'Generate Again'
              : 'Generate Random Lesson'
          }
        </button>
      </aside>

      <div className="lesson-content">
        {lesson ? (
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
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-sm w-full max-w-md p-8 space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
                Juliet’s Generator
              </h2>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating…' : 'Generate Random Lesson'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}