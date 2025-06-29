import React, { useState } from 'react'
import './NewLesson.css'

export default function NewLesson() {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  const [atAGlance, setAtAGlance] = useState([''])
  const [saving, setSaving] = useState(false)

  const handleHeaderClick = () => {
    setShowForm(true)
  }

  const handleAtAGlanceChange = (value, idx) => {
    const items = [...atAGlance]
    items[idx] = value
    if (idx === items.length - 1 && value.trim() !== '') {
      items.push('')
    }
    setAtAGlance(items)
  }

  const handleSave = async mode => {
    const cleaned = atAGlance.filter(item => item.trim() !== '')
    const payload = { lesson: { title, objective, at_a_glance: cleaned } }

    setSaving(true)
    try {
      const resp = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!resp.ok) throw new Error(`Status ${resp.status}`)
      const data = await resp.json()
      console.log('Saved lesson:', data)

      if (mode === 'again') {
        // reset form for another
        setTitle('')
        setObjective('')
        setAtAGlance([''])
        setShowForm(false)
      }
      // if mode === 'view', you could route to a details page
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save. See console for details.')
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
          {!showForm && (
            <button className="new-lesson-add" type="button">+</button>
          )}
          <h1 className="new-lesson-title">
            {showForm ? 'New Lesson' : 'Create a New Lesson'}
          </h1>
        </div>

        {showForm && (
          <div className="new-lesson-form">
            <div className="form-group">
              <label htmlFor="lesson-title">Title</label>
              <input
                id="lesson-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lesson-objective">Objective</label>
              <textarea
                id="lesson-objective"
                rows={3}
                value={objective}
                onChange={e => setObjective(e.target.value)}
              />
            </div>

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
