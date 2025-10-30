"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassComponents from "./GlassComponents";

const SinglePlayerMode = ({ questionFile, title, description, questionType, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [starredQuestions, setStarredQuestions] = useState([]);
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("quiz");
  const [previousTab, setPreviousTab] = useState("quiz");
  const [loading, setLoading] = useState(true);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  // Helper function to extract choice letter (handles both "A." and "A:" formats)
  const getChoiceLetter = (choice) => {
    const match = choice.match(/^([A-Z])[.:]/);
    return match ? match[1] : choice.charAt(0);
  };

  // Save progress to localStorage
  const saveProgress = () => {
    const progressData = {
      currentQuestionIndex,
      correctAnswers,
      wrongAnswers,
      starredQuestions,
      score,
      gameStarted,
      gameCompleted,
      activeTab,
      timestamp: Date.now()
    };
    localStorage.setItem(`practice-progress-${questionFile}-${questionType || 'all'}`, JSON.stringify(progressData));
  };

  // Load progress from localStorage
  const loadProgress = () => {
    try {
      const savedProgress = localStorage.getItem(`practice-progress-${questionFile}-${questionType || 'all'}`);
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        // Only load if progress is less than 7 days old
        if (Date.now() - progressData.timestamp < 7 * 24 * 60 * 60 * 1000) {
          setCurrentQuestionIndex(progressData.currentQuestionIndex || 0);
          setCorrectAnswers(progressData.correctAnswers || []);
          setWrongAnswers(progressData.wrongAnswers || []);
          setStarredQuestions(progressData.starredQuestions || []);
          setScore(progressData.score || 0);
          setGameStarted(progressData.gameStarted || false);
          setGameCompleted(progressData.gameCompleted || false);
          setActiveTab(progressData.activeTab || "quiz");
          setHasSavedProgress(true);
          return true;
        }
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
    return false;
  };

  // Clear saved progress
  const clearProgress = () => {
    localStorage.removeItem(`practice-progress-${questionFile}-${questionType || 'all'}`);
    setHasSavedProgress(false);
  };

  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch(`/${questionFile}`);
        const data = await response.json();
        
        // Filter questions by type if questionType is provided
        const filteredQuestions = questionType 
          ? data.filter(q => q.Topic === questionType)
          : data;
        
        setQuestions(filteredQuestions);
        setTotalQuestions(filteredQuestions.length);
        
        // Try to load saved progress
        const hasProgress = loadProgress();
        if (!hasProgress) {
          // If no saved progress, check if there's any progress at all
          const savedProgress = localStorage.getItem(`practice-progress-${questionFile}-${questionType || 'all'}`);
          if (savedProgress) {
            setHasSavedProgress(true);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading questions:", error);
        setLoading(false);
      }
    };

    loadQuestions();
  }, [questionFile, questionType]);

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers([]);
    setWrongAnswers([]);
    setGameCompleted(false);
    setActiveTab("quiz");
    clearProgress(); // Clear any old progress when starting fresh
  };

  const resumeGame = () => {
    setGameStarted(true);
    // Progress is already loaded from localStorage
  };

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.Answer;
    setIsCorrect(correct);

    const questionResult = {
      ...currentQuestion,
      userAnswer: selectedAnswer,
      isCorrect: correct,
      questionNumber: currentQuestionIndex + 1,
    };

    if (correct) {
      setCorrectAnswers(prev => {
        const newAnswers = [...prev, questionResult];
        return newAnswers;
      });
      setScore(prev => prev + 1);
    } else {
      setWrongAnswers(prev => {
        const newAnswers = [...prev, questionResult];
        return newAnswers;
      });
    }

    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
    } else {
      setGameCompleted(true);
      setActiveTab("results");
    }
  };

  // Toggle star for a question
  const toggleStar = (questionResult) => {
    const isStarred = starredQuestions.some(q => 
      q.question === questionResult.question && 
      q.questionNumber === questionResult.questionNumber
    );
    if (isStarred) {
      setStarredQuestions(prev => prev.filter(q => 
        !(q.question === questionResult.question && q.questionNumber === questionResult.questionNumber)
      ));
    } else {
      setStarredQuestions(prev => [...prev, questionResult]);
    }
  };

  // Remove question from wrong/correct list and add back to quiz
  const removeFromList = (questionResult, listType) => {
    // Remove from the respective list
    if (listType === 'correct') {
      setCorrectAnswers(prev => prev.filter((q, index) => {
        return q.question !== questionResult.question || 
               q.questionNumber !== questionResult.questionNumber;
      }));
      // Update score if removing from correct
      setScore(prev => Math.max(0, prev - 1));
    } else {
      setWrongAnswers(prev => prev.filter((q, index) => {
        return q.question !== questionResult.question || 
               q.questionNumber !== questionResult.questionNumber;
      }));
    }
    
    // Create a clean version of the question without userAnswer, isCorrect, questionNumber
    const originalQuestion = {
      Question: questionResult.Question,
      Choices: questionResult.Choices,
      Answer: questionResult.Answer,
      Topic: questionResult.Topic
    };
    
    // Add the question back to the end of the questions array
    setQuestions(prev => [...prev, originalQuestion]);
  };

  // Toggle reveal answer
  const toggleRevealAnswer = (questionResult) => {
    // Use Question property (capital Q) to match the structure from questionResult
    const questionText = questionResult.Question;
    const key = `${questionResult.questionNumber}-${questionText}`;
    setRevealedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Save progress whenever game state changes
  useEffect(() => {
    if (gameStarted && questions.length > 0) {
      saveProgress();
    }
  }, [currentQuestionIndex, correctAnswers, wrongAnswers, starredQuestions, score, gameStarted, gameCompleted, activeTab, questions.length]);

  const resetGame = () => {
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setShowResult(false);
    setCorrectAnswers([]);
    setWrongAnswers([]);
    setScore(0);
    setGameCompleted(false);
    setActiveTab("quiz");
    clearProgress(); // Clear saved progress when resetting
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 sm:pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen pt-24 sm:pt-32 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            {description} Track your progress and review your mistakes!
          </p>
          
          <GlassComponents 
            className="rounded-lg p-8 mb-8"
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">{totalQuestions}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total Questions</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                  {hasSavedProgress ? correctAnswers.length + wrongAnswers.length : 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">✓</div>
                <div className="text-xs sm:text-sm text-gray-600">Track Correct</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">✗</div>
                <div className="text-xs sm:text-sm text-gray-600">Review Mistakes</div>
              </div>
            </div>
          </GlassComponents>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              {hasSavedProgress ? "Start Fresh" : "Start Practice"}
            </motion.button>
            
            {hasSavedProgress && (
              <motion.button
                onClick={resumeGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Resume Practice
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {/* Back button to category selection */}
          {gameStarted && onBack && (
            <motion.button
              onClick={onBack}
              className="mb-4 px-4 py-2 rounded-lg font-medium transition-colors text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>←</span>
              <span>Back to Categories</span>
            </motion.button>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h1>
            <div className="text-lg font-semibold text-primary">
              Score: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <motion.div
              className="bg-primary h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            {/* Back arrow - show when not on quiz tab */}
            {activeTab !== "quiz" && (
              <motion.button
                onClick={() => {
                  setActiveTab(previousTab);
                }}
                className="px-3 py-2 rounded-lg font-medium transition-colors text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`Back to ${previousTab === "quiz" ? "Quiz" : previousTab.charAt(0).toUpperCase() + previousTab.slice(1)}`}
              >
                <span>←</span>
                <span>Back</span>
              </motion.button>
            )}
            <button
              onClick={() => {
                if (activeTab !== "quiz") setPreviousTab(activeTab);
                setActiveTab("quiz");
              }}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                activeTab === "quiz"
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Quiz
            </button>
            <button
              onClick={() => {
                if (activeTab !== "correct") setPreviousTab(activeTab);
                setActiveTab("correct");
              }}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                activeTab === "correct"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Correct ({correctAnswers.length})
            </button>
            <button
              onClick={() => {
                if (activeTab !== "wrong") setPreviousTab(activeTab);
                setActiveTab("wrong");
              }}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                activeTab === "wrong"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Wrong ({wrongAnswers.length})
            </button>
            <button
              onClick={() => {
                if (activeTab !== "starred") setPreviousTab(activeTab);
                setActiveTab("starred");
              }}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                activeTab === "starred"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ⭐ Starred ({starredQuestions.length})
            </button>
            {gameCompleted && (
              <button
                onClick={() => {
                  if (activeTab !== "results") setPreviousTab(activeTab);
                  setActiveTab("results");
                }}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  activeTab === "results"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Final Results
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "quiz" && !gameCompleted && currentQuestion && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassComponents 
                className="rounded-lg p-4 sm:p-8"
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
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="font-semibold">Topic:</span> {currentQuestion?.Topic || 'Unknown'}
                    </div>
                    <motion.button
                      onClick={() => {
                        if (!currentQuestion) return;
                        const questionResult = {
                          ...currentQuestion,
                          userAnswer: selectedAnswer,
                          isCorrect: currentQuestion.Answer === selectedAnswer,
                          questionNumber: currentQuestionIndex + 1,
                        };
                        toggleStar(questionResult);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        starredQuestions.some(q => 
                          q.Question === currentQuestion?.Question || 
                          q.question === currentQuestion?.Question
                        )
                          ? 'text-yellow-500 bg-yellow-100'
                          : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Star this question"
                    >
                      ⭐
                    </motion.button>
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
                    {currentQuestion?.Question || 'Loading question...'}
                  </h2>
                </div>

                <div className="space-y-3 mb-6">
                  {currentQuestion?.Choices?.map((choice, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(getChoiceLetter(choice))}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        selectedAnswer === getChoiceLetter(choice)
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-gray-300"
                      } ${showResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                      whileHover={!showResult ? { scale: 1.01 } : {}}
                      whileTap={!showResult ? { scale: 0.99 } : {}}
                    >
                      <span className="font-medium leading-relaxed">{choice}</span>
                    </motion.button>
                  ))}
                </div>

                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg mb-6 ${
                      isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <span className="font-semibold">
                        {isCorrect ? "Correct!" : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-sm">
                      {isCorrect 
                        ? "Great job! You got this question right."
                        : `The correct answer was: ${currentQuestion?.Answer || 'N/A'}`
                      }
                    </p>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  {!showResult ? (
                    <motion.button
                      onClick={submitAnswer}
                      disabled={!selectedAnswer}
                      className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors ${
                        selectedAnswer
                          ? "bg-primary text-white hover:bg-primary-dark"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      whileHover={selectedAnswer ? { scale: 1.05 } : {}}
                      whileTap={selectedAnswer ? { scale: 0.95 } : {}}
                    >
                      Submit Answer
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={nextQuestion}
                      className="px-4 sm:px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                    </motion.button>
                  )}
                </div>
              </GlassComponents>
            </motion.div>
          )}

          {activeTab === "correct" && (
            <motion.div
              key="correct"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-green-600 mb-6">
                Correct Answers ({correctAnswers.length})
              </h2>
              <div className="space-y-4">
                {correctAnswers.map((question, index) => (
                  <GlassComponents 
                    key={index}
                    className="rounded-lg p-4 sm:p-6"
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
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                      <div className="flex items-center">
                        <span className="text-green-600 text-xl mr-2 flex-shrink-0">✓</span>
                        <span className="font-semibold text-green-600">
                          Question {question.questionNumber}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => toggleStar(question)}
                          className={`p-2 rounded-full ${
                            starredQuestions.some(q => q.question === question.question && q.questionNumber === question.questionNumber)
                              ? 'text-yellow-500 bg-yellow-100'
                              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ⭐
                        </motion.button>
                        <motion.button
                          onClick={() => removeFromList(question, 'correct')}
                          className="px-3 py-1 text-xs text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Remove
                        </motion.button>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {question.Topic.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm sm:text-base text-gray-900 leading-relaxed ">
                        {question.Question}
                      </p>
                    </div>
                    
                    {(() => {
                      const key = `${question.questionNumber}-${question.Question}`;
                      const isRevealed = revealedAnswers.has(key);
                      return (
                        <>
                          <motion.button
                            onClick={() => toggleRevealAnswer(question)}
                            className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isRevealed ? '👁️ Hide Answer' : '🔍 Reveal Answer'}
                          </motion.button>

                          {isRevealed && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-3 mt-3">
                              <p className="text-xs font-medium text-green-700 mb-1">Your Answer:</p>
                              <p className="text-sm font-semibold text-green-800">
                                {question.userAnswer}
                              </p>
                            </div>
                          )}

                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-600 mb-2">Answer Choices:</p>
                            <div className="space-y-2">
                              {question.Choices.map((choice, choiceIndex) => {
                                const choiceLetter = getChoiceLetter(choice);
                                const isUserAnswer = choiceLetter === question.userAnswer;
                                const isCorrectAnswer = isRevealed && choiceLetter === question.Answer;
                                
                                return (
                                  <div
                                    key={choiceIndex}
                                    className={`p-2 rounded text-xs ${
                                      isUserAnswer && isRevealed && isCorrectAnswer
                                        ? 'bg-green-100 border border-green-300 text-green-800'
                                        : isUserAnswer && isRevealed && !isCorrectAnswer
                                        ? 'bg-red-100 border border-red-300 text-red-800'
                                        : isCorrectAnswer
                                        ? 'bg-green-100 border border-green-300 text-green-800'
                                        : 'bg-gray-50 border border-gray-200 text-gray-700'
                                    }`}
                                  >
                                    <span className="font-medium">{choice}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </GlassComponents>
                ))}
                {correctAnswers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📚</div>
                    <p className="text-lg font-medium">No correct answers yet!</p>
                    <p className="text-sm">Start practicing to see your correct answers here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "wrong" && (
            <motion.div
              key="wrong"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-red-600 mb-6">
                Incorrect Answers ({wrongAnswers.length})
              </h2>
              <div className="space-y-4">
                {wrongAnswers.map((question, index) => (
                  <GlassComponents 
                    key={index}
                    className="rounded-lg p-4 sm:p-6"
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
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                      <div className="flex items-center">
                        <span className="text-red-600 text-xl mr-2 flex-shrink-0">✗</span>
                        <span className="font-semibold text-red-600">
                          Question {question.questionNumber}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => toggleStar(question)}
                          className={`p-2 rounded-full ${
                            starredQuestions.some(q => q.question === question.question && q.questionNumber === question.questionNumber)
                              ? 'text-yellow-500 bg-yellow-100'
                              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ⭐
                        </motion.button>
                        <motion.button
                          onClick={() => removeFromList(question, 'wrong')}
                          className="px-3 py-1 text-xs text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Remove
                        </motion.button>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {question.Topic.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm sm:text-base text-gray-900 leading-relaxed ">
                        {question.Question}
                      </p>
                    </div>
                    
                    {(() => {
                      const key = `${question.questionNumber}-${question.Question}`;
                      const isRevealed = revealedAnswers.has(key);
                      return (
                        <>
                          <motion.button
                            onClick={() => toggleRevealAnswer(question)}
                            className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isRevealed ? '👁️ Hide Answer' : '🔍 Reveal Answer'}
                          </motion.button>

                          {isRevealed && (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-3 mt-3">
                              <p className="text-xs font-medium text-red-700 mb-1">Your Answer:</p>
                              <p className="text-sm font-semibold text-red-800">
                                {question.userAnswer}
                              </p>
                            </div>
                          )}

                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-600 mb-2">Answer Choices:</p>
                            <div className="space-y-2">
                              {question.Choices.map((choice, choiceIndex) => {
                                const choiceLetter = getChoiceLetter(choice);
                                const isUserAnswer = isRevealed && choiceLetter === question.userAnswer;
                                const isCorrectAnswer = isRevealed && choiceLetter === question.Answer;
                                
                                return (
                                  <div
                                    key={choiceIndex}
                                    className={`p-2 rounded text-xs ${
                                      isCorrectAnswer
                                        ? 'bg-green-100 border border-green-300 text-green-800'
                                        : isUserAnswer
                                        ? 'bg-red-100 border border-red-300 text-red-800'
                                        : 'bg-gray-50 border border-gray-200 text-gray-700'
                                    }`}
                                  >
                                    <span className="font-medium">{choice}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </GlassComponents>
                ))}
                {wrongAnswers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="text-lg font-medium">No incorrect answers yet!</p>
                    <p className="text-sm">Great job! Keep up the excellent work.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "starred" && (
            <motion.div
              key="starred"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-yellow-600 mb-6">
                ⭐ Starred Questions ({starredQuestions.length})
              </h2>
              <div className="space-y-4">
                {starredQuestions.map((question, index) => (
                  <GlassComponents 
                    key={index}
                    className="rounded-lg p-4 sm:p-6"
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
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                      <div className="flex items-center">
                        <span className="text-yellow-600 text-xl mr-2 flex-shrink-0">⭐</span>
                        <span className="font-semibold text-yellow-600">
                          Question {question.questionNumber}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => toggleStar(question)}
                          className="p-2 text-yellow-500 bg-yellow-100 rounded-full"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ⭐
                        </motion.button>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {question.Topic?.replace(/_/g, ' ') || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm sm:text-base text-gray-900 leading-relaxed ">
                        {question.Question || question.question}
                      </p>
                    </div>
                    
                    {(() => {
                      // Use the same key format as correct/wrong tabs
                      const questionText = question.Question || question.question;
                      const key = `${question.questionNumber}-${questionText}`;
                      const isRevealed = revealedAnswers.has(key);
                      const isCorrect = question.isCorrect !== undefined ? question.isCorrect : null;
                      
                      return (
                        <>
                          <motion.button
                            onClick={() => toggleRevealAnswer(question)}
                            className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-4"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isRevealed ? '👁️ Hide Answer' : '🔍 Reveal Answer'}
                          </motion.button>

                          {isRevealed && (
                            <div className={`${isCorrect ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} p-3 rounded-lg border mb-3`}>
                              <p className={`text-xs font-medium mb-1 ${isCorrect ? 'text-green-700' : 'text-yellow-700'}`}>Your Answer:</p>
                              <p className={`text-sm font-semibold ${isCorrect ? 'text-green-800' : 'text-yellow-800'}`}>
                                {question.userAnswer}
                              </p>
                            </div>
                          )}

                          {question.Choices && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-gray-600 mb-2">Answer Choices:</p>
                              <div className="space-y-2">
                                {question.Choices.map((choice, choiceIndex) => {
                                  const choiceLetter = getChoiceLetter(choice);
                                  const correctAnswer = question.Answer;
                                  const isUserAnswer = isRevealed && choiceLetter === question.userAnswer;
                                  const isCorrectAnswer = isRevealed && choiceLetter === correctAnswer;
                                  
                                  return (
                                    <div
                                      key={choiceIndex}
                                      className={`p-2 rounded text-xs ${
                                        isCorrectAnswer
                                          ? 'bg-green-100 border border-green-300 text-green-800'
                                          : isUserAnswer && !isCorrectAnswer
                                          ? 'bg-red-100 border border-red-300 text-red-800'
                                          : 'bg-gray-50 border border-gray-200 text-gray-700'
                                      }`}
                                    >
                                      <span className="font-medium">{choice}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </GlassComponents>
                ))}
                {starredQuestions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">⭐</div>
                    <p className="text-lg font-medium">No starred questions yet!</p>
                    <p className="text-sm">Star questions you want to review later.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "results" && gameCompleted && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassComponents 
                className="rounded-lg p-8 text-center"
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Quiz Complete! 🎉
                </h2>
                <p>
                  <h1>
                    <button>Start quiz <span>Again</span></button>
                  </h1>
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round((score / questions.length) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {score}
                    </div>
                    <div className="text-sm text-gray-600">Correct Answers</div>
                  </div>
                  <div className="bg-red-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {questions.length - score}
                    </div>
                    <div className="text-sm text-gray-600">Incorrect Answers</div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <motion.button
                    onClick={resetGame}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Again
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveTab("wrong")}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Review Mistakes
                  </motion.button>
                </div>
              </GlassComponents>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SinglePlayerMode;
