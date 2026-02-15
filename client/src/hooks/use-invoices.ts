import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";
import type { InsertInvoice } from "@shared/schema";

function getHeaders(token: string | null) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function useInvoices() {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: [api.invoices.list.path],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(api.invoices.list.path, {
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return api.invoices.list.responses[200].parse(await res.json());
    },
    enabled: !!token,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (data: InsertInvoice) => {
      if (!token) throw new Error("Not authenticated");
      // Ensure amount is integer cents
      const payload = {
        ...data,
        amount: Math.round(data.amount), 
      };
      
      const res = await fetch(api.invoices.create.path, {
        method: api.invoices.create.method,
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create invoice");
      return api.invoices.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] });
    },
  });
}

export function useDownloadInvoice() {
  const { token } = useAuth();
  
  return async (id: number) => {
    if (!token) throw new Error("Not authenticated");
    const url = buildUrl(api.invoices.getPdf.path, { id });
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) throw new Error("Failed to download PDF");
    
    // Handle blob download
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `invoice-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
}
