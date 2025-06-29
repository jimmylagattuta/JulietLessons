import React from 'react';
import './NewLesson.css';

export default function NewLesson() {
  return (
    <div className="lesson-page">
        <aside className="lesson-sidebar">Sidebar</aside>
        <div className="new-lesson-page">
            <h1 className="new-lesson-title">Create a New Lesson</h1>
            {/* later: form fields, stepper, etc */}
        </div>
    </div>
  );
}