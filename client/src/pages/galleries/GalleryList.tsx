import { useState } from "react";
import { type Gallery, type Photo } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Image as ImageIcon,
  Loader2,
  ArrowRight,
  MoreVertical,
  Share2,
  Trash2,
  Edit2,
  Calendar,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
} from "lucide-react";
import { useGalleries, useCreateGallery } from "@/hooks/use-galleries";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { insertGallerySchema } from "@shared/schema";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SortDropdown } from "@/components/ui/sort-dropdown";

// Helper function to generate 4-digit PIN
const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

// Share Dialog Component
function ShareDialog({ gallery, onClose }: { gallery: { token: string; pin: string | null; title: string }; onClose: () => void }) {
  const shareUrl = `${window.location.origin}/share/${gallery.token}`;
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
    if (gallery.pin) {
      navigator.clipboard.writeText(gallery.pin);
      setCopiedPin(true);
      toast({ title: "Copied!", description: "PIN copied to clipboard." });
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
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
                  {gallery.pin || "4947"}
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

function CreateGalleryDialog() {
  const [open, setOpen] = useState(false);
  const createGallery = useCreateGallery();

  const form = useForm<z.infer<typeof insertGallerySchema>>({
    resolver: zodResolver(insertGallerySchema),
    defaultValues: {
      title: "",
      clientName: "",
      photographerId: 0,
      downloadPin: generatePin(), // Generate PIN for new gallery
    },
  });

  const onSubmit = (data: z.infer<typeof insertGallerySchema>) => {
    createGallery.mutate(
      {
        ...data,
        photographerId: 0,
        downloadPin: data.downloadPin || generatePin(), // Ensure PIN is set
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          // Reset form with new PIN for next gallery
          form.reset({
            title: "",
            clientName: "",
            photographerId: 0,
            downloadPin: generatePin(),
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all rounded-full px-6 h-11">
          <Plus className="mr-2 h-4 w-4" />
          New Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold">
            Create New Gallery
          </DialogTitle>
          <DialogDescription>
            Add a new gallery for your client. You can upload photos after
            creating it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gallery Title</Label>
            <Input
              className="rounded-xl h-11"
              placeholder="Wedding at The Plaza"
              {...form.register("title")}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Client Name</Label>
            <Input
              className="rounded-xl h-11"
              placeholder="John & Jane Doe"
              {...form.register("clientName")}
            />
          </div>
          {/* Hidden field for downloadPin - automatically handled */}
          <DialogFooter>
            <Button
              type="submit"
              className="rounded-full px-8 h-11 w-full sm:w-auto"
              disabled={createGallery.isPending}
            >
              {createGallery.isPending ? "Creating..." : "Create Gallery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function GalleryList() {
  const { data: galleries, isLoading } = useGalleries();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState("created-desc");
  const [shareGallery, setShareGallery] = useState<{ token: string; pin: string | null; title: string } | null>(null);

  const deleteGallery = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/galleries/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({ title: "Success", description: "Gallery deleted." });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to delete gallery.",
        variant: "destructive",
      });
    }
  };

  const sortedGalleries = [...(galleries || [])].sort((a, b) => {
    // Handle null dates
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    switch (sortBy) {
      case "created-desc":
        return dateB - dateA;
      case "created-asc":
        return dateA - dateB;
      case "name-asc":
        return a.title.localeCompare(b.title);
      case "name-desc":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  // Helper function to get cover image URL with proper typing
  const getCoverImageUrl = (gallery: Gallery & { photos?: Photo[] }) => {
    // If there's a cover photo ID and photos exist, find it
    if (gallery.coverPhotoId && gallery.photos && gallery.photos.length > 0) {
      const coverPhoto = gallery.photos.find(
        (p) => p.id === gallery.coverPhotoId,
      );
      if (coverPhoto) {
        return coverPhoto.storagePath.startsWith("http")
          ? coverPhoto.storagePath
          : `https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=400&h=300&fit=crop`;
      }
    }

    // If no cover but there are photos, use the first photo
    if (gallery.photos && gallery.photos.length > 0) {
      const firstPhoto = gallery.photos[0];
      return firstPhoto.storagePath.startsWith("http")
        ? firstPhoto.storagePath
        : `https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=400&h=300&fit=crop`;
    }

    // No photos at all - use placeholder
    return `https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=400&h=300&fit=crop`;
  };

  return (
    <DashboardLayout>
      {/* Share Dialog */}
      {shareGallery && (
        <ShareDialog 
          gallery={shareGallery} 
          onClose={() => setShareGallery(null)} 
        />
      )}

      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Galleries
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 font-medium">
            Manage and share your photo collections.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <SortDropdown onSortChange={setSortBy} currentSort={sortBy} />
          <CreateGalleryDialog />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : galleries?.length === 0 ? (
        <div className="text-center py-16 sm:py-32 bg-white dark:bg-neutral-800 rounded-2xl sm:rounded-[2rem] border border-dashed border-border/60 shadow-sm mx-4 sm:mx-0">
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-muted rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-display font-bold">No galleries yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-sm mx-auto font-medium px-4">
            Create your first gallery to start uploading photos and sharing them
            with clients.
          </p>
          <CreateGalleryDialog />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {sortedGalleries.map((gallery: Gallery & { photos?: Photo[] }) => (
            <div
              key={gallery.id}
              className="group relative bg-white dark:bg-neutral-800 rounded-lg sm:rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col dark:border-neutral-700"
            >
              <Link
                href={`/galleries/${gallery.id}`}
                className="flex-1 p-2 sm:p-3 cursor-pointer"
              >
                <div className="aspect-[3/2] bg-neutral-100 dark:bg-neutral-700 rounded-md sm:rounded-lg mb-2 sm:mb-3 overflow-hidden relative">
                  <img
                    src={getCoverImageUrl(gallery)}
                    alt={gallery.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                  {/* Photo count badge - smaller on mobile */}
                  {gallery.photos && gallery.photos.length > 0 && (
                    <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 bg-black/60 text-white text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full">
                      {gallery.photos.length}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-sm sm:text-base leading-tight text-foreground group-hover:text-primary transition-colors truncate">
                      {gallery.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium truncate">
                      {gallery.clientName}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="px-2 sm:px-3 pb-2 sm:pb-3 mt-auto">
                <div className="pt-1 sm:pt-2 border-t flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-light">
                    {gallery.createdAt
                      ? new Date(gallery.createdAt).toLocaleDateString()
                      : "No date"}
                  </span>
                  <span className="text-[7px] sm:text-[8px] uppercase tracking-wider font-medium px-1 sm:px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full border border-green-100 dark:border-green-900">
                    Active
                  </span>
                </div>
              </div>

              {/* 3-Dot Menu - smaller on mobile */}
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded-md bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-neutral-700 dark:border-neutral-600"
                    >
                      <MoreVertical className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    sideOffset={5}
                    className="w-36 sm:w-44 rounded-lg shadow-xl p-1 border-border/50 bg-white dark:bg-neutral-800 dark:border-neutral-700 z-[100] text-xs sm:text-sm"
                  >
                    <DropdownMenuItem
                      onClick={() => setLocation(`/galleries/${gallery.id}`)}
                      className="rounded-md gap-1 sm:gap-2 cursor-pointer py-1.5 px-2 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Quick edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShareGallery({
                        token: gallery.shareToken,
                        pin: gallery.downloadPin || null,
                        title: gallery.title
                      })}
                      className="rounded-md gap-1 sm:gap-2 cursor-pointer py-1.5 px-2 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteGallery(gallery.id)}
                      className="rounded-md gap-1 sm:gap-2 cursor-pointer py-1.5 px-2 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 focus:text-destructive focus:bg-destructive/5"
                    >
                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
