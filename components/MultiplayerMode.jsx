"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassComponents from "./GlassComponents";
import { useAuth } from "../contexts/AuthContext";
import confetti from "canvas-confetti";

const MultiplayerMode = () => {
  const { user, token } = useAuth();
  const [screen, setScreen] = useState("main"); // main, create, join, waiting, playing, finished
  const [gameCode, setGameCode] = useState("");
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Game creation settings
  const [settings, setSettings] = useState({
    category: "english", // math or english
    questionType: null,
    numRounds: 5,
    gameMode: "fast", // fast or timed
    timeLimit: 30 // for timed mode
  });

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());

  const timerRef = useRef(null);

  // Helper function to extract choice letter (handles both "A." and "A:" formats)
  const getChoiceLetter = (choice) => {
    const match = choice.match(/^([A-Z])[.:]/);
    return match ? match[1] : choice.charAt(0);
  };

  // Reading question types
  const readingQuestionTypes = [
    { id: "Notes_Rhetorical_Synthesis", name: "Rhetorical Synthesis" },
    { id: "Reading_Boundaries", name: "Reading Boundaries" },
    { id: "Reading_Central_Ideas_And_Details", name: "Central Ideas & Details" },
    { id: "Reading_Command_Of_Evidence", name: "Command of Evidence" },
    { id: "Reading_Form_Structure_And_Sense", name: "Form, Structure & Sense" },
    { id: "Reading_Inferences", name: "Inferences" },
    { id: "Reading_Text_Strucutre_And_Purpose", name: "Text Structure & Purpose" },
    { id: "Reading_Transitions", name: "Transitions" },
    { id: "Reading_Words_In_Context", name: "Words in Context" },
    { id: "Reading2_Cross-Text_Connections", name: "Cross-Text Connections" }
  ];

  // Math question types
  const mathQuestionTypes = [
    { id: "Linear Equations in One Variable", name: "Linear Equations in One Variable" },
    { id: "Linear Equations in Two Variables", name: "Linear Equations in Two Variables" },
    { id: "Systems of Two Linear Equations in Two Variables", name: "Systems of Linear Equations" },
    { id: "Linear Functions", name: "Linear Functions" },
    { id: "Linear Inequalities in One or Two Variables", name: "Linear Inequalities" },
    { id: "Nonlinear Functions", name: "Nonlinear Functions" },
    { id: "Nonlinear Functions and Systems of Equations in Two Variables", name: "Nonlinear Systems" },
    { id: "Equivalent Expressions", name: "Equivalent Expressions" },
    { id: "Right Triangles and Trigonometry", name: "Right Triangles & Trigonometry" },
    { id: "Lines, Angles, and Triangles", name: "Lines, Angles, and Triangles" },
    { id: "Circles", name: "Circles" },
    { id: "Area and Volume", name: "Area and Volume" },
    { id: "Ratios, Rates, Proportional Relationships, and Units", name: "Ratios and Proportions" },
    { id: "Percentages", name: "Percentages" },
    { id: "Probability and Conditional Probability", name: "Probability" },
    { id: "One Variable Data", name: "One Variable Data" },
    { id: "Two Variable Data", name: "Two Variable Data" },
    { id: "Inference From Sample Statistics and Margin of Error", name: "Statistical Inference" },
    { id: "Evaluating Statistical Claims", name: "Evaluating Statistical Claims" }
  ];

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  // Poll game state
  const pollGameState = async () => {
    if (!game?.gameCode) return;

    try {
      const response = await fetch(`/api/multiplayer/game/${game.gameCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const updatedGame = data.game;

        setGame(updatedGame);

        // Handle game state changes
        if (updatedGame.status === "finished" && screen !== "finished") {
          handleGameEnd(updatedGame);
        } else if (updatedGame.status === "waiting" && screen === "finished") {
          // Rematch created - move to waiting room
          setScreen("waiting");
        } else if (updatedGame.status === "active" && screen === "waiting") {
          setScreen("playing");
          if (updatedGame.currentQuestion) {
            setCurrentQuestion(updatedGame.currentQuestion);
            startTimer(updatedGame);
          }
        } else if (updatedGame.status === "active" && screen === "playing") {
          // Update current question from server
          if (updatedGame.currentQuestion) {
            setCurrentQuestion(updatedGame.currentQuestion);
            startTimer(updatedGame);
          }
        } else if (updatedGame.status === "forfeited") {
          handleGameEnd(updatedGame);
        }

        // Check if both players want rematch - auto-create rematch
        if (screen === "finished" && updatedGame.players) {
          const rematchReady = updatedGame.players.filter(p => p.wantsRematch).length;
          if (rematchReady === 2 && updatedGame.status === "finished") {
            // Both ready - create rematch (only one player should trigger to avoid race condition)
            // The player who clicked first will create it
            const currentPlayerReady = updatedGame.players.find(p => p.userId === user?.id)?.wantsRematch;
            if (currentPlayerReady) {
              // Small delay to let the other player's request complete first
              setTimeout(() => {
                createRematch();
              }, 500);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error polling game state:", err);
    }
  };

  // Start timer for timed mode
  const startTimer = (gameState) => {
    if (gameState.gameMode === "timed" && gameState.questionStartTime) {
      const startTime = new Date(gameState.questionStartTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, gameState.timeLimit - elapsed);
      
      setTimeRemaining(remaining);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Start polling when in game
  useEffect(() => {
    if ((screen === "waiting" || screen === "playing" || screen === "finished") && game?.gameCode) {
      const interval = setInterval(pollGameState, 2000); // Poll every 2 seconds
      setPollInterval(interval);
      return () => {
        clearInterval(interval);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [screen, game?.gameCode]);

  // Handle time running out in timed mode - automatically advance to next round
  useEffect(() => {
    if (timeRemaining === 0 && game?.gameMode === "timed" && screen === "playing" && game?.status === "active") {
      // Time's up - automatically move to next round
      setTimeout(() => {
        nextRound();
      }, 1000); // Wait 1 second to show final state, then auto-advance
    }
  }, [timeRemaining, game?.gameMode, screen, game?.status]);

  // Create game
  const createGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/multiplayer/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok) {
        setGame(data.game);
        setGameCode(data.game.gameCode);
        setScreen("waiting");
      } else {
        setError(data.error || "Failed to create game");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error creating game:", err);
    } finally {
      setLoading(false);
    }
  };

  // Join game
  const joinGame = async () => {
    if (!gameCode || gameCode.length !== 6) {
      setError("Please enter a valid 6-character game code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/multiplayer/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gameCode: gameCode.toUpperCase() })
      });

      const data = await response.json();

      if (response.ok) {
        setGame(data.game);
        setScreen("waiting");
      } else {
        setError(data.error || "Failed to join game");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error joining game:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark ready
  const markReady = async () => {
    try {
      const response = await fetch("/api/multiplayer/ready", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gameCode: game.gameCode, isReady: true })
      });

      if (response.ok) {
        await pollGameState();
      }
    } catch (err) {
      console.error("Error marking ready:", err);
    }
  };

  // Start game (creator only)
  const startGame = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/multiplayer/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gameCode: game.gameCode })
      });

      if (response.ok) {
        await pollGameState();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to start game");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!selectedAnswer) return;

    try {
      const response = await fetch("/api/multiplayer/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          gameCode: game.gameCode,
          answer: selectedAnswer
        })
      });

      if (response.ok) {
        const data = await response.json();
        await pollGameState();
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  // Next round
  const nextRound = async () => {
    try {
      const response = await fetch("/api/multiplayer/next-round", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gameCode: game.gameCode })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.gameFinished) {
          // Get final game state with winner
          await pollGameState();
          setTimeout(() => {
            pollGameState(); // Poll again to get updated scores
          }, 500);
        } else {
          setSelectedAnswer("");
          setCurrentQuestion(data.currentQuestion || null);
          await pollGameState();
        }
      }
    } catch (err) {
      console.error("Error moving to next round:", err);
    }
  };

  // Forfeit game
  const forfeitGame = async () => {
    if (!confirm("Are you sure you want to forfeit this game?")) return;

    try {
      const response = await fetch("/api/multiplayer/forfeit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gameCode: game.gameCode })
      });

      if (response.ok) {
        await pollGameState();
      }
    } catch (err) {
      console.error("Error forfeiting game:", err);
    }
  };

  // Handle game end
  const handleGameEnd = (gameData) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const winner = gameData.winner;
    const currentUserId = user?.id;

    // Check if current user won
    if (winner && (winner.userId === currentUserId || winner.id === currentUserId)) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Update game state with winner info
    const updatedGame = { ...game };
    if (gameData.winner) {
      updatedGame.winner = gameData.winner;
    }
    if (gameData.players) {
      updatedGame.players = gameData.players;
    }
    updatedGame.status = gameData.status || "finished";
    
    setGame(updatedGame);
    setScreen("finished");
  };

  // Reset game
  const resetGame = () => {
    setScreen("main");
    setGame(null);
    setGameCode("");
    setCurrentQuestion(null);
    setSelectedAnswer("");
    setTimeRemaining(null);
    setError(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Fetch game history
  const fetchGameHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch("/api/multiplayer/game-history", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGameHistory(data.games || []);
      }
    } catch (err) {
      console.error("Error fetching game history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Main menu screen
  if (screen === "main") {
    return (
      <div className="min-h-screen pt-24 sm:pt-32 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Multiplayer 1v1
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Challenge your friends to a SAT question battle!
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <motion.button
                onClick={() => setScreen("create")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Create Game
              </motion.button>
              <motion.button
                onClick={() => setScreen("join")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Join Game
              </motion.button>
              <motion.button
                onClick={() => {
                  fetchGameHistory();
                  setScreen("history");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Game History
              </motion.button>
            </div>
          </GlassComponents>
        </motion.div>
      </div>
    );
  }

  // Create game screen
  if (screen === "create") {
    return (
      <div className="min-h-screen pt-24 sm:pt-32 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setScreen("main")}
            className="mb-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back
          </button>

          <GlassComponents
            className="rounded-lg p-8"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Game</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSettings({ ...settings, category: "english", questionType: null })}
                    className={`p-3 rounded-lg border-2 ${
                      settings.category === "english"
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, category: "math", questionType: null })}
                    className={`p-3 rounded-lg border-2 ${
                      settings.category === "math"
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    Math
                  </button>
                </div>
              </div>

              {/* Question Type (for English) */}
              {settings.category === "english" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type (Optional)
                  </label>
                  <select
                    value={settings.questionType || ""}
                    onChange={(e) => setSettings({ ...settings, questionType: e.target.value || null })}
                    className="w-full p-3 rounded-lg border-2 border-gray-200"
                  >
                    <option value="">All Types</option>
                    {readingQuestionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Question Type (for Math) */}
              {settings.category === "math" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type (Optional)
                  </label>
                  <select
                    value={settings.questionType || ""}
                    onChange={(e) => setSettings({ ...settings, questionType: e.target.value || null })}
                    className="w-full p-3 rounded-lg border-2 border-gray-200"
                  >
                    <option value="">All Types</option>
                    {mathQuestionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Number of Rounds */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rounds: {settings.numRounds}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={settings.numRounds}
                  onChange={(e) => setSettings({ ...settings, numRounds: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Game Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Mode
                </label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => setSettings({ ...settings, gameMode: "fast" })}
                    className={`p-3 rounded-lg border-2 ${
                      settings.gameMode === "fast"
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    Fast (First to Answer)
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, gameMode: "timed" })}
                    className={`p-3 rounded-lg border-2 ${
                      settings.gameMode === "timed"
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    Timed
                  </button>
                </div>
                {settings.gameMode === "timed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time per Question (seconds): {settings.timeLimit}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={settings.timeLimit}
                      onChange={(e) => setSettings({ ...settings, timeLimit: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <motion.button
                onClick={createGame}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Game"}
              </motion.button>
            </div>
          </GlassComponents>
        </div>
      </div>
    );
  }

  // Join game screen
  if (screen === "join") {
    return (
      <div className="min-h-screen pt-24 sm:pt-32 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setScreen("main")}
            className="mb-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back
          </button>

          <GlassComponents
            className="rounded-lg p-8"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Join Game</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Game Code (6 characters)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-lg border-2 border-gray-200 text-center text-2xl font-bold tracking-widest uppercase"
                  placeholder="ABC123"
                />
              </div>

              <motion.button
                onClick={joinGame}
                disabled={loading || gameCode.length !== 6}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Game"}
              </motion.button>
            </div>
          </GlassComponents>
        </div>
      </div>
    );
  }

  // Waiting room
  if (screen === "waiting" && game) {
    const currentPlayer = game.players?.find(p => p.id === user?.id);
    const isCreator = game.creatorId === user?.id;
    const allReady = game.players?.every(p => p.isReady) && game.players?.length === 2;

    return (
      <div className="min-h-screen pt-24 sm:pt-32 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <GlassComponents
            className="rounded-lg p-8"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Waiting Room</h2>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Share this code with your friend:</p>
              <div className="text-4xl font-bold text-primary text-center tracking-widest mb-4">
                {game.gameCode}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {game.players?.map((player, index) => (
                <div
                  key={player.id}
                  className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{player.firstName || player.username}</p>
                    {player.id === user?.id && isCreator && <p className="text-xs text-gray-500">(You - Creator)</p>}
                    {player.id === user?.id && !isCreator && <p className="text-xs text-gray-500">(You)</p>}
                  </div>
                  <div>
                    {player.isReady ? (
                      <span className="text-green-600 font-semibold">Ready ✓</span>
                    ) : (
                      <span className="text-gray-400">Not Ready</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {!currentPlayer?.isReady && (
                <motion.button
                  onClick={markReady}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  I'm Ready
                </motion.button>
              )}

              {isCreator && allReady && (
                <motion.button
                  onClick={startGame}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Starting..." : "Start Game"}
                </motion.button>
              )}

              <motion.button
                onClick={forfeitGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Forfeit Game
              </motion.button>
            </div>
          </GlassComponents>
        </div>
      </div>
    );
  }

  // Playing screen
  if (screen === "playing" && game && currentQuestion) {
    const currentPlayer = game.players?.find(p => p.id === user?.id);
    const otherPlayer = game.players?.find(p => p.id !== user?.id);
    const hasAnswered = currentPlayer?.currentAnswer;
    const bothAnswered = game.players?.every(p => p.currentAnswer);

    return (
      <div className="min-h-screen pt-24 sm:pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Scoreboard */}
          <div className="mb-6 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {currentPlayer?.firstName || currentPlayer?.username || "You"}
              </p>
              <p className="text-2xl font-bold text-primary">
                {currentPlayer?.score || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">VS</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {otherPlayer?.firstName || otherPlayer?.username || "Opponent"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {otherPlayer?.score || 0}
              </p>
            </div>
          </div>

          {/* Round Info */}
          <div className="mb-6 text-center">
            <p className="text-lg font-semibold text-gray-700">
              Round {game.currentRound} of {game.numRounds}
            </p>
            {game.gameMode === "timed" && timeRemaining !== null && (
              <p className={`text-2xl font-bold mt-2 ${
                timeRemaining <= 10 ? "text-red-600" : "text-primary"
              }`}>
                {timeRemaining}s
              </p>
            )}
          </div>

          <GlassComponents
            className="rounded-lg p-8"
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
              <div className="text-sm font-medium text-gray-600 mb-3 bg-gray-50 px-3 py-2 rounded-lg">
                <span className="font-semibold">Topic:</span> {currentQuestion.Topic?.replace(/_/g, ' ')}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
                {currentQuestion.Question}
              </h2>
            </div>

            <div className="space-y-3 mb-6">
              {currentQuestion.Choices.map((choice, index) => {
                const choiceLetter = getChoiceLetter(choice);
                return (
                  <motion.button
                    key={index}
                    onClick={() => !hasAnswered && setSelectedAnswer(choiceLetter)}
                    disabled={hasAnswered}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === choiceLetter
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    } ${hasAnswered ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    whileHover={!hasAnswered ? { scale: 1.01 } : {}}
                    whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                  >
                    <span className="font-medium leading-relaxed">{choice}</span>
                  </motion.button>
                );
              })}
            </div>

            {hasAnswered && (
              <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg">
                <p>Waiting for opponent to answer{game.gameMode === "timed" && timeRemaining > 0 ? ` (${timeRemaining}s remaining)` : ""}...</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {!hasAnswered ? (
                <motion.button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedAnswer
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  whileHover={selectedAnswer ? { scale: 1.05 } : {}}
                  whileTap={selectedAnswer ? { scale: 0.95 } : {}}
                >
                  Submit Answer
                </motion.button>
              ) : bothAnswered ? (
                <motion.button
                  onClick={nextRound}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {game.currentRound < game.numRounds ? "Next Round" : "Finish Game"}
                </motion.button>
              ) : null}

              <motion.button
                onClick={forfeitGame}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Forfeit Game
              </motion.button>
            </div>
          </GlassComponents>
        </div>
      </div>
    );
  }

  // Create rematch
  const createRematch = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/multiplayer/rematch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gameCode: game.gameCode })
      });

      if (response.ok) {
        const data = await response.json();
        setGame(data.game);
        setGameCode(data.game.gameCode);
        setScreen("waiting");
        setCurrentQuestion(null);
        setSelectedAnswer("");
        setTimeRemaining(null);
      }
    } catch (err) {
      console.error("Error creating rematch:", err);
      setError("Failed to create rematch. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Request rematch
  const requestRematch = async () => {
    try {
      const response = await fetch("/api/multiplayer/rematch-ready", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ gameCode: game.gameCode })
      });

      if (response.ok) {
        const data = await response.json();
        await pollGameState();
        
        // If both players are ready, create rematch automatically
        if (data.rematchReadyCount === 2) {
          await createRematch();
        }
      }
    } catch (err) {
      console.error("Error requesting rematch:", err);
    }
  };

  // Game History screen
  if (screen === "history") {
    return (
      <div className="min-h-screen pt-24 sm:pt-32 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setScreen("main")}
              className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to Main Menu</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Game History</h1>
          </div>

          {loadingHistory ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading game history...</p>
            </div>
          ) : selectedGame ? (
            // Show selected game details and questions
            <div>
              <button
                onClick={() => {
                  setSelectedGame(null);
                  setRevealedAnswers(new Set());
                }}
                className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
              >
                <span>←</span>
                <span>Back to History</span>
              </button>
              <GlassComponents
                className="rounded-lg p-8 mb-6"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Game vs {selectedGame.opponent?.firstName || selectedGame.opponent?.username || "Unknown"}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Your Score</p>
                    <p className="text-2xl font-bold text-primary">{selectedGame.userScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Opponent Score</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedGame.opponentScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Result</p>
                    <p className={`text-xl font-bold ${
                      selectedGame.winner === 'user' ? 'text-green-600' :
                      selectedGame.winner === 'opponent' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {selectedGame.winner === 'user' ? 'Win ✓' :
                       selectedGame.winner === 'opponent' ? 'Loss ✗' :
                       'Tie'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedGame.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">Questions from this Game</h3>
                
                {/* Game Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Game Mode: {selectedGame.gameMode === 'fast' ? 'Fast Mode' : `Timed Mode (${selectedGame.timeLimit}s)`}</p>
                      <p className="text-sm text-gray-600">Category: {selectedGame.category?.charAt(0).toUpperCase() + selectedGame.category?.slice(1)}</p>
                      {selectedGame.questionType && (
                        <p className="text-sm text-gray-600">Question Type: {selectedGame.questionType?.replace(/_/g, ' ')}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Questions: {selectedGame.questions?.length || 0}</p>
                      <p className="text-sm text-gray-600">Rounds Played: {selectedGame.numRounds}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedGame.questions && selectedGame.questions.length > 0 ? (
                    selectedGame.questions.map((question, index) => {
                      const questionNumber = question.questionNumber || index + 1;
                      const questionText = question.Question || question.question;
                      const key = `${selectedGame.id}-${questionNumber}-${questionText}`;
                      const isRevealed = revealedAnswers.has(key);
                      const hasUserAnswer = question.userAnswer !== undefined && question.userAnswer !== null;
                      const isCorrect = question.isCorrect;
                      
                      return (
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
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Question {questionNumber}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {question.Topic?.replace(/_/g, ' ') || 'Unknown Topic'}
                              </span>
                              {hasUserAnswer && (
                                <span className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-full ${
                                  isCorrect 
                                    ? 'bg-green-100 text-green-700 border border-green-300' 
                                    : 'bg-red-100 text-red-700 border border-red-300'
                                }`}>
                                  {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-sm sm:text-base text-gray-900 leading-relaxed">
                              {questionText}
                            </p>
                          </div>
                          
                          {/* Reveal Answer Button */}
                          <motion.button
                            onClick={() => {
                              setRevealedAnswers(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(key)) {
                                  newSet.delete(key);
                                } else {
                                  newSet.add(key);
                                }
                                return newSet;
                              });
                            }}
                            className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-4"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isRevealed ? '👁️ Hide Answer' : '🔍 Reveal Answer'}
                          </motion.button>

                          {/* Show user's answer when revealed */}
                          {isRevealed && hasUserAnswer && (
                            <div className={`${
                              isCorrect 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            } p-3 rounded-lg border mb-3`}>
                              <p className={`text-xs font-medium mb-1 ${
                                isCorrect ? 'text-green-700' : 'text-red-700'
                              }`}>
                                Your Answer:
                              </p>
                              <p className={`text-sm font-semibold ${
                                isCorrect ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {question.userAnswer}
                              </p>
                            </div>
                          )}
                          
                          {/* Answer Choices - only show highlighting when revealed */}
                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-600 mb-2">Answer Choices:</p>
                            <div className="space-y-2">
                              {question.Choices?.map((choice, choiceIndex) => {
                                const choiceLetter = getChoiceLetter(choice);
                                const isCorrectAnswer = isRevealed && choiceLetter === question.Answer;
                                const isUserAnswer = isRevealed && hasUserAnswer && choiceLetter === question.userAnswer;
                                
                                return (
                                  <div
                                    key={choiceIndex}
                                    className={`p-2 rounded text-xs ${
                                      isUserAnswer && isCorrectAnswer
                                        ? 'bg-green-100 border border-green-300 text-green-800'
                                        : isUserAnswer && !isCorrectAnswer
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
                        </GlassComponents>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No questions available for this game.</p>
                    </div>
                  )}
                </div>
              </GlassComponents>
            </div>
          ) : (
            // Show list of games
            <div className="space-y-4">
              {gameHistory.length > 0 ? (
                gameHistory.map((game) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <GlassComponents
                      className="rounded-lg p-6 cursor-pointer"
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
                      onClick={() => {
                        setSelectedGame(game);
                        setRevealedAnswers(new Set());
                      }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              vs {game.opponent?.firstName || game.opponent?.username || "Unknown"}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              game.winner === 'user' ? 'bg-green-100 text-green-700' :
                              game.winner === 'opponent' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {game.winner === 'user' ? 'Win' :
                               game.winner === 'opponent' ? 'Loss' :
                               'Tie'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {game.gameMode === 'fast' ? 'Fast Mode' : `Timed Mode (${game.timeLimit}s)`} • {game.numRounds} rounds
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(game.createdAt).toLocaleDateString()} {new Date(game.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">You</p>
                            <p className="text-2xl font-bold text-primary">{game.userScore}</p>
                          </div>
                          <div className="text-gray-400">-</div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Opponent</p>
                            <p className="text-2xl font-bold text-gray-900">{game.opponentScore}</p>
                          </div>
                        </div>
                      </div>
                    </GlassComponents>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📜</div>
                  <p className="text-lg font-medium">No game history yet!</p>
                  <p className="text-sm">Play some games to see your history here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Finished screen
  if (screen === "finished" && game) {
    const currentPlayer = game.players?.find(p => p.id === user?.id);
    const otherPlayer = game.players?.find(p => p.id !== user?.id);
    
    // Determine winner - check winner object first, then compare scores
    let isWinner = false;
    let isTie = false;
    
    if (game.winner) {
      // Use winner object if available
      isWinner = game.winner.userId === user?.id || game.winner.id === user?.id;
    } else if (currentPlayer && otherPlayer) {
      // Fallback: compare scores
      if (currentPlayer.score > otherPlayer.score) {
        isWinner = true;
      } else if (currentPlayer.score === otherPlayer.score) {
        isTie = true;
      }
    }

    // Count rematch ready players
    const rematchReadyCount = game.players?.filter(p => p.wantsRematch).length || 0;
    const isReadyForRematch = currentPlayer?.wantsRematch || false;

    return (
      <div className="min-h-screen pt-24 sm:pt-32 pb-8 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
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
              {isTie ? "It's a Tie! 🎉" : isWinner ? "You Won! 🎉" : "Game Over"}
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-lg ${isWinner && !isTie ? "bg-green-50 border-2 border-green-300" : "bg-gray-50"}`}>
                <p className="font-semibold text-gray-700 mb-2">
                  {currentPlayer?.firstName || currentPlayer?.username || "You"}
                </p>
                <p className={`text-3xl font-bold ${isWinner && !isTie ? "text-green-600" : "text-gray-600"}`}>
                  {currentPlayer?.score || 0}
                </p>
              </div>
              <div className={`p-6 rounded-lg ${!isWinner && !isTie && otherPlayer ? "bg-green-50 border-2 border-green-300" : "bg-gray-50"}`}>
                <p className="font-semibold text-gray-700 mb-2">
                  {otherPlayer?.firstName || otherPlayer?.username || "Opponent"}
                </p>
                <p className={`text-3xl font-bold ${!isWinner && !isTie && otherPlayer ? "text-green-600" : "text-gray-600"}`}>
                  {otherPlayer?.score || 0}
                </p>
              </div>
            </div>

            {/* Rematch Status */}
            {rematchReadyCount > 0 && (
              <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                {rematchReadyCount}/2 players ready for rematch
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isReadyForRematch ? (
                <motion.button
                  onClick={requestRematch}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? "Starting..." : "Play Again"}
                </motion.button>
              ) : (
                <motion.div
                  className="bg-green-100 text-green-800 px-8 py-4 rounded-lg text-lg font-semibold"
                >
                  Waiting for other player...
                </motion.div>
              )}
              <motion.button
                onClick={() => setScreen("main")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Main Menu
              </motion.button>
            </div>
          </GlassComponents>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default MultiplayerMode;
