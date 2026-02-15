import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Image as ImageIcon, Loader2, ArrowRight } from "lucide-react";
import { useGalleries, useCreateGallery } from "@/hooks/use-galleries";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { insertGallerySchema } from "@shared/schema";
import { z } from "zod";

function CreateGalleryDialog() {
  const [open, setOpen] = useState(false);
  const createGallery = useCreateGallery();
  
  const form = useForm<z.infer<typeof insertGallerySchema>>({
    resolver: zodResolver(insertGallerySchema),
    defaultValues: {
      title: "",
      clientName: "",
      photographerId: 0, // This is ignored by schema validation on client side for forms
    },
  });

  const onSubmit = (data: z.infer<typeof insertGallerySchema>) => {
    // We don't need photographerId in the form submission as it's handled by backend auth
    createGallery.mutate({
      ...data,
      photographerId: 0 // placeholder
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
        <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
          <Plus className="mr-2 h-4 w-4" />
          New Gallery
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Gallery</DialogTitle>
          <DialogDescription>
            Add a new gallery for your client. You can upload photos after creating it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Gallery Title</Label>
            <Input placeholder="Wedding at The Plaza" {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label>Client Name</Label>
            <Input placeholder="John & Jane Doe" {...form.register("clientName")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createGallery.isPending}>
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Galleries</h1>
          <p className="text-muted-foreground mt-1">Manage and share your photo collections.</p>
        </div>
        <CreateGalleryDialog />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : galleries?.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-border/60">
          <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No galleries yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first gallery to start uploading photos and sharing them with clients.
          </p>
          <CreateGalleryDialog />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries?.map((gallery) => (
            <Link key={gallery.id} href={`/galleries/${gallery.id}`}>
              <div className="group relative bg-white rounded-2xl border p-5 hover-card-effect cursor-pointer">
                <div className="aspect-[3/2] bg-muted/30 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
                  {/* Real implementation would show a thumbnail here */}
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                      {gallery.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{gallery.clientName}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/5 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(gallery.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium px-2 py-0.5 bg-secondary rounded-full">Active</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
