"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import GlassComponents from "../../components/GlassComponents";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    //validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    //validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);

    if (result.success) {
      router.push(
        "/login?message=Account created successfully! Please sign in."
      );
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-15 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <motion.a
              href="/login"
              className="relative inline-flex flex-col items-start justify-center font-semibold"
              initial="rest"
              animate="rest"
              whileHover="hover"
              variants={{
                rest: { color: "var(--color-primary)" },
                hover: { color: "var(--color-tertiary-hover)" },
              }}
            >
              sign into an existing account
              <motion.span
                className="absolute left-0 bottom-0 h-[3px] bg-tertiary-hover"
                transition={{ duration: 0.3 }}
                variants={{
                  rest: { width: 0 },
                  hover: { width: "100%" },
                }}
              />
            </motion.a>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "circOut" }}
              >
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <GlassComponents 
                  className="rounded-md shadow-sm flex flex-col gap-2 p-1" 
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
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className="appearance-none relative block w-full px-3 py-2 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-transparent"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </GlassComponents>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease: "circOut" }}
              >
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <GlassComponents 
                  className="rounded-md shadow-sm flex flex-col gap-2 p-1" 
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
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className="appearance-none relative block w-full px-3 py-2 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-transparent"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </GlassComponents>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "circOut" }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <GlassComponents 
                className="rounded-md shadow-sm flex flex-col gap-2 p-1" 
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
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-transparent"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </GlassComponents>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25, ease: "circOut" }}
            >
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <GlassComponents 
                className="rounded-md shadow-sm flex flex-col gap-2 p-1" 
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
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-transparent"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </GlassComponents>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "circOut" }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <GlassComponents 
                className="rounded-md shadow-sm flex flex-col gap-2 p-1" 
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
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-transparent"
                  placeholder="Password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                />
              </GlassComponents>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35, ease: "circOut" }}
            >
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <GlassComponents 
                className="rounded-md shadow-sm flex flex-col gap-2 p-1" 
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
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-transparent"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </GlassComponents>
            </motion.div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: "circOut" }}
          >
            <motion.button
              type="submit"
              disabled={loading}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.02, transition: { ease: "circOut" } }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full flex justify-center items-center text-sm font-bold rounded-md text-primary"
            >
              <GlassComponents 
                className="rounded-md shadow-sm flex justify-center items-center gap-2 px-3 py-2" 
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
                {loading ? "Creating account..." : "Create account"}
              </GlassComponents>
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}