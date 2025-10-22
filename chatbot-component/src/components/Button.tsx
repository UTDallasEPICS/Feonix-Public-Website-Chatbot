import React, { useState, useEffect } from "react";
import Chatbot from "./Chatbot";
import MobileChatbot from "./MobileChatbot";

export default function Button() {
  const [showBox, setShowBox] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Simple mobile detection (can be improved if needed)
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (
      /android/i.test(userAgent) ||
      /iPad|iPhone|iPod/.test(userAgent) ||
      window.innerWidth <= 768
    ) {
      setIsMobile(true);
    }
  }, []);

  const handleClick = () => setShowBox(true);
  const handleClose = () => setShowBox(false);

  return (
    <div>
      <button
        onClick={handleClick}
        className="
          fixed bottom-4 right-4 
          bg-gradient-to-r from-orange-500 to-red-500 hover:bg-red-700 
          text-white font-bold 
          p-4 rounded-full shadow-lg 
          transition
          animate-bounce
          ring-4 ring-orange-300
          text-sm text-center
        "
      >
        Need help?<br />Click here!
      </button>

      {showBox && (
        <>
          <div
            onClick={handleClose}
          ></div>

          <div className="z-50">
            {isMobile ? <MobileChatbot /> : <Chatbot />}
          </div>
        </>
      )}
    </div>
  );
}
