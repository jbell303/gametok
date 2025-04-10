"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, RefreshCw, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Game {
  id: string
  title: string
  creator: string
  hashtags: string[]
  likes: number
  shares: number
  gameUrl: string
}

interface GameCardProps {
  game: Game
  isActive: boolean
}

export default function GameCard({ game, isActive }: GameCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(game.likes)
  const [shareCount, setShareCount] = useState(game.shares)
  const [isGameLoaded, setIsGameLoaded] = useState(false)
  const [isGamePaused, setIsGamePaused] = useState(!isActive)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Handle game pause/resume when card becomes active/inactive
  useEffect(() => {
    if (iframeRef.current && isGameLoaded) {
      if (isActive) {
        iframeRef.current.contentWindow?.postMessage("resume", "*")
        setIsGamePaused(false)
      } else {
        iframeRef.current.contentWindow?.postMessage("pause", "*")
        setIsGamePaused(true)
      }
    }
  }, [isActive, isGameLoaded])

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setLiked(!liked)
  }

  const handleReplay = () => {
    if (iframeRef.current) {
      // Create a clone of the iframe
      const parentNode = iframeRef.current.parentNode
      if (parentNode) {
        // Remove the current iframe
        const oldIframe = iframeRef.current
        // Create a new iframe with the same attributes
        const newIframe = document.createElement("iframe")
        newIframe.className = oldIframe.className
        newIframe.allow = oldIframe.allow
        newIframe.sandbox = oldIframe.sandbox
        newIframe.src = game.gameUrl
        newIframe.onload = () => setIsGameLoaded(true)

        // Replace the old iframe with the new one
        parentNode.replaceChild(newIframe, oldIframe)
        // Update the ref
        iframeRef.current = newIframe
      }
    }
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog
    setShareCount((prev) => prev + 1)

    if (navigator.share) {
      navigator
        .share({
          title: game.title,
          text: `Check out this awesome game: ${game.title}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.log("Error sharing:", err)
        })
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert("Game link copied to clipboard!")
    }
  }

  return (
    <div className="h-[100dvh] w-full relative flex items-center justify-center overflow-hidden">
      {/* Game container */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {/* Game iframe - always render but only show if active */}
        <div className="w-full h-[calc(100%-80px)] flex items-center justify-center">
          <iframe
            ref={iframeRef}
            src={game.gameUrl}
            className={`w-full h-full border-0 bg-white rounded-lg ${isActive ? "block" : "hidden"}`}
            onLoad={() => {
              setIsGameLoaded(true)
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            sandbox="allow-scripts allow-same-origin"
          />

          {/* Placeholder when game is not active */}
          {!isActive && (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
              <p className="text-gray-500">Game paused</p>
            </div>
          )}
        </div>

        {/* Game info overlay */}
        <div className="absolute bottom-[80px] left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
          <h2 className="text-2xl font-bold">{game.title}</h2>
          <p className="text-sm opacity-90">{game.creator}</p>
          <div className="flex gap-2 mt-1">
            {game.hashtags.map((tag) => (
              <span key={tag} className="text-xs opacity-80">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Interaction buttons - fixed at bottom with safe area padding */}
        <div className="absolute bottom-0 left-0 right-0 h-[80px] flex justify-center gap-8 px-4 items-center bg-gradient-to-t from-black/90 to-black/0 pb-safe">
          <button onClick={handleLike} className="flex flex-col items-center" aria-label="Like game">
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Heart
                className={cn("transition-colors", liked ? "fill-red-500 text-red-500" : "text-white")}
                size={24}
              />
            </div>
            <span className="text-white text-xs mt-1">{likeCount}</span>
          </button>

          <button onClick={handleReplay} className="flex flex-col items-center" aria-label="Replay game">
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <RefreshCw className="text-white" size={24} />
            </div>
            <span className="text-white text-xs mt-1">Replay</span>
          </button>

          <button onClick={handleShare} className="flex flex-col items-center" aria-label="Share game">
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Share2 className="text-white" size={24} />
            </div>
            <span className="text-white text-xs mt-1">{shareCount}</span>
          </button>
        </div>

        {/* Pause overlay - only show when game is loaded but paused */}
        {isActive && isGamePaused && isGameLoaded && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-xl font-bold">Game Paused</p>
              <p className="text-sm">Tap to continue playing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
