"use client";

import GradientText from "../../components/GradientText";
import React from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { motion } from "framer-motion";
import GlassComponents from "../../components/GlassComponents";

export default function Leaderboards() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 mt-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-secondary mb-8">
            National Leaderboards
          </h1>
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{
              y: 0,
              opacity: 1,
              transition: {
                duration: "0.3",
              },
            }}
            viewport={{ once: true }}
          >
            <GlassComponents
              className="rounded-lg shadow-sm p-8 text-center"
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
              <GradientText
                className="font-bold inline"
                colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
                animationSpeed={8}
                showBorder={false}
              >
                Leaderboards Coming Soon!
              </GradientText>
              <p className="text-sm text-tertiary font-semibold mt-2">
                This is where you will rise to the top—where the whole world will
                see your glory.
              </p>
            </GlassComponents>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}