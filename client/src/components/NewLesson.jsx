import React from 'react'
import './NewLesson.css'

export default function NewLesson() {
  return (
    <div className="lesson-page">
      <aside className="lesson-sidebar">Sidebar</aside>
      <div className="new-lesson-page">
        <div className="new-lesson-header">
          <button
            className="new-lesson-add"
            onClick={() => {
              /* no-op for now */
            }}
          >
            +
          </button>
          <h1 className="new-lesson-title">Create a New Lesson</h1>
        </div>
        {/* later: form fields, stepper, etc */}
      </div>
    </div>
  )
}