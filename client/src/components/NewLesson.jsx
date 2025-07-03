// src/components/NewLesson.jsx

import React, { useState, useMemo } from 'react'
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

export default function NewLesson() {
  const [showForm, setShowForm] = useState(true)
  const [sectionType, setSectionType] = useState('')
  const [lessonParts, setLessonParts] = useState([])
  const [pdfsBySection, setPdfsBySection] = useState(() =>
    Object.keys(SECTION_LABELS).reduce((acc, key) => {
      acc[key] = [{ file: null }]
      return acc
    }, {})
  )
  const [saving, setSaving] = useState(false)

  const handleAddPart = sectionKey => {
    if (!sectionKey) return
    setLessonParts(ps => [
      ...ps,
      {
        sectionType: sectionKey,
        title: '',
        body: '',
        time: '',
        age_group: '',
        level: ''
      }
    ])
    setSectionType('')
  }

  const handlePartChange = (idx, field, val) => {
    setLessonParts(ps => {
      const copy = [...ps]
      copy[idx] = { ...copy[idx], [field]: val }
      return copy
    })
  }

  const handleRemovePart = idxToRemove => {
    setLessonParts(ps => ps.filter((_, i) => i !== idxToRemove))
  }

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

  const handleRemovePdf = (sectionKey, idxSlot) => {
    setPdfsBySection(prev => {
      const slots = prev[sectionKey].filter((_, i) => i !== idxSlot)
      return {
        ...prev,
        [sectionKey]: slots.length ? slots : [{ file: null }]
      }
    })
  }

  const partsBySection = useMemo(() => {
    return lessonParts.reduce((acc, part, idx) => {
      if (!acc[part.sectionType]) acc[part.sectionType] = []
      acc[part.sectionType].push({ ...part, idx })
      return acc
    }, {})
  }, [lessonParts])

  const handleSave = async () => {
    const filteredParts = lessonParts.filter(
      part => part.title.trim() && part.body.trim()
    )

    if (filteredParts.length === 0) {
      alert('Add at least one lesson part with a title and body.')
      return
    }

    setSaving(true)

    try {
      for (let i = 0; i < filteredParts.length; i++) {
        const part = filteredParts[i]
        const formData = new FormData()

        formData.append('lesson_part[section_type]', part.sectionType)
        formData.append('lesson_part[title]', part.title)
        formData.append('lesson_part[body]', part.body)
        formData.append('lesson_part[time]', part.time || '')
        formData.append('lesson_part[position]', i + 1)
        formData.append('lesson_part[age_group]', part.age_group)
        formData.append('lesson_part[level]', part.level)

        const pdfs = pdfsBySection[part.sectionType] || []
        if (i === lessonParts.findIndex(p => p.sectionType === part.sectionType)) {
          pdfs.forEach(slot => {
            if (slot.file) {
              formData.append('lesson_part[files][]', slot.file)
            }
          })
        }

        const resp = await fetch('/api/lesson_parts', {
          method: 'POST',
          body: formData
        })

        if (!resp.ok) {
          throw new Error(`Failed to save part ${i + 1}. Status ${resp.status}`)
        }

        const json = await resp.json()
        console.log('Created lesson part:', json)
      }

      alert('All lesson parts created successfully.')

      // Reset form
      setLessonParts([])
      setPdfsBySection(
        Object.keys(SECTION_LABELS).reduce((acc, key) => {
          acc[key] = [{ file: null }]
          return acc
        }, {})
      )
    } catch (err) {
      console.error(err)
      alert('Failed to save one or more parts. See console.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="lesson-page">
      <div className="new-lesson-page">
        <h1 className="new-lesson-title">Add Lesson Parts (Admin Mode)</h1>

        {Object.entries(partsBySection).map(([sectionKey, parts]) => (
          <div className="lesson-part-group" key={sectionKey}>
            <h3 className="lesson-part-heading">{SECTION_LABELS[sectionKey]}</h3>

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

                <div className="lesson-part-label">
                  <label>Age Group</label>
                  <select
                    value={p.age_group || ''}
                    onChange={e => handlePartChange(p.idx, 'age_group', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {AGE_GROUPS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="lesson-part-label">
                  <label>Level</label>
                  <select
                    value={p.level || ''}
                    onChange={e => handlePartChange(p.idx, 'level', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
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

            {/* PDF uploader */}
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

        {/* Dropdown to select a section and add part */}
        <div className="form-group">
          <label>Add Lesson Part</label>
          <div className="select-wrapper">
            <select
              value={sectionType}
              onChange={e => handleAddPart(e.target.value)}
            >
              <option value="" disabled>Select part…</option>
              {Object.entries(SECTION_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Save all */}
        <div className="form-actions">
          <button
            className="btn-save-view"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save All Lesson Parts'}
          </button>
        </div>
      </div>
    </div>
  )
}
