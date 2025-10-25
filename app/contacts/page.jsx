import React from 'react'
import GradientText from '../../components/GradientText';

export default function Contacts() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <GradientText
        className="inline text-[40px] font-extrabold text-primary"
        colors={["#038dff", "#949bff", "#038dff", "#949bff", "#038dff"]}
        animationSpeed={8}
        showBorder={false}
      >
        Contact Us!
      </GradientText>
    </div>
  )
}