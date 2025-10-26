"use client";

import React, { useState, useEffect, useRef } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { motion, useAnimation } from "framer-motion";
import { GrRefresh } from "react-icons/gr";
import { FaCheck, FaTimes, FaStar } from "react-icons/fa";
import GradientText from "./GradientText";
import GlassComponents from "./GlassComponents";

export default function VocabPractice() {
  const controls = useAnimation();
  const cardRef = useRef(null);
  
  const [vocabWords, setVocabWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredWords, setFilteredWords] = useState([]);
  const [isRefreshHovering, setIsRefreshHovering] = useState(false);
  const [cumulativeAngle, setCumulativeAngle] = useState(360);
  
  // Swipe tracking
  const [knownWords, setKnownWords] = useState(new Set());
  const [unknownWords, setUnknownWords] = useState(new Set());
  const [starredWords, setStarredWords] = useState(new Set());
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all", "starred", "wrong"
  const [practiceMode, setPracticeMode] = useState(false); // true when practicing wrong answers only
  const [isFlipped, setIsFlipped] = useState(false); // true when showing definition
  const [showWordFirst, setShowWordFirst] = useState(true); // true = word first, false = definition first
  const [isShuffled, setIsShuffled] = useState(false); // true when cards are shuffled

  // Load vocab data and progress
  useEffect(() => {
    const loadVocabData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/vocab.json');
        if (!response.ok) {
          throw new Error('Failed to load vocabulary data');
        }
        
        const data = await response.json();
        setVocabWords(data);
        setFilteredWords(data);
        
        // Load saved progress
        const savedKnown = localStorage.getItem('vocab-known-words');
        const savedUnknown = localStorage.getItem('vocab-unknown-words');
        const savedStarred = localStorage.getItem('vocab-starred-words');
        
        if (savedKnown) {
          setKnownWords(new Set(JSON.parse(savedKnown)));
        }
        if (savedUnknown) {
          setUnknownWords(new Set(JSON.parse(savedUnknown)));
        }
        if (savedStarred) {
          setStarredWords(new Set(JSON.parse(savedStarred)));
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading vocab data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVocabData();
  }, []);

  // Filter words based on search term and active tab
  useEffect(() => {
    let baseWords = vocabWords;
    
    // Filter by tab first
    if (activeTab === "starred") {
      baseWords = vocabWords.filter(word => starredWords.has(word.word));
    } else if (activeTab === "wrong") {
      baseWords = vocabWords.filter(word => unknownWords.has(word.word));
    } else if (activeTab === "unseen") {
      baseWords = vocabWords.filter(word => 
        !knownWords.has(word.word) && !unknownWords.has(word.word)
      );
    }
    
    // Shuffle if enabled
    if (isShuffled) {
      baseWords = [...baseWords].sort(() => Math.random() - 0.5);
    }
    
    // Then filter by search term
    if (searchTerm.trim() === "") {
      setFilteredWords(baseWords);
    } else {
      const filtered = baseWords.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.definition.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWords(filtered);
    }
  }, [searchTerm, vocabWords, activeTab, starredWords, unknownWords, knownWords, isShuffled]);

  // Reset index only when changing tabs or search
  useEffect(() => {
    setCurrentWordIndex(0);
    setIsFlipped(false);
  }, [activeTab, searchTerm]);

  // Handle bounds checking when filtered words change
  useEffect(() => {
    if (filteredWords.length > 0 && currentWordIndex >= filteredWords.length) {
      // If current index is out of bounds, reset to last valid index
      setCurrentWordIndex(Math.max(0, filteredWords.length - 1));
    } else if (filteredWords.length === 0) {
      // If no words available, reset to 0
      setCurrentWordIndex(0);
    }
  }, [filteredWords.length, currentWordIndex]);

  // Handle hover animation
  useEffect(() => {
    if (isRefreshHovering) {
      controls.start({ rotate: cumulativeAngle + 30, transition: { duration: 0.3, ease: "circOut" } });
    } else {
      controls.start({ rotate: cumulativeAngle, transition: { duration: 0.3, ease: "circOut" } });
    }
  }, [isRefreshHovering, cumulativeAngle, controls]);

  // Save progress whenever known/unknown words change
  useEffect(() => {
    saveProgress();
  }, [knownWords, unknownWords]);

  // Touch/swipe handling
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const handleStart = (e) => {
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      isDragging = true;
      setIsSwipeActive(true);
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const currentY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      // Only consider horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        
        if (deltaX > 50) {
          setSwipeDirection('right');
        } else if (deltaX < -50) {
          setSwipeDirection('left');
        } else {
          setSwipeDirection(null);
        }
      }
    };

    const handleEnd = (e) => {
      if (!isDragging) return;
      
      const currentX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const deltaX = currentX - startX;
      
      if (deltaX > 100) {
        // Swipe right - mark as known
        markAsKnown();
      } else if (deltaX < -100) {
        // Swipe left - mark as unknown
        markAsUnknown();
      }
      
      isDragging = false;
      setIsSwipeActive(false);
      setSwipeDirection(null);
    };

    // Mouse events for desktop
    card.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // Touch events for mobile
    card.addEventListener('touchstart', handleStart, { passive: false });
    card.addEventListener('touchmove', handleMove, { passive: false });
    card.addEventListener('touchend', handleEnd);

    return () => {
      card.removeEventListener('mousedown', handleStart);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      card.removeEventListener('touchstart', handleStart);
      card.removeEventListener('touchmove', handleMove);
      card.removeEventListener('touchend', handleEnd);
    };
  }, [currentWordIndex, filteredWords]);

  const currentWord = filteredWords[currentWordIndex];

  // Save progress to localStorage
  const saveProgress = () => {
    localStorage.setItem('vocab-known-words', JSON.stringify([...knownWords]));
    localStorage.setItem('vocab-unknown-words', JSON.stringify([...unknownWords]));
    localStorage.setItem('vocab-starred-words', JSON.stringify([...starredWords]));
  };

  // Navigation functions
  const nextWord = () => {
    safeNavigate('next');
  };

  const prevWord = () => {
    safeNavigate('prev');
  };

  // Flashcard functions
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const toggleDirection = () => {
    setShowWordFirst(!showWordFirst);
    setIsFlipped(false); // Reset flip state when changing direction
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    setCurrentWordIndex(0); // Reset to first card when shuffling
    setIsFlipped(false);
  };

  // Safe navigation function that handles bounds checking
  const safeNavigate = (direction) => {
    setCurrentWordIndex(prev => {
      const maxIndex = filteredWords.length - 1;
      if (maxIndex < 0) return 0; // No words available
      
      if (direction === 'next') {
        return prev < maxIndex ? prev + 1 : 0; // Wrap to beginning
      } else {
        return prev > 0 ? prev - 1 : maxIndex; // Wrap to end
      }
    });
    setIsFlipped(false);
    setSwipeDirection(null);
    setIsSwipeActive(false);
  };

  // Swipe functions
  const markAsKnown = () => {
    const currentWordData = filteredWords[currentWordIndex];
    if (currentWordData) {
      const wordKey = currentWordData.word;
      
      setKnownWords(prev => {
        const newSet = new Set(prev);
        newSet.add(wordKey);
        return newSet;
      });
      
      setUnknownWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordKey);
        return newSet;
      });
      
      // Go to first word when marking as known
      setCurrentWordIndex(0);
      setIsFlipped(false);
      setSwipeDirection(null);
      setIsSwipeActive(false);
    }
  };

  const markAsUnknown = () => {
    const currentWordData = filteredWords[currentWordIndex];
    if (currentWordData) {
      const wordKey = currentWordData.word;
      
      setUnknownWords(prev => {
        const newSet = new Set(prev);
        newSet.add(wordKey);
        return newSet;
      });
      
      setKnownWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordKey);
        return newSet;
      });
      
      // Use safe navigation to handle bounds checking
      safeNavigate('next');
    }
  };

  const toggleStar = () => {
    const currentWordData = filteredWords[currentWordIndex];
    if (currentWordData) {
      const wordKey = currentWordData.word;
      
      setStarredWords(prev => {
        const newSet = new Set(prev);
        if (newSet.has(wordKey)) {
          newSet.delete(wordKey);
        } else {
          newSet.add(wordKey);
        }
        return newSet;
      });
    }
  };

  const restartFlashcards = () => {
    setKnownWords(new Set());
    setUnknownWords(new Set());
    setStarredWords(new Set());
    setCurrentWordIndex(0);
    setShowDefinition(false);
    setActiveTab("all");
    setPracticeMode(false);
    localStorage.removeItem('vocab-known-words');
    localStorage.removeItem('vocab-unknown-words');
    localStorage.removeItem('vocab-starred-words');
  };

  const refreshData = () => {
    const newAngle = cumulativeAngle + 360;
    controls.start({ rotate: newAngle, transition: { duration: 0.5, ease: "circOut" } });
    setCumulativeAngle(newAngle);
    
    // Reload data
    window.location.reload();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!currentWord) return;
      
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          markAsKnown();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          markAsUnknown();
          break;
        case ' ':
          event.preventDefault();
          flipCard();
          break;
        case 's':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            toggleStar();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentWord, flipCard]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen pt-24 sm:pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading vocabulary...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-24 sm:pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-extrabold text-secondary">
              Vocabulary Practice
            </h1>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={restartFlashcards}
                className="text-red-500 px-3 py-1 text-sm font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassComponents 
                  className="px-3 py-2 rounded shadow-sm flex flex-row gap-2 justify-center items-center" 
                  width="auto" 
                  height="auto" 
                  borderRadius={20}
                  borderWidth={0.03}
                  backgroundOpacity={0.1}
                  saturation={1}
                  brightness={50}
                  opacity={0.93}
                  blur={22}
                  displace={0.5}
                  distortionScale={-180}
                  redOffset={0}
                  greenOffset={10}
                  blueOffset={20}
                  mixBlendMode="screen"
                >
                  Restart All
                </GlassComponents>
              </motion.button>
              <motion.button
                onClick={refreshData}
                className="text-primary px-3 py-1 text-sm font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setIsRefreshHovering(true)}
                onMouseLeave={() => setIsRefreshHovering(false)}
              >
                <GlassComponents 
                  className="px-3 py-2 rounded shadow-sm flex flex-row gap-2 justify-center items-center" 
                  width="auto" 
                  height="auto" 
                  borderRadius={20}
                  borderWidth={0.03}
                  backgroundOpacity={0.1}
                  saturation={1}
                  brightness={50}
                  opacity={0.93}
                  blur={22}
                  displace={0.5}
                  distortionScale={-180}
                  redOffset={0}
                  greenOffset={10}
                  blueOffset={20}
                  mixBlendMode="screen"
                >
                  <motion.div animate={controls}>
                    <GrRefresh className="text-primary font-bold"/> 
                  </motion.div>
                  Refresh
                </GlassComponents>
              </motion.button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold"
              >
                Try Again
              </button>
            </div>
          )}


          {/* Search Bar */}
          <div className="mb-6">
            <h2 className="text-xl text-secondary font-bold mb-3">
              Search <GradientText
                className="font-bold inline"
                colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
                animationSpeed={8}
                showBorder={false}
              >
                vocabulary</GradientText>:
            </h2>
            <input
              type="text"
              placeholder="Search words or definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
            />
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                Showing {filteredWords.length} of {activeTab === "starred" ? starredWords.size : activeTab === "wrong" ? unknownWords.size : vocabWords.length} words
              </p>
            )}
          </div>

          {/* Word Counter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeTab === "all" 
                    ? "bg-primary text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                All Words ({vocabWords.length})
              </motion.button>
              <motion.button
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Known ({knownWords.size})
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("wrong")}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeTab === "wrong" 
                    ? "bg-red-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Unknown ({unknownWords.size})
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("unseen")}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeTab === "unseen" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Unseen ({vocabWords.length - knownWords.size - unknownWords.size})
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("starred")}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1 ${
                  activeTab === "starred" 
                    ? "bg-yellow-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaStar className="text-sm fill-current" />
                Starred ({starredWords.size})
              </motion.button>
              {searchTerm && (
                <motion.button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "circOut" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Filtered ({filteredWords.length})
                </motion.button>
              )}
            </div>
          </div>

          {/* Current Word Card */}
          {currentWord && (
            <motion.div
              ref={cardRef}
              className="mb-6 min-h-[300px] cursor-pointer relative"
              onClick={() => setShowDefinition(!showDefinition)}
              initial={{
                y: 20,
                opacity: 0,
              }}
              animate={{ 
                y: 0, 
                opacity: 1,
                x: swipeDirection === 'right' ? 20 : swipeDirection === 'left' ? -20 : 0,
                rotate: swipeDirection === 'right' ? 5 : swipeDirection === 'left' ? -5 : 0
              }}
              transition={{ duration: 0.3, ease: "circOut" }}
              whileHover={{
                scale: 1.02,
              }}
            >
              {/* Swipe Indicators */}
              {isSwipeActive && (
                <>
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 transition-opacity duration-200 ${
                    swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <FaTimes />
                      <span className="font-semibold">Don't Know</span>
                    </div>
                  </div>
                  <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 transition-opacity duration-200 ${
                    swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <FaCheck />
                      <span className="font-semibold">Know It</span>
                    </div>
                  </div>
                </>
              )}

              <GlassComponents 
                className={`rounded-2xl shadow-sm p-8 flex flex-col justify-center items-center transition-all duration-200 ${
                  swipeDirection === 'right' ? 'bg-green-50 border-green-200' : 
                  swipeDirection === 'left' ? 'bg-red-50 border-red-200' : ''
                }`}
                width="100%" 
                height="auto" 
                borderRadius={20}
                borderWidth={0.03}
                backgroundOpacity={0.1}
                saturation={1}
                brightness={50}
                opacity={0.93}
                blur={22}
                displace={0.5}
                distortionScale={-180}
                redOffset={0}
                greenOffset={10}
                blueOffset={20}
                mixBlendMode="screen"
              >
                <div className="text-center flex my-auto flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-secondary">
                      {(() => {
                        if (showWordFirst) {
                          return isFlipped ? "Definition:" : "Word:";
                        } else {
                          return isFlipped ? "Word:" : "Definition:";
                        }
                      })()}
                    </h3>
                    <motion.button
                      onClick={toggleStar}
                      className={`p-2 rounded-full transition-colors ${
                        starredWords.has(currentWord.word) 
                          ? 'text-yellow-500 bg-yellow-100' 
                          : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaStar className={`text-xl ${starredWords.has(currentWord.word) ? 'fill-current' : ''}`} />
                    </motion.button>
                  </div>
                  <motion.div
                    className="cursor-pointer"
                    onClick={flipCard}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-lg mb-4 font-semibold text-secondary">
                      {(() => {
                        if (showWordFirst) {
                          return isFlipped ? currentWord.definition : currentWord.word;
                        } else {
                          return isFlipped ? currentWord.word : currentWord.definition;
                        }
                      })()}
                    </p>
                  </motion.div>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span>{currentWordIndex + 1} of {filteredWords.length}</span>
                    {knownWords.has(currentWord.word) && (
                      <span className="text-green-600 font-semibold">✓ Known</span>
                    )}
                    {unknownWords.has(currentWord.word) && (
                      <span className="text-red-600 font-semibold">✗ Unknown</span>
                    )}
                    {starredWords.has(currentWord.word) && (
                      <span className="text-yellow-600 font-semibold flex items-center gap-1">
                        <FaStar className="text-xs fill-current" />
                        Starred
                      </span>
                    )}
                  </div>
                </div>
              </GlassComponents>
            </motion.div>
          )}


          {/* Action Buttons */}
          {filteredWords.length > 0 && (
            <div className="flex justify-center gap-4 mt-6">
              <motion.button
                onClick={markAsUnknown}
                className="px-8 py-4 bg-red-500 text-white rounded-lg font-semibold flex items-center gap-2 text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, delay: 0.2 },
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimes />
                Don't Know
                <span className="text-sm opacity-75">(←)</span>
              </motion.button>
              <motion.button
                onClick={toggleStar}
                className={`px-8 py-4 rounded-lg font-semibold flex items-center gap-2 text-lg ${
                  starredWords.has(currentWord?.word)
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, delay: 0.25 },
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaStar className={starredWords.has(currentWord?.word) ? 'fill-current' : ''} />
                {starredWords.has(currentWord?.word) ? 'Unstar' : 'Star'}
                <span className="text-sm opacity-75">(Ctrl+S)</span>
              </motion.button>
              <motion.button
                onClick={markAsKnown}
                className="px-8 py-4 bg-green-500 text-white rounded-lg font-semibold flex items-center gap-2 text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, delay: 0.3 },
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaCheck />
                Know It
                <span className="text-sm opacity-75">(→)</span>
              </motion.button>
            </div>
          )}

          {/* Flashcard Controls */}
          {filteredWords.length > 0 && (
            <div className="flex justify-center gap-4 mt-6">
              <motion.button
                onClick={flipCard}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Flip Card
                <span className="text-sm opacity-75">(Space)</span>
              </motion.button>
              <motion.button
                onClick={toggleDirection}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                  showWordFirst 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-purple-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showWordFirst ? '📖 Word First' : '📝 Definition First'}
              </motion.button>
              <motion.button
                onClick={toggleShuffle}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                  isShuffled 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔀 {isShuffled ? 'Shuffled' : 'Shuffle'}
              </motion.button>
            </div>
          )}

          {/* Navigation Controls */}
          {filteredWords.length > 0 && (
            <div className="flex justify-center gap-4 mt-4">
              <motion.button
                onClick={prevWord}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Previous
              </motion.button>
              <motion.button
                onClick={nextWord}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next →
              </motion.button>
            </div>
          )}

          {/* Word Counter */}
          {filteredWords.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-secondary">
                {currentWordIndex + 1} / {filteredWords.length}
              </p>
            </div>
          )}

          {/* Keyboard Shortcuts Info */}
          {filteredWords.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Keyboard shortcuts: ← Don't Know | → Know It | Space Flip Card | Ctrl+S Star</p>
            </div>
          )}

          {filteredWords.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg font-medium">No words found</p>
              <p className="text-sm">Try adjusting your search term</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
