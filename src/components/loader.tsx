import React from 'react';
import { Loader2 } from 'lucide-react';

export function Loader() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Loading ChatBox</h2>
        <p className="text-muted-foreground mt-2">Please wait while we initialize your experience...</p>
      </div>
    </div>
  );
}

// Add fade-in animation to make the loader appear smoothly
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
`;
document.head.appendChild(style);