import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Upload, FileText, Download, Eye, Trash2 } from 'lucide-react';
import { Activity, AgeGroup, Level, ActivityType, PlayOrCraft, Script, ActivityPDF } from '../types';
import { ApiService } from '../services/api';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editActivity?: Activity;
  onViewPDF?: (pdfUrl: string, fileName: string) => void;
}

const ageGroups: AgeGroup[] = ['Young', 'Middle', 'Older'];
const levels: Level[] = ['Toe Tipper', 'Green Horn', 'Semi-Pro', 'Seasoned Veteran'];
const activityTypes: ActivityType[] = ['warm-up', 'main', 'cool-down', 'game', 'exercise'];
const playOrCraftOptions: PlayOrCraft[] = ['More Playing Than Creating', 'A Balance of Playing and Creating', 'Let us Create And Craft'];

export function CreateActivityModal({ isOpen, onClose, onCreate, editActivity, onViewPDF }: CreateActivityModalProps) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [formData, setFormData] = useState({
    title: editActivity?.title || '',
    description: editActivity?.description || '',
    ageGroup: editActivity?.ageGroup || 'Middle' as AgeGroup,
    skillLevel: editActivity?.skillLevel || 'Toe Tipper' as Level,
    duration: editActivity?.duration || 30,
    materials: editActivity?.materials?.join(', ') || '',
    tags: editActivity?.tags?.join(', ') || '',
    requiresScript: editActivity?.requiresScript || 'none' as 'required' | 'optional' | 'none',
    activityType: editActivity?.activityType || 'main' as ActivityType,
    playOrCraft: editActivity?.playOrCraft || 'A Balance of Playing and Creating' as PlayOrCraft,
    scriptIds: editActivity?.scriptIds || [],
    pdfFiles: editActivity?.pdfFiles || []
  });

  // Load scripts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadScripts();
    }
  }, [isOpen]);

  const loadScripts = async () => {
    try {
      setLoadingScripts(true);
      const data = await ApiService.getScripts();
      setScripts(data);
    } catch (error) {
      console.error('Failed to load scripts:', error);
    } finally {
      setLoadingScripts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create FormData object
      const formDataObj = new FormData();
      
      // Add all activity data as JSON string
      const activityData = {
        title: formData.title,
        description: formData.description,
        ageGroup: formData.ageGroup,
        skillLevel: formData.skillLevel,
        duration: formData.duration,
        materials: formData.materials.split(',').map((m: string) => m.trim()).filter(Boolean),
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        requiresScript: formData.requiresScript,
        activityType: formData.activityType,
        playOrCraft: formData.playOrCraft,
        scriptIds: formData.scriptIds,
        pdfFiles: formData.pdfFiles // Include the actual PDF files from form state
      };
      
      formDataObj.append('data', JSON.stringify(activityData));
      
      // Add files
      if (formData.pdfFiles.length > 0) {
        for (const pdf of formData.pdfFiles) {
          // Convert blob URL to File object
          const response = await fetch(pdf.fileUrl);
          const blob = await response.blob();
          const file = new File([blob], pdf.fileName, { type: 'application/pdf' });
          formDataObj.append('files', file);
        }
      }
      
      // Call onCreate with the activity data
      onCreate(activityData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create activity. Please try again.');
    }
  };

  const toggleScript = (scriptId: string) => {
    setFormData(prev => ({
      ...prev,
      scriptIds: prev.scriptIds.includes(scriptId)
        ? prev.scriptIds.filter(id => id !== scriptId)
        : [...prev.scriptIds, scriptId]
    }));
  };

  const getSelectedScripts = () => {
    return scripts.filter(script => formData.scriptIds.includes(script.id));
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingPDF(true);
    try {
      const newPDFs: ActivityPDF[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (file.type !== 'application/pdf') {
          alert(`${file.name} is not a PDF file. Only PDF files are allowed.`);
          continue;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum file size is 10MB.`);
          continue;
        }

        // Create a blob URL for preview
        const blobUrl = URL.createObjectURL(file);
        
        const newPDF: ActivityPDF = {
          _id: Date.now().toString() + i,
          fileName: file.name,
          fileUrl: blobUrl,
          fileSize: file.size,
          uploadedAt: new Date(),
          description: ''
        };

        newPDFs.push(newPDF);
      }

      setFormData(prev => ({
        ...prev,
        pdfFiles: [...prev.pdfFiles, ...newPDFs]
      }));
    } catch (error) {
      console.error('Error uploading PDFs:', error);
      alert('Failed to upload PDF files. Please try again.');
    } finally {
      setUploadingPDF(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const removePDF = (pdfId: string) => {
    setFormData(prev => ({
      ...prev,
      pdfFiles: prev.pdfFiles.filter(pdf => pdf._id !== pdfId)
    }));
  };

  const updatePDFDescription = (pdfId: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      pdfFiles: prev.pdfFiles.map(pdf => 
        pdf._id === pdfId ? { ...pdf, description } : pdf
      )
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-dark-700 transition-colors duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editActivity ? 'Edit Activity' : 'Create New Activity'}
          </h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Group</label>
              <select
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as AgeGroup })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                {ageGroups.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
              <select
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value as Level })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activity Type</label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value as ActivityType })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                {activityTypes.map(type => (
                  <option key={type} value={type}>
                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Script Requirement</label>
              <select
                value={formData.requiresScript}
                onChange={(e) => setFormData({ ...formData, requiresScript: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option value="none">None</option>
                <option value="optional">Optional</option>
                <option value="required">Required</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Play or Craft</label>
              <select
                value={formData.playOrCraft}
                onChange={(e) => setFormData({ ...formData, playOrCraft: e.target.value as PlayOrCraft })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                {playOrCraftOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PDF Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              PDF Attachments
            </label>
            
            {/* Upload Area */}
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-dark-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> PDF files
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF files only (MAX. 10MB each)</p>
                  {uploadingPDF && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-blue-600 dark:text-blue-400">Uploading...</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handlePDFUpload}
                  disabled={uploadingPDF}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded PDFs List */}
            {formData.pdfFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uploaded PDFs ({formData.pdfFiles.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.pdfFiles.map((pdf) => (
                    <div key={pdf._id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600">
                      <FileText className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{pdf.fileName}</p>
                          <div className="flex items-center gap-1 ml-2">
                            {/* {onViewPDF && (
                              <button
                                type="button"
                                onClick={() => onViewPDF(pdf.fileUrl, pdf.fileName)}
                                className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                title="View PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )} */}
                            <a
                              href={pdf.fileUrl}
                              download={pdf.fileName}
                              className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => removePDF(pdf._id)}
                              className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Remove PDF"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <span>{formatFileSize(pdf.fileSize)}</span>
                          <span>•</span>
                          <span>{new Date(pdf.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Add description (optional)"
                          value={pdf.description || ''}
                          onChange={(e) => updatePDFDescription(pdf._id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-dark-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Script Selection */}
          {(formData.requiresScript === 'required' || formData.requiresScript === 'optional') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Scripts {formData.requiresScript === 'required' && <span className="text-red-500">*</span>}
              </label>
              
              {loadingScripts ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading scripts...</p>
                </div>
              ) : (
                <>
                  {/* Selected Scripts */}
                  {formData.scriptIds.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected Scripts ({formData.scriptIds.length})
                      </h4>
                      <div className="space-y-2">
                        {getSelectedScripts().map(script => (
                          <div key={script.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex-1">
                              <h5 className="font-medium text-blue-900 dark:text-blue-300">{script.title}</h5>
                              <p className="text-sm text-blue-700 dark:text-blue-400">{script.description}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                                  {script.genre}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                                  {script.ageGroup}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                                  {script.duration} min
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleScript(script.id)}
                              className="ml-3 p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Scripts */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Scripts ({scripts.filter(s => !formData.scriptIds.includes(s.id)).length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700">
                      {scripts.filter(script => !formData.scriptIds.includes(script.id)).length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          {formData.scriptIds.length > 0 ? 'All available scripts selected' : 'No scripts available'}
                        </div>
                      ) : (
                        <div className="space-y-1 p-2">
                          {scripts
                            .filter(script => !formData.scriptIds.includes(script.id))
                            .map(script => (
                              <div key={script.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-dark-600 rounded-lg transition-colors">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 dark:text-white">{script.title}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{script.description}</p>
                                  <div className="flex gap-2 mt-1">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                      {script.genre}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                      {script.ageGroup}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                      {script.duration} min
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleScript(script.id)}
                                  className="ml-3 p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Materials (comma-separated)</label>
            <input
              type="text"
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              placeholder="Props, costumes, chairs..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="improv, teamwork, creativity..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingPDF}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editActivity ? 'Update' : 'Create'} Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}