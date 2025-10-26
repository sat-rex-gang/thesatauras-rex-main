"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GradientText from "./GradientText";
import { useAuth } from "../contexts/AuthContext";

const fileLinks = [
  {
    filePath: "/",
    fileName: "home",
  },
  {
    filePath: "/contacts",
    fileName: "Contact Us",
  },
];

const fileLinksAuth = [
  {
    filePath: "/dashboard",
    fileName: "dashboard",
  },
  {
    filePath: "/vocab",
    fileName: "vocab",
  },
  {
    filePath: "/leaderboards",
    fileName: "leaderboards",
  },
  {
    filePath: "/questions",
    fileName: "questions",
  },
  {
    filePath: "/contacts",
    fileName: "Contact Us",
  },
];

export default function NavLinks({ containerStyles }) {
  const { isAuthenticated } = useAuth();
  const path = usePathname();

  return (
    <ul className={containerStyles}>
      {(isAuthenticated ? fileLinksAuth : fileLinks).map((fileLink, index) => {
        const isActive = path === fileLink.filePath;

        return (
          <Link
            className={`${isActive ? "font-extrabold text-primary" : "font-bold text-secondary"} text-lg capitalize font-bold`}
            key={index}
            href={fileLink.filePath}
          >
            <motion.button
              className={`relative z-50 font-bold text-[20px] capitalize`}
              initial={{ y: 0 }}
              whileHover={{
                y: -3,
              }}
              whileTap={{
                y: -2,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            >
              {isActive ? (
                <GradientText
                  className="font-bold inline"
                  colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
                  animationSpeed={8}
                  showBorder={false}
                >
                  {fileLink.fileName}</GradientText>
              ) : (
                fileLink.fileName
              )}
            </motion.button>
          </Link>
        );
      })}
    </ul>
  );
}