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
    { id: "Dhanush D", name: "Dhanush D" },
    { id: "Udhaya Boopathi V", name: "Udhaya Boopathi V" },
    { id: "Shaik Aman", name: "Shaik Aman" },
  ],
  vicePresident: [
    { id: "Soundharya I", name: "Soundharya I" },
    { id: "Gowsalya E", name: "Gowsalya E" },
    { id: "Thusita D", name: "Thusita D" },
  ],
  secretary: [
    { id: "Vasunthara S", name: "Vasunthara S" },
    { id: "Krithikasri D", name: "Krithikasri D" },
    { id: "ArunKumar S", name: "ArunKumar S" },
  ],
  jointSecretary: [
    { id: "Kayalvizhi N", name: "Kayalvizhi N" },
    { id: "Sumathi M", name: "Sumathi M" },
    { id: "Dhayanidhi P", name: "Dhayanidhi P" },
  ],
  treasury: [
    { id: "Priyadharshini V", name: "Priyadharshini V" },
    { id: "Sasidharan M", name: "Sasidharan M" },
    { id: "Chandru D", name: "Chandru D" },
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
