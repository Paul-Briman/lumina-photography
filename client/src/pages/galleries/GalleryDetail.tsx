import React, { useCallback, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useDropzone } from "react-dropzone";
import {
  useGallery,
  useUploadPhotos,
  useUpdatePhoto,
  useDeletePhoto,
  useSetCoverPhoto,
} from "@/hooks/use-galleries";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  Share2,
  UploadCloud,
  ChevronLeft,
  Image as ImageIcon,
  Copy,
  Check,
  MoreVertical,
  Maximize2,
  Download,
  Image as ImageControl,
  RefreshCw,
  Trash2,
  X,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryClient } from "@/lib/queryClient";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import { api } from "@shared/routes";

// Lightbox Component
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
  const { toast } = useToast();

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
            <ChevronLeftIcon className="h-10 w-10" />
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
          className={`max-w-full max-h-[90vh] object-contain transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}

function ShareDialog({ token, pin }: { token: string; pin?: string | null }) {
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
        <Button
          variant="outline"
          className="rounded-full px-6 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-foreground dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] rounded-xl border-0 shadow-2xl p-0 overflow-hidden bg-white dark:bg-neutral-800">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold tracking-widest text-neutral-900 dark:text-white uppercase">
              GET DIRECT LINK
            </h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-neutral-800 dark:text-neutral-200">
                Collection URL
              </label>
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-sm overflow-hidden h-10 bg-white dark:bg-neutral-900">
                <div className="flex-1 px-3 text-[13px] text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 h-full flex items-center">
                  <span className="truncate font-mono">
                    {shareUrl.length > 35
                      ? shareUrl.substring(0, 32) + "..."
                      : shareUrl}
                  </span>
                </div>
                <button
                  onClick={copyUrl}
                  className="flex items-center justify-center px-3 h-full text-[12px] font-medium text-primary hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 w-[60px]"
                >
                  {copiedUrl ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Share this unique URL for this collection with your client.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-neutral-800 dark:text-neutral-200">
                Download PIN
              </label>
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-sm overflow-hidden h-10 bg-white dark:bg-neutral-900">
                <div className="flex-1 px-3 text-[13px] text-neutral-600 dark:text-neutral-300 font-mono bg-white dark:bg-neutral-900 h-full flex items-center">
                  {pin || "4947"}
                </div>
                <button
                  onClick={copyPin}
                  className="flex items-center justify-center px-3 h-full text-[12px] font-medium text-primary hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 w-[60px]"
                >
                  {copiedPin ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Share this 4-digit PIN with your client for download access.
              </p>
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
  const { toast } = useToast();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);

  const updatePhoto = useUpdatePhoto();
  const deletePhoto = useDeletePhoto();
  const setCoverPhoto = useSetCoverPhoto();

  const handleOpenLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handleDownload = async (photo: {
    id: number;
    storagePath: string;
    filename: string;
  }) => {
    try {
      const url = photo.storagePath.startsWith("http")
        ? photo.storagePath
        : `https://picsum.photos/400/600?random=${photo.id}`;

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = photo.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast({ title: "Success", description: "Download started." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Download failed.",
        variant: "destructive",
      });
    }
  };

  const handleSetCover = (photoId: number) => {
    setCoverPhoto.mutate(
      { galleryId: id, photoId },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Cover photo updated." });
          queryClient.invalidateQueries({
            queryKey: [api.galleries.get.path, id],
          });
          queryClient.invalidateQueries({
            queryKey: [api.galleries.list.path],
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to set cover.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleReplace = (photoId: number, file: File) => {
    console.log("1. Starting replace for photo:", photoId, "file:", file.name);

    // Create FormData to send the file
    const formData = new FormData();
    formData.append("photo", file);

    toast({
      title: "Uploading",
      description: "Replacing photo...",
    });

    console.log("2. Sending to backend...");

    fetch(`/api/photos/${photoId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData, // Send FormData, not JSON
    })
      .then(async (res) => {
        console.log("3. Backend response status:", res.status);
        const text = await res.text();
        console.log("4. Backend response:", text);

        if (!res.ok) {
          throw new Error(`Failed to update database: ${res.status} - ${text}`);
        }
        return JSON.parse(text);
      })
      .then((updatedPhoto) => {
        console.log("5. Success! Updated photo:", updatedPhoto);
        toast({
          title: "Success",
          description: "Photo replaced successfully.",
        });
        setReplaceFile(null);
        queryClient.invalidateQueries({
          queryKey: [api.galleries.get.path, id],
        });
      })
      .catch((err) => {
        console.error("6. Error:", err);
        toast({
          title: "Error",
          description: "Failed to replace photo.",
          variant: "destructive",
        });
      });
  };

  const handleDelete = (photoId: number) => {
    deletePhoto.mutate(
      { galleryId: id, photoId },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Photo deleted." });
          setDeleteConfirm(null);
          queryClient.invalidateQueries({
            queryKey: [api.galleries.get.path, id],
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete photo.",
            variant: "destructive",
          });
        },
      },
    );
  };

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

  const photoImages = gallery.photos.map((p) => ({
    id: p.id,
    url: p.storagePath.startsWith("http")
      ? p.storagePath
      : `https://picsum.photos/400/600?random=${p.id}`,
    filename: p.filename,
  }));

  console.log("📸 photoImages length:", photoImages.length);

  return (
    <DashboardLayout>
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={photoImages}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />

      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary transition-colors text-foreground dark:text-white"
          onClick={() => setLocation("/galleries")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Galleries
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground dark:text-white">
              {gallery.title}
            </h1>
            <p className="text-muted-foreground dark:text-neutral-400 mt-1 font-medium">
              {" "}
              {gallery.clientName} •{" "}
              {gallery?.createdAt
                ? new Date(gallery.createdAt).toLocaleDateString()
                : "No date"}
            </p>
          </div>
          <div className="flex gap-3">
            <ShareDialog
              token={gallery.shareToken}
              pin={gallery.downloadPin || undefined}
            />
            <CloudinaryUpload
              galleryId={id}
              onUploadSuccess={() => {
                queryClient.invalidateQueries({
                  queryKey: [api.galleries.get.path, id],
                });
                queryClient.invalidateQueries({
                  queryKey: [api.galleries.list.path],
                });
              }}
            />
          </div>
        </div>
      </div>

      {gallery.photos.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-neutral-800 rounded-3xl border border-dashed border-border/60 dark:border-neutral-700 shadow-sm">
          <div className="h-16 w-16 bg-muted dark:bg-neutral-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground dark:text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground dark:text-white">
            No photos uploaded
          </h3>
          <p className="text-muted-foreground dark:text-neutral-400 mb-6 max-w-sm mx-auto">
            This gallery is empty. Upload your first batch of photos to get
            started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <img
                src={
                  photo.storagePath.startsWith("http")
                    ? photo.storagePath
                    : `https://picsum.photos/400/600?random=${photo.id}`
                }
                alt={photo.filename}
                className="w-full h-full object-cover"
                onClick={() => handleOpenLightbox(index)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/30 transition-colors" />

              {/* Photo Options Menu */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-md border-0 hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52 rounded-xl shadow-2xl p-1 border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  >
                    <DropdownMenuItem
                      onClick={() => handleOpenLightbox(index)}
                      className="rounded-lg gap-3 cursor-pointer font-medium py-2.5 px-4 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      <Maximize2 className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />{" "}
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDownload(photo)}
                      className="rounded-lg gap-3 cursor-pointer font-medium py-2.5 px-4 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      <Download className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />{" "}
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSetCover(photo.id)}
                      className="rounded-lg gap-3 cursor-pointer font-medium py-2.5 px-4 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      <ImageControl className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />{" "}
                      Set as cover
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) handleReplace(photo.id, file);
                        };
                        input.click();
                      }}
                      className="rounded-lg gap-3 cursor-pointer font-medium py-2.5 px-4 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      <RefreshCw className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />{" "}
                      Replace photo
                    </DropdownMenuItem>
                    <div className="my-1 border-t border-neutral-100 dark:border-neutral-700" />
                    <DropdownMenuItem
                      onClick={() => {
                        if (
                          confirm("Are you sure you want to delete this photo?")
                        ) {
                          handleDelete(photo.id);
                        }
                      }}
                      className="rounded-lg gap-3 cursor-pointer font-medium py-2.5 px-4 text-destructive hover:bg-destructive/5 dark:hover:bg-destructive/20"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white font-medium truncate bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md dark:bg-black/60">
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
