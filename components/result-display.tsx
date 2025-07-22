"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { candidates, positions, type CandidatesByPosition } from "@/lib/election-data"
import { toast } from "sonner"

export function ResultsDisplay() {
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})
  const [votedStudentIds, setVotedStudentIds] = useState<string[]>([])

  useEffect(() => {
    // Load data from localStorage on component mount
    if (typeof window !== "undefined") {
      const storedVotedIds = localStorage.getItem("votedStudentIds")
      if (storedVotedIds) {
        setVotedStudentIds(JSON.parse(storedVotedIds))
      }
      const storedVoteCounts = localStorage.getItem("electionVoteCounts")
      if (storedVoteCounts) {
        setVoteCounts(JSON.parse(storedVoteCounts))
      } else {
        // Initialize vote counts if not present (should ideally be done once)
        const initialCounts: Record<string, number> = {}
        Object.values(candidates).forEach((posCandidates) => {
          posCandidates.forEach((candidate:any) => {
            initialCounts[candidate.id] = 0
          })
        })
        setVoteCounts(initialCounts)
      }
    }
  }, [])

  const exportVoteData = () => {
    let csvContent = "Position,Candidate ID,Candidate Name,Vote Count\n"

    positions.forEach((pos) => {
      candidates[pos.key as keyof CandidatesByPosition].forEach((candidate) => {
        const count = voteCounts[candidate.id] || 0
        csvContent += `${pos.title},${candidate.id},"${candidate.name}",${count}\n`
      })
    })

    // Add a section for voted student IDs
    csvContent += "\n\nVoted Student IDs (from this browser)\n"
    votedStudentIds.forEach((id) => {
      csvContent += `${id}\n`
    })

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      if (link.download !== undefined) {
        // Feature detection for download attribute
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "election_results.csv")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url) // Clean up the URL object
        toast("Export Successful", {
          description: "Election results exported to election_results.csv",
        })
      } else {
        // Fallback for browsers that don't support download attribute
        toast("Export Failed",{
          description: "Your browser does not support direct file downloads. Please copy the content manually.",
        })
      }
    } catch (error) {
      console.error("Error during CSV export:", error)
      toast("Export Error", {
        description: "An error occurred during export. Please try again.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-50">Election Results (Local)</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
        These results are based on votes cast from this browser only. For a complete count, data from all voting devices
        would need to be aggregated manually.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {positions.map((pos) => (
          <Card key={`results-${pos.key}`}>
            <CardHeader>
              <CardTitle className="text-lg">{pos.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {candidates[pos.key as keyof CandidatesByPosition].map((candidate) => (
                  <li key={`result-${candidate.id}`} className="flex justify-between items-center">
                    <span>{candidate.name}</span>
                    <span className="font-semibold">{voteCounts[candidate.id] || 0}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button onClick={exportVoteData} className="w-full mt-4">
        Export Results to CSV
      </Button>
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-2">
        (Includes voted student IDs and candidate vote counts from this browser)
      </p>
    </div>
  )
}
