import { useState } from "react";
import { Button } from "./button";
import { Loader2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Add type declaration for window.cloudinary
declare global {
  interface Window {
    cloudinary: any;
  }
}

interface CloudinaryUploadProps {
  galleryId: number;
  onUploadSuccess: (photos: any[]) => void;
  onUploadError?: (error: Error) => void;
}

export function CloudinaryUpload({ galleryId, onUploadSuccess, onUploadError }: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const openUploadWidget = () => {
    // Check if Cloudinary widget is available
    if (!window.cloudinary) {
      toast({
        title: "Error",
        description: "Upload widget not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast({
        title: "Configuration Error",
        description: "Cloudinary credentials not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          folder: `lumina-galleries/${galleryId}`,
          maxFiles: 20,
          multiple: true,
          clientAllowedFormats: ["image"],
          maxFileSize: 10000000, // 10MB
          sources: ["local", "url", "camera"],
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#E4E4E7",
              tabIcon: "#3B82F6",
              menuIcons: "#71717A",
              textDark: "#09090B",
              textLight: "#FAFAFA",
              link: "#3B82F6",
              action: "#3B82F6",
              inactiveTabIcon: "#A1A1AA",
              error: "#EF4444",
              inProgress: "#3B82F6",
              complete: "#10B981",
              sourceBg: "#F4F4F5",
            },
            fonts: {
              default: {
                active: true,
              },
            },
          },
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Upload error:", error);
            toast({
              title: "Upload Failed",
              description: error.message || "Failed to upload photos.",
              variant: "destructive",
            });
            onUploadError?.(error);
            setIsUploading(false);
            return;
          }

          if (result.event === "success") {
            const photoData = {
              filename: result.info.original_filename || result.info.public_id,
              storagePath: result.info.secure_url,
              size: result.info.bytes,
            };

            fetch(`/api/galleries/${galleryId}/photos-metadata`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify(photoData),
            })
              .then(async (res) => {
                if (!res.ok) {
                  const errorText = await res.text();
                  throw new Error(`Server responded with ${res.status}: ${errorText}`);
                }
                return res.json();
              })
              .then((savedPhoto) => {
                onUploadSuccess([savedPhoto]);
                toast({
                  title: "Success",
                  description: `${result.info.original_filename || "Photo"} uploaded successfully.`,
                });
              })
              .catch((err) => {
                console.error("Database error:", err);
                toast({
                  title: "Warning",
                  description: "Photo uploaded but failed to save to gallery. Please refresh.",
                  variant: "default",
                });
              });
          }

          if (result.event === "close") {
            setIsUploading(false);
          }
        }
      );

      widget.open();
      setIsUploading(true);
    } catch (error) {
      console.error("Widget error:", error);
      toast({
        title: "Error",
        description: "Failed to open upload widget.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <Button
      onClick={openUploadWidget}
      disabled={isUploading}
      className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all rounded-full px-6 h-11 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
    >
      {isUploading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UploadCloud className="mr-2 h-4 w-4" />
      )}
      {isUploading ? "Uploading..." : "Upload Photos"}
    </Button>
  );
}