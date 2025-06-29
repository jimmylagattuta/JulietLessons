import React, { useState } from 'react'
import './NewLesson.css'

export default function NewLesson() {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  const [atAGlance, setAtAGlance] = useState([''])

  const handleHeaderClick = () => {
    setShowForm(true)
  }

  const handleAtAGlanceChange = (value, idx) => {
    const items = [...atAGlance]
    items[idx] = value
    // if user typed into the last box, append a new empty one
    if (idx === items.length - 1 && value.trim() !== '') {
      items.push('')
    }
    setAtAGlance(items)
  }

  const handleSave = mode => {
    const cleaned = atAGlance.filter(item => item.trim() !== '')
    const payload = {
      title,
      objective,
      at_a_glance: cleaned,
    }
    console.log('Would save lesson:', payload)
    if (mode === 'new') {
      // reset for next
      setTitle('')
      setObjective('')
      setAtAGlance([''])
      setShowForm(false)
    }
    // if mode === 'view' we might navigate to view page…
  }

  return (
    <div className="lesson-page">
      <aside className="lesson-sidebar">Sidebar</aside>
      <div className="new-lesson-page">
        <div
          className="new-lesson-header"
          onClick={handleHeaderClick}
          role="button"
          tabIndex={0}
          onKeyPress={e => e.key === 'Enter' && handleHeaderClick()}
        >
          <button className="new-lesson-add" type="button">+</button>
          <h1 className="new-lesson-title">Create a New Lesson</h1>
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
              >
                Save and View
              </button>
              <button
                className="btn-save-new"
                onClick={() => handleSave('new')}
              >
                Save and Create New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
