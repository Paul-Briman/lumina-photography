import { useParams } from "wouter";
import { Loader2, Download, Share2 } from "lucide-react";
import { useSharedGallery } from "@/hooks/use-galleries";
import { Button } from "@/components/ui/button";

export default function SharedGallery() {
  const params = useParams<{ token: string }>();
  const { data: gallery, isLoading, error } = useSharedGallery(params.token!);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <h1 className="text-3xl font-display font-bold mb-2">Gallery Unavailable</h1>
        <p className="text-muted-foreground">This gallery link may be expired or incorrect.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="h-[50vh] bg-neutral-900 relative flex items-center justify-center text-white overflow-hidden">
        {/* Placeholder for hero image - in production this would be the first photo */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="relative z-20 text-center space-y-4 p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-sm font-medium tracking-widest uppercase opacity-80">{gallery.clientName}</p>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">{gallery.title}</h1>
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" className="text-black border-white/20 bg-white/90 hover:bg-white">
              <Download className="mr-2 h-4 w-4" /> Download All
            </Button>
            <Button variant="outline" className="text-white border-white/30 bg-white/10 hover:bg-white/20 hover:text-white">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gallery.photos.map((photo) => (
            <div key={photo.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                {/* Photo placeholder */}
                <div className="absolute inset-0 bg-neutral-200 animate-pulse group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center text-neutral-400 font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {photo.filename}
                </div>
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="icon" variant="secondary" className="rounded-full h-12 w-12">
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {gallery.photos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Photos are being processed. Please check back soon.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-sm text-muted-foreground">
        <p>Photography by {gallery.photographerId /* In real app, fetch photographer name */}</p>
        <p className="mt-2">© {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
}
