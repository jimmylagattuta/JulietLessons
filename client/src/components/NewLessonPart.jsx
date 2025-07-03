// src/components/NewLessonPart.jsx
import React, { useState } from 'react';

const SECTION_LABELS = {
  warm_up:         'Warm Ups',
  bridge_activity: 'Bridge Activities',
  main_activity:   'Main Activities',
  end_of_lesson:   'End Of Lesson',
  script:          'Scripts',
};

const AGE_GROUPS = ['Young', 'Middle', 'Older', 'All'];
const LEVELS     = ['Toe Tipper', 'Green Horn', 'Semi-Pro', 'Seasoned Veteran(all)'];

export default function NewLessonPart() {
  const [showForm, setShowForm]     = useState(false);
  const [sectionType, setSectionType] = useState('');
  const [title, setTitle]           = useState('');
  const [body, setBody]             = useState('');
  const [time, setTime]             = useState('');
  const [ageGroup, setAgeGroup]     = useState('');
  const [level, setLevel]           = useState('');
  const [pdfFiles, setPdfFiles]     = useState([{ file: null }]);
  const [saving, setSaving]         = useState(false);

  const resetForm = () => {
    setSectionType('');
    setTitle('');
    setBody('');
    setTime('');
    setAgeGroup('');
    setLevel('');
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
    form.append('lesson_part[age_group]', ageGroup);
    form.append('lesson_part[level]', level);
    pdfFiles.forEach(s => s.file && form.append('lesson_part[files][]', s.file));

    setSaving(true);
    try {
      const res = await fetch('/api/lesson_parts', { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      await res.json();
      alert('Lesson part saved!');
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
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sidebar</h2>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="p-6 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => !showForm && setShowForm(true)}
            role={!showForm ? 'button' : undefined}
            tabIndex={!showForm ? 0 : undefined}
            onKeyPress={e => !showForm && e.key === 'Enter' && setShowForm(true)}
          >
            {!showForm && <div className="text-4xl font-bold text-green-500">+</div>}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {showForm ? 'New Lesson Part' : 'Create a Lesson Part'}
            </h1>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="flex-1 overflow-auto p-6 max-w-2xl mx-auto">
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

                {/* Age Group */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Age Group
                  </label>
                  <select
                    value={ageGroup}
                    onChange={e => setAgeGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Age Group…</option>
                    {AGE_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Level */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Level
                  </label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Level…</option>
                    {LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
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
