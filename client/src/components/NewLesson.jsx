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
  const [lessonParts, setLessonParts] = useState([])    // {sectionType, title, body, time}
  // store PDF slots per section key
  const [pdfsBySection, setPdfsBySection] = useState(() =>
    Object.keys(SECTION_LABELS).reduce((acc, key) => {
      acc[key] = [{ file: null }]   // start with one empty slot
      return acc
    }, {})
  )
  const [saving, setSaving]           = useState(false)

  // show the form
  const handleHeaderClick = () => setShowForm(true)

  // dynamic At-a-Glance bullets
  const handleAtAGlanceChange = (val, idx) => {
    const arr = [...atAGlance]
    arr[idx] = val
    if (idx === arr.length - 1 && val.trim() !== '') arr.push('')
    setAtAGlance(arr)
  }

  // add a new lesson part
  const handleAddPart = sectionKey => {
    if (!sectionKey) return
    setLessonParts(ps => [
      ...ps,
      { sectionType: sectionKey, title: '', body: '', time: '' }
    ])
    setSectionType('')
  }

  // update a field on a part
  const handlePartChange = (idx, field, val) => {
    setLessonParts(ps => {
      const copy = [...ps]
      copy[idx] = { ...copy[idx], [field]: val }
      return copy
    })
  }

  // remove a part row
  const handleRemovePart = idxToRemove => {
    setLessonParts(ps => ps.filter((_, i) => i !== idxToRemove))
  }

  // file-picker for a PDF slot in a section
  const handlePdfFileChange = (sectionKey, idx, files) => {
    setPdfsBySection(prev => {
      const copy = { ...prev }
      copy[sectionKey][idx].file = files[0]
      return copy
    })
  }

  // add another PDF slot under that section
  const handleAddPdf = sectionKey => {
    setPdfsBySection(prev => {
      const arr = prev[sectionKey] || []
      return {
        ...prev,
        [sectionKey]: [...arr, { file: null }]
      }
    })
  }

  // remove a PDF slot (never go below one)
  const handleRemovePdf = (sectionKey, idx) => {
    setPdfsBySection(prev => {
      const arr = prev[sectionKey].filter((_, i) => i !== idx)
      return {
        ...prev,
        [sectionKey]: arr.length ? arr : [{ file: null }]
      }
    })
  }

  // group parts by sectionType
  const partsBySection = useMemo(() => {
    return lessonParts.reduce((acc, part, idx) => {
      if (!acc[part.sectionType]) acc[part.sectionType] = []
      acc[part.sectionType].push({ ...part, idx })
      return acc
    }, {})
  }, [lessonParts])

  // on save, bundle everything into FormData
  const handleSave = async mode => {
    const glance = atAGlance.filter(x => x.trim() !== '')
    const formData = new FormData()
    formData.append('lesson[title]', title)
    formData.append('lesson[objective]', objective)
    glance.forEach(g => formData.append('lesson[at_a_glance][]', g))

    // append lesson parts
    lessonParts.forEach((p, i) => {
      const base = `lesson[lesson_parts_attributes][${i}]`
      formData.append(`${base}[section_type]`, p.sectionType)
      formData.append(`${base}[title]`, p.title)
      formData.append(`${base}[body]`, p.body)
      formData.append(`${base}[time]`, p.time)
      formData.append(`${base}[position]`, i + 1)

      // find that part's sectionKey, get all its PDFs
      const pdfSlots = pdfsBySection[p.sectionType] || []
      pdfSlots.forEach(slot => {
        if (slot.file) {
          formData.append(`${base}[files][]`, slot.file)
        }
      })
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
        setShowForm(false)
        setTitle(''); setObjective('')
        setAtAGlance([''])
        setLessonParts([])
        // reset PDF slots
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

                {/* Section Heading */}
                <h3 className="lesson-part-heading">
                  {SECTION_LABELS[sectionKey]}
                </h3>

                {/* Each part row */}
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
                    <div className="lesson-part-label">
                      <label>Time (min)</label>
                      <input
                        type="number"
                        min="0"
                        value={p.time}
                        onChange={e => handlePartChange(p.idx, 'time', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="lesson-part-remove"
                      onClick={() => handleRemovePart(p.idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {/* PDF uploader for this section */}
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
                  <button
                    type="button"
                    className="lesson-part-add-inline"
                    onClick={() => handleAddPdf(sectionKey)}
                  >
                    + Add PDF
                  </button>
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
