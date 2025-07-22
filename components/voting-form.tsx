"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { candidates, positions, type CandidatesByPosition } from "@/lib/election-data"
import { toast } from "sonner"

const departments = [
  { key: "MCA", name: "Master of Computer Applications" },
  { key: "MSC", name: "Master of Science" },
  { key: "DS", name: "Data Science" },
]

const registerNumbers = {
  MCA: Array.from({ length: 30 }, (_, i) => `U24PG507CAP${String(i + 1).padStart(2, "0")}`),
  MSC: Array.from({ length: 44 }, (_, i) => `U24PG507CSC${String(i + 1).padStart(2, "0")}`),
  DS: Array.from({ length: 42 }, (_, i) => `U24PG507DS${String(i + 1).padStart(2, "0")}`),
}

export function VotingForm() {
  const [studentId, setStudentId] = useState("")
  const [hasVoted, setHasVoted] = useState(false)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [votedStudentIds, setVotedStudentIds] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedRegisterNumber, setSelectedRegisterNumber] = useState<string>("")
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedVotedIds = localStorage.getItem("votedStudentIds")
      if (storedVotedIds) {
        setVotedStudentIds(JSON.parse(storedVotedIds))
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

  const resetForm = useCallback(() => {
    // Keep the selected department, only reset the voting-related fields
    setSelectedRegisterNumber("")
    setStudentId("")
    setVotes({})
    setHasVoted(false)
    if (formRef.current) {
      formRef.current.reset()
    }
    // Focus back to the register number dropdown if department is selected
    if (selectedDepartment) {
      document.getElementById("registerNumber")?.focus()
    } else {
      document.getElementById("studentId")?.focus()
    }
  }, [selectedDepartment])

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

    const allPositionsVoted = positions.every((pos) => votes[pos.key])
    if (!allPositionsVoted) {
      toast("Incomplete Vote", {
        description: "Please select a candidate for all positions.",
      })
      return
    }

    if (typeof window !== "undefined") {
      const storedVoteCounts = localStorage.getItem("electionVoteCounts")
      const currentVoteCounts: Record<string, number> = storedVoteCounts ? JSON.parse(storedVoteCounts) : {}

      const newVoteCounts = { ...currentVoteCounts }
      Object.values(votes).forEach((candidateId) => {
        newVoteCounts[candidateId] = (newVoteCounts[candidateId] || 0) + 1
      })
      localStorage.setItem("electionVoteCounts", JSON.stringify(newVoteCounts))

      const newVotedStudentIds = [...votedStudentIds, studentId]
      setVotedStudentIds(newVotedStudentIds)
      localStorage.setItem("votedStudentIds", JSON.stringify(newVotedStudentIds))
    }

    toast("Vote Submitted!", {
      description: "Your vote has been successfully recorded. Ready for the next voter.",
    })

    resetForm()
  }

  // Get available register numbers (excluding already voted ones)
  const getAvailableRegisterNumbers = (dept: string) => {
    const allNumbers = registerNumbers[dept as keyof typeof registerNumbers] || []
    return allNumbers.filter((regNum) => !votedStudentIds.includes(regNum))
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Department</Label>
          <div className="flex space-x-2">
            {departments.map((dept) => (
              <Button
                key={dept.key}
                type="button"
                variant={selectedDepartment === dept.key ? "default" : "outline"}
                onClick={() => {
                  setSelectedDepartment(dept.key)
                  setSelectedRegisterNumber("")
                  setStudentId("")
                  setHasVoted(false)
                  setVotes({})
                }}
                disabled={hasVoted}
                className="flex-1"
              >
                {dept.key}
              </Button>
            ))}
          </div>
        </div>

        {selectedDepartment && (
          <div className="space-y-2">
            <Label htmlFor="registerNumber">Select Register Number</Label>
            <select
              id="registerNumber"
              value={selectedRegisterNumber}
              onChange={(e) => {
                const regNum = e.target.value
                setSelectedRegisterNumber(regNum)
                setStudentId(regNum)
                if (votedStudentIds.includes(regNum)) {
                  setHasVoted(true)
                  toast("Already Voted", {
                    description: "This register number has already cast a vote.",
                  })
                } else {
                  setHasVoted(false)
                }
              }}
              disabled={hasVoted}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Register Number</option>
              {getAvailableRegisterNumbers(selectedDepartment).map((regNum) => (
                <option key={regNum} value={regNum}>
                  {regNum}
                </option>
              ))}
            </select>
            {hasVoted && (
              <p className="text-sm text-red-500 dark:text-red-400">This register number has already cast a vote.</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Available: {getAvailableRegisterNumbers(selectedDepartment).length} /{" "}
              {registerNumbers[selectedDepartment as keyof typeof registerNumbers]?.length || 0}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="studentId">Your Student ID</Label>
          <Input
            id="studentId"
            placeholder="Type ID (e.g., S001, MCA005)"
            value={studentId}
            onChange={handleStudentIdChange}
            disabled={hasVoted || selectedRegisterNumber !== ""}
            className="uppercase"
          />
          {hasVoted && (
            <p className="text-sm text-red-500 dark:text-red-400">This student ID has already cast a vote.</p>
          )}
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmitVote} className="space-y-6">
        {positions.map((pos) => (
          <Card key={pos.key}>
            <CardHeader>
              <CardTitle>{pos.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                key={JSON.stringify(votes)} // Add key to force remount when votes change
                onValueChange={(value) => handleVoteChange(pos.key, value)}
                value={votes[pos.key]}
                disabled={hasVoted || !studentId || !selectedDepartment}
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
        <Button type="submit" className="w-full" disabled={hasVoted || !studentId || !selectedDepartment}>
          Submit Vote
        </Button>
      </form>
    </div>
  )
}
