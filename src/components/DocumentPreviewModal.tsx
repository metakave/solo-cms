'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  File,
  AlertCircle,
  Loader2,
  FileType,
} from 'lucide-react';
import { Attachment } from '@/types/crm';

interface DocumentPreviewModalProps {
  attachment: Attachment | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper to convert base64 Data URI to a Uint8Array & ArrayBuffer
function dataUriToUint8Array(dataUri: string): { bytes: Uint8Array; mime: string } {
  try {
    const parts = dataUri.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const base64Data = parts[1] || parts[0];
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return { bytes, mime };
  } catch (err) {
    console.error('Failed to decode dataUri:', err);
    return { bytes: new Uint8Array(0), mime: 'application/octet-stream' };
  }
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  attachment,
  isOpen,
  onClose,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const docxContainerRef = useRef<HTMLDivElement>(null);

  const fileName = attachment?.fileName || 'Document';
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
  const isPdf = fileExt === 'pdf' || attachment?.fileType.includes('pdf');
  const isDocx =
    fileExt === 'docx' ||
    attachment?.fileType.includes('wordprocessingml') ||
    attachment?.fileType.includes('officedocument');
  const isDoc = fileExt === 'doc' || attachment?.fileType.includes('msword');
  const isImage =
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(fileExt) ||
    attachment?.fileType.startsWith('image/');
  const isText =
    ['txt', 'csv', 'json', 'md', 'xml', 'log'].includes(fileExt) ||
    attachment?.fileType.startsWith('text/');

  useEffect(() => {
    if (!isOpen || !attachment) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setDocxHtml(null);
      setTextContent(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setDocxHtml(null);
    setTextContent(null);

    let active = true;

    try {
      const { bytes, mime } = dataUriToUint8Array(attachment.fileData);

      if (bytes.length === 0) {
        setError('Document content is empty or invalid.');
        setIsLoading(false);
        return;
      }

      // Create a Blob URL for direct browser embedding / opening
      const currentBlob = new Blob([bytes as unknown as BlobPart], {
        type: isPdf ? 'application/pdf' : mime || 'application/octet-stream',
      });
      const url = URL.createObjectURL(currentBlob);
      setBlobUrl(url);

      // Handle DOCX via mammoth / docx-preview
      if (isDocx) {
        (async () => {
          try {
            // First try mammoth for clean semantic HTML
            const mammoth = await import('mammoth/mammoth.browser');
            const result = await mammoth.convertToHtml({
              arrayBuffer: bytes.buffer as ArrayBuffer,
            });

            if (active) {
              if (result.value && result.value.trim().length > 0) {
                setDocxHtml(result.value);
              } else {
                setDocxHtml(
                  '<p class="italic text-slate-400">Document has no text content.</p>'
                );
              }
              setIsLoading(false);
            }
          } catch (mErr: any) {
            console.warn('Mammoth preview error, trying docx-preview:', mErr);
            // Fallback to docx-preview
            try {
              const { renderAsync } = await import('docx-preview');
              if (docxContainerRef.current && active) {
                await renderAsync(bytes.buffer as ArrayBuffer, docxContainerRef.current, undefined, {
                  inWrapper: false,
                  ignoreWidth: true,
                  ignoreHeight: true,
                });
                setIsLoading(false);
              }
            } catch (dpErr: any) {
              console.error('DOCX rendering failed:', dpErr);
              if (active) {
                setError(
                  'Could not parse Word (.docx) document. You can download and open it in Word or Google Docs.'
                );
                setIsLoading(false);
              }
            }
          }
        })();
      } else if (isDoc) {
        // Legacy .doc format - extract readable text strings if possible
        try {
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const rawText = decoder.decode(bytes);
          // Filter readable chunks
          const readableStrings = rawText.match(/[\w\s.,;:?!'"()\/\-]{4,}/g);
          if (readableStrings && readableStrings.length > 5 && active) {
            setTextContent(readableStrings.join(' '));
          }
        } catch {
          // ignore extraction error
        }
        setIsLoading(false);
      } else if (isText) {
        try {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(bytes);
          if (active) {
            setTextContent(text);
            setIsLoading(false);
          }
        } catch (tErr: any) {
          if (active) {
            setError('Could not decode text file.');
            setIsLoading(false);
          }
        }
      } else {
        // Images and PDFs use the blob URL directly
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Preview error:', err);
      if (active) {
        setError(err.message || 'Failed to load document preview.');
        setIsLoading(false);
      }
    }

    return () => {
      active = false;
    };
  }, [isOpen, attachment]);

  // Clean up blob url on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (!isOpen || !attachment) return null;

  const handleDownload = () => {
    if (!attachment.fileData) return;
    const a = document.createElement('a');
    a.href = blobUrl || attachment.fileData;
    a.download = attachment.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullScreen
            ? 'w-full h-full max-w-none max-h-none rounded-none'
            : 'w-full max-w-5xl h-[90vh] max-h-[920px]'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2 rounded-xl border shrink-0 ${
                isPdf
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'
                  : isDocx || isDoc
                  ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {isPdf ? (
                <FileText className="w-5 h-5" />
              ) : isDocx || isDoc ? (
                <FileType className="w-5 h-5" />
              ) : (
                <File className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {attachment.fileName}
                </h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {fileExt || 'DOC'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {formatFileSize(attachment.fileSize)} • Attached{' '}
                {new Date(attachment.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 shrink-0 ml-4">
            {blobUrl && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Open in new browser tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors hidden sm:block"
              title={isFullScreen ? 'Exit full screen' : 'Full screen preview'}
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Close preview (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 overflow-auto bg-slate-100/60 dark:bg-slate-950 p-3 sm:p-6 flex flex-col items-center justify-start relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-900/70 z-10 gap-2">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Loading document preview...
              </span>
            </div>
          )}

          {error && (
            <div className="my-auto max-w-md w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-6 text-center shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Preview Notice
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {error}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                Download {attachment.fileName}
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* PDF Viewer */}
              {isPdf && blobUrl && (
                <div className="w-full h-full min-h-[500px] flex flex-col rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-white">
                  <iframe
                    src={`${blobUrl}#toolbar=1&navpanes=0`}
                    className="w-full h-full flex-1 border-0 rounded-xl"
                    title={attachment.fileName}
                  />
                </div>
              )}

              {/* Word DOCX HTML Viewer */}
              {isDocx && docxHtml && (
                <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 sm:p-14 transition-colors">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <FileType className="w-4 h-4" />
                      Microsoft Word Preview
                    </span>
                    <span>Rendered from .docx</span>
                  </div>

                  <div
                    className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: docxHtml }}
                  />
                </div>
              )}

              {/* Container for docx-preview fallback */}
              {isDocx && !docxHtml && (
                <div
                  ref={docxContainerRef}
                  className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 sm:p-12 overflow-x-auto text-slate-900 dark:text-slate-100"
                />
              )}

              {/* Legacy DOC Viewer / Text Fallback */}
              {isDoc && (
                <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 space-y-5">
                  <div className="flex items-center gap-3 p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                    <FileType className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Legacy Word Document (.doc)
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        For complete formatting, download and view in Microsoft Word or LibreOffice.
                      </p>
                    </div>
                  </div>

                  {textContent && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap">
                      {textContent}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .doc Document
                    </button>
                  </div>
                </div>
              )}

              {/* Image Viewer */}
              {isImage && blobUrl && (
                <div className="w-full h-full flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blobUrl}
                    alt={attachment.fileName}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800"
                  />
                </div>
              )}

              {/* Plain Text / CSV / Code Viewer */}
              {isText && textContent !== null && (
                <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
                    <span>{fileName}</span>
                    <span>{textContent.split('\n').length} lines</span>
                  </div>
                  <pre className="p-6 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[70vh]">
                    {textContent}
                  </pre>
                </div>
              )}

              {/* Unsupported Generic File */}
              {!isPdf && !isDocx && !isDoc && !isImage && !isText && (
                <div className="my-auto max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xl space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-500/20">
                    <File className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {attachment.fileName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Direct preview is available for PDF, Word (.docx, .doc), text, and image files.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Download File ({formatFileSize(attachment.fileSize)})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
