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
  const [showGlance, setShowGlance]     = useState(false)
  const [showWarmUps, setShowWarmUps]   = useState(false)
  const [showBridge, setShowBridge]     = useState(false)
  const [showMain, setShowMain]         = useState(false)
  const [showEnd, setShowEnd]           = useState(false)
  const [showScripts, setShowScripts]   = useState(false)

  // If we're viewing a saved lesson by ID, fetch it once.
  useEffect(() => {
    if (!lessonId) return
    setLoading(true)
    fetch(`/api/lessons/${lessonId}`)
      .then(res => { if (!res.ok) throw new Error(`Status ${res.status}`); return res.json() })
      .then(setLesson)
      .catch(err => console.error('Error fetching lesson by ID:', err))
      .finally(() => setLoading(false))
  }, [lessonId])

  // Always fetch a new random lesson when you click
  const handleGenerate = async () => {
    onClearView && onClearView()
    setLoading(true)
    try {
      const res = await fetch('/api/lessons/random')
      if (!res.ok) throw new Error(`Status ${res.status}`)
      setLesson(await res.json())
    } catch (err) {
      console.error('Error fetching random lesson:', err)
    } finally {
      setLoading(false)
    }
  }

  // helpers
  const partsBy = section_type =>
    (lesson?.lesson_parts || []).filter(lp => lp.section_type === section_type)
  const warmUps      = partsBy('warm_up')
  const bridgeParts  = partsBy('bridge_activity')
  const mainActs     = partsBy('main_activity')
  const endActs      = partsBy('end_of_lesson')
  const scripts      = partsBy('script')

  const sumTime = arr => arr.reduce((sum, lp) => sum + (lp.time||0), 0)
  const sortByPosition = arr => arr.slice().sort((a,b)=>(a.position||0)-(b.position||0))

  return (
    <div className="lesson-page">
      {/* Sidebar (fixed width) */}
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

      {/* Main content: flex column, inner scroll */}
      <div className="lesson-content">
        {lesson ? (
          <div className="lesson-details">
            {/* Title & Objective */}
            <div className="lesson-star-block">
              <h1 className="lesson-title showman">{lesson.title}</h1>
            </div>
            <div className="lesson-block alternate">
              <h2 className="section-heading">Lesson Objective</h2>
              <p>{lesson.objective}</p>
            </div>

            {/* At a Glance */}
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

            {/* Warm Ups */}
            {warmUps.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowWarmUps(!showWarmUps)}
                >
                  Warm Ups — {sumTime(warmUps)} min {showWarmUps ? '▲' : '▼'}
                </h2>
                {showWarmUps && (
                  <ul className="lesson-parts-list">
                    {sortByPosition(warmUps).map((wp,i) => (
                      <li key={i}>
                        <strong>Part {i+1}:</strong> {wp.title}
                        {wp.body && <p className="part-body">{wp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {sortByPosition(warmUps).flatMap((wp,i) =>
                  (wp.file_infos||[]).map((file,j) => (
                    <div className="pdf-button-wrapper" key={`warmup-${i}-${j}`}>
                      <a
                        href={file.url}
                        target="_blank" rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        📄 {file.filename}
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Bridge Activities */}
            {bridgeParts.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowBridge(!showBridge)}
                >
                  Bridge Activities — {sumTime(bridgeParts)} min {showBridge ? '▲' : '▼'}
                </h2>
                {showBridge && (
                  <ul className="lesson-parts-list">
                    {sortByPosition(bridgeParts).map((bp,i) => (
                      <li key={i}>
                        <strong>Part {i+1}:</strong> {bp.title}
                        {bp.body && <p className="part-body">{bp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {sortByPosition(bridgeParts).flatMap((bp,i) =>
                  (bp.file_infos||[]).map((file,j) => (
                    <div className="pdf-button-wrapper" key={`bridge-${i}-${j}`}>
                      <a
                        href={file.url}
                        target="_blank" rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        📄 {file.filename}
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Main Activities */}
            {mainActs.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowMain(!showMain)}
                >
                  Main Activities — {sumTime(mainActs)} min {showMain ? '▲' : '▼'}
                </h2>
                {showMain && (
                  <ul className="lesson-parts-list">
                    {sortByPosition(mainActs).map((mp,i) => (
                      <li key={i}>
                        <strong>Part {i+1}:</strong> {mp.title}
                        {mp.body && <p className="part-body">{mp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {sortByPosition(mainActs).flatMap((mp,i) =>
                  (mp.file_infos||[]).map((file,j) => (
                    <div className="pdf-button-wrapper" key={`main-${i}-${j}`}>
                      <a
                        href={file.url}
                        target="_blank" rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        📄 {file.filename}
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* End of Lesson */}
            {endActs.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowEnd(!showEnd)}
                >
                  End of Lesson — {sumTime(endActs)} min {showEnd ? '▲' : '▼'}
                </h2>
                {showEnd && (
                  <ul className="lesson-parts-list">
                    {sortByPosition(endActs).map((ep,i) => (
                      <li key={i}>
                        <strong>Part {i+1}:</strong> {ep.title}
                        {ep.body && <p className="part-body">{ep.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {sortByPosition(endActs).flatMap((ep,i) =>
                  (ep.file_infos||[]).map((file,j) => (
                    <div className="pdf-button-wrapper" key={`end-${i}-${j}`}>
                      <a
                        href={file.url}
                        target="_blank" rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        📄 {file.filename}
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Scripts */}
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
                    {sortByPosition(scripts).map((sp,i) => (
                      <li key={i}>
                        <strong>Part {i+1}:</strong> {sp.title}
                        {sp.body && <p className="part-body">{sp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {sortByPosition(scripts).flatMap((sp,i) =>
                  (sp.file_infos||[]).map((file,j) => (
                    <div className="pdf-button-wrapper" key={`script-${i}-${j}`}>
                      <a
                        href={file.url}
                        target="_blank" rel="noopener noreferrer"
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
            <h2 className="generate-title">Juliet's Generator</h2>
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
