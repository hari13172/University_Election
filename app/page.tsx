import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-50">College Election 2025</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Your platform for casting and viewing election results.</p>
        <div className="flex flex-col space-y-4">
          <Link href="/vote" passHref>
            <Button className="w-full py-3 text-lg">Cast Your Vote</Button>
          </Link>
          <Link href="/results" passHref>
            <Button variant="outline" className="w-full py-3 text-lg bg-transparent">
              View Election Results
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
