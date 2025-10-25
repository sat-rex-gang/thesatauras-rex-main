"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import GlassComponents from "../../components/GlassComponents";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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

    const result = await login(formData.email, formData.password);

    if (result.success) {
      router.push("/dashboard");
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-[15px] text-tertiary font-semibold">
            Or{" "}
            <motion.a
              href="/signup"
              className="relative inline-flex flex-col items-start justify-center font-semibold"
              initial="rest"
              animate="rest"
              whileHover="hover"
              variants={{
                rest: { color: "var(--color-primary)" },
                hover: { color: "var(--color-tertiary-hover)" },
              }}
            >
              create an account
              <motion.span
                className="absolute left-0 bottom-0 h-[3px] bg-tertiary-hover"
                variants={{
                  rest: { width: 0 },
                  hover: { width: "100%" },
                }}
              />
            </motion.a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <GlassComponents 
            className="rounded-md shadow-sm flex flex-col gap-2 p-1 mx-auto" width="200px" height="auto"
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
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
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
            </div>
            <hr className="relative w-[90%] border-t-2 border-tertiary mt-2" />
            <div className="mt-2">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 rounded-full focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-transparent"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </GlassComponents>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
            <motion.button
              type="submit"
              disabled={loading}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.03, transition: { ease: "circOut" } }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-auto h-auto flex justify-center items-center text-sm font-bold rounded-md text-primary mx-auto"
            >
              <GlassComponents 
                className="rounded-md shadow-sm flex justify-center items-center gap-2 px-3 py-2" width="100px" height="auto" 
                borderRadius={50}
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
                {loading ? "Signing in..." : "Sign in"}
              </GlassComponents>
            </motion.button>
        </form>
      </motion.div>
    </div>
  );
}