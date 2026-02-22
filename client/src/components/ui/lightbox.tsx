import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ id: number; url: string; filename: string }>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ isOpen, onClose, images, currentIndex, onIndexChange }: LightboxProps) {
     console.log("🔦 Lightbox received images:", images.length);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (images.length > 1) {
        if (e.key === "ArrowLeft") handlePrevious();
        if (e.key === "ArrowRight") handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen) return null;

  const handlePrevious = () => {
    setIsLoading(true);
    onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  };

  const handleNext = () => {
    setIsLoading(true);
    onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex].url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = images[currentIndex].filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Download started." });
    } catch (error) {
      toast({ title: "Error", description: "Download failed.", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/80 hover:text-white z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
      >
        <X className="h-8 w-8" />
      </button>

      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrevious}
            className="absolute left-6 text-white/80 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-6 text-white/80 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        </>
      )}

      <button 
        onClick={handleDownload}
        className="absolute bottom-6 right-6 text-white/80 hover:text-white p-3 rounded-full bg-black/20 hover:bg-black/40 transition-colors flex items-center gap-2"
      >
        <Download className="h-6 w-6" />
        <span className="text-sm font-medium">Download</span>
      </button>

      {images.length > 1 && (
        <div className="absolute bottom-6 left-6 text-white/60 text-sm bg-black/20 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      <div className="max-w-[90vw] max-h-[90vh]">
        {isLoading && (
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
        <img 
          src={images[currentIndex].url}
          alt={images[currentIndex].filename}
          className={`max-w-full max-h-[90vh] object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}