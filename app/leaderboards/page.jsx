"use client";

import GradientText from "../../components/GradientText";
import React, { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { motion } from "framer-motion";
import GlassComponents from "../../components/GlassComponents";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Leaderboards() {
  const { user } = useAuth();
  const router = useRouter();
  const [multiplayerLeaderboard, setMultiplayerLeaderboard] = useState([]);
  const [singlePlayerLeaderboard, setSinglePlayerLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("multiplayer");

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const response = await fetch('/api/leaderboards');
      if (response.ok) {
        const data = await response.json();
        setMultiplayerLeaderboard(data.multiplayer || []);
        setSinglePlayerLeaderboard(data.singlePlayer || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLeaderboard = (leaderboard, type) => (
    <div className="space-y-3">
      {leaderboard.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No data available yet. Start playing to see rankings!</p>
        </div>
      ) : (
        leaderboard.map((entry, index) => {
          const isCurrentUser = user && entry.id === user.id;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                isCurrentUser 
                  ? 'bg-primary/10 border-2 border-primary' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => router.push(`/user/${entry.id}`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                entry.rank === 1 ? 'bg-yellow-500 text-white' :
                entry.rank === 2 ? 'bg-gray-400 text-white' :
                entry.rank === 3 ? 'bg-orange-500 text-white' :
                'bg-primary text-white'
              }`}>
                {entry.rank}
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                {entry.profilePicture ? (
                  <img src={entry.profilePicture} alt={entry.username} className="w-full h-full object-cover" />
                ) : (
                  (entry.firstName?.charAt(0) || entry.username?.charAt(0) || "U").toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${isCurrentUser ? 'text-primary' : 'text-gray-900'}`}>
                  {entry.firstName || entry.username}
                  {isCurrentUser && <span className="ml-2 text-xs text-primary">(You)</span>}
                </p>
                <p className="text-sm text-gray-600">@{entry.username}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${isCurrentUser ? 'text-primary' : 'text-gray-900'}`}>
                  {type === "multiplayer" ? entry.multiplayerWins : entry.singlePlayerQuestions}
                </p>
                <p className="text-xs text-gray-500">
                  {type === "multiplayer" ? "Wins" : "Questions"}
                </p>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 mt-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-secondary mb-8">
            National Leaderboards
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <motion.button
              onClick={() => setActiveTab("multiplayer")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "multiplayer"
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Multiplayer Wins
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("singleplayer")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "singleplayer"
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Single Player Questions
            </motion.button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading leaderboards...</p>
            </div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <GlassComponents
                className="rounded-lg shadow-sm p-8"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {activeTab === "multiplayer" 
                    ? "Multiplayer Wins Leaderboard" 
                    : "Single Player Questions Leaderboard"}
                </h2>
                {activeTab === "multiplayer" 
                  ? renderLeaderboard(multiplayerLeaderboard, "multiplayer")
                  : renderLeaderboard(singlePlayerLeaderboard, "singleplayer")}
              </GlassComponents>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}