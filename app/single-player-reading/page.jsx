"use client";

import SinglePlayerMode from "../../components/SinglePlayerMode";

const SinglePlayerReading = () => {
  return (
    <SinglePlayerMode
      questionFile="questions_reading.json"
      title="Single Player Reading Practice"
      description="Test your reading comprehension skills with practice questions."
    />
  );
};

export default SinglePlayerReading;
