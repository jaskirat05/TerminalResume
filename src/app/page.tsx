"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import Timeline from "@/components/TimeLine";
import { employmentNewestFirst } from "./data/employment";
import { educationNewestFirst } from "./data/education";
import { Show } from "./models";
const XTermComponent = dynamic(() => import("../components/XTermComponent"), {
  ssr: false,
});

const TerminalPage: React.FC = () => {
  const [isXTermLoaded, setIsXTermLoaded] = useState(false);
  const [showEmployment, setShowEmployment] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  useEffect(() => {
    setIsXTermLoaded(true);

    const handleEscape = (event: { key: string }) => {
      if (event.key === "Escape") {
        setShowEmployment(false);
        setShowEducation(false);
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleEscape);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const showOrHideVisuals = (show: Show, visible: boolean) => {
    switch (show) {
      case Show.Education:
        setShowEducation(visible);
        break;
      case Show.Employment:
        setShowEmployment(visible);
        break;
      case Show.All:
        setShowEmployment(false);
        setShowEducation(false);
        break;
    }
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // e.target is now correctly typed as EventTarget
    const target = e.target as HTMLElement; // Type assertion
    console.log(target.id)

    // Check if the click is outside the content area
    if (target.id === 'overlay' || target.id === 'overlay-content') {
      showOrHideVisuals(Show.All, false);
      console.log("closing")
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-customBlack flex flex-col items-center justify-center h-24">
        <h1 className="text-4xl font-bold font-mono text-claudeText">
          Jaskirat Singh
        </h1>
        <p className="text-xl font-mono mt-2 text-claudeOrange">
          interactive terminal resume
        </p>
      </header>
      <div className="flex flex-grow justify-center items-center bg-customBlack">
        <div className="terminal-container relative w-4/6 bg-customBlack h-full p-4">
          {showEmployment && (
            <div id="overlay" onClick={handleOutsideClick}>
              <div id="overlay-content" onClick={handleOutsideClick}>
                <Timeline events={employmentNewestFirst} closeVisuals={function (): void {
                 showOrHideVisuals(Show.All, false);
                } } />
              </div>
            </div>
          )}
          {showEducation && (
            <div id="overlay" onClick={handleOutsideClick}>
              <div id="overlay-content" onClick={handleOutsideClick}>
                 <Timeline events={educationNewestFirst} closeVisuals={function (): void {
                 showOrHideVisuals(Show.All, false);
                } } />
              </div>
            </div>
          )}

          {isXTermLoaded && (
            <div
              className={`h-full w-full transition-opacity duration-500 ${
                showEmployment || showEducation
                  ? "opacity-50"
                  : "opacity-100"
              }`}
            >
              <XTermComponent showOrHideVisuals={showOrHideVisuals} />
            </div>
          )}
        </div>
      </div>
      <footer className="bg-customBlack text-center p-4 text-gray-600">
      <p>© Jaskirat Singh</p>
      {/* <p>
        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> | 
        <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>
      </p> */}
    </footer>
    </div>
  );
};

export default TerminalPage;
