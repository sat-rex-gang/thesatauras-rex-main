"use client";

import CompanySummaries from "../components/CompanySummary";
import PhotoGrid from "../components/PhotoGrid";
import PixelBlast from "../components/PixelBlast";
import { motion } from "framer-motion";
import BlurText from "../components/BlurText";
import React, { useRef, useEffect } from "react";
import GradientText from "../components/GradientText";
import CountUp from "../components/CountUp";
import lowScore from "../public/assets/images/homepage/low-score.png";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <div className="w-full min-h-screen flex flex-col items-stretch">
        <div
          style={{ width: "100%", height: "100vh", position: "relative" }}
          className="flex flex-col justify-center items-center"
        >
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#038dff"
            patternScale={2}
            patternDensity={0.8}
            pixelSizeJitter={0}
            enableRipples={true}
            rippleSpeed={0.2}
            rippleThickness={0.15}
            rippleIntensityScale={1.0}
            liquid={false}
            speed={0.5}
            edgeFade={0.1}
            transparent={true}
            antialias={false}
          />
          <div className="absolute z-10 text-center px-4 sm:px-8 w-[90vw] sm:w-[80vw]">
            <BlurText
              text="Boosting SAT Scores, One Student at a Time."
              className="text-3xl sm:text-5xl md:text-6xl font-bold text-secondary drop-shadow-2xl"
              delay={100}
              stepDuration={0.4}
            />
          </div>
        </div>
        <div className="w-full h-auto flex flex-col justify-center items-center gap-10 mt-10">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-[35px] font-extrabold px-4 sm:px-10 mt-12 sm:mt-20"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.3,
                ease: "circOut",
              },
            }}
            viewport={{ once: true }}
          >
            Mathematical formulas don't make sense?{" "}
            <GradientText
              className="font-bold inline"
              colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
              animationSpeed={8}
              showBorder={false}
            >
              No worries
            </GradientText>
            .
          </motion.h2>
          <motion.div
            className="w-full flex flex-col items-center justify-center"
            initial={{ y: 10, opacity: 0 }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.3,
                ease: "circOut",
              },
            }}
            viewport={{ once: true }}
          >
            <PhotoGrid
              imageOrientation={"right"}
              imgHeight={200}
              imgWidth={200}
              imageSrc={lowScore}
              textField={
                <span>
                  Let's turn your low score{" "}
                  <GradientText
                    className="font-bold inline"
                    colors={[
                      "#038dff",
                      "#949bff",
                      "#038dff",
                      "#949bff",
                      "#038dff",
                    ]}
                    animationSpeed={8}
                    showBorder={false}
                  >
                    upside down
                  </GradientText>
                  .
                </span>
              }
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}