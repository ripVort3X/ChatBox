import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import { AuthForm } from './components/auth-form';
import { Loader } from './components/loader';
import { HomePage } from './components/home-page';
import { ChatPage } from './components/chat-page';
import { EmailPage } from './components/email-page';
import { useState, useEffect } from 'react';

type Feature = 'chat' | 'email' | 'resume' | 'todo' | 'home';

function App() {
  const [user, authLoading] = useAuthState(auth);
  const [currentFeature, setCurrentFeature] = useState<Feature>('home');
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (authLoading || !appReady) {
    return <Loader />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentFeature('home')}
              className="text-2xl font-bold text-card-foreground hover:text-blue-500 transition-colors"
            >
              ChatBox
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <button
              onClick={() => auth.signOut()}
              className="px-4 py-2 text-sm text-red-400 hover:text-red-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentFeature === 'home' && (
          <HomePage onFeatureSelect={setCurrentFeature} />
        )}
        {currentFeature === 'chat' && (
          <ChatPage />
        )}
        {currentFeature === 'email' && (
          <EmailPage />
        )}
        {currentFeature === 'resume' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">Smart Resume Builder</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        )}
        {currentFeature === 'todo' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">Smart TO-DO List</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;