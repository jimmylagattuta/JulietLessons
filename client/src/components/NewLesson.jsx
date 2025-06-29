import React from 'react'
import './NewLesson.css'

export default function NewLesson() {
  const handleClickHeader = () => {
    // no-op for now
  }

  return (
    <div className="lesson-page">
      <aside className="lesson-sidebar">Sidebar</aside>
      <div className="new-lesson-page">
        <div
          className="new-lesson-header"
          onClick={handleClickHeader}
          role="button"
          tabIndex={0}
          onKeyPress={e => { if (e.key === 'Enter') handleClickHeader() }}
        >
          <button className="new-lesson-add" type="button">+</button>
          <h1 className="new-lesson-title">Create a New Lesson</h1>
        </div>
        {/* later: form fields, stepper, etc */}
      </div>
    </div>
  )
}
