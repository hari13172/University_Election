"use client"

import { ResultsDisplay } from "../../components/result-display"

export default function ResultsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <ResultsDisplay />
      </div>
    </div>
  )
}
