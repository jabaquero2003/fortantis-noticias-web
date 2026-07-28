import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export interface CaseDevelopment {
  storyId: string
  editionId: number
  date: string
  stage: string
  summary: string
}

export interface ArbitrationCase {
  caseId: string
  officialNumber?: string
  name: string
  claimant?: string
  respondent?: string
  country: string
  forum?: string
  sector?: string
  currentStage: string
  developments: CaseDevelopment[]
  firstSeenEdition: number
  lastSeenEdition: number
  lastUpdated: string
}

const CASES_PATH = join(process.cwd(), 'data', 'cases.json')

export function loadCases(): ArbitrationCase[] {
  if (!existsSync(CASES_PATH)) return []
  try {
    const db = JSON.parse(readFileSync(CASES_PATH, 'utf-8')) as { cases: ArbitrationCase[] }
    return db.cases ?? []
  } catch {
    return []
  }
}

export function findCase(
  cases: ArbitrationCase[],
  caseId: string | undefined,
  officialNumber: string | undefined
): ArbitrationCase | undefined {
  if (!caseId && !officialNumber) return undefined
  return cases.find(
    (c) =>
      (caseId && c.caseId === caseId) ||
      (officialNumber && c.officialNumber === officialNumber)
  )
}

export function upsertCase(
  cases: ArbitrationCase[],
  incoming: {
    caseId: string
    officialNumber?: string
    name: string
    claimant?: string
    respondent?: string
    country: string
    forum?: string
    sector?: string
    currentStage: string
    development: CaseDevelopment
  },
  editionId: number
): ArbitrationCase[] {
  const now = new Date().toISOString()
  const existing = findCase(cases, incoming.caseId, incoming.officialNumber)

  if (existing) {
    const updated: ArbitrationCase = {
      ...existing,
      currentStage: incoming.currentStage,
      lastSeenEdition: editionId,
      lastUpdated: now,
      developments: [incoming.development, ...existing.developments].slice(0, 30),
    }
    return cases.map((c) => (c.caseId === existing.caseId ? updated : c))
  }

  const newCase: ArbitrationCase = {
    caseId: incoming.caseId,
    officialNumber: incoming.officialNumber,
    name: incoming.name,
    claimant: incoming.claimant,
    respondent: incoming.respondent,
    country: incoming.country,
    forum: incoming.forum,
    sector: incoming.sector,
    currentStage: incoming.currentStage,
    developments: [incoming.development],
    firstSeenEdition: editionId,
    lastSeenEdition: editionId,
    lastUpdated: now,
  }
  return [...cases, newCase]
}

export function saveCases(cases: ArbitrationCase[]): void {
  writeFileSync(CASES_PATH, JSON.stringify({ cases }, null, 2), 'utf-8')
}
