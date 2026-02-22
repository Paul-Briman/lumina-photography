import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";
import type { InsertGallery } from "@shared/schema";
import { useToast } from "./use-toast";

// Helper to add auth header
function getHeaders(token: string | null) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function useGalleries() {
  const { token } = useAuth();

  return useQuery({
    queryKey: [api.galleries.list.path],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(api.galleries.list.path, {
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Failed to fetch galleries");
      return api.galleries.list.responses[200].parse(await res.json());
    },
    enabled: !!token,
  });
}

export function useGallery(id: number) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [api.galleries.get.path, id],
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      const url = buildUrl(api.galleries.get.path, { id });
      const res = await fetch(url, {
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Failed to fetch gallery");
      return api.galleries.get.responses[200].parse(await res.json());
    },
    enabled: !!token && !!id,
  });
}

export function useCreateGallery() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (data: InsertGallery) => {
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(api.galleries.create.path, {
        method: api.galleries.create.method,
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create gallery");
      return api.galleries.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.galleries.list.path] });
    },
  });
}

export function useUploadPhotos() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({
      galleryId,
      formData,
    }: {
      galleryId: number;
      formData: FormData;
    }) => {
      if (!token) throw new Error("Not authenticated");
      const url = buildUrl(api.galleries.uploadPhotos.path, { id: galleryId });

      const res = await fetch(url, {
        method: api.galleries.uploadPhotos.method,
        headers: { Authorization: `Bearer ${token}` }, // FormData sets its own Content-Type
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload photos");
      return api.galleries.uploadPhotos.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [api.galleries.get.path, variables.galleryId],
      });
    },
  });
}

// Public access (no token needed) - FIXED to use /api/share/:token
export function useSharedGallery(token: string) {
  return useQuery({
    queryKey: ["/api/share", token],
    queryFn: async () => {
      const url = `/api/share/${token}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gallery not found or private");
      return res.json();
    },
    enabled: !!token,
  });
}

// New hooks for photo operations
export function useUpdatePhoto() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({
      photoId,
      formData,
    }: {
      photoId: number;
      formData: FormData;
    }) => {
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update photo");
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate queries that might contain this photo
      queryClient.invalidateQueries({ queryKey: [api.galleries.list.path] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update photo.",
        variant: "destructive",
      });
    },
  });
}

export function useDeletePhoto() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({
      galleryId,
      photoId,
    }: {
      galleryId: number;
      photoId: number;
    }) => {
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Failed to delete photo");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [api.galleries.get.path, variables.galleryId],
      });
      queryClient.invalidateQueries({ queryKey: [api.galleries.list.path] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete photo.",
        variant: "destructive",
      });
    },
  });
}

export function useSetCoverPhoto() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({
      galleryId,
      photoId,
    }: {
      galleryId: number;
      photoId: number;
    }) => {
      if (!token) throw new Error("Not authenticated");
      console.log("Sending request:", { galleryId, photoId }); // Debug log

      const res = await fetch(`/api/galleries/${galleryId}/cover`, {
        method: "PATCH",
        headers: getHeaders(token),
        body: JSON.stringify({ photoId }),
      });

      console.log("Response status:", res.status); // Debug log
       // Get the response as text first
      const text = await res.text();
      console.log("Raw response text:", text);
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        console.log("Parsed JSON:", data);

       if (!res.ok) throw new Error("Failed to set cover photo");
        return data;
      } catch (e) {
        console.error("JSON parse error:", e);
        throw new Error("Invalid JSON response from server");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [api.galleries.get.path, variables.galleryId],
      });
      queryClient.invalidateQueries({ queryKey: [api.galleries.list.path] });
      toast({ title: "Success", description: "Cover photo updated." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set cover photo.",
        variant: "destructive",
      });
    },
  });
}
