'use client';

import { Chat } from "@/components/chat"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            SPARK AI + OpenAI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Intent-Based Audience Segment Search + AI Assistant
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Get audience insights with SPARK AI • Chat with OpenAI for anything else
          </p>
        </div>

        {/* Chat Interface */}
        <Chat />

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by SPARK AI (BAAI/bge-large-en-v1.5) + OpenAI GPT-4o-mini</p>
        </div>
      </div>
    </div>
  );
}
