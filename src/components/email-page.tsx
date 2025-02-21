import React, { useState, useRef } from 'react';
import { Mail, Upload, RefreshCw, Copy, Check, FileText, X, FileIcon, FileType2Icon, FileTextIcon, Trash2, Download } from 'lucide-react';
import { getChatCompletion } from '../lib/gemini';
import { parseDocument } from '../lib/document-parser';
import { cn } from '../lib/utils';

interface FilePreview {
  name: string;
  type: string;
  size: string;
  content: string;
}

export function EmailPage() {
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'application/pdf':
        return <FileIcon className="w-8 h-8 text-red-400" />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FileType2Icon className="w-8 h-8 text-blue-400" />;
      default:
        return <FileTextIcon className="w-8 h-8 text-purple-400" />;
    }
  };

  const handleSummarize = async () => {
    if (!filePreview) {
      setError('Please upload a document to summarize');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Please provide a concise summary of the following text, highlighting the key points and important details. If this is an email, identify the main action items and important dates. If it's a document, focus on the main themes and conclusions:\n\n${filePreview.content}`;
      const response = await getChatCompletion(prompt);
      setSummary(response);
    } catch (err) {
      console.error('Error getting summary:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    try {
      // Create blob from summary text
      const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set download attributes
      const fileName = filePreview ? 
        `summary-${filePreview.name.replace(/\.[^/.]+$/, '')}.txt` : 
        'document-summary.txt';
      
      link.href = url;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading summary:', err);
      setError('Failed to download summary. Please try again.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.length) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const content = await parseDocument(file);
      setFilePreview({
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
        content: content
      });
    } catch (err) {
      console.error('Error parsing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const clearFile = () => {
    setFilePreview(null);
    setSummary('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground mb-1">Email & Docs Summarizer</h1>
          <p className="text-muted-foreground">Upload your documents to get an AI-powered summary</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-card-foreground">Document</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
            </div>
          </div>

          <div
            className={cn(
              "border-2 border-dashed rounded-lg transition-colors min-h-[400px] flex items-center justify-center",
              dragActive ? "border-purple-500 bg-purple-500/5" : "border-border"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {filePreview ? (
              <div className="w-full p-6">
                <div className="bg-card/50 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getFileIcon(filePreview.type)}
                      <div>
                        <h3 className="font-medium text-card-foreground mb-1">
                          {filePreview.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {filePreview.size}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearFile}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Document loaded successfully. Click "Summarize" to generate a summary.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="bg-card/50 p-6 rounded-lg">
                  <div className="flex justify-center mb-4">
                    <div className="grid grid-cols-3 gap-3">
                      <FileIcon className="w-8 h-8 text-purple-400" />
                      <FileTextIcon className="w-8 h-8 text-purple-400" />
                      <FileType2Icon className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-card-foreground mb-2">
                    Drop your file here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF, DOCX, and TXT files
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2 mx-auto transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Browse Files
                  </button>
                </div>
              </div>
            )}
          </div>

          <input
            type="file"
            onChange={handleFileInput}
            accept=".pdf,.txt,.docx"
            className="hidden"
            ref={fileInputRef}
          />

          <button
            onClick={handleSummarize}
            disabled={isLoading || !filePreview}
            className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Summarize'
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-card-foreground">Summary</label>
            {summary && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleCopy}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          <div className="w-full h-[400px] px-4 py-3 rounded-lg border border-input bg-card/50 overflow-y-auto">
            {summary ? (
              <div className="prose prose-invert max-w-none">
                {summary}
              </div>
            ) : (
              <div className="text-muted-foreground text-center mt-[45%]">
                Your summary will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}