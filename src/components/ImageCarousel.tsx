import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  onClick?: () => void;
  full?: boolean; // when true use larger adaptive height
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt = "", onClick, full = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const prev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const next = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const containerClasses = full ? "relative w-full overflow-hidden group max-h-[80vh]" : "relative w-full h-64 overflow-hidden group";

  const imgClasses = full
    ? "w-full h-auto max-h-[80vh] object-contain transition-opacity duration-300 cursor-pointer"
    : "w-full h-64 object-cover transition-opacity duration-300 cursor-pointer";

  return (
    <div className={containerClasses}>
      {/* Current Image */}
      <img
        src={images[currentIndex]}
        alt={alt}
        className={imgClasses}
        onClick={() => onClick?.()}
      />

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-background/70 hover:bg-background/90 text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/70 hover:bg-background/90 text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
