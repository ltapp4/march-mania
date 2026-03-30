const OWNER_COLOR_PALETTE = [
  '#ff8a65',
  '#4fc3f7',
  '#81c784',
  '#ffd54f',
  '#ba68c8',
  '#4db6ac',
  '#f06292',
  '#9575cd',
  '#64b5f6',
  '#ffb74d',
  '#aed581',
  '#e57373',
]

const TEAM_NAME_ALIASES = {
  liu: 'longisland',
  longislanduniversity: 'longisland',
  stjohnsny: 'stjohns',
  stjohnsnewyork: 'stjohns',
  southfla: 'southflorida',
  prairieview: 'prairieviewaandm',
  uni: 'northerniowa',
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const UPDATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const GAME_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const GAME_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export const PAYOUT_RULES = {
  entryFeePerTeam: 7,
  championshipPotPerTeam: 2,
  winValue: 5,
  finalFourLossBonus: 7,
  runnerUpBonus: 14,
  championBonus: 100,
}

export function resolveTournamentOptions() {
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null

  const yearFromQuery = Number(searchParams?.get('year'))
  const pollMsFromQuery = Number(searchParams?.get('pollMs'))

  return {
    year:
      Number.isFinite(yearFromQuery) && yearFromQuery > 0
        ? yearFromQuery
        : Number(import.meta.env.VITE_MARCH_MADNESS_YEAR) ||
          new Date().getFullYear(),
    sport: import.meta.env.VITE_MARCH_MADNESS_SPORT || 'basketball-men',
    division: import.meta.env.VITE_MARCH_MADNESS_DIVISION || 'd1',
    apiBase: import.meta.env.VITE_MARCH_MADNESS_API_BASE || '/api/ncaa',
    pollMs:
      Number.isFinite(pollMsFromQuery) && pollMsFromQuery > 0
        ? pollMsFromQuery
        : Number(import.meta.env.VITE_MARCH_MADNESS_POLL_MS) || 10_000,
  }
}

export function formatMoney(value = 0) {
  return CURRENCY_FORMATTER.format(value)
}

export function formatUpdatedAt(value) {
  if (!value) {
    return 'Waiting for update'
  }

  return UPDATE_TIME_FORMATTER.format(new Date(value))
}

export function formatGameStatus(game) {
  if (game.isFinal) {
    return game.finalMessage || 'Final'
  }

  if (game.isLive) {
    return [game.currentPeriod || 'Live', game.contestClock]
      .filter(Boolean)
      .join(' • ')
  }

  const tipoffDate = getGameDate(game)

  if (!tipoffDate) {
    return 'TBD'
  }

  if (!game.hasStartTime || !game.startTime || game.startTime === 'TBA') {
    return `${GAME_DATE_FORMATTER.format(tipoffDate)} • TBD`
  }

  return GAME_DATE_TIME_FORMATTER.format(tipoffDate)
}

export function normalizeTeamName(name = '') {
  const normalized = `${name}`
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/\bsaint\b/g, 'st')
    .replace(/\bstate\b/g, 'st')
    .replace(/\buniversity\b/g, '')
    .replace(/\bcollege\b/g, '')
    .replace(/\bthe\b/g, '')
    .replace(/\bof\b/g, '')
    .replace(/[^a-z0-9]/g, '')

  return TEAM_NAME_ALIASES[normalized] || normalized
}

export function buildTournamentSnapshot(championship, ownersByName) {
  const ownerDirectory = createOwnerDirectory(ownersByName)
  const roundLookup = new Map(
    championship.rounds.map((round) => [
      round.roundNumber,
      {
        roundNumber: round.roundNumber,
        title: decodeBracketText(round.title),
        label: decodeBracketText(round.label),
        subtitle: round.subtitle,
      },
    ])
  )

  const regionLookup = new Map(
    championship.regions.map((region) => [
      region.sectionId,
      {
        sectionId: region.sectionId,
        title: decodeBracketText(region.title),
        abbreviation: decodeBracketText(region.abbreviation),
        subtitle: decodeBracketText(region.subtitle),
        regionCode: region.regionCode,
      },
    ])
  )

  const games = championship.games
    .map((game) => hydrateGame(game, ownerDirectory.teamOwnerMap))
    .sort((left, right) => left.bracketPositionId - right.bracketPositionId)

  const firstFourGames = games.filter((game) => game.sectionId === 1)
  const finalGames = games.filter((game) => game.sectionId === 6)

  const regions = championship.regions
    .filter((region) => !['TT', 'CC'].includes(region.regionCode))
    .map((region) => {
      const sectionGames = games.filter((game) => game.sectionId === region.sectionId)

      return {
        ...regionLookup.get(region.sectionId),
        rounds: groupGamesByRound(sectionGames, roundLookup),
      }
    })
    .sort(
      (left, right) =>
        getRegionOrder(left.regionCode) - getRegionOrder(right.regionCode)
    )

  const standings = calculateOwnerStandings(
    ownerDirectory.owners,
    games,
    ownerDirectory.ownedTeams
  )

  return {
    title: decodeBracketText(championship.title),
    year: championship.year,
    gameCount: games.length,
    completedGameCount: games.filter((game) => game.isFinal).length,
    liveGameCount: games.filter((game) => game.isLive).length,
    firstFour: {
      title: roundLookup.get(1)?.title || 'First Four',
      label: roundLookup.get(1)?.label || 'DAYTON',
      subtitle: roundLookup.get(1)?.subtitle || '',
      games: firstFourGames,
    },
    finals: {
      semifinalLabel: roundLookup.get(6)?.title || 'Final Four',
      semifinalSubtitle: roundLookup.get(6)?.subtitle || '',
      championshipLabel: roundLookup.get(7)?.title || 'Championship',
      championshipSubtitle: roundLookup.get(7)?.subtitle || '',
      semifinals: finalGames
        .filter((game) => game.roundNumber === 6)
        .sort((left, right) => left.bracketPositionId - right.bracketPositionId),
      championship:
        finalGames.find((game) => game.roundNumber === 7) || null,
    },
    regions,
    standings,
    unmatchedTeams: standings.flatMap((owner) =>
      owner.missingTeams.map((team) => ({
        owner: owner.name,
        team,
      }))
    ),
    statistics: {
      ownerCount: ownerDirectory.owners.length,
      teamsBought: ownerDirectory.ownedTeams.length,
      championshipPot:
        ownerDirectory.ownedTeams.length * PAYOUT_RULES.championshipPotPerTeam,
    },
  }
}

function createOwnerDirectory(ownersByName) {
  const owners = Object.entries(ownersByName).map(([name, teams]) => ({
    name,
    color: colorFromName(name),
    teams,
    teamKeys: teams.map(normalizeTeamName),
  }))

  const teamOwnerMap = new Map()
  const ownedTeams = []

  owners.forEach((owner) => {
    owner.teams.forEach((teamName) => {
      const teamKey = normalizeTeamName(teamName)
      ownedTeams.push(teamKey)

      if (!teamOwnerMap.has(teamKey)) {
        teamOwnerMap.set(teamKey, {
          name: owner.name,
          color: owner.color,
        })
      }
    })
  })

  return {
    owners,
    teamOwnerMap,
    ownedTeams,
  }
}

function calculateOwnerStandings(owners, games) {
  const winsByTeam = new Map()
  const lossesByTeam = new Set()
  const bonusByTeam = new Map()
  const teamsInBracket = new Set()

  games.forEach((game) => {
    game.teams.forEach((team) => {
      if (!team.isPlaceholder && team.teamKey) {
        teamsInBracket.add(team.teamKey)
      }
    })

    if (!game.isFinal) {
      return
    }

    const winner = game.teams.find(
      (team) => team.isWinner && !team.isPlaceholder && team.teamKey
    )
    const loser = game.teams.find(
      (team) => !team.isWinner && !team.isPlaceholder && team.teamKey
    )

    // First Four games are displayed in the bracket, but they do not count as
    // paid wins in the pool totals.
    if (winner?.teamKey && game.sectionId !== 1) {
      winsByTeam.set(winner.teamKey, (winsByTeam.get(winner.teamKey) || 0) + 1)
    }

    if (loser?.teamKey) {
      lossesByTeam.add(loser.teamKey)
    }

    if (game.roundNumber === 6 && loser?.teamKey) {
      addMoney(bonusByTeam, loser.teamKey, PAYOUT_RULES.finalFourLossBonus)
    }

    if (game.roundNumber === 7) {
      if (winner?.teamKey) {
        addMoney(bonusByTeam, winner.teamKey, PAYOUT_RULES.championBonus)
      }

      if (loser?.teamKey) {
        addMoney(bonusByTeam, loser.teamKey, PAYOUT_RULES.runnerUpBonus)
      }
    }
  })

  return owners
    .map((owner) => {
      const matchedTeams = owner.teamKeys.filter((teamKey) =>
        teamsInBracket.has(teamKey)
      )
      const missingTeams = owner.teams.filter(
        (_, index) => !teamsInBracket.has(owner.teamKeys[index])
      )
      const wins = owner.teamKeys.reduce(
        (total, teamKey) => total + (winsByTeam.get(teamKey) || 0),
        0
      )
      const bonusMoney = owner.teamKeys.reduce(
        (total, teamKey) => total + (bonusByTeam.get(teamKey) || 0),
        0
      )
      const aliveTeams = matchedTeams.filter((teamKey) => !lossesByTeam.has(teamKey))
        .length
      const teamsBought = owner.teams.length
      const entryFees = teamsBought * PAYOUT_RULES.entryFeePerTeam
      const potContribution =
        teamsBought * PAYOUT_RULES.championshipPotPerTeam
      const winMoney = wins * PAYOUT_RULES.winValue
      const winnings = winMoney + bonusMoney
      const net = winnings - entryFees

      return {
        name: owner.name,
        color: owner.color,
        teamsBought,
        aliveTeams,
        wins,
        winMoney,
        winnings,
        bonusMoney,
        entryFees,
        potContribution,
        net,
        missingTeams,
      }
    })
    .sort((left, right) => {
      if (right.net !== left.net) {
        return right.net - left.net
      }

      if (right.winnings !== left.winnings) {
        return right.winnings - left.winnings
      }

      if (right.aliveTeams !== left.aliveTeams) {
        return right.aliveTeams - left.aliveTeams
      }

      return left.name.localeCompare(right.name)
    })
}

function groupGamesByRound(games, roundLookup) {
  const groups = new Map()

  games.forEach((game) => {
    const roundNumber = game.roundNumber
    const roundMeta = roundLookup.get(roundNumber) || {
      roundNumber,
      title: `Round ${roundNumber}`,
      label: `Round ${roundNumber}`,
      subtitle: '',
    }

    if (!groups.has(roundNumber)) {
      groups.set(roundNumber, {
        ...roundMeta,
        games: [],
      })
    }

    groups.get(roundNumber).games.push(game)
  })

  return [...groups.values()]
    .map((group) => ({
      ...group,
      games: group.games.sort(
        (left, right) => left.bracketPositionId - right.bracketPositionId
      ),
    }))
    .sort((left, right) => left.roundNumber - right.roundNumber)
}

function hydrateGame(rawGame, teamOwnerMap) {
  const teams = [
    createGameSlot({
      isTopSlot: true,
      rawTeam: rawGame.teams.find((team) => team.isTop),
      rawGame,
      teamOwnerMap,
    }),
    createGameSlot({
      isTopSlot: false,
      rawTeam: rawGame.teams.find((team) => !team.isTop),
      rawGame,
      teamOwnerMap,
    }),
  ].filter(Boolean)

  const visibleScores = teams
    .map((team) => team.score)
    .filter((score) => typeof score === 'number')
  const highScore =
    visibleScores.length > 0 ? Math.max(...visibleScores) : Number.NEGATIVE_INFINITY
  const leaderCount = visibleScores.filter((score) => score === highScore).length

  teams.forEach((team) => {
    team.isLeading =
      rawGame.gameState === 'I' &&
      typeof team.score === 'number' &&
      team.score === highScore &&
      leaderCount === 1
  })

  return {
    contestId: rawGame.contestId,
    bracketPositionId: rawGame.bracketPositionId,
    victorBracketPositionId: rawGame.victorBracketPositionId,
    sectionId: rawGame.sectionId,
    roundNumber: inferRoundNumber(rawGame.bracketPositionId),
    title: rawGame.title,
    contestClock: rawGame.contestClock,
    currentPeriod: rawGame.currentPeriod,
    finalMessage: rawGame.finalMessage,
    hasStartTime: rawGame.hasStartTime,
    startDate: rawGame.startDate,
    startTime: rawGame.startTime,
    startTimeEpoch: rawGame.startTimeEpoch,
    gameState: rawGame.gameState,
    isFinal: rawGame.gameState === 'F',
    isLive: rawGame.gameState === 'I',
    isPending: rawGame.gameState === 'P',
    broadcaster: rawGame.broadcaster?.name || '',
    teams,
  }
}

function createGameSlot({ isTopSlot, rawTeam, rawGame, teamOwnerMap }) {
  const isVisible = isTopSlot ? rawGame.isTopVisible : rawGame.isBottomVisible

  if (!isVisible) {
    return null
  }

  if (!rawTeam) {
    return {
      slot: isTopSlot ? 'top' : 'bottom',
      displayName: 'TBD',
      fullName: '',
      teamKey: '',
      seed: null,
      score: null,
      isWinner: false,
      isPlaceholder: true,
      owner: null,
      logoUrl: '',
      isLeading: false,
    }
  }

  const displayName = rawTeam.textOverride || rawTeam.nameShort || rawTeam.nameFull
  const teamKey =
    normalizeTeamName(rawTeam.nameShort) || normalizeTeamName(rawTeam.nameFull)
  const owner =
    teamOwnerMap.get(teamKey) ||
    teamOwnerMap.get(normalizeTeamName(rawTeam.nameFull)) ||
    null

  return {
    slot: isTopSlot ? 'top' : 'bottom',
    displayName,
    fullName: rawTeam.nameFull || '',
    teamKey,
    seed: Number.isFinite(rawTeam.seed) ? rawTeam.seed : null,
    score: typeof rawTeam.score === 'number' ? rawTeam.score : null,
    isWinner: Boolean(rawTeam.isWinner),
    isPlaceholder: false,
    owner,
    logoUrl: rawTeam.logoUrl ? `https://www.ncaa.com${rawTeam.logoUrl}` : '',
    isLeading: false,
  }
}

function inferRoundNumber(bracketPositionId) {
  const bracketTier = Math.floor(Number(bracketPositionId) / 100)

  if (bracketTier <= 1) {
    return 1
  }

  if (bracketTier >= 7) {
    return 7
  }

  return bracketTier
}

function colorFromName(name) {
  let hash = 0

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(index)
    hash |= 0
  }

  return OWNER_COLOR_PALETTE[Math.abs(hash) % OWNER_COLOR_PALETTE.length]
}

function addMoney(targetMap, key, amount) {
  targetMap.set(key, (targetMap.get(key) || 0) + amount)
}

function decodeBracketText(value = '') {
  return `${value}`.replace(/&#174;/g, '').trim()
}

function getGameDate(game) {
  if (game.startTimeEpoch) {
    return new Date(game.startTimeEpoch * 1000)
  }

  if (!game.startDate) {
    return null
  }

  const [month, day, year] = game.startDate.split('/')

  if (!month || !day || !year) {
    return null
  }

  return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00`)
}

function getRegionOrder(regionCode) {
  return ['TL', 'TR', 'BL', 'BR'].indexOf(regionCode)
}
