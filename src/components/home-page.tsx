import React from 'react';
import { MessageSquare, Mail, FileText, CheckSquare } from 'lucide-react';

interface HomePageProps {
  onFeatureSelect: (feature: 'chat' | 'email' | 'resume' | 'todo') => void;
}

export function HomePage({ onFeatureSelect }: HomePageProps) {
  const features = [
    {
      id: 'chat',
      name: 'AI ChatBot',
      description: 'Intelligent conversational AI with multi-language support and voice capabilities.',
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      id: 'email',
      name: 'Email & Docs Summarizer',
      description: 'Quickly summarize emails and documents to save time and increase productivity.',
      icon: Mail,
      color: 'bg-purple-500',
    },
    {
      id: 'resume',
      name: 'Smart Resume Builder',
      description: 'Create professional resumes with AI-powered optimization and suggestions.',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      id: 'todo',
      name: 'Smart TO-DO List',
      description: 'Intelligent task management with AI prioritization and scheduling.',
      icon: CheckSquare,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-card-foreground mb-4">
          Welcome to ChatBox
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your all-in-one AI-powered productivity suite. Choose a feature to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onFeatureSelect(feature.id as any)}
            className="flex flex-col p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground mb-2">
              {feature.name}
            </h2>
            <p className="text-muted-foreground">
              {feature.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}