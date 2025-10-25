import React, { useState } from "react";
import { motion } from "framer-motion";

export default function TextInput({
  id,
  defaultValue = "",
  label,
  placeholder,
  containerStyles = "",
  value,
  onChange,
}) {
  return (
    <>
      <motion.div
        className="flex flex-col w-full justify-center items-center mt-5"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{
          opacity: 1,
          y: 0,
          transition: {
            delay: 0.1,
            duration: 0.3,
            ease: "circOut",
          },
        }}
        viewport={{ once: true }}
      >
        {label && (
          <label htmlFor={id} className="text-glow font-bold">
            {label}
          </label>
        )}
        <input
          className={`items-center border border-secondary/25 border-[1px] rounded-xl w-[400px] py-1 px-2
                    focus:outline-none focus:ring-0 font-semibold focus:border-secondary/35 focus:border-[2px]
                    bg-tertiary backdrop-blur-xs ${containerStyles}`}
          placeholder={`${placeholder}`}
          required
          type="text"
          value={value}
          onChange={onChange}
        />
      </motion.div>
    </>
  );
}