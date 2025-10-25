"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import GradientText from "./GradientText";
import GlassComponents from "./GlassComponents";

export default function FlashcardManager({ userId }) {
  const [flashcards, setFlashcards] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCard, setNewCard] = useState({
    front: "",
    back: "",
    difficulty: "medium",
    tagNames: [],
  });

  useEffect(() => {
    fetchFlashcards();
    fetchTags();
  }, []);

  const fetchFlashcards = async (tagFilter = null) => {
    try {
      setLoading(true);
      const url = tagFilter
        ? `/api/flashcards?tag=${encodeURIComponent(tagFilter)}`
        : "/api/flashcards";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch flashcards");

      const data = await response.json();
      setFlashcards(Array.isArray(data) ? data : data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) throw new Error("Failed to fetch tags");

      const tagsData = await response.json();
      setTags(tagsData);
    } catch (err) {
      console.error("Error fetching tags:", err);
      setError("Failed to load tags");
    }
  };

  // Filter flashcards by selected tag
  const filteredFlashcards = selectedTag
    ? flashcards.filter(
        (card) => card.tags && card.tags.some((tag) => tag.name === selectedTag)
      )
    : flashcards;

  const createFlashcard = async () => {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: newCard.front,
          back: newCard.back,
          difficulty: newCard.difficulty,
          tagNames: newCard.tagNames,
        }),
      });

      if (!response.ok) throw new Error("Failed to create flashcard");

      const createdCard = await response.json();

      // Update local state
      setFlashcards((prev) => [createdCard, ...prev]);

      setNewCard({
        front: "",
        back: "",
        difficulty: "medium",
        tagNames: [],
      });
      setShowCreateForm(false);

      // Refresh tags to get updated counts
      fetchTags();

      // Notify other components
      window.dispatchEvent(new CustomEvent("flashcardUpdated"));
    } catch (err) {
      setError(err.message);
      console.error("Error creating flashcard:", err);
    }
  };

  const deleteFlashcard = async (id) => {
    try {
      const response = await fetch(`/api/flashcards?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete flashcard");

      // Update local state
      setFlashcards((prev) => prev.filter((card) => card.id !== id));

      // Notify other components
      window.dispatchEvent(new CustomEvent("flashcardUpdated"));
    } catch (err) {
      setError(err.message);
      console.error("Error deleting flashcard:", err);
    }
  };

  const recordAnswer = async (flashcardId, correct) => {
    if (!userId) return;

    try {
      const response = await fetch("/api/flashcards/record-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          flashcardId,
          correct,
        }),
      });

      if (!response.ok) throw new Error("Failed to record answer");

      const progress = await response.json();
      console.log("Answer recorded:", progress);
    } catch (err) {
      console.error("Error recording answer:", err);
    }
  };

  const deleteTag = async (tagId, tagName) => {
    if (
      !confirm(
        `Are you sure you want to delete the tag "${tagName}"? This will only work if no flashcards are using this tag.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/tags?id=${tagId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete tag");
      }

      const result = await response.json();
      alert(result.message);

      // Refresh data
      fetchTags();
      fetchFlashcards();

      // Notify other components
      window.dispatchEvent(new CustomEvent("flashcardUpdated"));
    } catch (err) {
      setError(err.message);
      console.error("Error deleting tag:", err);
    }
  };

  const handleTagFilter = (tagName) => {
    setSelectedTag(tagName);
  };

  const handleCreateFormSubmit = (e) => {
    e.preventDefault();
    if (newCard.front.trim() && newCard.back.trim()) {
      createFlashcard();
    }
  };

  const handleTagInput = (tagString) => {
    const tagNames = tagString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setNewCard((prev) => ({ ...prev, tagNames }));
  };

  if (loading && filteredFlashcards.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-secondary font-bold text-[20px]">
          Loading Flashcards
          <TypeAnimation
            sequence={["...", 10, "...", 10]}
            wrapper="span"
            repeat={Infinity}
            speed={10}
          />
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-secondary font-bold">Flashcard Manager</h2>
        <motion.button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-primary font-bold text-[17px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, delay: 0.1 },
          }}
          transition={{
            ease: "circOut",
            duration: 0.35,
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <GlassComponents
            className="px-4 py-2 rounded-xl shadow-sm flex justify-center items-center"
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
            {showCreateForm ? "Cancel" : "Create New Card"}
          </GlassComponents>
        </motion.button>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 font-bold">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-lg text-secondary font-semibold mb-2">
          Filter by <GradientText
            className="font-extrabold inline"
            colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
            animationSpeed={8}
            showBorder={false}
          >
            topic:
          </GradientText>
        </h3>
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
            All ({tags.length})
          </motion.button>
          {tags.map((tag, index) => (
            <motion.div
              key={tag.id}
              className="flex items-center gap-1"
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
            >
              <motion.button
                onClick={() => setSelectedTag(tag.name)}
                className={`px-3 py-1 rounded font-semibold ${
                  selectedTag === tag.name
                    ? "bg-primary text-white"
                    : "bg-tertiary-hover text-secondary"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tag.name} ({tag._count?.flashcards || 0})
              </motion.button>
              <motion.button
                onClick={() => deleteTag(tag.id, tag.name)}
                className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={`Delete tag "${tag.name}"`}
              >
                x
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
      {showCreateForm && (
        <GlassComponents
          className="rounded-lg shadow-sm p-6 mb-6"
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg p-6 mb-6 relative w-full"
          >
            <h3 className="text-lg font-semibold mb-4">Create New Flashcard</h3>
            <form onSubmit={handleCreateFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary mb-1">
                  Front (Question)
                </label>
                <textarea
                  value={newCard.front}
                  onChange={(e) =>
                    setNewCard((prev) => ({ ...prev, front: e.target.value }))
                  }
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                  placeholder="Enter the question or front of the card"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary mb-1">
                  Back (Answer)
                </label>
                <textarea
                  value={newCard.back}
                  onChange={(e) =>
                    setNewCard((prev) => ({ ...prev, back: e.target.value }))
                  }
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                  placeholder="Enter the answer or back of the card"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary mb-1">
                  Difficulty
                </label>
                <select
                  value={newCard.difficulty}
                  onChange={(e) =>
                    setNewCard((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="w-full p-3 border rounded-lg font-semibold text-secondary"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  onChange={(e) => handleTagInput(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="e.g., RW:Usage, Grammar, SAT"
                />
              </div>
              <div className="flex gap-2">
                <motion.button
                  type="submit"
                  className="text-primary font-semibold"
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
                    className="px-3 py-1 rounded shadow-sm flex justify-center items-center"
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
                    Create Card
                  </GlassComponents>
                </motion.button>
                <motion.button
                  onClick={() => setShowCreateForm(false)}
                  className="text-primary font-semibold"
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
                    className="px-3 py-1 rounded shadow-sm flex justify-center items-center"
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
                    Cancel
                  </GlassComponents>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </GlassComponents>
      )}

      <div className="space-y-4">
        {filteredFlashcards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className=""
          >
            <GlassComponents
              className="rounded-lg shadow-sm p-6 relative w-full h-full flex flex-col justify-start items-center"
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
              <div className="flex justify-between items-start w-full">
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-sm font-bold text-tertiary">
                      Question:
                    </span>
                    <p className="mt-1 text-secondary font-semibold">
                      {card.front}
                    </p>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-bold text-tertiary">
                      Answer:
                    </span>
                    <p className="mt-1 text-green-600 font-semibold">
                      {card.back}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="text-tertiary font-bold">
                      Difficulty:{" "}
                      <span className="font-bold text-secondary">
                        {card.difficulty}
                      </span>
                    </span>
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {card.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="bg-blue-100 text-primary font-semibold px-2 py-1 rounded text-xs"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {userId && (
                    <>
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          recordAnswer(card.id, true);
                        }}
                        className="text-green-600 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <GlassComponents
                          className="px-3 py-1 rounded shadow-sm flex justify-center items-center"
                          width="auto"
                          height="auto"
                          borderRadius={8}
                        >
                          ✓ Correct
                        </GlassComponents>
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          recordAnswer(card.id, false);
                        }}
                        className="text-red-600 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <GlassComponents
                          className="px-3 py-1 rounded shadow-sm flex justify-center items-center"
                          width="auto"
                          height="auto"
                          borderRadius={8}
                        >
                          ✗ Wrong
                        </GlassComponents>
                      </motion.button>
                    </>
                  )}
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteFlashcard(card.id);
                    }}
                    className="text-red-600 font-bold text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GlassComponents
                      className="px-3 py-1 rounded shadow-sm flex justify-center items-center"
                      width="auto"
                      height="auto"
                      borderRadius={8}
                    >
                      Delete
                    </GlassComponents>
                  </motion.button>
                </div>
              </div>
            </GlassComponents>
          </motion.div>
        ))}

        {filteredFlashcards.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-tertiary font-bold">No flashcards found.</p>
            {!showCreateForm && (
              <motion.button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 text-primary font-bold text-[17px]"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  ease: "circOut",
                  duration: 0.35,
                }}
              >
                <GlassComponents
                  className="px-6 py-2 rounded-xl shadow-sm flex justify-center items-center"
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
                  Create your first flashcard
                </GlassComponents>
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}