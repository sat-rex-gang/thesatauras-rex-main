"using client";

import React from "react";
import GlassComponents from "./GlassComponents";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PhotoGrid({
  imageOrientation,
  textField,
  imageSrc,
  imgWidth,
  imgHeight,
}) {
  return (
    <div className="justify-center items-center h-auto w-full flex flex-col md:flex-row mb-10 gap-6 md:gap-0">
      {imageOrientation === "right" && (
        <>
          <div className="relative h-auto w-[90vw] md:w-[34vw] md:translate-x-[8vw] flex justify-center items-center text-center md:translate-x-0">
            <p className="text-2xl sm:text-3xl md:text-[30px] font-bold block px-4">{textField}</p>
          </div>
          <div className="h-auto w-full md:w-[50vw] flex justify-center items-center px-4">
            <motion.div
              whileHover={{
                rotate: 8,
                transition: {
                  delay: 0.05,
                  duration: 0.3,
                },
              }}
            >
              <GlassComponents
                className="relative py-5 px-5 rounded-xl bg-white h-auto w-auto flex justify-center items-center"
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
                <Image
                  src={imageSrc}
                  alt={textField}
                  width={imgWidth}
                  height={imgHeight}
                />
              </GlassComponents>
            </motion.div>
          </div>
        </>
      )}
      {imageOrientation === "left" && (
        <>
          <div className="relative h-auto py-10 px-10 flex justify-center items-center">
            <motion.div
              whileHover={{
                rotate: 8,
                transition: {
                  delay: 0.05,
                  duration: 0.3,
                },
              }}
            >
              <GlassComponents
                className="h-auto w-auto flex justify-center items-center"
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
                <Image
                  src={imageSrc}
                  alt={textField}
                  width={imgWidth}
                  height={imgHeight}
                />
              </GlassComponents>
            </motion.div>
          </div>
          <div className="relative h-auto w-[90vw] md:w-[34vw] md:translate-x-[8vw] flex justify-center items-center text-center md:translate-x-0">
            <p className="text-2xl sm:text-3xl md:text-[30px] font-bold block px-4">{textField}</p>
          </div>
        </>
      )}
    </div>
  );
}