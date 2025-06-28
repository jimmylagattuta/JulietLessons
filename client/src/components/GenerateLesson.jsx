import React from 'react';
import './GenerateLesson.css';

export default function GenerateLesson({ onGenerate, lessonGenerationState, onSwitch }) {
  return (
    <main className="generate-lesson-container">
      <div className="generate-lesson-wrapper">
        <h2 className="generate-lesson-title">Instant Lesson Generator</h2>
        <p className="generate-lesson-description">
          Click below to auto-generate a complete lesson.
        </p>

        <button
          className="generate-button"
          onClick={onGenerate}
          disabled={lessonGenerationState === 'generating'}
        >
          Generate Random Lesson
        </button>

        {lessonGenerationState === 'generating' && (
          <p className="generating-text">Generating lesson...</p>
        )}

        {lessonGenerationState === 'complete' && (
          <div className="generate-complete-box">
            Lesson generated! Go to{' '}
            <span
              className="generate-complete-link"
              onClick={() => onSwitch('lessons')}
            >
              Lesson Planning
            </span>{' '}
            to view it.
          </div>
        )}
      </div>
    </main>
  );
}
