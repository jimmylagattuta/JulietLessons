// src/components/NewLesson.jsx

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
  const [sectionType, setSectionType] = useState('')
  const [lessonParts, setLessonParts] = useState([])
  const [pdfsBySection, setPdfsBySection] = useState(() =>
    Object.keys(SECTION_LABELS).reduce((acc, key) => {
      acc[key] = [{ file: null }]
      return acc
    }, {})
  )
  const [saving, setSaving]           = useState(false)

  // show form
  const handleHeaderClick = () => setShowForm(true)

  // at-a-glance dynamic
  const handleAtAGlanceChange = (val, idx) => {
    const arr = [...atAGlance]
    arr[idx] = val
    if (idx === arr.length - 1 && val.trim() !== '') arr.push('')
    setAtAGlance(arr)
  }

  // add part
  const handleAddPart = sectionKey => {
    if (!sectionKey) return
    setLessonParts(ps => [
      ...ps,
      { sectionType: sectionKey, title: '', body: '', time: '' }
    ])
    setSectionType('')
  }

  // change part field
  const handlePartChange = (idx, field, val) => {
    setLessonParts(ps => {
      const copy = [...ps]
      copy[idx] = { ...copy[idx], [field]: val }
      return copy
    })
  }

  // remove part
  const handleRemovePart = idxToRemove => {
    setLessonParts(ps => ps.filter((_, i) => i !== idxToRemove))
  }

  // when a PDF is picked, update and if last slot, append a new empty slot
  const handlePdfFileChange = (sectionKey, idxSlot, files) => {
    setPdfsBySection(prev => {
      const copy = { ...prev }
      const slots = [...copy[sectionKey]]
      slots[idxSlot].file = files[0] || null

      if (idxSlot === slots.length - 1 && files[0]) {
        slots.push({ file: null })
      }
      copy[sectionKey] = slots
      return copy
    })
  }

  // remove a PDF slot (but always keep at least one)
  const handleRemovePdf = (sectionKey, idxSlot) => {
    setPdfsBySection(prev => {
      const slots = prev[sectionKey].filter((_, i) => i !== idxSlot)
      return {
        ...prev,
        [sectionKey]: slots.length ? slots : [{ file: null }]
      }
    })
  }

  // group parts by section
  const partsBySection = useMemo(() => {
    return lessonParts.reduce((acc, part, idx) => {
      if (!acc[part.sectionType]) acc[part.sectionType] = []
      acc[part.sectionType].push({ ...part, idx })
      return acc
    }, {})
  }, [lessonParts])

  // save all via FormData
  const handleSave = async mode => {
    const glance = atAGlance.filter(x => x.trim() !== '')
    const formData = new FormData()

    formData.append('lesson[title]', title)
    formData.append('lesson[objective]', objective)
    glance.forEach(g => formData.append('lesson[at_a_glance][]', g))

    // STEP 1: figure out the first part index for each section
    const firstIndexBySection = {}
    lessonParts.forEach((p, idx) => {
      if (firstIndexBySection[p.sectionType] == null) {
        firstIndexBySection[p.sectionType] = idx
      }
    })

    // STEP 2: build nested params, but only attach PDFs on the first index
    lessonParts.forEach((p, i) => {
      const base = `lesson[lesson_parts_attributes][${i}]`
      formData.append(`${base}[section_type]`, p.sectionType)
      formData.append(`${base}[title]`, p.title)
      formData.append(`${base}[body]`, p.body)
      formData.append(`${base}[time]`, p.time)
      formData.append(`${base}[position]`, i + 1)

      // only for the first part of this section:
      if (firstIndexBySection[p.sectionType] === i) {
        (pdfsBySection[p.sectionType] || []).forEach(slot => {
          if (slot.file) {
            formData.append(`${base}[files][]`, slot.file)
          }
        })
      }
    })

    setSaving(true)
    try {
      const resp = await fetch('/api/lessons', {
        method: 'POST',
        body:   formData
      })
      if (!resp.ok) throw new Error(`Status ${resp.status}`)
      const data = await resp.json()
      console.log('Saved lesson:', data)

      if (mode === 'again') {
        // reset everything back to demo or blank defaults, keep form open
        setTitle(DEMO ? 'Demo Lesson Title' : '')
        setObjective(DEMO ? 'This is a demo objective' : '')
        setAtAGlance(
          DEMO
            ? ['There will be a warm up', 'There will be a main activity']
            : ['']
        )
        setLessonParts([])
        setPdfsBySection(
          Object.keys(SECTION_LABELS).reduce((acc, key) => {
            acc[key] = [{ file: null }]
            return acc
          }, {})
        )
      }
    } catch (err) {
      console.error(err)
      alert('Failed to save. See console.')
    } finally {
      setSaving(false)
    }
  }

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

                <h3 className="lesson-part-heading">
                  {SECTION_LABELS[sectionKey]}
                </h3>

                {parts.map(p => (
                  <div className="lesson-part-row" key={p.idx}>
                    <div className="lesson-part-label">
                      <label>Title</label>
                      <input
                        type="text"
                        value={p.title}
                        onChange={e => handlePartChange(p.idx, 'title', e.target.value)}
                      />
                    </div>

                    <div className="lesson-part-label">
                      <label>Body</label>
                      <textarea
                        rows={2}
                        value={p.body}
                        onChange={e => handlePartChange(p.idx, 'body', e.target.value)}
                      />
                    </div>

                    {sectionKey !== 'script' && (
                      <div className="lesson-part-label">
                        <label>Time (min)</label>
                        <input
                          type="number"
                          min="0"
                          value={p.time}
                          onChange={e => handlePartChange(p.idx, 'time', e.target.value)}
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      className="lesson-part-remove"
                      onClick={() => handleRemovePart(p.idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {/* PDF uploader slots */}
                <div className="lesson-part-files">
                  <label>Attachments (PDF)</label>
                  {pdfsBySection[sectionKey].map((slot, i) => (
                    <div className="pdf-slot" key={i}>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={e => handlePdfFileChange(sectionKey, i, e.target.files)}
                      />
                      {slot.file && (
                        <div className="pdf-title">
                          {slot.file.name}
                          <button
                            type="button"
                            className="pdf-remove"
                            onClick={() => handleRemovePdf(sectionKey, i)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Inline “Add Part” */}
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
