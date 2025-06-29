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
  const bridgeParts = lesson?.lesson_parts?.filter(lp => lp.section_type === 'bridge_activity') || [];
  const totalWarmUpTime = warmUps.reduce((sum, lp) => sum + (lp.time || 0), 0);
  const totalBridgeTime = bridgeParts.reduce((sum, lp) => sum + (lp.time || 0), 0);

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
            <div className="lesson-block">
              <h1 className="lesson-title showman">{lesson.title}</h1>
            </div>

            <div className="lesson-block alternate">
              <h2 className="section-heading">Lesson Objective</h2>
              <p>{lesson.objective}</p>
            </div>

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

            {warmUps.length > 0 && (
              <div className="lesson-block">
                <h2
                  className="section-heading glance-toggle"
                  onClick={() => setShowWarmUps(!showWarmUps)}
                >
                  Warm Ups — {totalWarmUpTime} min {showWarmUps ? '▲' : '▼'}
                </h2>

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

                {warmUps.map((wp, i) =>
                  wp.file_url ? (
                    <div className="pdf-button-wrapper" key={`pdf-${i}`}>
                      <a
                        href={wp.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        <span className="pdf-icon">📄</span>
                        <span className="pdf-title">{wp.title}</span>
                        View PDF
                      </a>
                    </div>
                  ) : null
                )}
              </div>
            )}

           {bridgeParts.length > 0 && (
              <div className="lesson-block">
                <h2 className="section-heading glance-toggle" onClick={() => setShowBridge(!showBridge)}>
                  Bridge Activities (Pre-Main Activity) — {totalBridgeTime} min {showBridge ? '▲' : '▼'}
                </h2>
                {showBridge && (
                  <ul className="lesson-parts-list">
                    {bridgeParts.map((bp, i) => (
                      <li key={i}>
                        <strong>Part {bp.position}:</strong> {bp.title}
                        {bp.body && <p className="part-body">{bp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {bridgeParts.map((bp, i) =>
                  bp.file_url ? (
                    <div className="pdf-button-wrapper" key={`bridge-pdf-${i}`}>
                      <a href={bp.file_url} target="_blank" rel="noopener noreferrer" className="pdf-button">
                        <span className="pdf-icon">📄</span>
                        <span className="pdf-title">{bp.title}</span>
                        View PDF
                      </a>
                    </div>
                  ) : null
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