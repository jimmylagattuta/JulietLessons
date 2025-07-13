// src/components/NewLessonPart.jsx
import React, { useState } from 'react';
import EditLessonPart from './EditLessonPart';

const SECTION_LABELS = {
  warm_up:         'Warm Ups',
  bridge_activity: 'Bridge Activities',
  main_activity:   'Main Activities',
  end_of_lesson:   'End Of Lesson',
  script:          'Scripts',
};
const AGE_GROUPS = ['Young', 'Middle', 'Older', 'All'];
const LEVELS     = ['Toe Tipper', 'Green Horn', 'Semi-Pro', 'Seasoned Veteran(all)'];
const AVAILABLE_TAGS = [
  'Commedia Principals',
  'Character Dynamics',
  'Meisner',
  'Impro Games',
  'Vocal Acrobatics',
  'Physical Theater',
  'Planned Projects',
  'Shakespeare',
  'Pantomime',
  'Playmaking',
  'Acting Challenges',
  'Ensemble Work',
];

export default function NewLessonPart({ admin }) {
  const [showForm, setShowForm]     = useState(false);
  const [sectionType, setSectionType] = useState('');
  const [title, setTitle]           = useState('');
  const [body, setBody]             = useState('');
  const [time, setTime]             = useState('');
  const [ageGroup, setAgeGroup]     = useState('');
  const [level, setLevel]           = useState('');
  const [pdfFiles, setPdfFiles]     = useState([{ file: null }]);
  const [saving, setSaving]         = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [tags, setTags] = useState([]);

  const resetForm = () => {
    setSectionType('');
    setTitle('');
    setBody('');
    setTime('');
    setAgeGroup('');
    setLevel('');
    setTags([]);
    setPdfFiles([{ file: null }]);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handlePdfChange = (idx, files) => {
    const slots = [...pdfFiles];
    slots[idx].file = files[0] || null;
    if (idx === slots.length - 1 && files[0]) slots.push({ file: null });
    setPdfFiles(slots);
  };

  const handleRemovePdf = idx => {
    const slots = pdfFiles.filter((_, i) => i !== idx);
    setPdfFiles(slots.length ? slots : [{ file: null }]);
  };

  const handleSave = async () => {
    if (!sectionType || !title.trim() || !body.trim()) {
      alert('Please complete all required fields.');
      return;
    }
    const form = new FormData();
    form.append('lesson_part[section_type]', sectionType);
    form.append('lesson_part[title]', title);
    form.append('lesson_part[body]', body);
    form.append('lesson_part[time]', time);
    ageGroup.forEach(g => form.append('lesson_part[age_group][]', g))
    level.forEach(l => form.append('lesson_part[level][]', l))
    form.append('lesson_part[admin_created]', admin ? 'true' : 'false');

    tags.forEach(tag => form.append('lesson_part[tags][]', tag));

    pdfFiles.forEach(s => s.file && form.append('lesson_part[files][]', s.file));

    setSaving(true);
    try {
      const res = await fetch('/api/lesson_parts', { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      await res.json();
      setSuccessMessage('✅ Lesson part saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
      resetForm();
      setShowForm(false);
    } catch (e) {
      console.error(e);
      alert('Save failed. See console.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow z-50">
          {successMessage}
        </div>
      )}
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sidebar</h2>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        {/* Show Create Header ONLY if not editing */}
        {!showEditForm && (
          <div className="p-6 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => {
                setShowForm(true);
                setShowEditForm(false);
              }}
              role={!showForm ? 'button' : undefined}
              tabIndex={!showForm ? 0 : undefined}
              onKeyPress={e => {
                if (!showForm && e.key === 'Enter') {
                  setShowForm(true);
                  setShowEditForm(false);
                }
              }}
            >
              {!showForm && <div className="text-4xl font-bold text-green-500">+</div>}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {showForm ? 'New Lesson Part' : 'Create a Lesson Part'}
              </h1>
            </div>
          </div>
        )}

        {/* Show Edit Header ONLY if not creating */}
        {!showForm && (
          <div className="p-6 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => {
                setShowEditForm(true);
                setShowForm(false);
              }}
              role={!showEditForm ? 'button' : undefined}
              tabIndex={!showEditForm ? 0 : undefined}
              onKeyPress={e => {
                if (!showEditForm && e.key === 'Enter') {
                  setShowEditForm(true);
                  setShowForm(false);
                }
              }}
            >
              {!showEditForm && <div className="text-4xl font-bold text-yellow-400">✎</div>}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {showEditForm ? 'Edit a Lesson Part' : 'Edit a Lesson Part'}
              </h1>
            </div>
          </div>
        )}
        {/* Back button */}
        {showEditForm && (
          <div className="w-full h-full min-h-screen flex flex-col bg-white dark:bg-dark-900 p-6 space-y-0">
            <div className="mb-0">
              <button
                onClick={() => {
                  if (editingPart) {
                    setEditingPart(null); // just close the current lesson part editing view
                  } else {
                    setShowEditForm(false); // fully exit edit mode
                  }
                }}
                className="text-blue-600 hover:underline font-medium mb-2"
              >
                ← Back
              </button>
            </div>
            <EditLessonPart editingPart={editingPart} setEditingPart={setEditingPart} admin={admin} />
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="flex-1 overflow-auto p-6 max-w-2xl mx-auto">
            <div className="mb-4">
              <button
                onClick={() => setShowForm(false)}
                className="text-blue-600 hover:underline font-medium mb-2"
              >
                ← Back
              </button>
            </div>
            {/* Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Section
              </label>
              <select
                value={sectionType}
                onChange={e => setSectionType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Section…</option>
                {Object.entries(SECTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {sectionType && (
              <>
                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Body */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Body
                  </label>
                  <textarea
                    rows={3}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Age Group (multi-select pill style) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Age Group
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUPS.map(group => {
                      const isSelected = ageGroup.includes(group);
                      return (
                        <button
                          type="button"
                          key={group}
                          onClick={() =>
                            setAgeGroup(prev =>
                              isSelected ? prev.filter(g => g !== group) : [...prev, group]
                            )
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                            isSelected
                              ? 'text-white'
                              : 'text-gray-300 border border-gray-500 bg-dark-700 hover:bg-dark-600'
                          }`}
                          style={
                            isSelected
                              ? {
                                  background: 'linear-gradient(135deg, #1e3a8a, #10b981)',
                                  backgroundSize: '160% 160%',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  boxShadow:
                                    'inset 0 0 6px rgba(255, 255, 255, 0.05), 0 2px 6px rgba(16, 185, 129, 0.4)',
                                  backdropFilter: 'blur(3px)',
                                }
                              : {}
                          }
                        >
                          {isSelected ? '✅ ' : ''}
                          {group}
                        </button>
                      );
                    })}
                  </div>
                </div>


                {/* Level (multi-select pill style) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map(lvl => {
                      const isSelected = level.includes(lvl);
                      return (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() =>
                            setLevel(prev =>
                              isSelected ? prev.filter(t => t !== lvl) : [...prev, lvl]
                            )
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                            isSelected
                              ? 'text-white'
                              : 'text-gray-300 border border-gray-500 bg-dark-700 hover:bg-dark-600'
                          }`}
                          style={
                            isSelected
                              ? {
                                  background: 'linear-gradient(135deg, #3b82f6, #f97316)',
                                  backgroundSize: '160% 160%',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  boxShadow:
                                    'inset 0 0 6px rgba(255, 255, 255, 0.05), 0 2px 6px rgba(59, 130, 246, 0.4)',
                                  backdropFilter: 'blur(3px)',
                                }
                              : {}
                          }
                        >
                          {isSelected ? '✨ ' : ''}
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>



                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map(tag => {
                      const isSelected = tags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => {
                            setTags(prev =>
                              isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                            );
                          }}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                            isSelected
                              ? 'text-white'
                              : 'text-gray-300 border border-gray-500 bg-dark-700 hover:bg-dark-600'
                          }`}
                          style={
                            isSelected
                              ? {
                                  background: 'linear-gradient(135deg, #6b21a8, #9d174d)',
                                  backgroundSize: '160% 160%',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  boxShadow:
                                    'inset 0 0 6px rgba(255, 255, 255, 0.05), 0 2px 6px rgba(109, 40, 217, 0.4)',
                                  backdropFilter: 'blur(3px)',
                                }
                              : {}
                          }
                        >
                          {isSelected ? '✨ ' : ''}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PDF slots */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Attachments (PDF)
                  </label>
                  <div className="space-y-2">
                    {pdfFiles.map((slot, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={e => handlePdfChange(i, e.target.files)}
                          className="text-gray-700 dark:text-gray-200"
                        />
                        {slot.file && (
                          <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {slot.file.name}
                            </span>
                            <button
                              onClick={() => handleRemovePdf(i)}
                              className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg shadow transition-colors duration-200 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-gray-300 dark:bg-dark-700 hover:bg-gray-400 dark:hover:bg-dark-600 text-gray-900 dark:text-gray-200 px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
