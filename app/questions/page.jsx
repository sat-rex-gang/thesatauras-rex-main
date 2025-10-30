"use client";

import React, { useState } from "react";
import GradientText from "../../components/GradientText";
import ProtectedRoute from "../../components/ProtectedRoute";
import { motion } from "framer-motion";
import GlassComponents from "../../components/GlassComponents";
import SinglePlayerMode from "../../components/SinglePlayerMode";

export default function Questions() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedReadingType, setSelectedReadingType] = useState(null);
  const [selectedMathType, setSelectedMathType] = useState(null);

  const readingQuestionTypes = [
    {
      id: "Notes_Rhetorical_Synthesis",
      name: "Rhetorical Synthesis",
      description: "Combine information from multiple sources to create coherent arguments",
      count: "500+ questions"
    },
    {
      id: "Reading_Boundaries",
      name: "Reading Boundaries",
      description: "Identify sentence and paragraph boundaries in text",
      count: "200+ questions"
    },
    {
      id: "Reading_Central_Ideas_And_Details",
      name: "Central Ideas & Details",
      description: "Understand main ideas and supporting details in passages",
      count: "300+ questions"
    },
    {
      id: "Reading_Command_Of_Evidence",
      name: "Command of Evidence",
      description: "Analyze and evaluate evidence in reading passages",
      count: "250+ questions"
    },
    {
      id: "Reading_Form_Structure_And_Sense",
      name: "Form, Structure & Sense",
      description: "Understand how text structure affects meaning",
      count: "200+ questions"
    },
    {
      id: "Reading_Inferences",
      name: "Inferences",
      description: "Draw logical conclusions from reading passages",
      count: "300+ questions"
    },
    {
      id: "Reading_Text_Strucutre_And_Purpose",
      name: "Text Structure & Purpose",
      description: "Analyze how authors organize and structure their writing",
      count: "250+ questions"
    },
    {
      id: "Reading_Transitions",
      name: "Transitions",
      description: "Understand how ideas connect and flow in passages",
      count: "200+ questions"
    },
    {
      id: "Reading_Words_In_Context",
      name: "Words in Context",
      description: "Determine word meanings from context clues",
      count: "300+ questions"
    },
    {
      id: "Reading2_Cross-Text_Connections",
      name: "Cross-Text Connections",
      description: "Compare and connect ideas across multiple texts",
      count: "150+ questions"
    }
  ];

  const mathQuestionTypes = [
    {
      id: null,
      name: "All Math Questions",
      description: "Practice all math topics including algebra, geometry, and advanced math",
      count: "All questions"
    },
    {
      id: "Linear Equations in One Variable",
      name: "Linear Equations in One Variable",
      description: "Solve linear equations with a single variable",
      count: "500+ questions"
    },
    {
      id: "Linear Equations in Two Variables",
      name: "Linear Equations in Two Variables",
      description: "Work with linear equations involving two variables",
      count: "400+ questions"
    },
    {
      id: "Systems of Two Linear Equations in Two Variables",
      name: "Systems of Linear Equations",
      description: "Solve systems of two linear equations with two variables",
      count: "450+ questions"
    },
    {
      id: "Linear Functions",
      name: "Linear Functions",
      description: "Understand and work with linear function relationships",
      count: "400+ questions"
    },
    {
      id: "Linear Inequalities in One or Two Variables",
      name: "Linear Inequalities",
      description: "Solve and graph linear inequalities",
      count: "350+ questions"
    },
    {
      id: "Nonlinear Functions",
      name: "Nonlinear Functions",
      description: "Explore quadratic, exponential, and other nonlinear functions",
      count: "450+ questions"
    },
    {
      id: "Nonlinear Functions and Systems of Equations in Two Variables",
      name: "Nonlinear Systems",
      description: "Solve systems involving nonlinear equations",
      count: "300+ questions"
    },
    {
      id: "Equivalent Expressions",
      name: "Equivalent Expressions",
      description: "Simplify and manipulate algebraic expressions",
      count: "500+ questions"
    },
    {
      id: "Right Triangles and Trigonometry",
      name: "Right Triangles & Trigonometry",
      description: "Apply trigonometric ratios and solve right triangle problems",
      count: "400+ questions"
    },
    {
      id: "Lines, Angles, and Triangles",
      name: "Lines, Angles, and Triangles",
      description: "Work with geometric relationships in lines and triangles",
      count: "450+ questions"
    },
    {
      id: "Circles",
      name: "Circles",
      description: "Solve problems involving circles, arcs, and angles",
      count: "400+ questions"
    },
    {
      id: "Area and Volume",
      name: "Area and Volume",
      description: "Calculate areas and volumes of various geometric shapes",
      count: "500+ questions"
    },
    {
      id: "Ratios, Rates, Proportional Relationships, and Units",
      name: "Ratios and Proportions",
      description: "Solve problems involving ratios, rates, and proportional relationships",
      count: "450+ questions"
    },
    {
      id: "Percentages",
      name: "Percentages",
      description: "Work with percentage calculations and applications",
      count: "400+ questions"
    },
    {
      id: "Probability and Conditional Probability",
      name: "Probability",
      description: "Calculate probabilities and conditional probabilities",
      count: "350+ questions"
    },
    {
      id: "One Variable Data",
      name: "One Variable Data",
      description: "Analyze and interpret single-variable data sets",
      count: "300+ questions"
    },
    {
      id: "Two Variable Data",
      name: "Two Variable Data",
      description: "Analyze relationships between two variables and scatter plots",
      count: "350+ questions"
    },
    {
      id: "Inference From Sample Statistics and Margin of Error",
      name: "Statistical Inference",
      description: "Make inferences from sample statistics and margin of error",
      count: "250+ questions"
    },
    {
      id: "Evaluating Statistical Claims",
      name: "Evaluating Statistical Claims",
      description: "Evaluate and interpret statistical claims and studies",
      count: "300+ questions"
    }
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === "reading") {
      // Don't auto-select a reading type, let user choose
    }
  };

  const handleReadingTypeSelect = (type) => {
    setSelectedReadingType(type);
  };

  const handleMathTypeSelect = (type) => {
    setSelectedMathType(type);
  };

  const startPractice = () => {
    if (selectedCategory === "reading" && selectedReadingType) {
      // Start reading practice with selected type
      return;
    }
    if (selectedCategory === "math" && selectedMathType) {
      // Start math practice with selected type
      return;
    }
  };

  if (selectedCategory === "reading" && selectedReadingType) {
    return (
      <SinglePlayerMode
        questionFile="questions_reading.json"
        title={`${selectedReadingType.name} Practice`}
        description={selectedReadingType.description}
        questionType={selectedReadingType.id}
        onBack={() => setSelectedReadingType(null)}
      />
    );
  }

  if (selectedCategory === "math" && selectedMathType) {
    return (
      <SinglePlayerMode
        questionFile="generated_math_questions.json"
        title={`${selectedMathType.name}`}
        description={selectedMathType.description}
        questionType={selectedMathType.id || undefined}
        onBack={() => setSelectedMathType(null)}
      />
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-24 sm:pt-32 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold text-secondary mb-8 text-center">
            Practice Questions
          </h1>
          
          {!selectedCategory ? (
            <motion.div
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <GlassComponents
                className="rounded-lg shadow-sm p-8"
                width="100%"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Choose a Practice Category
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.button
                    onClick={() => handleCategorySelect("reading")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all text-left"
                  >
                    <div className="text-blue-600 text-2xl mb-2">📖</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Reading</h3>
                    <p className="text-sm text-gray-600">
                      Practice reading comprehension with various question types including rhetorical synthesis, 
                      central ideas, evidence analysis, and more.
                    </p>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleCategorySelect("math")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-6 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 hover:border-green-300 transition-all text-left"
                  >
                    <div className="text-green-600 text-2xl mb-2">🔢</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Math</h3>
                    <p className="text-sm text-gray-600">
                      Practice math skills with algebra, geometry, and advanced math topics.
                    </p>
                  </motion.button>
                </div>
              </GlassComponents>
            </motion.div>
          ) : selectedCategory === "reading" ? (
            <motion.div
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <GlassComponents
                className="rounded-lg shadow-sm p-8"
                width="100%"
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
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ← Back to Categories
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Reading Question Types</h2>
                  <div></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {readingQuestionTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      onClick={() => handleReadingTypeSelect(type)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedReadingType?.id === type.id
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h3 className={`font-semibold mb-2 ${
                        selectedReadingType?.id === type.id ? "text-white" : "text-gray-900"
                      }`}>
                        {type.name}
                      </h3>
                      <p className={`text-sm mb-2 ${
                        selectedReadingType?.id === type.id ? "text-blue-100" : "text-gray-600"
                      }`}>
                        {type.description}
                      </p>
                      <p className={`text-xs font-medium ${
                        selectedReadingType?.id === type.id ? "text-blue-200" : "text-gray-500"
                      }`}>
                        {type.count}
                      </p>
                    </motion.button>
                  ))}
                </div>
                
                {selectedReadingType && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <motion.button
                      onClick={startPractice}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                      Start {selectedReadingType.name} Practice
                    </motion.button>
                  </motion.div>
                )}
              </GlassComponents>
            </motion.div>
          ) : selectedCategory === "math" ? (
            <motion.div
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <GlassComponents
                className="rounded-lg shadow-sm p-8"
                width="100%"
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
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ← Back to Categories
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Math Question Types</h2>
                  <div></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mathQuestionTypes.map((type) => (
                    <motion.button
                      key={type.id || "all"}
                      onClick={() => handleMathTypeSelect(type)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedMathType?.id === type.id
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h3 className={`font-semibold mb-2 ${
                        selectedMathType?.id === type.id ? "text-white" : "text-gray-900"
                      }`}>
                        {type.name}
                      </h3>
                      <p className={`text-sm mb-2 ${
                        selectedMathType?.id === type.id ? "text-blue-100" : "text-gray-600"
                      }`}>
                        {type.description}
                      </p>
                      <p className={`text-xs font-medium ${
                        selectedMathType?.id === type.id ? "text-blue-200" : "text-gray-500"
                      }`}>
                        {type.count}
                      </p>
                    </motion.button>
                  ))}
                </div>
                
                {selectedMathType && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <motion.button
                      onClick={startPractice}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                      Start {selectedMathType.name}
                    </motion.button>
                  </motion.div>
                )}
              </GlassComponents>
            </motion.div>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}