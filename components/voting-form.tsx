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
// import { useRouter } from "next/navigation" // Not used for this specific request, but kept for context if needed

export function VotingForm() {
  const [studentId, setStudentId] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [votedStudentIds, setVotedStudentIds] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedVotedIds = localStorage.getItem("votedStudentIds");
      if (storedVotedIds) {
        setVotedStudentIds(JSON.parse(storedVotedIds));
      }
    }
  }, []);

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value.trim().toUpperCase();
    setStudentId(id);
    if (votedStudentIds.includes(id)) {
      setHasVoted(true);
      toast("Already Voted", {
        description: "This student ID has already cast a vote.",
      });
    } else {
      setHasVoted(false);
    }
  };

  const handleVoteChange = (positionKey: string, candidateId: string) => {
    setVotes((prev) => ({ ...prev, [positionKey]: candidateId }));
  };

  const resetForm = useCallback(() => {
    setStudentId("");
    setVotes({});
    setHasVoted(false);
    if (formRef.current) {
      formRef.current.reset(); // Reset the form fields
    }
    document.getElementById("studentId")?.focus();
  }, []);

  const handleSubmitVote = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId) {
      toast("Missing Student ID", {
        description: "Please enter your student ID to vote.",
      });
      return;
    }

    if (hasVoted) {
      toast("Already Voted", {
        description: "This student ID has already cast a vote.",
      });
      return;
    }

    const allPositionsVoted = positions.every((pos) => votes[pos.key]);
    if (!allPositionsVoted) {
      toast("Incomplete Vote", {
        description: "Please select a candidate for all positions.",
      });
      return;
    }

    if (typeof window !== "undefined") {
      const storedVoteCounts = localStorage.getItem("electionVoteCounts");
      const currentVoteCounts: Record<string, number> = storedVoteCounts ? JSON.parse(storedVoteCounts) : {};

      const newVoteCounts = { ...currentVoteCounts };
      Object.values(votes).forEach((candidateId) => {
        newVoteCounts[candidateId] = (newVoteCounts[candidateId] || 0) + 1;
      });
      localStorage.setItem("electionVoteCounts", JSON.stringify(newVoteCounts));

      const newVotedStudentIds = [...votedStudentIds, studentId];
      setVotedStudentIds(newVotedStudentIds);
      localStorage.setItem("votedStudentIds", JSON.stringify(newVotedStudentIds));
    }

    toast("Vote Submitted!", {
      description: "Your vote has been successfully recorded. Ready for the next voter.",
    });

    resetForm();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="studentId">Your Student ID</Label>
        <Input
          id="studentId"
          placeholder="Type ID (e.g., S001, MCA005)"
          value={studentId}
          onChange={handleStudentIdChange}
          disabled={hasVoted}
          className="uppercase"
        />
        {hasVoted && <p className="text-sm text-red-500 dark:text-red-400">This student ID has already cast a vote.</p>}
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
                disabled={hasVoted || !studentId}
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
        <Button type="submit" className="w-full" disabled={hasVoted || !studentId}>
          Submit Vote
        </Button>
      </form>
    </div>
  );
}
