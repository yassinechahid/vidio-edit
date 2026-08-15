import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin border-4 border-t-4 border-gray-200 border-t-[#A0CAFD] rounded-full w-16 h-16"></div>
    </div>
  );
};

export default LoadingSpinner;
