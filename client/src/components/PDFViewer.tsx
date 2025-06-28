import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title?: string;
}

export function PDFViewer({ isOpen, onClose, pdfUrl, title }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError('');
  };

  const onDocumentLoadError = (error: Error) => {
    setError('Failed to load PDF document');
    setLoading(false);
    console.error('PDF load error:', error);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col border border-gray-200 dark:border-dark-700 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title || 'Script Preview'}
            </h3>
            {numPages > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {pageNumber} of {numPages}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 mr-4">
              <button
                onClick={zoomOut}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={resetZoom}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                title="Reset Zoom"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={zoomIn}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Download Button */}
            <a
              href={pdfUrl}
              download
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-dark-900 p-4">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-2">Error loading PDF</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="flex justify-center">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                className="shadow-lg"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  className="border border-gray-300 dark:border-dark-600"
                />
              </Document>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        {numPages > 1 && (
          <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-200 dark:border-dark-700">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white">Previous</span>
            </button>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={numPages}
                value={pageNumber}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= numPages) {
                    setPageNumber(page);
                  }
                }}
                className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-dark-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-500 dark:text-gray-400">of {numPages}</span>
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <span className="text-gray-900 dark:text-white">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}