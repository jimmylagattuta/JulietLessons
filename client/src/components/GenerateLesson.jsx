import React, { useState } from 'react';
import './GenerateLesson.css';

export default function GenerateLesson() {
  const [lesson, setLesson] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showGlance, setShowGlance] = useState(false);
  const [showWarmUps, setShowWarmUps] = useState(false);
  const [showBridge, setShowBridge] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showScripts, setShowScripts] = useState(false);

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
  const endActivities = lesson?.lesson_parts?.filter(lp => lp.section_type === 'end_of_lesson') || [];
  const scripts = lesson?.lesson_parts?.filter(lp => lp.section_type === 'script') || [];

  const totalWarmUpTime = warmUps.reduce((sum, lp) => sum + (lp.time || 0), 0);
  const totalBridgeTime = bridgeParts.reduce((sum, lp) => sum + (lp.time || 0), 0);
  const totalMainTime = mainActivities.reduce((sum, lp) => sum + (lp.time || 0), 0);
  const totalEndTime = endActivities.reduce((sum, lp) => sum + (lp.time || 0), 0);

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

            {/* Warm Ups */}
            {warmUps.length > 0 && (
              <div className="lesson-block">
                <h2 className="section-heading glance-toggle" onClick={() => setShowWarmUps(!showWarmUps)}>
                  Warm Ups — {totalWarmUpTime} min {showWarmUps ? '▲' : '▼'}
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

            {/* Bridge Activities */}
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

            {/* Main Activities */}
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

            {/* End of Lesson */}
            {endActivities.length > 0 && (
              <div className="lesson-block">
                <h2 className="section-heading glance-toggle" onClick={() => setShowEnd(!showEnd)}>
                  End of Lesson — {totalEndTime} min {showEnd ? '▲' : '▼'}
                </h2>
                {showEnd && (
                  <ul className="lesson-parts-list">
                    {endActivities.map((ep, i) => (
                      <li key={i}>
                        <strong>Part {ep.position}:</strong> {ep.title}
                        {ep.body && <p className="part-body">{ep.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {endActivities.map((ep, i) => (
                  ep.file_infos && ep.file_infos.length > 0 && ep.file_infos.map((file, j) => (
                    <div className="pdf-button-wrapper" key={`end-pdf-${i}-${j}`}>
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
            {scripts.length > 0 && (
              <div className="lesson-block">
                <h2 className="section-heading glance-toggle" onClick={() => setShowScripts(!showScripts)}>
                  Scripts {showScripts ? '▲' : '▼'}
                </h2>

                {showScripts && (
                  <ul className="lesson-parts-list">
                    {scripts.map((sp, i) => (
                      <li key={i}>
                        <strong>{sp.title}</strong>
                        {sp.body && <p className="part-body">{sp.body}</p>}
                      </li>
                    ))}
                  </ul>
                )}

                {scripts.map((sp, i) => (
                  sp.file_infos && sp.file_infos.length > 0 && sp.file_infos.map((file, j) => (
                    <div className="pdf-button-wrapper" key={`script-pdf-${i}-${j}`}>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="pdf-button">
                        <span className="pdf-icon">📄</span>
                        <span className="pdf-title">SCRIPT{" - "}{file.filename}</span>
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
