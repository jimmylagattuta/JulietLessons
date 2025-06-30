import React, { useState, useMemo } from 'react'
import './NewLesson.css'

/** 
 * Set DEMO = true while developing to auto-fill 
 * Title, Objective, and two At a Glance bullets.
 */
const DEMO = true

const SECTION_LABELS = {
  warm_up:         'Warm Ups',
  bridge_activity: 'Bridge Activities',
  main_activity:   'Main Activities',
  end_of_lesson:   'End Of Lesson',
  script:          'Scripts',
}

export default function NewLesson() {
  const [showForm, setShowForm]       = useState(DEMO)
  const [title, setTitle]             = useState(DEMO ? 'Demo Lesson Title'       : '')
  const [objective, setObjective]     = useState(DEMO ? 'This is a demo objective' : '')
  const [atAGlance, setAtAGlance]     = useState(
    DEMO
      ? ['There will be a warm up', 'There will be a main activity']
      : ['']
  )
  const [sectionType, setSectionType] = useState('')    // controlled dropdown
  const [lessonParts, setLessonParts] = useState([])    // added parts: {sectionType, title, body, time}
  const [saving, setSaving]           = useState(false)

  // show form on header click
  const handleHeaderClick = () => setShowForm(true)

  // dynamically grow at-a-glance bullets
  const handleAtAGlanceChange = (value, idx) => {
    const arr = [...atAGlance]
    arr[idx] = value
    if (idx === arr.length - 1 && value.trim() !== '') {
      arr.push('')
    }
    setAtAGlance(arr)
  }

  // add a new part of given sectionType
  const handleAddPart = val => {
    if (!val) return
    setLessonParts(parts => [
      ...parts,
      { sectionType: val, title: '', body: '', time: '' }
    ])
    setSectionType('')
  }

  // update a field on an existing part
  const handlePartChange = (idx, field, value) => {
    setLessonParts(parts => {
      const copy = [...parts]
      copy[idx] = { ...copy[idx], [field]: value }
      return copy
    })
  }

  // save handler (stub)
  const handleSave = async mode => {
    const cleanedGlance = atAGlance.filter(x => x.trim() !== '')
    const payload = {
      lesson: { title, objective, at_a_glance: cleanedGlance }
      // in real life you'd POST lessonParts too
    }

    setSaving(true)
    try {
      const resp = await fetch('/api/lessons', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      })
      if (!resp.ok) throw new Error(`Status ${resp.status}`)
      const data = await resp.json()
      console.log('Saved lesson:', data)

      if (mode === 'again') {
        setShowForm(false)
        setTitle('')
        setObjective('')
        setAtAGlance([''])
        setLessonParts([])
      }
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save; check console.')
    } finally {
      setSaving(false)
    }
  }

  // find index of the last warm_up in lessonParts
  const lastWarmUpIndex = useMemo(() => {
    let last = -1
    lessonParts.forEach((p, i) => {
      if (p.sectionType === 'warm_up') last = i
    })
    return last
  }, [lessonParts])

  return (
    <div className="lesson-page">
      <aside className="lesson-sidebar">Sidebar</aside>
      <div className="new-lesson-page">

        {/* header */}
        <div
          className="new-lesson-header"
          onClick={!showForm ? handleHeaderClick : undefined}
          role={showForm ? undefined : 'button'}
          tabIndex={showForm ? undefined : 0}
          onKeyPress={e => !showForm && e.key === 'Enter' && handleHeaderClick()}
        >
          {!showForm && <button className="new-lesson-add">+</button>}
          <h1 className="new-lesson-title">
            {showForm ? 'New Lesson' : 'Create a New Lesson'}
          </h1>
        </div>

        {/* form */}
        {showForm && (
          <div className="new-lesson-form">

            {/* Lesson Title */}
            <div className="form-group">
              <label htmlFor="lesson-title">Title</label>
              <input
                id="lesson-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Objective */}
            <div className="form-group">
              <label htmlFor="lesson-objective">Objective</label>
              <textarea
                id="lesson-objective"
                rows={3}
                value={objective}
                onChange={e => setObjective(e.target.value)}
              />
            </div>

            {/* At a Glance bullets */}
            <div className="form-group">
              <label>At a Glance</label>
              {atAGlance.map((item, idx) => (
                <input
                  key={idx}
                  className="at-glance-input"
                  type="text"
                  value={item}
                  placeholder="Enter a quick bullet…"
                  onChange={e => handleAtAGlanceChange(e.target.value, idx)}
                />
              ))}
            </div>

            {/* Dynamic Lesson Parts */}
            {lessonParts.map((part, idx) => (
              <div className="lesson-part-group" key={idx}>

                {/* Section Heading */}
                <h3 className="lesson-part-heading">
                  {SECTION_LABELS[part.sectionType]}
                </h3>

                {/* Title */}
                <div className="lesson-part-label">
                  <label>Title</label>
                  <input
                    type="text"
                    value={part.title}
                    onChange={e => handlePartChange(idx, 'title', e.target.value)}
                  />
                </div>

                {/* Body */}
                <div className="lesson-part-label">
                  <label>Body</label>
                  <textarea
                    rows={2}
                    value={part.body}
                    onChange={e => handlePartChange(idx, 'body', e.target.value)}
                  />
                </div>

                {/* Time */}
                <div className="lesson-part-label">
                  <label>Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={part.time}
                    onChange={e => handlePartChange(idx, 'time', e.target.value)}
                  />
                </div>

                {/* Inline “+ Add Warm Up” under the last warm_up */}
                {part.sectionType === 'warm_up' && idx === lastWarmUpIndex && (
                  <div className="lesson-part-add-inline">
                    <button
                      type="button"
                      onClick={() => handleAddPart('warm_up')}
                    >
                      + Add Warm Up
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Fallback dropdown to add any section */}
            <div className="form-group">
              <label>Add Lesson Part</label>
              <div className="select-wrapper">
                <select
                  value={sectionType}
                  onChange={e => handleAddPart(e.target.value)}
                >
                  <option value="" disabled>Select part…</option>
                  <option value="warm_up">Warm Ups</option>
                  <option value="bridge_activity">Bridge Activities</option>
                  <option value="main_activity">Main Activities</option>
                  <option value="end_of_lesson">End Of Lesson</option>
                  <option value="script">Scripts</option>
                </select>
              </div>
            </div>

            {/* Save buttons */}
            <div className="form-actions">
              <button
                className="btn-save-view"
                onClick={() => handleSave('view')}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save and View'}
              </button>
              <button
                className="btn-save-again"
                onClick={() => handleSave('again')}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save and Create Again'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
