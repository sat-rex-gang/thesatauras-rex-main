"use client";

import React from 'react'
import GradientText from '../../components/GradientText';
import GlassComponents from '../../components/GlassComponents';
import { motion } from 'framer-motion';
import { MdEmail } from 'react-icons/md';

export default function Contacts() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8"
      >
        <GradientText
          className="inline text-3xl sm:text-4xl md:text-[40px] font-extrabold text-primary text-center"
          colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
          animationSpeed={8}
          showBorder={false}
        >
          Contact Us!
        </GradientText>
        
        <motion.a
          href="mailto:mavsaiweijz@gmail.com"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <GlassComponents 
            className="rounded-lg shadow-sm flex items-center justify-center px-6 py-4 cursor-pointer transition-all hover:shadow-lg" 
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
            <MdEmail size={32} className="text-primary" />
          </GlassComponents>
        </motion.a>
      </motion.div>
    </div>
  )
}