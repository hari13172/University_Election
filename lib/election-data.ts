import type { MetadataRoute } from "next"

export interface Candidate {
  id: string
  name: string
}

export interface CandidatesByPosition {
  president: Candidate[]
  vicePresident: Candidate[]
  secretary: Candidate[]
  jointSecretary: Candidate[]
  treasury: Candidate[]
}

export const candidates: CandidatesByPosition = {
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

export const positions = [
  { key: "president", title: "President" },
  { key: "vicePresident", title: "Vice-President" },
  { key: "secretary", title: "Secretary" },
  { key: "jointSecretary", title: "Joint-Secretary" },
  { key: "treasury", title: "Treasury" },
]

// Example sitemap generation (as per Next.js documentation [^1])
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://your-election-site.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://your-election-site.com/vote",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://your-election-site.com/results",
      lastModified: new Date(),
      changeFrequency: "hourly", // Results might update frequently during election
      priority: 0.9,
    },
  ]
}
