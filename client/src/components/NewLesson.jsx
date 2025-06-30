import React, { useState } from 'react'
import './NewLesson.css'

const SECTION_LABELS = {
  warm_up:          'Warm Ups',
  bridge_activity:  'Bridge Activity',
  main_activity:    'Main Activity',
  end_of_lesson:    'End Of Lesson',
  script:           'Script',
}

export default function NewLesson() {
  const [showForm, setShowForm]         = useState(false)
  const [title, setTitle]               = useState('')
  const [objective, setObjective]       = useState('')
  const [atAGlance, setAtAGlance]       = useState([''])
  const [sectionType, setSectionType]   = useState('')    // controlled for the <select>
  const [lessonParts, setLessonParts]   = useState([])    // array of picked parts
  const [saving, setSaving]             = useState(false)

  const handleHeaderClick = () => setShowForm(true)

  const handleAtAGlanceChange = (value, idx) => {
    const items = [...atAGlance]
    items[idx] = value
    if (idx === items.length - 1 && value.trim() !== '') {
      items.push('')
    }
    setAtAGlance(items)
  }

  const handlePartsChange = val => {
    if (!val) return
    setLessonParts(parts => [...parts, val])
    setSectionType('')  // reset dropdown
  }

  const handleSave = async mode => {
    const cleanedGlance = atAGlance.filter(i => i.trim() !== '')
    const payload = {
      lesson: {
        title,
        objective,
        at_a_glance: cleanedGlance,
        // you may want to send lesson_parts separately later
      }
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
        setTitle('')
        setObjective('')
        setAtAGlance([''])
        setLessonParts([])
        setShowForm(false)
      }
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save. See console.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="lesson-page">
      <aside className="lesson-sidebar">Sidebar</aside>
      <div className="new-lesson-page">
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

        {showForm && (
          <div className="new-lesson-form">
            {/* Title */}
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

            {/* At a Glance */}
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

            {/* Lesson Parts – show each picked part as its own input */}
            <div className="form-group">
              <label>Lesson Parts</label>
              {lessonParts.map((pt, i) => (
                <input
                  key={i}
                  className="at-glance-input"
                  type="text"
                  readOnly
                  value={SECTION_LABELS[pt]}
                />
              ))}

              {/* the dropdown */}
              <div className="select-wrapper">
                <select
                  value={sectionType}
                  onChange={e => {
                    handlePartsChange(e.target.value)
                  }}
                >
                  <option value="" disabled>
                    Select part…
                  </option>
                  <option value="warm_up">Warm Ups</option>
                  <option value="bridge_activity">Bridge Activity</option>
                  <option value="main_activity">Main Activity</option>
                  <option value="end_of_lesson">End Of Lesson</option>
                  <option value="script">Script</option>
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
