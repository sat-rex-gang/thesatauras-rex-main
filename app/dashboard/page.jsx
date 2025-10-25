"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import GradientText from "../../components/GradientText";
import { useEffect } from "react";
import CountUp from "../../components/CountUp";
import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import GlassComponents from "../../components/GlassComponents";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: "Practice Tests Completed",
      value: user?.practiceTests?.length || 0,
    },
    {
      title: "Vocabulary Words Mastered",
      value: user?.vocabProgress?.filter((v) => v.mastered).length || 0,
    },
    {
      title: "Best SAT Score",
      value:
        user?.satScores?.length > 0
          ? Math.max(...user.satScores.map((s) => s.total))
          : "N/A",
    },
    {
      title: "Days Active",
      value: user?.createdAt
        ? Math.ceil(
            (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
          )
        : 0,
    },
  ];

  return (
    <div className="min-h-screen py-8 mt-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-secondary">
            Welcome back, 
            <GradientText className="text-secondary text-3xl" colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]} animationSpeed={8} showBorder={false}>
              {user?.firstName || user?.username}!
            </GradientText>
          </h1>
          <p className="mt-2 text-tertiary font-semibold">
            Ready to boost your SAT score? Let's get started.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassComponents 
                className="rounded-lg shadow-sm flex items-center p-6" 
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
                <div className="flex items-center">
                  <div className="">
                    <p className="text-sm text-tertiary font-bold">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-semibold text-secondary">
                      <CountUp from={0} to={stat.value} duration={1} />
                    </p>
                  </div>
                </div>
              </GlassComponents>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <MotionConfig
          transition={{
            ease: "circOut",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <GlassComponents 
              className="rounded-lg shadow-sm flex flex-col" 
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
              <div className="px-6 py-4 border-b border-tertiary-hover">
                <h2 className="text-lg font-extrabold text-secondary">
                  <GradientText className="text-2xl" colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]} animationSpeed={8} showBorder={false}>Quick Actions</GradientText>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/questions">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 border border-tertiary-hover rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <div className="text-center">
                        <h3 className="font-bold text-secondary">
                          Practice Questions
                        </h3>
                        <p className="text-sm text-tertiary font-semibold">
                          Test your knowledge
                        </p>
                      </div>
                    </motion.div>
                  </Link>

                  <Link href="/vocab">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 border border-tertiary-hover rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <div className="text-center">
                        <h3 className="font-bold text-secondary">Vocabulary</h3>
                        <p className="text-sm text-tertiary font-semibold">
                          Master SAT words
                        </p>
                      </div>
                    </motion.div>
                  </Link>

                  <Link href="/leaderboards">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 border border-tertiary-hover rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <div className="text-center">
                        <h3 className="text-secondary font-bold">Leaderboards</h3>
                        <p className="text-sm text-tertiary font-semibold">
                          See how you rank
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </GlassComponents>
          </motion.div>
        </MotionConfig>
        {user?.practiceTests?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassComponents 
              className="rounded-lg shadow-sm flex flex-col" 
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
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Recent Practice Tests
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {user.practiceTests.slice(0, 5).map((test, index) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {test.testType} Test
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(test.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          <CountUp from={0} to={test.score} duration={1} />
                        </p>
                        <p className="text-sm text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassComponents>
          </motion.div>
        )}
      </div>
    </div>
  );
}