// src/components/NewLessonPart.jsx

import React, { useState } from 'react'
import './NewLesson.css'

const SECTION_LABELS = {
  warm_up: 'Warm Ups',
  bridge_activity: 'Bridge Activities',
  main_activity: 'Main Activities',
  end_of_lesson: 'End Of Lesson',
  script: 'Scripts',
}

const AGE_GROUPS = ['young', 'middle', 'older', 'all']
const LEVELS = ['Toe Tipper', 'Green Horn', 'Semi-Pro', 'Seasoned Veteran']

export default function NewLessonPart() {
  // form is closed initially
  const [showForm, setShowForm] = useState(false)
  const [sectionType, setSectionType] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [time, setTime] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [level, setLevel] = useState('')
  const [pdfFiles, setPdfFiles] = useState([{ file: null }])
  const [saving, setSaving] = useState(false)

  const handleHeaderClick = () => setShowForm(true)

  const resetForm = () => {
    setSectionType('')
    setTitle('')
    setBody('')
    setTime('')
    setAgeGroup('')
    setLevel('')
    setPdfFiles([{ file: null }])
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  const handlePdfChange = (index, files) => {
    const copy = [...pdfFiles]
    copy[index].file = files[0] || null
    if (index === pdfFiles.length - 1 && files[0]) {
      copy.push({ file: null })
    }
    setPdfFiles(copy)
  }

  const handleRemovePdf = index => {
    const filtered = pdfFiles.filter((_, i) => i !== index)
    setPdfFiles(filtered.length ? filtered : [{ file: null }])
  }

  const handleSave = async () => {
    if (!sectionType || !title.trim() || !body.trim()) {
      alert('Please complete all required fields.')
      return
    }

    const formData = new FormData()
    formData.append('lesson_part[section_type]', sectionType)
    formData.append('lesson_part[title]', title)
    formData.append('lesson_part[body]', body)
    formData.append('lesson_part[time]', time)
    formData.append('lesson_part[age_group]', ageGroup)
    formData.append('lesson_part[level]', level)
    pdfFiles.forEach(slot => {
      if (slot.file) {
        formData.append('lesson_part[files][]', slot.file)
      }
    })

    setSaving(true)
    try {
      const resp = await fetch('/api/lesson_parts', {
        method: 'POST',
        body: formData,
      })
      if (!resp.ok) throw new Error(`Status ${resp.status}`)
      await resp.json()
      alert('Lesson part saved!')
      // after saving, clear and close
      resetForm()
      setShowForm(false)
    } catch (err) {
      console.error(err)
      alert('Save failed. See console.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="lesson-page">
      <aside className="lesson-sidebar">Sidebar</aside>
      <div className="new-lesson-page">
        {/* Header: green "+" when closed */}
        <div
          className="new-lesson-header"
          onClick={!showForm ? handleHeaderClick : undefined}
          role={!showForm ? 'button' : undefined}
          tabIndex={!showForm ? 0 : undefined}
          onKeyPress={e =>
            !showForm && e.key === 'Enter' && handleHeaderClick()
          }
        >
          {!showForm && <button className="new-lesson-add">+</button>}
          <h1 className="new-lesson-title">
            {showForm ? 'New Lesson Part' : 'Create a Lesson Part'}
          </h1>
        </div>

        {/* Form */}
        {showForm && (
          <div className="new-lesson-form">
            {/* Section selector: always visible */}
            <div className="form-group">
              <label>Section</label>
              <select
                value={sectionType}
                onChange={e => setSectionType(e.target.value)}
              >
                <option value="">Select Section…</option>
                {Object.entries(SECTION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rest of fields only after section chosen */}
            {sectionType && (
              <>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Body</label>
                  <textarea
                    rows={3}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Time (minutes)</label>
                  <input
                    type="number"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Age Group</label>
                  <select
                    value={ageGroup}
                    onChange={e => setAgeGroup(e.target.value)}
                  >
                    <option value="">Select Age Group…</option>
                    {AGE_GROUPS.map(g => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                  >
                    <option value="">Select Level…</option>
                    {LEVELS.map(l => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lesson-part-files">
                  <label>Attachments (PDF)</label>
                  {pdfFiles.map((slot, i) => (
                    <div className="pdf-slot" key={i}>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={e => handlePdfChange(i, e.target.files)}
                      />
                      {slot.file && (
                        <div className="pdf-title">
                          {slot.file.name}
                          <button
                            type="button"
                            className="pdf-remove"
                            onClick={() => handleRemovePdf(i)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Save & Cancel */}
                <div className="form-actions">
                  <button
                    className="btn-save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
