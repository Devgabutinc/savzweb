import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ImageCarousel from "./ImageCarousel";

interface LightboxProps {
  open: boolean;
  images: string[];
  onOpenChange: (open: boolean) => void;
}

const Lightbox: React.FC<LightboxProps> = ({ open, images, onOpenChange }) => {
  if (!images || images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto max-w-[90vw] p-0 bg-transparent border-none shadow-none">
        {images.length > 1 ? (
          <ImageCarousel images={images} alt="product image" full />
        ) : (
          <img
            src={images[0]}
            alt="product image"
            className="max-w-full max-h-[80vh] object-contain"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Lightbox;
