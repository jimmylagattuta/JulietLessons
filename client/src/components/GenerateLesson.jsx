import React, { useState } from 'react';
import './GenerateLesson.css';

export default function GenerateLesson() {
  const [lesson, setLesson] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showGlance, setShowGlance] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    fetch('/api/lessons/random')
      .then(response => response.json())
      .then(data => {
        setLesson(data);
        setGenerating(false);
      })
      .catch(error => {
        console.error('Error fetching lesson:', error);
        setGenerating(false);
      });
  };

  return (
    <div className="lesson-page">
      <aside className="lesson-sidebar">Sidebar</aside>
      <div
        className="lesson-content"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/djtsuktwb/image/upload/v1751151866/iStock-487619256_gfou89.jpg)'
        }}
      >
        {lesson ? (
          <div className="lesson-details">
            <div className="lesson-block">
              <h1 className="lesson-title showman">{lesson.title}</h1>
            </div>
            <div className="lesson-block">
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
                <ul>
                  {lesson.at_a_glance.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
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
