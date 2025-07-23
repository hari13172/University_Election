"use client"

import { VotingForm } from "@/components/voting-form"

export default function VotePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-50">Student Election 2025</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Please enter your student ID and cast your votes for the various postings.
        </p>
        <VotingForm />
      </div>
    </div>
  )
}
