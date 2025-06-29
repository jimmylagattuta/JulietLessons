// GenerateLesson.js
import React, { useState } from 'react';
import './GenerateLesson.css';

export default function GenerateLesson() {
  const [lesson, setLesson] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showGlance, setShowGlance] = useState(false);
  const [showWarmUps, setShowWarmUps] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    fetch('/api/lessons/random')
      .then(r => r.json())
      .then(data => {
        setLesson(data);
        setGenerating(false);
      })
      .catch(err => {
        console.error('Error fetching lesson:', err);
        setGenerating(false);
      });
  };

  const warmUps = lesson?.lesson_parts?.filter(lp => lp.section_type === 'warm_up') || [];
  const totalWarmUpTime = warmUps.reduce((sum, lp) => sum + (lp.time || 0), 0);

  return (
    <div className="lesson-page">
      <aside className="lesson-sidebar">Sidebar</aside>
      <div
        className="lesson-content"
        style={{
          backgroundImage:
            'url(https://res.cloudinary.com/djtsuktwb/image/upload/v1751151866/iStock-487619256_gfou89.jpg)'
        }}
      >
        {lesson ? (
          <div className="lesson-details">
            {/* Title Block */}
            <div className="lesson-block">
              <h1 className="lesson-title showman">{lesson.title}</h1>
            </div>

            {/* Objective Block */}
            <div className="lesson-block alternate">
              <h2 className="section-heading">Lesson Objective</h2>
              <p>{lesson.objective}</p>
            </div>

            {/* At a Glance Block */}
            <div className="lesson-block alternate">
              <h2
                className="section-heading glance-toggle"
                onClick={() => setShowGlance(!showGlance)}
              >
                At a Glance {showGlance ? '▲' : '▼'}
              </h2>
              {showGlance && (
                <ul className="lesson-parts-list">
                  {lesson.at_a_glance.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Warm Ups Block */}
            {warmUps.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowWarmUps(!showWarmUps)}
                >
                  Warm Ups — {totalWarmUpTime} min {showWarmUps ? '▲' : '▼'}
                </h2>

                {/* Render PDF buttons outside of the dropdown */}
                {warmUps.map((wp, i) =>
                  wp.file_url ? (
                    <div className="pdf-button-wrapper" key={`pdf-${i}`}>
                      <span className="pdf-title">{wp.title}</span>
                      <a
                        href={wp.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        <span className="pdf-icon">📄</span>
                        View PDF
                      </a>
                    </div>
                  ) : null
                )}

                {showWarmUps && (
                  <ul className="lesson-parts-list">
                    {warmUps.map((wp, i) => (
                      <li key={i}>
                        <strong>Part {wp.position}:</strong> {wp.title}
                        {wp.body && <p className="part-body">{wp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="generate-box">
            <h2 className="generate-title">Instant Lesson Generator</h2>
            <button
              className="generate-button"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Random Lesson'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
