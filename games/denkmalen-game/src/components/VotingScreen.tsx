'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, calculateScore } from '@/store/gameStore'
import { t } from '@/lib/i18n'
import { useGame } from '@/components/GameProvider'
import { useSocket } from '@/components/SocketProvider'
import { FaVoteYea, FaCheck, FaStar, FaTrophy, FaEye } from 'react-icons/fa'

export function VotingScreen() {
  const { mode, drawings, votes, hasVoted, currentPlayer, players, addVote, setPhase, updatePlayerScore, gameType, currentLetter, creativePrompt, settings } = useGameStore()
  const { playSound, vibrate } = useGame()
  const { submitVote: socketSubmitVote } = useSocket()

  const isOnline = mode === 'online'

  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null)
  // Offline pass-and-play: players vote one after another on the same device
  const [voterIndex, setVoterIndex] = useState(0)
  const [showPassOverlay, setShowPassOverlay] = useState(!isOnline)

  // Whoever is holding the device right now
  const voter = isOnline ? currentPlayer : (players[voterIndex] || null)

  // Check if the active voter has voted
  const hasVoterVoted = voter ? (hasVoted[voter.id]?.length ?? 0) > 0 : false

  // Get unique voters
  const votedPlayers = Object.keys(hasVoted)
  const allPlayersVoted = votedPlayers.length >= players.length

  const handleVote = (drawingId: string) => {
    if (!voter || hasVoterVoted) return

    // Can't vote for own drawing
    const drawing = drawings.find(d => d.id === drawingId)
    if (drawing?.playerId === voter.id) {
      playSound('error')
      vibrate([100, 50, 100])
      return
    }

    playSound('vote')
    vibrate()

    setSelectedDrawing(drawingId)
  }

  const handleSubmitVote = () => {
    if (!voter || !selectedDrawing) return

    if (isOnline) {
      socketSubmitVote({ drawingId: selectedDrawing, rank: 1 })
      playSound('success')
      return
    }

    addVote({
      voterId: voter.id,
      drawingId: selectedDrawing,
      rank: votes.filter(v => v.drawingId === selectedDrawing).length + 1,
    })
    playSound('success')
    setSelectedDrawing(null)

    // Hand the device to the next voter, if any
    if (voterIndex + 1 < players.length) {
      setVoterIndex(voterIndex + 1)
      setShowPassOverlay(true)
    }
  }

  const handleNext = () => {
    // Online mode: the server computes and broadcasts results (round-results),
    // which flips the phase to 'results' on its own — nothing to do here.
    if (isOnline) return

    if (allPlayersVoted) {
      // Calculate scores
      const drawingVotes: Record<string, number> = {}
      votes.forEach(vote => {
        drawingVotes[vote.drawingId] = (drawingVotes[vote.drawingId] || 0) + 1
      })

      // Sort by votes
      const sorted = Object.entries(drawingVotes)
        .sort(([, a], [, b]) => b - a)
        .map(([id, voteCount], index) => ({
          id,
          votes: voteCount,
          rank: index + 1,
        }))

      // Assign scores
      sorted.forEach(({ id, rank }) => {
        const drawing = drawings.find(d => d.id === id)
        if (drawing) {
          const score = calculateScore(rank)
          updatePlayerScore(drawing.playerId, score)
        }
      })

      setPhase('results')
      playSound('winner')
      vibrate([100, 50, 100, 50, 200])
    }
  }

  const isOwnDrawing = (drawingId: string) => {
    const drawing = drawings.find(d => d.id === drawingId)
    return drawing?.playerId === voter?.id
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-4 relative"
    >
      {/* Pass-device overlay (offline): hides ballots between voters */}
      <AnimatePresence>
        {!isOnline && showPassOverlay && !allPlayersVoted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center p-8 z-30 select-none"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-6">🗳️</div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {voter?.name}&apos;s turn to vote!
              </h2>
              <p className="text-slate-300 mb-8 text-lg">
                {t('draw.passDevice', settings.language)} {voter?.name}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playSound('click'); vibrate(); setShowPassOverlay(false) }}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500
                           text-white font-bold text-xl rounded-2xl shadow-lg"
              >
                <FaEye className="inline mr-2" />
                {t('vote.startVoting', settings.language)}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500
                     text-white rounded-full shadow-lg"
        >
          <FaVoteYea className="text-xl" />
          <span className="font-bold text-lg">{t('vote.title', settings.language)}!</span>
        </motion.div>
        <p className="text-slate-600 dark:text-slate-400 mt-3">
          {allPlayersVoted
            ? t('vote.allVotesIn', settings.language)
            : hasVoterVoted
              ? `${t('vote.waiting', settings.language)} (${votedPlayers.length}/${players.length})`
              : gameType === 'letter'
                ? `${voter ? voter.name + ', ' : ''}${t('vote.voteFor', settings.language)} "${currentLetter}"!`
                : gameType === 'creative'
                  ? `${voter ? voter.name + ', ' : ''}${t('vote.voteForCreative', settings.language)}`
                  : `${voter ? voter.name + ' — ' : ''}${t('vote.tapFavorite', settings.language)}`
          }
        </p>
      </div>

      {/* Drawings Grid */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full">
        {drawings.map((drawing, index) => {
          const isOwn = isOwnDrawing(drawing.id)
          const isSelected = selectedDrawing === drawing.id
          const voteCount = votes.filter(v => v.drawingId === drawing.id).length

          return (
            <motion.div
              key={drawing.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !isOwn && !hasVoterVoted && handleVote(drawing.id)}
              className={`relative rounded-2xl overflow-hidden shadow-lg transition-all ${
                isOwn
                  ? 'opacity-50 cursor-not-allowed'
                  : hasVoterVoted
                    ? 'cursor-default'
                    : 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]'
              } ${isSelected ? 'ring-4 ring-primary-500' : ''}`}
            >
              {/* Drawing Image */}
              <div className="aspect-square bg-white">
                <img
                  src={drawing.canvasData}
                  alt={`Drawing by anonymous player`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-white text-sm">
                    <span>
                      {gameType === 'letter'
                        ? `Letter: ${currentLetter}`
                        : gameType === 'creative'
                          ? '🎨 Creative Challenge'
                          : drawing.word}
                    </span>
                  </div>
                  {isOwn && (
                    <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
                      {t('vote.yourDrawing', settings.language)}
                    </span>
                  )}
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-10 h-10 bg-primary-500 rounded-full
                             flex items-center justify-center text-white shadow-lg"
                >
                  <FaCheck className="text-lg" />
                </motion.div>
              )}

              {/* Vote Count (revealed once everyone has voted, so later
                  voters aren't biased by earlier ballots) */}
              {allPlayersVoted && voteCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-white
                             rounded-full font-bold flex items-center gap-1"
                >
                  <FaStar className="text-sm" />
                  {voteCount}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Submit Vote Button */}
      <div className="mt-6 flex justify-center">
        {!hasVoterVoted && !allPlayersVoted ? (
          <motion.button
            whileHover={{ scale: selectedDrawing ? 1.05 : 1 }}
            whileTap={{ scale: selectedDrawing ? 0.95 : 1 }}
            onClick={handleSubmitVote}
            disabled={!selectedDrawing}
            className={`px-8 py-4 rounded-2xl font-bold text-xl flex items-center gap-3 transition-all ${
              selectedDrawing
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <FaVoteYea />
            {t('vote.submit', settings.language)}
          </motion.button>
        ) : allPlayersVoted && isOnline ? (
          <div className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                          rounded-2xl font-bold text-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {t('vote.calculating', settings.language)}
          </div>
        ) : allPlayersVoted ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500
                       text-white font-bold text-xl rounded-2xl shadow-lg
                       flex items-center gap-3"
          >
            <FaTrophy />
            {t('vote.seeResults', settings.language)}
          </motion.button>
        ) : (
          <div className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                          rounded-2xl font-bold text-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {t('vote.waiting', settings.language)}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mt-4 max-w-md mx-auto w-full">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
          <span>{t('vote.votesCollected', settings.language)}</span>
          <span>{votedPlayers.length} / {players.length}</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(votedPlayers.length / players.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
          />
        </div>
      </div>
    </motion.div>
  )
}
