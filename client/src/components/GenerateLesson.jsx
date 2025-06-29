import React, { useState } from 'react';
import './GenerateLesson.css';

export default function GenerateLesson() {
  const [lesson, setLesson] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showGlance, setShowGlance] = useState(false);
  const [showWarmUps, setShowWarmUps] = useState(false);
  const [showBridge, setShowBridge] = useState(false);
  const [showMain, setShowMain] = useState(false);

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
  const mainActivities = lesson?.lesson_parts?.filter(lp => lp.section_type === 'main_activity') || [];

  const totalWarmUpTime = warmUps.reduce((sum, lp) => sum + (lp.time || 0), 0);
  const totalBridgeTime = bridgeParts.reduce((sum, lp) => sum + (lp.time || 0), 0);
  const totalMainTime = mainActivities.reduce((sum, lp) => sum + (lp.time || 0), 0);

  return (
    <div className="lesson-page">
      <aside className="lesson-sidebar">Sidebar</aside>
      <div className="lesson-content">
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
              <h2 className="section-heading glance-toggle" onClick={() => setShowGlance(!showGlance)}>
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
                <h2 className="section-heading glance-toggle" onClick={() => setShowWarmUps(!showWarmUps)}>
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

                {warmUps.map((wp, i) => (
                  wp.file_infos && wp.file_infos.length > 0 && wp.file_infos.map((file, j) => (
                    <div className="pdf-button-wrapper" key={`warmup-pdf-${i}-${j}`}>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="pdf-button">
                        <span className="pdf-icon">📄</span>
                        <span className="pdf-title">{file.filename}</span>
                        View PDF
                      </a>
                    </div>
                  ))
                ))}
              </div>
            )}

            {bridgeParts.length > 0 && (
              <div className="lesson-block">
                <h2 className="section-heading glance-toggle" onClick={() => setShowBridge(!showBridge)}>
                  Bridge Activities — {totalBridgeTime} min {showBridge ? '▲' : '▼'}
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

                {bridgeParts.map((bp, i) => (
                  bp.file_infos && bp.file_infos.length > 0 && bp.file_infos.map((file, j) => (
                    <div className="pdf-button-wrapper" key={`bridge-pdf-${i}-${j}`}>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="pdf-button">
                        <span className="pdf-icon">📄</span>
                        <span className="pdf-title">{file.filename}</span>
                        View PDF
                      </a>
                    </div>
                  ))
                ))}
              </div>
            )}

            {mainActivities.length > 0 && (
                <div className="lesson-block">
                    <h2 className="section-heading glance-toggle" onClick={() => setShowMain(!showMain)}>
                    Main Activities — {totalMainTime} min {showMain ? '▲' : '▼'}
                    </h2>

                    {showMain && (
                    <ul className="lesson-parts-list">
                        {mainActivities.map((mp, i) => (
                        <li key={i}>
                            <strong>Part {mp.position}:</strong> {mp.title}
                            {mp.body && <p className="part-body">{mp.body}</p>}
                        </li>
                        ))}
                    </ul>
                    )}

                    {mainActivities.map((mp, i) => (
                    mp.file_infos && mp.file_infos.length > 0 && mp.file_infos.map((file, j) => (
                        <div className="pdf-button-wrapper" key={`main-pdf-${i}-${j}`}>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="pdf-button">
                            <span className="pdf-icon">📄</span>
                            <span className="pdf-title">{file.filename}</span>
                            View PDF
                        </a>
                        </div>
                    ))
                    ))}
                </div>
                )}
          </div>
        ) : (
          <div className="generate-box">
            <h2 className="generate-title">Instant Lesson Generator</h2>
            <button className="generate-button" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Random Lesson'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
