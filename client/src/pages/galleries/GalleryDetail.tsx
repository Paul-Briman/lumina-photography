import { useCallback, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useDropzone } from "react-dropzone";
import { useGallery, useUploadPhotos } from "@/hooks/use-galleries";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Share2, UploadCloud, ChevronLeft, Image as ImageIcon, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

function UploadDialog({ galleryId }: { galleryId: number }) {
  const [open, setOpen] = useState(false);
  const uploadPhotos = useUploadPhotos();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append("photos", file);
    });

    uploadPhotos.mutate(
      { galleryId, formData },
      {
        onSuccess: () => {
          toast({ title: "Success", description: `${acceptedFiles.length} photos uploaded.` });
          setOpen(false);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to upload photos.", variant: "destructive" });
        }
      }
    );
  }, [galleryId, uploadPhotos, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/25 rounded-full px-6">
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
          <DialogDescription>
            Drag and drop high-resolution images here.
          </DialogDescription>
        </DialogHeader>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          {uploadPhotos.isPending ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
              <p className="text-sm font-medium">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max 10MB)</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShareDialog({ token, pin }: { token: string; pin?: string }) {
  const shareUrl = `${window.location.origin}/share/${token}`;
  const { toast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedUrl(true);
    toast({ title: "Copied!", description: "Link copied to clipboard." });
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyPin = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setCopiedPin(true);
      toast({ title: "Copied!", description: "PIN copied to clipboard." });
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full px-6">
          <Share2 className="mr-2 h-4 w-4" />
          Share Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold">Share Gallery</DialogTitle>
          <DialogDescription>
            Send this link and PIN to your client to give them access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Collection URL</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate p-2.5 rounded-xl bg-muted/30 border text-sm font-mono select-all">
                {shareUrl}
              </div>
              <Button size="icon" onClick={copyUrl} className="rounded-full shrink-0 h-10 w-10 bg-primary hover:bg-primary/90">
                {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Download PIN</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2.5 rounded-xl bg-muted/30 border text-sm font-mono">
                {pin || "Not set"}
              </div>
              <Button size="icon" onClick={copyPin} variant="outline" className="rounded-full shrink-0 h-10 w-10">
                {copiedPin ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function GalleryDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id!);
  const [, setLocation] = useLocation();
  const { data: gallery, isLoading } = useGallery(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!gallery) {
    return <DashboardLayout>Gallery not found</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary transition-colors"
          onClick={() => setLocation("/galleries")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Galleries
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">{gallery.title}</h1>
            <p className="text-muted-foreground mt-1 font-medium">{gallery.clientName} • {new Date(gallery.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-3">
            <ShareDialog token={gallery.shareToken} pin={gallery.downloadPin} />
            <UploadDialog galleryId={id} />
          </div>
        </div>
      </div>

      {gallery.photos.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-border/60 shadow-sm">
          <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No photos uploaded</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            This gallery is empty. Upload your first batch of photos to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gallery.photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <img 
                src={photo.storagePath.startsWith('http') ? photo.storagePath : `https://picsum.photos/400/600?random=${photo.id}`} 
                alt={photo.filename}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white font-medium truncate bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                  {photo.filename}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
