import React, { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useSharedGallery } from "@/hooks/use-galleries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Lock,
  Image as ImageIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Grid3x3,
  List,
  Check,
  DownloadCloud,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Animation styles
const animationStyles = `
  @keyframes fadeInScale {
    0% {
      opacity: 0;
      transform: scale(1.05);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slideUpFade {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes letterGlow {
    0%, 100% {
      text-shadow: 0 0 15px rgba(255,255,255,0.2);
    }
    50% {
      text-shadow: 0 0 30px rgba(255,255,255,0.5);
    }
  }
  
  @keyframes softPulse {
    0%, 100% {
      opacity: 0.9;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.03);
    }
  }
  
  .animate-fade-scale {
    animation: fadeInScale 1.2s ease-out forwards;
  }
  
  .animate-slide-up {
    opacity: 0;
    animation: slideUpFade 0.8s ease-out forwards;
  }
  
  .animate-delay-1 {
    animation-delay: 0.2s;
  }
  
  .animate-delay-2 {
    animation-delay: 0.4s;
  }
  
  .animate-letter-glow {
    animation: letterGlow 3s ease-in-out infinite;
  }
  
  .animate-soft-pulse {
    animation: softPulse 2s ease-in-out infinite;
  }
`;

// Define the Photo type inline
interface Photo {
  id: number;
  filename: string;
  storagePath: string;
  size: number;
}

// Lightbox Component with swipe support
function Lightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ id: number; url: string; filename: string }>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const { toast } = useToast();

  // Minimum swipe distance required (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && images.length > 1) {
      handleNext();
    } else if (isRightSwipe && images.length > 1) {
      handlePrevious();
    }
  };

  React.useEffect(() => {
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
      const a = document.createElement("a");
      a.href = url;
      a.download = images[currentIndex].filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Download started." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Download failed.",
        variant: "destructive",
      });
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

      <div
        className="max-w-[90vw] max-h-[90vh]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {isLoading && (
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].filename}
          className={`max-w-full max-h-[90vh] object-contain transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}

export default function ClientGallery() {
  const { token } = useParams<{ token: string }>();
  const { data: gallery, isLoading, error } = useSharedGallery(token);
  const [pin, setPin] = useState("");
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<{
    type: "single" | "all";
    photoId?: number;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  // Gallery view states
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  // Ref for scrolling to gallery
  const galleryRef = useRef<HTMLDivElement>(null);

  // Add animation styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Helper function for sequential downloads
  const downloadPhotosSequentially = async (photos: Photo[]) => {
    const failedDownloads: string[] = [];
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        // Show progress toast
        toast({
          title: `Downloading ${i + 1} of ${photos.length}`,
          description: photo.filename,
        });

        const response = await fetch(photo.storagePath);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Fix filename extension
        let filename = photo.filename;
        if (filename.toLowerCase().endsWith('.jfif')) {
          filename = filename.replace(/\.jfif$/i, '.jpg');
        }
        if (!filename.includes('.')) {
          filename = filename + '.jpg';
        }
        
        a.download = filename;
        document.body.appendChild(a);
        
        // Small delay between click creations to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 100));
        
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Delay between downloads (500ms)
        if (i < photos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`Failed to download ${photo.filename}:`, error);
        failedDownloads.push(photo.filename);
      }
    }
    
    if (failedDownloads.length > 0) {
      toast({
        title: "Partial Success",
        description: `${photos.length - failedDownloads.length} downloaded, ${failedDownloads.length} failed`,
        variant: "default",
      });
    } else {
      toast({
        title: "Success",
        description: `All ${photos.length} photos downloaded`,
      });
    }
  };

  const handleVerifyPin = () => {
    if (!gallery) return;

    setIsVerifying(true);
    setTimeout(() => {
      if (pin === gallery?.downloadPin) {
        // PIN correct - proceed with pending download
        if (pendingDownload) {
          if (pendingDownload.type === "single" && pendingDownload.photoId) {
            const photo = gallery.photos.find(
              (p: Photo) => p.id === pendingDownload.photoId,
            );
            if (photo) {
              // Single download - use sequential with just one photo
              downloadPhotosSequentially([photo]);
            }
          } else if (pendingDownload.type === "all") {
            const photosToDownload = gallery.photos.filter((p: Photo) =>
              selectedPhotos.has(p.id)
            );
            downloadPhotosSequentially(photosToDownload);
          }
        }
        setShowPinDialog(false);
        setPin("");
        setSelectedPhotos(new Set());
      } else {
        toast({
          title: "Invalid PIN",
          description: "The PIN you entered is incorrect.",
          variant: "destructive",
        });
      }
      setIsVerifying(false);
      setPendingDownload(null);
    }, 500);
  };

  const handleDownload = (photo: Photo) => {
    setPendingDownload({ type: "single", photoId: photo.id });
    setShowPinDialog(true);
  };

  const handleDownloadAll = () => {
    if (!gallery || gallery.photos.length === 0) return;
    setSelectedPhotos(new Set(gallery.photos.map((p: Photo) => p.id)));
    setPendingDownload({ type: "all" });
    setShowPinDialog(true);
  };

  const handleDownloadSelected = () => {
    if (selectedPhotos.size === 0) return;
    setPendingDownload({ type: "all" });
    setShowPinDialog(true);
  };

  const togglePhotoSelection = (photoId: number) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const selectAll = () => {
    if (!gallery) return;

    if (selectedPhotos.size === gallery.photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(gallery.photos.map((p: Photo) => p.id)));
    }
  };

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">
            Gallery Not Found
          </h1>
          <p className="text-muted-foreground">
            This gallery doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const photoImages = gallery.photos.map((p: Photo) => ({
    id: p.id,
    url: p.storagePath,
    filename: p.filename,
  }));

  const heroImageUrl =
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2068&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={photoImages}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />

      {/* PIN Dialog */}
      {showPinDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border dark:border-neutral-700">
            <div className="text-center mb-6">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">
                Enter Download PIN
              </h2>
              <p className="text-muted-foreground text-sm">
                This gallery is protected. Enter the 4-digit PIN to download
                photos.
              </p>
            </div>

            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 4-digit PIN"
              className="text-center text-2xl tracking-widest h-14 rounded-xl mb-4"
              autoFocus
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPinDialog(false);
                  setPin("");
                  setPendingDownload(null);
                }}
                className="flex-1 h-12 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyPin}
                disabled={pin.length !== 4 || isVerifying}
                className="flex-1 h-12 rounded-xl"
              >
                {isVerifying ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Download"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 animate-fade-scale">
          <img
            src={heroImageUrl}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4 sm:px-6">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center mb-4 sm:mb-6 animate-slide-up"
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            P H O T O <span style={{ margin: "0 0.3em" }} /> A S S E T
          </h1>
          <p
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-6 sm:mb-8 md:mb-10 text-center italic px-2 animate-slide-up animate-delay-1"
            style={{
              fontFamily: "DM Serif Display, Georgia, Times New Roman, serif",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            Everyone is Beautiful
          </p>
          <button
            onClick={scrollToGallery}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-transparent border border-white text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 text-sm sm:text-base tracking-wider font-medium animate-slide-up animate-delay-2 hover:animate-soft-pulse"
          >
            VIEW GALLERY
          </button>
        </div>

        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-4 h-6 sm:w-5 sm:h-8 rounded-full border border-white/30 flex items-start justify-center p-1 sm:p-2">
            <div className="w-0.5 h-1.5 sm:w-1 sm:h-2 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div ref={galleryRef} className="pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Gallery Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                {gallery.title}
              </h2>
              <p className="text-muted-foreground">
                {gallery.clientName} • {gallery.photos.length}{" "}
                {gallery.photos.length === 1 ? "photo" : "photos"}
              </p>
            </div>

            {gallery.photos.length > 0 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                  className="h-10 w-10 rounded-full"
                >
                  {viewMode === "grid" ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <Grid3x3 className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  onClick={handleDownloadAll}
                  className="rounded-full px-6"
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <DownloadCloud className="mr-2 h-4 w-4" />
                  )}
                  Download All
                </Button>
              </div>
            )}
          </div>

          {/* Selection Bar */}
          {gallery.photos.length > 0 && selectedPhotos.size > 0 && (
            <div className="mb-8 flex items-center justify-between bg-primary/5 rounded-lg p-3">
              <span className="text-sm font-medium">
                {selectedPhotos.size}{" "}
                {selectedPhotos.size === 1 ? "photo" : "photos"} selected
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="h-8 text-xs"
                >
                  {selectedPhotos.size === gallery.photos.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadSelected}
                  disabled={isDownloading}
                  className="h-8 gap-1"
                >
                  {isDownloading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  Download ({selectedPhotos.size})
                </Button>
              </div>
            </div>
          )}

          {/* Photo Grid or Empty State */}
          {gallery.photos.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-neutral-800 rounded-3xl border border-dashed border-border/60 dark:border-neutral-700 shadow-sm">
              <div className="h-16 w-16 bg-muted dark:bg-neutral-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground dark:text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">
                No photos uploaded
              </h3>
              <p className="text-muted-foreground dark:text-neutral-400">
                Photos are being processed. Please check back soon.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 lg:gap-5 space-y-3 sm:space-y-4 lg:space-y-5">
              {gallery.photos.map((photo: Photo, index: number) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid group relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer mb-3 sm:mb-4 lg:mb-5"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={photo.storagePath}
                    alt={photo.filename}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />

                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 transition-all ${
                        selectedPhotos.has(photo.id)
                          ? "bg-primary border-primary"
                          : "bg-white/80 border-white group-hover:bg-white"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhotoSelection(photo.id);
                      }}
                    >
                      {selectedPhotos.has(photo.id) && (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/90 hover:bg-white shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(photo);
                      }}
                    >
                      <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {gallery.photos.map((photo: Photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  onClick={() => {
                    const index = gallery.photos.findIndex(
                      (p: Photo) => p.id === photo.id,
                    );
                    setCurrentImageIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex-shrink-0 ${
                      selectedPhotos.has(photo.id)
                        ? "bg-primary border-primary"
                        : "border-neutral-300 dark:border-neutral-600"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhotoSelection(photo.id);
                    }}
                  >
                    {selectedPhotos.has(photo.id) && (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    )}
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                    <img
                      src={photo.storagePath}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {photo.filename}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {(photo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(photo);
                    }}
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}