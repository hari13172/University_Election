"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { candidates, positions, type CandidatesByPosition } from "@/lib/election-data"
import { toast } from "sonner"
import { Users, Vote, TrendingUp, Download, RefreshCw, BarChart3 } from "lucide-react"

const departments = [
  { key: "MCA", name: "Master of Computer Applications", total: 30 },
  { key: "MSC", name: "Master of Science", total: 44 },
  { key: "DS", name: "Data Science", total: 42 },
]

const registerNumbers = {
  MCA: Array.from({ length: 30 }, (_, i) => `U24PG507CAP${String(i + 1).padStart(2, "0")}`),
  MSC: Array.from({ length: 44 }, (_, i) => `U24PG507CSC${String(i + 1).padStart(2, "0")}`),
  DS: Array.from({ length: 42 }, (_, i) => `U24PG507DS${String(i + 1).padStart(2, "0")}`),
}

export function AdminDashboard() {
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})
  const [deptVoteCounts, setDeptVoteCounts] = useState<Record<string, Record<string, number>>>({})
  const [votedStudentIds, setVotedStudentIds] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const loadData = () => {
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

      const storedDeptVoteCounts = localStorage.getItem("electionDeptVoteCounts")
      if (storedDeptVoteCounts) {
        setDeptVoteCounts(JSON.parse(storedDeptVoteCounts))
      } else {
        // Initialize department vote counts if not present
        const initialDeptCounts: Record<string, Record<string, number>> = {}
        Object.values(candidates).forEach((posCandidates) => {
          posCandidates.forEach((candidate:any) => {
            initialDeptCounts[candidate.id] = { MCA: 0, MSC: 0, DS: 0 }
          })
        })
        setDeptVoteCounts(initialDeptCounts)
      }

      setLastUpdated(new Date())
    }
  }

  useEffect(() => {
    loadData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate department-wise statistics
  const getDepartmentStats = () => {
    const stats = departments.map((dept) => {
      const deptRegNumbers = registerNumbers[dept.key as keyof typeof registerNumbers]
      const votedInDept = votedStudentIds.filter((id) => deptRegNumbers.includes(id))
      const turnoutPercentage = (votedInDept.length / dept.total) * 100

      return {
        ...dept,
        voted: votedInDept.length,
        remaining: dept.total - votedInDept.length,
        turnoutPercentage,
        votedIds: votedInDept,
      }
    })
    return stats
  }

  // Calculate overall statistics
  const getOverallStats = () => {
    const totalStudents = departments.reduce((sum, dept) => sum + dept.total, 0)
    const totalVoted = votedStudentIds.length
    const totalRemaining = totalStudents - totalVoted
    const overallTurnout = (totalVoted / totalStudents) * 100

    return {
      totalStudents,
      totalVoted,
      totalRemaining,
      overallTurnout,
    }
  }

  // Get candidate results with actual department breakdown
  const getCandidateResults = () => {
    return positions.map((pos) => {
      const positionCandidates = candidates[pos.key as keyof CandidatesByPosition]
      const candidateResults = positionCandidates.map((candidate) => {
        const totalVotes = voteCounts[candidate.id] || 0
        const deptBreakdown = deptVoteCounts[candidate.id] || { MCA: 0, MSC: 0, DS: 0 }

        return {
          ...candidate,
          totalVotes,
          deptBreakdown: [
            { department: "MCA", votes: deptBreakdown.MCA || 0 },
            { department: "MSC", votes: deptBreakdown.MSC || 0 },
            { department: "DS", votes: deptBreakdown.DS || 0 },
          ],
        }
      })

      // Sort by vote count
      candidateResults.sort((a, b) => b.totalVotes - a.totalVotes)

      return {
        ...pos,
        candidates: candidateResults,
        totalVotes: candidateResults.reduce((sum, c) => sum + c.totalVotes, 0),
      }
    })
  }

  const exportDetailedReport = () => {
    const overallStats = getOverallStats()
    const deptStats = getDepartmentStats()
    const candidateResults = getCandidateResults()

    let csvContent = "COLLEGE ELECTION DETAILED REPORT\n"
    csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`

    // Overall Statistics
    csvContent += "OVERALL STATISTICS\n"
    csvContent += `Total Students,${overallStats.totalStudents}\n`
    csvContent += `Total Voted,${overallStats.totalVoted}\n`
    csvContent += `Total Remaining,${overallStats.totalRemaining}\n`
    csvContent += `Overall Turnout,${overallStats.overallTurnout.toFixed(2)}%\n\n`

    // Department-wise Statistics
    csvContent += "DEPARTMENT-WISE STATISTICS\n"
    csvContent += "Department,Total Students,Voted,Remaining,Turnout %\n"
    deptStats.forEach((dept) => {
      csvContent += `${dept.key},${dept.total},${dept.voted},${dept.remaining},${dept.turnoutPercentage.toFixed(2)}%\n`
    })
    csvContent += "\n"

    // Position-wise Results
    candidateResults.forEach((position) => {
      csvContent += `${position.title.toUpperCase()} RESULTS\n`
      csvContent += "Candidate,Total Votes,MCA Votes,MSC Votes,DS Votes\n"
      position.candidates.forEach((candidate) => {
        const mcaVotes = candidate.deptBreakdown.find((d) => d.department === "MCA")?.votes || 0
        const mscVotes = candidate.deptBreakdown.find((d) => d.department === "MSC")?.votes || 0
        const dsVotes = candidate.deptBreakdown.find((d) => d.department === "DS")?.votes || 0
        csvContent += `"${candidate.name}",${candidate.totalVotes},${mcaVotes},${mscVotes},${dsVotes}\n`
      })
      csvContent += "\n"
    })

    // Voted Student IDs by Department
    csvContent += "VOTED STUDENT IDs BY DEPARTMENT\n"
    deptStats.forEach((dept) => {
      csvContent += `\n${dept.key} Department (${dept.voted}/${dept.total})\n`
      dept.votedIds.forEach((id) => {
        csvContent += `${id}\n`
      })
    })

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `election_admin_report_${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast("Export Successful", {
          description: "Detailed election report exported successfully",
        })
      }
    } catch (error) {
      console.error("Error during CSV export:", error)
      toast("Export Error", {
        description: "An error occurred during export. Please try again.",
      })
    }
  }

  const overallStats = getOverallStats()
  const deptStats = getDepartmentStats()
  const candidateResults = getCandidateResults()

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Last Updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportDetailedReport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Voted</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.totalVoted}</div>
            <p className="text-xs text-muted-foreground">Votes cast</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overallStats.totalRemaining}</div>
            <p className="text-xs text-muted-foreground">Yet to vote</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnout</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{overallStats.overallTurnout.toFixed(1)}%</div>
            <Progress value={overallStats.overallTurnout} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Department-wise Voting Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deptStats.map((dept) => (
              <div key={dept.key} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{dept.key}</h3>
                  <Badge
                    variant={
                      dept.turnoutPercentage > 70
                        ? "default"
                        : dept.turnoutPercentage > 50
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {dept.turnoutPercentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Voted:</span>
                    <span className="font-medium text-green-600">
                      {dept.voted}/{dept.total}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining:</span>
                    <span className="font-medium text-orange-600">{dept.remaining}</span>
                  </div>
                  <Progress value={dept.turnoutPercentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Position-wise Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {candidateResults.map((position) => (
          <Card key={position.key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {position.title}
                <Badge variant="outline">{position.totalVotes} votes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {position.candidates.map((candidate, index) => {
                  const percentage = position.totalVotes > 0 ? (candidate.totalVotes / position.totalVotes) * 100 : 0
                  return (
                    <div key={candidate.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Badge variant={index === 0 ? "default" : "secondary"}>#{index + 1}</Badge>
                          <span className="font-medium">{candidate.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{candidate.totalVotes}</div>
                          <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>MCA: {candidate.deptBreakdown.find((d) => d.department === "MCA")?.votes || 0}</span>
                        <span>MSC: {candidate.deptBreakdown.find((d) => d.department === "MSC")?.votes || 0}</span>
                        <span>DS: {candidate.deptBreakdown.find((d) => d.department === "DS")?.votes || 0}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
