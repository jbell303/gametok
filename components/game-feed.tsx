"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import GameCard from "@/components/game-card"
import { ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

// Sample game data
const GAMES = [
  {
    id: "flappy-bird",
    title: "Flappy Bird Clone",
    creator: "@creatorhandle",
    hashtags: ["#arcade", "#casual"],
    likes: 1243,
    shares: 89,
    gameUrl: "/games/flappy-bird.html",
  },
  {
    id: "snake",
    title: "Snake Classic",
    creator: "@pixelgames",
    hashtags: ["#retro", "#classic"],
    likes: 876,
    shares: 45,
    gameUrl: "/games/snake.html",
  },
  {
    id: "breakout",
    title: "Breakout",
    creator: "@retrodev",
    hashtags: ["#puzzle", "#retro"],
    likes: 2134,
    shares: 156,
    gameUrl: "/games/breakout.html",
  },
]

export default function GameFeed() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const feedRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  useEffect(() => {
    // Hide scroll indicator after 5 seconds
    const timer = setTimeout(() => {
      setShowScrollIndicator(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isSwipe = Math.abs(distance) > minSwipeDistance

    if (isSwipe) {
      // Swiping up
      if (distance > 0 && currentIndex < GAMES.length - 1) {
        setIsScrolling(true)
        setCurrentIndex((prevIndex) => prevIndex + 1)
        setTimeout(() => setIsScrolling(false), 500)
      }
      // Swiping down
      else if (distance < 0 && currentIndex > 0) {
        setIsScrolling(true)
        setCurrentIndex((prevIndex) => prevIndex - 1)
        setTimeout(() => setIsScrolling(false), 500)
      }
    }

    // Reset values
    setTouchStart(0)
    setTouchEnd(0)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (isScrolling) return

    // Scrolling down (positive deltaY)
    if (e.deltaY > 0 && currentIndex < GAMES.length - 1) {
      setIsScrolling(true)
      setCurrentIndex((prevIndex) => prevIndex + 1)
      setTimeout(() => setIsScrolling(false), 500)
    }
    // Scrolling up (negative deltaY)
    else if (e.deltaY < 0 && currentIndex > 0) {
      setIsScrolling(true)
      setCurrentIndex((prevIndex) => prevIndex - 1)
      setTimeout(() => setIsScrolling(false), 500)
    }
  }

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.style.transform = `translateY(-${currentIndex * 100}dvh)`
    }
  }, [currentIndex])

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <div
        ref={feedRef}
        className="transition-transform duration-500 ease-in-out"
        style={{ height: `${GAMES.length * 100}dvh` }}
      >
        {GAMES.map((game, index) => (
          <GameCard key={game.id} game={game} isActive={index === currentIndex && !isScrolling} />
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        className={cn(
          "fixed bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center text-white transition-opacity duration-500 z-10",
          showScrollIndicator ? "opacity-70" : "opacity-0",
        )}
      >
        <ChevronUp className="animate-bounce" size={24} />
        <p className="text-xs">Swipe up for more games</p>
      </div>
    </div>
  )
}
