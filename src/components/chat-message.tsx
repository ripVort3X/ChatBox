import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: string;
  isAi: boolean;
  timestamp: Date;
  id: string;
}

export function ChatMessage({ message, isAi, timestamp, id }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={cn(
        "flex gap-3 p-4 rounded-lg group relative",
        isAi ? "bg-card/50" : "bg-blue-500/10"
      )}
      key={id}
    >
      <div className="flex-shrink-0 mt-1">
        {isAi ? (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-card-foreground">
            {isAi ? 'ChatBox AI' : 'You'}
          </span>
          <span className="text-sm text-muted-foreground">
            {timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={cn("bg-muted px-1.5 py-0.5 rounded-md", className)} {...props}>
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>;
              }
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
        <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}