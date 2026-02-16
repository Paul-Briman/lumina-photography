import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Image as ImageIcon, Loader2, ArrowRight, MoreVertical, Share2, Trash2, Edit2 } from "lucide-react";
import { useGalleries, useCreateGallery } from "@/hooks/use-galleries";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { insertGallerySchema } from "@shared/schema";
import { z } from "zod";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function CreateGalleryDialog() {
  const [open, setOpen] = useState(false);
  const createGallery = useCreateGallery();
  
  const form = useForm<z.infer<typeof insertGallerySchema>>({
    resolver: zodResolver(insertGallerySchema),
    defaultValues: {
      title: "",
      clientName: "",
      photographerId: 0,
    },
  });

  const onSubmit = (data: z.infer<typeof insertGallerySchema>) => {
    createGallery.mutate({
      ...data,
      photographerId: 0
    }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
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
          <DialogTitle className="text-2xl font-display font-bold">Create New Gallery</DialogTitle>
          <DialogDescription>
            Add a new gallery for your client. You can upload photos after creating it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gallery Title</Label>
            <Input className="rounded-xl h-11" placeholder="Wedding at The Plaza" {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Client Name</Label>
            <Input className="rounded-xl h-11" placeholder="John & Jane Doe" {...form.register("clientName")} />
          </div>
          <DialogFooter>
            <Button type="submit" className="rounded-full px-8 h-11 w-full sm:w-auto" disabled={createGallery.isPending}>
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

  const deleteGallery = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/galleries/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({ title: "Success", description: "Gallery deleted." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete gallery.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Galleries</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage and share your photo collections.</p>
        </div>
        <CreateGalleryDialog />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : galleries?.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-border/60 shadow-sm">
          <div className="h-20 w-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold">No galleries yet</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium">
            Create your first gallery to start uploading photos and sharing them with clients.
          </p>
          <CreateGalleryDialog />
        </div>
      ) : (
        <div className="flex flex-wrap gap-8 justify-start">
          {galleries?.map((gallery) => (
            <div key={gallery.id} className="group relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col w-[280px]">
              <Link href={`/galleries/${gallery.id}`} className="flex-1 p-4 cursor-pointer">
                <div className="aspect-[3/2] bg-neutral-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                  <ImageIcon className="h-10 w-10 text-neutral-300 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors">
                      {gallery.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 regular">{gallery.clientName}</p>
                  </div>
                </div>
              </Link>

              <div className="px-4 pb-4 mt-auto">
                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">{new Date(gallery.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100">Active</span>
                  </div>
                </div>
              </div>

              {/* 3-Dot Menu */}
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-white/80 backdrop-blur-md shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    side="bottom"
                    sideOffset={8}
                    className="w-48 rounded-lg shadow-xl p-1 border-border/50 bg-white z-[100]"
                  >
                    <DropdownMenuItem onClick={() => setLocation(`/galleries/${gallery.id}`)} className="rounded-md gap-2 cursor-pointer font-medium py-2">
                      <Edit2 className="h-4 w-4" /> Quick edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation(`/galleries/${gallery.id}`)} className="rounded-md gap-2 cursor-pointer font-medium py-2">
                      <Share2 className="h-4 w-4" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteGallery(gallery.id)}
                      className="rounded-md gap-2 cursor-pointer font-medium py-2 text-destructive focus:text-destructive focus:bg-destructive/5"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
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
