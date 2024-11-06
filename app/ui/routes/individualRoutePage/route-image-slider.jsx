'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function ImageSlider(images) {
  const imagesArray = Object.values(images)[0];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === imagesArray.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imagesArray.length - 1 : prevIndex - 1
    );
  };
  return (
    <div className="flex items-center">
      <button
        onClick={handlePrev}
        className="text-white mr-2 bg-opacity-0 hover:bg-opacity-100 bg-white rounded-full hover:text-black p-1"
      >
        &#10094;
      </button>
      <Image
        src={imagesArray[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        height={600}
        width={600}
        style={{ objectFit: 'cover' }}
        className="w-32 h-40"
      />

      {/* Navigation buttons */}

      <button
        onClick={handleNext}
        className="text-white ml-2 bg-opacity-0 hover:bg-opacity-100 bg-white rounded-full hover:text-black p-1"
      >
        &#10095;
      </button>
    </div>
  );
}
