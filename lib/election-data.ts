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
    { id: "Dhanush D", name: "Dhanush D (MCA)" },
    { id: "Udhaya Boopathi V", name: "Udhaya Boopathi V (MSC)" },
    { id: "Shaik Aman", name: "Shaik Aman (MSC DS)" },
  ],
  vicePresident: [
    { id: "Soundharya I", name: "Soundharya I (MCA)" },
    { id: "Gowsalya E", name: "Gowsalya E (MSC)" },
    { id: "Thusita D", name: "Thusita D (MSC DS)" },
  ],
  secretary: [
    { id: "Vasunthara S", name: "Vasunthara S (MCA)" },
    { id: "Krithikasri D", name: "Krithikasri D (MSC)" },
    { id: "ArunKumar S", name: "ArunKumar S (MSC DS)" },
  ],
  jointSecretary: [
    { id: "Kayalvizhi N", name: "Kayalvizhi N (MCA)" },
    { id: "Sumathi M", name: "Sumathi M (MSC)" },
    { id: "Dhayanidhi P", name: "Dhayanidhi P (MSC DS)" },
  ],
  treasury: [
    { id: "Priyadharshini V", name: "Priyadharshini V (MCA)" },
    { id: "Sasidharan M", name: "Sasidharan M (MSC)" },
    { id: "Chandru D", name: "Chandru D (MSC DS)" },
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
