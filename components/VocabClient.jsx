"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { motion, useAnimation } from "framer-motion";
import { GrRefresh } from "react-icons/gr";
import GradientText from "./GradientText";
import GlassComponents from "./GlassComponents";
export default function VocabClient({ initialFlashcards, initialTags }) {
  const controls = useAnimation();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [allFlashcards, setAllFlashcards] = useState(initialFlashcards);
  const [allTags, setAllTags] = useState(initialTags);
  const [loading, setLoading] = useState(false);
  const [isRefreshHovering, setIsRefreshHovering] = useState(false);
  const [error, setError] = useState(null);
  const [cumulativeAngle, setCumulativeAngle] = useState(360);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [flashcardsResponse, tagsResponse] = await Promise.all([
        fetch('/api/flashcards'),
        fetch('/api/tags')
      ]);

      if (flashcardsResponse.ok && tagsResponse.ok) {
        const flashcardsData = await flashcardsResponse.json();
        const tagsData = await tagsResponse.json();
        
        setAllFlashcards(Array.isArray(flashcardsData) ? flashcardsData : flashcardsData.data || []);
        setAllTags(tagsData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };

    window.addEventListener('flashcardUpdated', handleRefresh);
    return () => window.removeEventListener('flashcardUpdated', handleRefresh);
  }, []);

  // Handle hover animation
  useEffect(() => {
    if (isRefreshHovering) {
      controls.start({ rotate: cumulativeAngle + 30, transition: { duration: 0.3, ease: "circOut" } });
    } else {
      controls.start({ rotate: cumulativeAngle, transition: { duration: 0.3, ease: "circOut" } });
    }
  }, [isRefreshHovering, cumulativeAngle, controls]);

  //filter by tag
  const filteredFlashcards = selectedTag
    ? allFlashcards.filter(
        (card) => card.tags && card.tags.some((tag) => tag.name === selectedTag)
      )
    : allFlashcards;

  const currentCard = filteredFlashcards[currentCardIndex];

  const nextCard = () => {
    setCurrentCardIndex((prev) =>
      prev < filteredFlashcards.length - 1 ? prev + 1 : 0
    );
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) =>
      prev > 0 ? prev - 1 : filteredFlashcards.length - 1
    );
    setShowAnswer(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 mt-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text0-secondary">
              Vocabulary Practice
            </h1>
            <div className="flex items-center gap-2">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-tertiary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Updating...</span>
                </div>
              )}
              <motion.button
                onClick={() => {
                  const newAngle = cumulativeAngle + 360;
                  controls.start({ rotate: newAngle, transition: { duration: 0.5, ease: "circOut" } });
                  setCumulativeAngle(newAngle);
                  fetchData();
                }}
                className="text-primary px-3 py-1 text-sm font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
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
                  <motion.div
                    animate={controls}
                  >
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
                onClick={fetchData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold"
              >
                Try Again
              </button>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-[20px] text-secondary font-bold mb-2">
              Filter by <GradientText
                className="font-bold inline"
                colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
                animationSpeed={8}
                showBorder={false}
              >
                topic</GradientText>:
            </h2>
            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded font-semibold ${
                  !selectedTag
                    ? "bg-primary text-white"
                    : "bg-tertiary-hover text-secondary"
                }`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: "circOut",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                viewport={{ once: true, amount: "all" }}
              >
                All ({allFlashcards.length})
              </motion.button>
              {allTags.map((tag, index) => (
                <motion.button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.name)}
                  className={`px-3 py-1 rounded font-semibold ${
                    selectedTag === tag.name
                      ? "bg-primary text-white"
                      : "bg-tertiary-hover text-secondary"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: (index + 1) * 0.1 },
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "circOut",
                  }}
                  viewport={{ once: true, amount: "all" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tag.name} ({tag._count?.flashcards || 0})
                </motion.button>
              ))}
            </div>
          </div>
          {currentCard && (
            <motion.div
              className="mb-6 min-h-[300px] cursor-pointer"
              onClick={() => setShowAnswer(!showAnswer)}
              initial={{
                y: 20,
                opacity: 0,
              }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              whileHover={{
                scale: 1.02,
              }}
            >
              <GlassComponents 
                className="rounded-2xl shadow-sm p-8 flex flex-col justify-center items-center" 
                width="full" 
                height="270px" 
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
                  <h3 className="text-xl font-bold text-secondary mb-4">
                    {showAnswer ? "Answer:" : "Question:"}
                  </h3>
                  <p className="text-lg mb-4 font-semibold text-secondary">
                    {showAnswer ? currentCard.back : currentCard.front}
                  </p>
                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentCard.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-blue-100 text-primary px-2 py-1 rounded-xl text-sm font-semibold"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </GlassComponents>
            </motion.div>
          )}
          {filteredFlashcards.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <motion.button
                  onClick={prevCard}
                  className="text-secondary text-[17px] font-bold px-6 py-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, delay: 0.2 },
                  }}
                  transition={{
                    ease: "circOut",
                    duration: 0.35,
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlassComponents 
                    className="px-3 py-2 rounded shadow-sm flex justify-center items-center" 
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
                    Previous
                  </GlassComponents>
                </motion.button>
                <motion.span
                  className="absolute left-1/2 transform -translate-x-1/2 text-[16px] text-tertiary font-semibold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {currentCardIndex + 1} of {filteredFlashcards.length}
                </motion.span>
                <motion.button
                  onClick={nextCard}
                  className="text-primary text-[17px] font-bold px-6 py-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, delay: 0.4 },
                  }}
                  transition={{
                    ease: "circOut",
                    duration: 0.35,
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlassComponents 
                    className="px-3 py-2 rounded shadow-sm flex justify-center items-center" 
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
                    Next
                  </GlassComponents>
                </motion.button>
              </div>
              <motion.a
                href="/manage-flashcards"
                className="mt-5 absolute left-1/2 transform -translate-x-1/2 inline-flex flex-col items-start justify-center font-semibold text-[16px]"
                initial="initial"
                whileInView={{
                  y: 0,
                  opacity: 1,
                  transition: {
                    ease: "circOut",
                    duration: 0.4,
                    delay: 0.5,
                  },
                }}
                animate="rest"
                whileHover="hover"
                variants={{
                  initial: { color: "var(--color-primary)", opacity: 0, y: 20 },
                  rest: { color: "var(--color-primary)" },
                  hover: { color: "var(--color-tertiary-hover)" },
                }}
                viewport={{ once: true, amount: "all" }}
              >
                Manage flashcards
                <motion.span
                  className="absolute left-0 bottom-0 h-[3px] bg-tertiary-hover"
                  variants={{
                    rest: { width: 0 },
                    hover: { width: "100%" },
                  }}
                />
              </motion.a>
            </>
          )}
          {filteredFlashcards.length === 0 && (
            <div className="flex flex-col justify-center items-center text-center py-8">
              <p className="text-tertiary font-bold text-[20px]">
                No flashcards found for the selected topic.
              </p>
              <motion.a
                href="/manage-flashcards"
                className="mt-30 absolute left-1/2 transform -translate-x-1/2 inline-flex flex-col items-start justify-center font-semibold text-[16px]"
                initial="initial"
                whileInView={{
                  y: 0,
                  opacity: 1,
                  transition: {
                    ease: "circOut",
                    duration: 0.4,
                    delay: 0.5,
                  },
                }}
                animate="rest"
                whileHover="hover"
                variants={{
                  initial: { color: "var(--color-primary)", opacity: 0, y: 20 },
                  rest: { color: "var(--color-primary)" },
                  hover: { color: "var(--color-tertiary-hover)" },
                }}
                viewport={{ once: true, amount: "all" }}
              >
                Manage flashcards
                <motion.span
                  className="absolute left-0 bottom-0 h-[3px] bg-tertiary-hover"
                  variants={{
                    rest: { width: 0 },
                    hover: { width: "100%" },
                  }}
                />
              </motion.a>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}