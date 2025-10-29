"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import GlassComponents from "../../components/GlassComponents";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { user, token, fetchUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    profilePicture: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        profilePicture: user.profilePicture || "",
        password: "",
        confirmPassword: ""
      });
      syncQuestionsCount();
      fetchStats();
      fetchProfile();
    }
  }, [user]);

  const syncQuestionsCount = async () => {
    try {
      // Calculate total questions answered from localStorage
      let totalQuestionsAnswered = 0;
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('practice-progress-')) {
            try {
              const progressData = JSON.parse(localStorage.getItem(key));
              if (progressData.correctAnswers) {
                totalQuestionsAnswered += progressData.correctAnswers.length;
              }
              if (progressData.wrongAnswers) {
                totalQuestionsAnswered += progressData.wrongAnswers.length;
              }
            } catch (e) {
              console.error('Error parsing localStorage:', e);
            }
          }
        }
      }

      // Sync to database
      if (totalQuestionsAnswered > 0 && token) {
        await fetch('/api/questions/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ totalQuestionsAnswered })
        });
      }
    } catch (err) {
      console.error('Error syncing questions count:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          username: data.user.username || "",
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          bio: data.user.bio || "",
          profilePicture: data.user.profilePicture || ""
        }));
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Calculate singleplayer questions from localStorage
        let totalQuestionsAnswered = 0;
        if (typeof window !== 'undefined') {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('practice-progress-')) {
              try {
                const progressData = JSON.parse(localStorage.getItem(key));
                if (progressData.correctAnswers) {
                  totalQuestionsAnswered += progressData.correctAnswers.length;
                }
                if (progressData.wrongAnswers) {
                  totalQuestionsAnswered += progressData.wrongAnswers.length;
                }
              } catch (e) {
                console.error('Error parsing localStorage:', e);
              }
            }
          }
        }
        
        setStats({
          ...data,
          singleplayer: {
            ...data.singleplayer,
            totalQuestionsAnswered: totalQuestionsAnswered || data.singleplayer.totalQuestionsAnswered || 0
          }
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image file is too large. Please use an image smaller than 2MB.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        
        // Compress the image if it's too large (base64 string > 500KB)
        if (result.length > 500 * 1024) {
          // Create an image to resize
          const img = new Image();
          img.onload = () => {
            // Create canvas to resize
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression (quality 0.8)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            
            setFormData({
              ...formData,
              profilePicture: compressedBase64
            });
          };
          img.onerror = () => {
            setError("Error processing image. Please try another image.");
          };
          img.src = result;
        } else {
          // Image is small enough, use as-is
          setFormData({
            ...formData,
            profilePicture: result
          });
        }
      };
      reader.onerror = () => {
        setError("Error reading image file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        profilePicture: formData.profilePicture
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setError(""); // Clear any previous errors
        if (fetchUser && token) {
          await fetchUser(token); // Refresh user data
        }
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: "",
          confirmPassword: ""
        }));
        // Refresh stats
        await fetchStats();
      } else {
        // Display detailed error if available
        const errorMessage = data.details || data.error || "Failed to update profile";
        setError(errorMessage);
        console.error("Profile update error:", data);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-24 sm:pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2">
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
                {!isEditing ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                      <motion.button
                        onClick={() => setIsEditing(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                      >
                        Edit Profile
                      </motion.button>
                    </div>

                    <div className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                          {formData.profilePicture ? (
                            <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            (formData.firstName?.charAt(0) || formData.username?.charAt(0) || "U").toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {formData.firstName || formData.username || "User"}
                          </p>
                          <p className="text-sm text-gray-600">@{formData.username}</p>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Email</p>
                          <p className="text-base text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Username</p>
                          <p className="text-base text-gray-900">{formData.username}</p>
                        </div>
                        {formData.firstName && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">First Name</p>
                            <p className="text-base text-gray-900">{formData.firstName}</p>
                          </div>
                        )}
                        {formData.lastName && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Last Name</p>
                            <p className="text-base text-gray-900">{formData.lastName}</p>
                          </div>
                        )}
                        {formData.bio && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Bio</p>
                            <p className="text-base text-gray-900">{formData.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                      <motion.button
                        onClick={() => {
                          setIsEditing(false);
                          setError("");
                          setSuccess("");
                          // Reset form data
                          if (user) {
                            setFormData({
                              username: user.username || "",
                              firstName: user.firstName || "",
                              lastName: user.lastName || "",
                              bio: user.bio || "",
                              profilePicture: user.profilePicture || "",
                              password: "",
                              confirmPassword: ""
                            });
                          }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </motion.button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                          {success}
                        </div>
                      )}

                      {/* Profile Picture */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Picture
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                            {formData.profilePicture ? (
                              <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              (formData.firstName?.charAt(0) || formData.username?.charAt(0) || "U").toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <label htmlFor="profile-picture-input" className="block">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                                className="hidden"
                                id="profile-picture-input"
                              />
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => document.getElementById('profile-picture-input')?.click()}
                                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors cursor-pointer shadow-md"
                              >
                                Choose File
                              </motion.button>
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Select an image file to upload as your profile picture</p>
                          </div>
                        </div>
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password (leave blank to keep current)
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Confirm Password */}
                      {formData.password && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
                          />
                        </div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </motion.button>
                    </form>
                  </>
                )}
              </GlassComponents>
            </div>

            {/* Stats Card */}
            <div>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h2>

                {stats ? (
                  <div className="space-y-6">
                    {/* Multiplayer Stats */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Multiplayer</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Games</span>
                          <span className="font-bold text-gray-900">{stats.multiplayer.totalGames}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Wins</span>
                          <span className="font-bold text-green-600">{stats.multiplayer.wins}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Losses</span>
                          <span className="font-bold text-red-600">{stats.multiplayer.losses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ties</span>
                          <span className="font-bold text-gray-600">{stats.multiplayer.ties}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Win Rate</span>
                          <span className="font-bold text-primary">{stats.multiplayer.winRate}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Singleplayer Stats */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Singleplayer</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Questions Answered</span>
                          <span className="font-bold text-gray-900">{stats.singleplayer.totalQuestionsAnswered}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Practice Tests</span>
                          <span className="font-bold text-gray-900">{stats.singleplayer.totalTests}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-600">Loading stats...</p>
                  </div>
                )}
              </GlassComponents>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

