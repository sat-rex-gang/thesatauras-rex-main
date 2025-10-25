"use client";

import React, { useState } from "react";
import NavLinks from "../components/NavLinks";
import { BsPersonBadge } from "react-icons/bs";
import GradientText from "./GradientText";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import GlassNavbar from "./GlassNavbar";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleButton = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <div className="z-[500]">
        <GlassNavbar
          width="60%"
          height="90px"
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
          className="fixed top-[30px] left-1/2 transform -translate-x-1/2 flex flex-row py-4 px-10 justify-between items-center z-[9999]"
        >
          <h1 className="absolute left-0">
            <span className="font-extrabold text-[25px] text-primary hidden sm:block">
              <a href={isAuthenticated ? "/dashboard" : "/"}>
                <GradientText
                  className="font-bold inline"
                  colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
                  animationSpeed={8}
                  showBorder={false}
                >
                  theSATauras
                </GradientText>
              </a>
            </span>
          </h1>
          <div className="absolute right-0">
            <div
              className={`relative z-[50] flex justify-center items-center rounded-full w-[55px] h-[55px]`}
            >
              <MotionConfig
                transition={{
                  duration: 0.35,
                  ease: "circOut",
                }}
              >
                {!isAuthenticated ? (
                  <motion.a
                    className="absolute flex flex-col items-center justify-center mr-40 z-[30]"
                    href="/login"
                    initial={{ y: 0, opacity: 1 }}
                    animate={{
                      y: 0,
                      opacity: isOpen ? 0 : 1,
                      pointerEvents: isOpen ? "none" : "auto",
                      transition: {
                        duration: 0.25,
                        ease: "easeInOut",
                      },
                    }}
                    whileHover={{ y: -3 }}
                  >
                    <div>
                      <BsPersonBadge size={40} color="var(--color-tertiary)" />
                    </div>
                  </motion.a>
                ) : (
                  <motion.div
                    className="absolute flex flex-col items-center justify-center mr-40 z-[30]"
                    initial={{ y: 0, opacity: 1 }}
                    animate={{
                      y: 0,
                      opacity: isOpen ? 0 : 1,
                      pointerEvents: isOpen ? "none" : "auto",
                      transition: {
                        duration: 0.25,
                        ease: "easeInOut",
                      },
                    }}
                    whileHover={{ y: -3 }}
                  >
                    <div className="text-center flex flex-col items-center justify-center mt-2">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                        {user?.firstName?.charAt(0) ||
                          user?.username?.charAt(0) ||
                          "U"}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 hidden sm:block">
                        {user?.firstName || user?.username}
                      </p>
                    </div>
                  </motion.div>
                )}
                <motion.button
                  className="z-[100] flex flex-col items-center justify-center"
                  initial={false}
                  onClick={toggleButton}
                  aria-expanded={isOpen}
                  animate={isOpen ? "open" : "closed"}
                  transition={{
                    duration: 0.3,
                  }}
                >
                  <div className="w-10 h-10">
                    {/* top */}
                    <motion.span
                      className="pointer-events-none absolute h-[4px] w-[28px] bg-secondary rounded-full"
                      style={{
                        left: "50%",
                        top: "50%",
                        x: "-50%",
                        y: "-250%",
                      }}
                      variants={{
                        open: {
                          top: ["50%", "65%", "65%"],
                          rotate: ["0deg", "0deg", "45deg"],
                        },
                        closed: {
                          top: ["65%", "65%", "50%"],
                          rotate: ["45deg", "0deg", "0deg"],
                        },
                      }}
                    />
                    {/* middle */}
                    <motion.span
                      className="pointer-events-none absolute h-[4px] w-[28px] bg-secondary rounded-full"
                      style={{
                        left: "50%",
                        top: "50%",
                        x: "-50%",
                        y: "-50%",
                      }}
                      variants={{
                        open: {
                          rotate: ["0deg", "0deg", "-45deg"],
                          opacity: 0,
                        },
                        closed: {
                          rotate: ["-45deg", "0deg", "0deg"],
                          opacity: 1,
                        },
                      }}
                    />
                    {/* bottom */}
                    <motion.span
                      className="pointer-events-none absolute h-[4px] w-[28px] bg-secondary rounded-full"
                      style={{
                        left: "50%",
                        top: "50%",
                        x: "-50%",
                        y: "150%",
                      }}
                      variants={{
                        open: {
                          top: ["50%", "35%", "35%"],
                          rotate: ["0deg", "0deg", "-45deg"],
                        },
                        closed: {
                          top: ["35%", "35%", "50%"],
                          rotate: ["-45deg", "0deg", "0deg"],
                        },
                      }}
                    />
                  </div>
                </motion.button>
              </MotionConfig>
            </div>
          </div>
        </GlassNavbar>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            className={`fixed top-[130px] right-[calc(50%-30vw)] z-[9999] ${
              isAuthenticated ? "h-[550px]" : "h-[225px]"
            } w-[255px]`}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              delay: 1.7,
              duration: 0.4,
              ease: "easeInOut",
            }}
            exit={{ opacity: 0, y: 20 }}
          >
            <GlassNavbar
              width="255px"
              height={isAuthenticated ? "550px" : "225px"}
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
              className="w-full h-full"
            >
              <motion.nav
                className="flex items-center justify-start px-6 py-15"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  delay: 1.7,
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                exit={{ opacity: 0 }}
              >
                {isAuthenticated ? (
                  <div className="flex flex-col gap-6">
                    <div className="pb-4 border-b border-tertiary">
                      <p className="text-sm text-secondary font-semibold">
                        Signed in as
                      </p>
                      <p className="font-bold text-secondary">
                        <GradientText
                          className="font-bold inline"
                          colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
                          animationSpeed={8}
                          showBorder={false}
                        >
                          {user?.firstName || user?.username}
                        </GradientText>
                      </p>
                      <p className="text-sm font-semibold text-secondary">
                        {user?.email}
                      </p>
                    </div>
                    <NavLinks
                      containerStyles={"flex flex-col gap-8"}
                    />
                    <motion.button
                      onClick={handleLogout}
                      className="text-left text-[20px] font-bold"
                      initial={{ color: "#f23418", y: 0 }}
                      whileHover={{
                        y: -3,
                        color: "#751507",
                      }}
                      transition={{
                        duration: 0.25,
                        ease: "easeInOut",
                      }}
                    >
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <NavLinks containerStyles={"flex flex-col gap-8"} />
                )}
              </motion.nav>
            </GlassNavbar>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                delay: 1.7,
                duration: 0.4,
                ease: "easeInOut",
              }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[100]"
              key={isOpen}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}