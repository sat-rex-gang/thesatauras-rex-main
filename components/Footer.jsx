"use client";

import React from "react";
import { motion, MotionConfig } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import GradientText from "./GradientText";

export default function Footer() {
  return (
    <div
      className={`p-8 flex flex-col gap-4 border border-[2px] border-tertiary min-w-screen h-[400px] rounded-xl`}
    >
      <motion.div
        className="w-full flex flex-col gap-2 justify-start items-start"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            ease: "circInOut",
          },
        }}
        viewport={{ once: true }}
      >
        <h1>
          <span className="text-[30px] text-secondary font-extrabold">
            Beat your <GradientText
              className="font-bold inline"
              colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
              animationSpeed={8}
              showBorder={false}
            >
              competition</GradientText>, beat
            the <GradientText
              className="font-bold inline"
              colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
              animationSpeed={8}
              showBorder={false}
            >
              test</GradientText>.
          </span>
        </h1>
        <TypeAnimation
          className="text-[18px] text-tertiary font-bold"
          sequence={[
            "Smarter.",
            1000,
            "Faster.",
            1000,
            "Higher.",
            1000,
            "Better.",
            1000,
          ]}
          wrapper="span"
          speed={50}
          repeat={Infinity}
        />
      </motion.div>
      <div className="mt-4 w-full flex flex-col md:flex-row justify-start items-center md:items-center">
        <div className="flex flex-col sm:flex-row gap-10">
          <motion.div
            className="flex flex-col gap-1 justify-center items-start w-auto h-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: {
                delay: 0.1,
                duration: 0.3,
                ease: "circInOut",
              },
            }}
            viewport={{ once: true }}
          >
            <h3 className="text-[20px] font-bold text-primary">
              <GradientText
                className="font-bold inline"
                colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
                animationSpeed={8}
                showBorder={false}
              >
                Need help? Contact us!</GradientText>
            </h3>
            <div className="w-auto h-auto flex flex-col">
              <MotionConfig
                transition={{
                  duration: 0.25,
                  ease: "circOut",
                }}
              >
                <motion.a
                  href="/contacts"
                  className="relative inline-flex flex-col items-start justify-center font-semibold text-[18px]"
                  initial="rest"
                  animate="rest"
                  whileHover="hover"
                  variants={{
                    rest: { color: "var(--color-secondary)" },
                    hover: { color: "var(--color-tertiary-hover)" },
                  }}
                >
                  Contacts
                  <motion.span
                    className="absolute left-0 bottom-0 h-[4px] bg-tertiary-hover"
                    variants={{
                      rest: { width: 0 },
                      hover: { width: "100%" },
                    }}
                  />
                </motion.a>
              </MotionConfig>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}