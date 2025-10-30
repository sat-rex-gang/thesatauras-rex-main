"use client";

import SinglePlayerMode from "../../components/SinglePlayerMode";

const SinglePlayerMath = () => {
  return (
    <SinglePlayerMode
      questionFile="generated_math_questions.json"
      title="Single Player Math Practice"
      description="Test your math skills with practice questions covering algebra, geometry, and advanced topics."
    />
  );
};

export default SinglePlayerMath;

