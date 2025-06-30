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
  const [sectionType, setSectionType] = useState('')    // for fallback dropdown
  const [lessonParts, setLessonParts] = useState([])    // array of {sectionType, title, body, time}
  const [saving, setSaving]           = useState(false)

  // reveal form
  const handleHeaderClick = () => setShowForm(true)

  // dynamic at-a-glance bullets
  const handleAtAGlanceChange = (val, idx) => {
    const arr = [...atAGlance]
    arr[idx] = val
    if (idx === arr.length - 1 && val.trim() !== '') arr.push('')
    setAtAGlance(arr)
  }

  // add new blank part
  const handleAddPart = sectionKey => {
    if (!sectionKey) return
    setLessonParts(ps => [
      ...ps,
      { sectionType: sectionKey, title: '', body: '', time: '' }
    ])
    setSectionType('')
  }

  // update field on part
  const handlePartChange = (idx, field, val) => {
    setLessonParts(ps => {
      const copy = [...ps]
      copy[idx] = { ...copy[idx], [field]: val }
      return copy
    })
  }

  // remove a part
  const handleRemovePart = idxToRemove => {
    setLessonParts(ps => ps.filter((_, i) => i !== idxToRemove))
  }

  // stubbed save
  const handleSave = async mode => {
    const glance = atAGlance.filter(x => x.trim() !== '')
    const payload = { lesson: { title, objective, at_a_glance: glance } }

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
      console.error(err)
      alert('Failed to save. See console.')
    } finally {
      setSaving(false)
    }
  }

  // group parts by sectionType
  const partsBySection = useMemo(() => {
    return lessonParts.reduce((acc, part, idx) => {
      if (!acc[part.sectionType]) acc[part.sectionType] = []
      acc[part.sectionType].push({ ...part, idx })
      return acc
    }, {})
  }, [lessonParts])

  return (
    <div className="lesson-page">
      <aside className="lesson-sidebar">Sidebar</aside>
      <div className="new-lesson-page">

        {/* Header */}
        <div
          className="new-lesson-header"
          onClick={!showForm ? handleHeaderClick : undefined}
          role={!showForm ? 'button' : undefined}
          tabIndex={!showForm ? 0 : undefined}
          onKeyPress={e => !showForm && e.key === 'Enter' && handleHeaderClick()}
        >
          {!showForm && <button className="new-lesson-add">+</button>}
          <h1 className="new-lesson-title">
            {showForm ? 'New Lesson' : 'Create a New Lesson'}
          </h1>
        </div>

        {/* Form */}
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
              {atAGlance.map((item, i) => (
                <input
                  key={i}
                  className="at-glance-input"
                  type="text"
                  value={item}
                  placeholder="Enter a quick bullet…"
                  onChange={e => handleAtAGlanceChange(e.target.value, i)}
                />
              ))}
            </div>

            {/* Sections */}
            {Object.entries(partsBySection).map(([sectionKey, parts]) => (
              <div className="lesson-part-group" key={sectionKey}>

                {/* Heading */}
                <h3 className="lesson-part-heading">
                  {SECTION_LABELS[sectionKey]}
                </h3>

                {/* Rows */}
                {parts.map((p, localIdx) => (
                  <div className="lesson-part-row" key={p.idx}>

                    <div className="lesson-part-label">
                      <label>
                        Title{parts.length > 1 ? ` Part ${localIdx + 1}` : ''}
                      </label>
                      <input
                        type="text"
                        value={p.title}
                        onChange={e => handlePartChange(p.idx, 'title', e.target.value)}
                      />
                    </div>

                    <div className="lesson-part-label">
                      <label>
                        Body{parts.length > 1 ? ` Part ${localIdx + 1}` : ''}
                      </label>
                      <textarea
                        rows={2}
                        value={p.body}
                        onChange={e => handlePartChange(p.idx, 'body', e.target.value)}
                      />
                    </div>

                    <div className="lesson-part-label">
                      <label>
                        Time (min){parts.length > 1 ? ` Part ${localIdx + 1}` : ''}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={p.time}
                        onChange={e => handlePartChange(p.idx, 'time', e.target.value)}
                      />
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      className="lesson-part-remove"
                      onClick={() => handleRemovePart(p.idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {/* Inline Add */}
                <div className="lesson-part-add-inline">
                  <button
                    type="button"
                    onClick={() => handleAddPart(sectionKey)}
                  >
                    + Add {SECTION_LABELS[sectionKey].replace(/s$/, '')}
                  </button>
                </div>
              </div>
            ))}

            {/* Fallback dropdown */}
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

            {/* Save */}
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
