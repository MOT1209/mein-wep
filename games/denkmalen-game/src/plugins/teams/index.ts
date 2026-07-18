// ═══════════════════════════════════════════════════════════════════════════════
// Teams Plugin — Team vs Team gameplay
// ═══════════════════════════════════════════════════════════════════════════════

import { createPlugin } from '@/plugin-system/base'

export interface Team {
  id: string
  name: string
  color: string
  icon: string
  members: string[]
  score: number
  leader: string
}

let teams: Team[] = []

export default createPlugin(
  { id: 'teams', name: 'Teams', version: '1.0.0', description: 'Team vs Team mode', author: 'Sketch Battle Team' },
  (ctx) => ({
    onActivate: () => { teams = [] },
    onDeactivate: () => { teams = [] },
  })
)

export const createTeam = (name: string, color: string, icon: string): Team => {
  const team: Team = { id: `team_${Date.now()}`, name, color, icon, members: [], score: 0, leader: '' }
  teams.push(team)
  return team
}
export const joinTeam = (teamId: string, playerId: string): boolean => {
  const team = teams.find(t => t.id === teamId)
  if (!team) return false
  team.members.push(playerId)
  if (!team.leader) team.leader = playerId
  return true
}
export const getTeams = () => [...teams]
export const getTeamScore = (teamId: string): number => teams.find(t => t.id === teamId)?.score ?? 0
