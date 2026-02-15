import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";
import type { InsertGallery } from "@shared/schema";

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
    mutationFn: async ({ galleryId, formData }: { galleryId: number; formData: FormData }) => {
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
      queryClient.invalidateQueries({ queryKey: [api.galleries.get.path, variables.galleryId] });
    },
  });
}

// Public access (no token needed)
export function useSharedGallery(token: string) {
  return useQuery({
    queryKey: [api.share.get.path, token],
    queryFn: async () => {
      const url = buildUrl(api.share.get.path, { token });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gallery not found or private");
      return api.share.get.responses[200].parse(await res.json());
    },
    enabled: !!token,
  });
}
