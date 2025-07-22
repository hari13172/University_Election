"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Candidate {
  id: string
  name: string
}

interface CandidatesByPosition {
  president: Candidate[]
  vicePresident: Candidate[]
  secretary: Candidate[]
  jointSecretary: Candidate[]
  treasury: Candidate[]
}

const candidates: CandidatesByPosition = {
  president: [
    { id: "pres-alice", name: "Alice Smith" },
    { id: "pres-bob", name: "Bob Johnson" },
    { id: "pres-charlie", name: "Charlie Brown" },
  ],
  vicePresident: [
    { id: "vp-diana", name: "Diana Prince" },
    { id: "vp-ethan", name: "Ethan Hunt" },
  ],
  secretary: [
    { id: "sec-fiona", name: "Fiona Glenanne" },
    { id: "sec-george", name: "George Costanza" },
  ],
  jointSecretary: [
    { id: "js-hannah", name: "Hannah Montana" },
    { id: "js-ivan", name: "Ivan Drago" },
  ],
  treasury: [
    { id: "tre-jessica", name: "Jessica Rabbit" },
    { id: "tre-kevin", name: "Kevin McCallister" },
  ],
}

const positions = [
  { key: "president", title: "President" },
  { key: "vicePresident", title: "Vice-President" },
  { key: "secretary", title: "Secretary" },
  { key: "jointSecretary", title: "Joint-Secretary" },
  { key: "treasury", title: "Treasury" },
]

export function ElectionForm() {
  const [studentId, setStudentId] = useState("")
  const [hasVoted, setHasVoted] = useState(false)
  const [votes, setVotes] = useState<Record<string, string>>({}) // Stores selected candidate ID for each position
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({}) // Stores total counts for each candidate
  const [votedStudentIds, setVotedStudentIds] = useState<string[]>([]) // Stores IDs of students who have voted

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
        // Initialize vote counts if not present
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

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value.trim().toUpperCase()
    setStudentId(id)
    if (votedStudentIds.includes(id)) {
      setHasVoted(true)
      toast("Already Voted", {
        description: "This student ID has already cast a vote.",
      })
    } else {
      setHasVoted(false)
    }
  }

  const handleVoteChange = (positionKey: string, candidateId: string) => {
    setVotes((prev) => ({ ...prev, [positionKey]: candidateId }))
  }

  const handleSubmitVote = (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentId) {
      toast("Missing Student ID", {
        description: "Please enter your student ID to vote.",
      })
      return
    }

    if (hasVoted) {
      toast("Already Voted", {
        description: "This student ID has already cast a vote.",
      })
      return
    }

    // Check if all positions have been voted for
    const allPositionsVoted = positions.every((pos) => votes[pos.key])
    if (!allPositionsVoted) {
      toast("Incomplete Vote", {
        description: "Please select a candidate for all positions.",
      })
      return
    }

    // Update vote counts
    const newVoteCounts = { ...voteCounts }
    Object.values(votes).forEach((candidateId) => {
      newVoteCounts[candidateId] = (newVoteCounts[candidateId] || 0) + 1
    })
    setVoteCounts(newVoteCounts)
    localStorage.setItem("electionVoteCounts", JSON.stringify(newVoteCounts))

    // Mark student ID as voted
    const newVotedStudentIds = [...votedStudentIds, studentId]
    setVotedStudentIds(newVotedStudentIds)
    localStorage.setItem("votedStudentIds", JSON.stringify(newVotedStudentIds))

    setHasVoted(true)
    toast("Vote Submitted!", {
      description: "Your vote has been successfully recorded.",
    })
    // Optionally clear the form or redirect
    setVotes({}) // Clear selections after voting
  }

  const exportVoteData = () => {
    let csvContent = "Position,Candidate ID,Candidate Name,Vote Count\n"

    positions.forEach((pos) => {
      candidates[pos.key as keyof CandidatesByPosition].forEach((candidate) => {
        const count = voteCounts[candidate.id] || 0
        csvContent += `${pos.title},${candidate.id},"${candidate.name}",${count}\n`
      })
    })

    // Add a section for voted student IDs
    csvContent += "\n\nVoted Student IDs\n"
    votedStudentIds.forEach((id) => {
      csvContent += `${id}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "election_results.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast("Export Successful", {
        description: "Election results exported to election_results.csv",
      })
    } else {
      toast("Export Failed", {
        description: "Your browser does not support downloading files directly.",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="studentId">Your Student ID</Label>
        <Input
          id="studentId"
          placeholder="e.g., S001, MCA005"
          value={studentId}
          onChange={handleStudentIdChange}
          disabled={hasVoted}
          className="uppercase"
        />
        {hasVoted && <p className="text-sm text-red-500 dark:text-red-400">You have already voted with this ID.</p>}
      </div>

      <form onSubmit={handleSubmitVote} className="space-y-6">
        {positions.map((pos) => (
          <Card key={pos.key}>
            <CardHeader>
              <CardTitle>{pos.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                onValueChange={(value) => handleVoteChange(pos.key, value)}
                value={votes[pos.key]}
                disabled={hasVoted}
              >
                {candidates[pos.key as keyof CandidatesByPosition].map((candidate) => (
                  <div key={candidate.id} className="flex items-center space-x-2 py-2">
                    <RadioGroupItem value={candidate.id} id={candidate.id} />
                    <Label htmlFor={candidate.id}>{candidate.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
        <Button type="submit" className="w-full" disabled={hasVoted}>
          Submit Vote
        </Button>
      </form>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-50">Election Results (Local)</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          These results are based on votes cast from this browser only.
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
    </div>
  )
}
