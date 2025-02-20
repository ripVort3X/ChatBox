import React from 'react';
import { Loader2 } from 'lucide-react';

export function Loader() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Loading ChatBox</h2>
        <p className="text-muted-foreground mt-2">Please wait while we initialize your experience...</p>
      </div>
    </div>
  );
}