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
            <div className="lesson-block alternate">
              <h2 className="section-heading">Lesson Objective</h2>
              <p>{lesson.objective}</p>
            </div>
            {/* -- At a Glance -- */}
            <div className="lesson-block alternate">
              <h2
                className="section-heading glance-toggle"
                onClick={() => setShowGlance(!showGlance)}
              >
                At a Glance {showGlance ? '▲' : '▼'}
              </h2>
              {showGlance && (
                <ul className="lesson-parts-list">
                  {lesson.at_a_glance.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* -- Warm Ups -- */}
            {warmUps.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowWarmUps(!showWarmUps)}
                >
                  Warm Ups — {totalWarmUpTime} min {showWarmUps ? '▲' : '▼'}
                </h2>
                {showWarmUps && (
                  <ul className="lesson-parts-list">
                    {sortByPosition(warmUps).map((wp, i) => (
                      <li key={i}>
                        <strong>Part {i + 1}:</strong> {wp.title}
                        {wp.body && <p className="part-body">{wp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {sortByPosition(warmUps).map((wp, i) =>
                  wp.file_infos?.map((file, j) => (
                    <div className="pdf-button-wrapper" key={`warmup-pdf-${i}-${j}`}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        📄 {file.filename}
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* -- Bridge Activities -- */}
            {bridgeParts.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowBridge(!showBridge)}
                >
                  Bridge Activities — {totalBridgeTime} min {showBridge ? '▲' : '▼'}
                </h2>
                {showBridge && (
                  <ul className="lesson-parts-list">
                    {sortByPosition(bridgeParts).map((bp, i) => (
                      <li key={i}>
                        <strong>Part {i + 1}:</strong> {bp.title}
                        {bp.body && <p className="part-body">{bp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {sortByPosition(bridgeParts).map((bp, i) =>
                  bp.file_infos?.map((file, j) => (
                    <div className="pdf-button-wrapper" key={`bridge-pdf-${i}-${j}`}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        📄 {file.filename}
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* -- Main Activities -- */}
            {mainActivities.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowMain(!showMain)}
                >
                  Main Activities — {totalMainTime} min {showMain ? '▲' : '▼'}
                </h2>
                {showMain && (
                  <ul className="lesson-parts-list">
                    {sortByPosition(mainActivities).map((mp, i) => (
                      <li key={i}>
                        <strong>Part {i + 1}:</strong> {mp.title}
                        {mp.body && <p className="part-body">{mp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {sortByPosition(mainActivities).map((mp, i) =>
                  mp.file_infos?.map((file, j) => (
                    <div className="pdf-button-wrapper" key={`main-pdf-${i}-${j}`}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        📄 {file.filename}
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* -- End of Lesson -- */}
            {endActivities.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowEnd(!showEnd)}
                >
                  End of Lesson — {totalEndTime} min {showEnd ? '▲' : '▼'}
                </h2>
                {showEnd && (
                  <ul className="lesson-parts-list">
                    {sortByPosition(endActivities).map((ep, i) => (
                      <li key={i}>
                        <strong>Part {i + 1}:</strong> {ep.title}
                        {ep.body && <p className="part-body">{ep.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {sortByPosition(endActivities).map((ep, i) =>
                  ep.file_infos?.map((file, j) => (
                    <div className="pdf-button-wrapper" key={`end-pdf-${i}-${j}`}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        📄 {file.filename}
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* -- Scripts -- */}
            {scripts.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowScripts(!showScripts)}
                >
                  Scripts {showScripts ? '▲' : '▼'}
                </h2>
                {showScripts && (
                  <ul className="lesson-parts-list">
                    {sortByPosition(scripts).map((sp, i) => (
                      <li key={i}>
                        <strong>Part {i + 1}:</strong> {sp.title}
                        {sp.body && <p className="part-body">{sp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {sortByPosition(scripts).map((sp, i) =>
                  sp.file_infos?.map((file, j) => (
                    <div className="pdf-button-wrapper" key={`script-pdf-${i}-${j}`}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        📄 {file.filename}
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="generate-box">
            <h2 className="generate-title">Instant Lesson Generator</h2>
            <button
              className="generate-button"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Generating…' : 'Generate Random Lesson'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}