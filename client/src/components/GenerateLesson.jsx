import React, { useState } from 'react';
import './GenerateLesson.css';

export default function GenerateLesson() {
  const [lesson, setLesson] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setLesson({
        title: "Posing a Scene to Give it Life",
        objective: "Players will be able to have purposeful blocking in a scene when a script is provided.",
        at_a_glance: [
          "PRODUCT OR DELIVERABLE MADE OR PERFORMED: Blocking In A Performance",
          "MAJOR PRINCIPALS: Emotions and reactions lead to placement on stage and the actions make.",
          "SKILLS LEARNED: Blocking, Poses, Listening, Gestures.",
          "Warm Up: Emotional What Are you Doing?",
          "Bridge - Partner Sculpture From Prompt",
          "Main Activity - Tableaux - Photo Copier",
          "Main Activity - Tableaux - Norman Rockwell (Various)",
          "End Of Lesson - Performance Of Script - We Got A Problem - Using (EM, PL, PO, GE) Blocking Process"
        ]
      });
      setGenerating(false);
    }, 1000);
  };

  return (
    <div className="lesson-page">
    <aside className="lesson-sidebar">Sidebar</aside>
    <div
        className="lesson-content full-width"
        style={{
        backgroundImage: 'url(https://res.cloudinary.com/djtsuktwb/image/upload/v1751151866/iStock-487619256_gfou89.jpg)'
        }}
    >
        {lesson ? (
        <div className="lesson-details">
            <h1 className="lesson-title">{lesson.title}</h1>
            <section>
            <h2 className="section-heading">Lesson Objective</h2>
            <p>{lesson.objective}</p>
            </section>
            <section>
            <h2 className="section-heading">At a Glance</h2>
            <ul>
                {lesson.at_a_glance.map((item, index) => (
                <li key={index}>{item}</li>
                ))}
            </ul>
            </section>
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
