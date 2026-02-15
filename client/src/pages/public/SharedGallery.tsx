import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { Loader2, Download, Share2, X, ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useSharedGallery } from "@/hooks/use-galleries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export default function SharedGallery() {
  const params = useParams<{ token: string }>();
  const { data: gallery, isLoading, error } = useSharedGallery(params.token!);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = useMemo(() => gallery?.photos || [], [gallery]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === photos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(photos.map(p => p.id));
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSelected = () => {
    selectedIds.forEach(id => {
      const photo = photos.find(p => p.id === id);
      if (photo) downloadFile(photo.storagePath, photo.filename);
    });
  };

  const downloadAll = () => {
    photos.forEach(photo => downloadFile(photo.storagePath, photo.filename));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[3/4] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4 text-center">
        <h1 className="text-3xl font-display font-bold mb-2">Gallery Unavailable</h1>
        <p className="text-muted-foreground">This gallery link may be expired or incorrect.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 group">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">{gallery.title}</h1>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-sm text-muted-foreground ml-4 cursor-pointer" onClick={selectAll}>
              <Checkbox checked={selectedIds.length === photos.length && photos.length > 0} onCheckedChange={selectAll} className="rounded-sm border-neutral-300" />
              <span>Select All</span>
            </div>
          </div>
          <p className="text-lg text-neutral-500 font-medium">{gallery.clientName} • {photos.length} photos</p>
        </div>
        
        {photos.length > 0 && (
          <Button 
            onClick={downloadAll}
            className="rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 h-12 text-base font-medium shadow-sm transition-all active:scale-95"
          >
            <Download className="mr-2 h-5 w-5" /> Download All
          </Button>
        )}
      </header>

      {/* Masonry Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-32">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="relative group break-inside-avoid animate-in fade-in duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div 
                className={cn(
                  "relative rounded-lg overflow-hidden bg-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
                  selectedIds.includes(photo.id) && "ring-2 ring-[#3B82F6]"
                )}
                onClick={() => setLightboxIndex(index)}
              >
                <img 
                  src={photo.storagePath} 
                  alt={photo.filename}
                  className="w-full h-auto block"
                />
                
                {/* Hover States */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                {/* Select Checkbox */}
                <div 
                  className={cn(
                    "absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity",
                    selectedIds.includes(photo.id) && "opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(photo.id);
                  }}
                >
                  <div className="bg-white rounded-md p-1 shadow-sm">
                    {selectedIds.includes(photo.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-[#3B82F6]" />
                    ) : (
                      <Circle className="h-5 w-5 text-neutral-300" />
                    )}
                  </div>
                </div>

                {/* Download Icon */}
                <div 
                  className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(photo.storagePath, photo.filename);
                  }}
                >
                  <div className="bg-white rounded-full p-2.5 shadow-md hover:bg-neutral-50 transition-colors">
                    <Download className="h-4 w-4 text-[#3B82F6]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-32 space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
            <p className="text-neutral-500 text-lg">Photos are being processed. Please check back soon.</p>
          </div>
        )}
      </main>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-white rounded-full shadow-2xl border border-neutral-100 px-6 py-3 flex items-center gap-6">
            <span className="text-sm font-medium text-neutral-900">{selectedIds.length} selected</span>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-sm font-medium text-[#3B82F6] hover:underline"
            >
              Deselect all
            </button>
            <div className="w-px h-4 bg-neutral-200" />
            <Button 
              onClick={downloadSelected}
              className="rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white h-9 px-4 text-sm"
            >
              Download Selected
            </Button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-in fade-in duration-200">
          {/* Controls */}
          <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between text-white z-50">
            <div className="text-sm font-medium opacity-80">
              {lightboxIndex + 1} / {photos.length}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => downloadFile(photos[lightboxIndex].storagePath, photos[lightboxIndex].filename)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Download className="h-6 w-6" />
              </button>
              <button 
                onClick={() => setLightboxIndex(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <button 
            className="absolute left-6 p-4 text-white hover:bg-white/10 rounded-full transition-colors z-50"
            onClick={() => setLightboxIndex(prev => prev! > 0 ? prev! - 1 : photos.length - 1)}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <div className="relative w-full h-full p-12 flex items-center justify-center">
            <img 
              src={photos[lightboxIndex].storagePath} 
              alt={photos[lightboxIndex].filename}
              className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-300"
            />
          </div>

          <button 
            className="absolute right-6 p-4 text-white hover:bg-white/10 rounded-full transition-colors z-50"
            onClick={() => setLightboxIndex(prev => prev! < photos.length - 1 ? prev! + 1 : 0)}
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="py-20 bg-white border-t text-center text-neutral-400 text-sm">
        <p>© {new Date().getFullYear()} Photography by Demo Photography</p>
      </footer>
    </div>
  );
}
