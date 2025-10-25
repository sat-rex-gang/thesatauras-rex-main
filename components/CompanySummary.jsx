"use client";

import React from "react";
import { motion } from "framer-motion";
import { VscGraph } from "react-icons/vsc";
import { SiSpeedtest } from "react-icons/si";
import CountUp from "./CountUp";
import GlassComponents from "./GlassComponents";
import GradientText from "./GradientText";

export default function CompanySummaries({ descriptionType }) {
  const descriptions = {
    Scores: (
      <p className="text-[15px] font-semibold text-secondary">
        Consistently, our students score{" "}
        <GradientText
          className="font-bold inline"
          colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
          animationSpeed={8}
          showBorder={false}
        >
          <CountUp
            from={0}
            to={1550}
            separator=""
            direction="up"
            duration={1}
          />+
        </GradientText>{" "} with the help
        of our mentors.
      </p>
    ),
    Tests: (
      <p className="text-[15px] font-semibold text-secondary">
        We meticolously construct{" "}
        <GradientText
          className="font-bold inline"
          colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
          animationSpeed={8}
          showBorder={false}
        >
          full-length
        </GradientText>{" "}
        practice tests using professional hires.
      </p>
    ),
  };

  const typeDelays = {
    Scores: 0.1,
    Tests: 0.15,
  };

  const imageIcons = {
    Scores: <VscGraph size={20} color="var(--color-primary)" />,
    Tests: <SiSpeedtest size={20} color="var(--color-primary)" />,
  };

  return (
    <motion.div
      className="w-[200px] h-[200px]"
      initial={{
        scale: 1,
        opacity: 0,
        y: 10,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        scale: 1.1,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      }}
      transition={{
        duration: 0.25,
        ease: "circOut",
      }}
      viewport={{ once: true }}
    >
      <GlassComponents
        className="relative p-4 flex flex-col justify-center items-center"
        width="200px"
        height="200px"
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
        <motion.div
          className="flex flex-col items-center justify-center h-full w-full text-center"
          initial={{ 
            opacity: 0, 
            scale: 0.98,
            y: 20
          }}
          animate={{ 
            opacity: 1, 
            scale: 1.03,
            y: 0
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
            delay: typeDelays[descriptionType]
          }}
        >
          {descriptions[descriptionType]}
        </motion.div>
      </GlassComponents>
    </motion.div>
  );
}