"use client"

import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-50">
          Election Admin Dashboard
        </h1>
        <AdminDashboard />
      </div>
    </div>
  )
}
