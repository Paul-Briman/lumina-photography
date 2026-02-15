import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Download, Loader2, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useInvoices, useCreateInvoice, useDownloadInvoice } from "@/hooks/use-invoices";
import { useGalleries } from "@/hooks/use-galleries";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { insertInvoiceSchema } from "@shared/schema";
import { z } from "zod";

// Extend schema for form to include manual gallery selection
const invoiceFormSchema = insertInvoiceSchema.extend({
  amount: z.coerce.number().min(1, "Amount is required"),
  galleryId: z.coerce.number().min(1, "Gallery is required"),
});

function CreateInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const createInvoice = useCreateInvoice();
  const { data: galleries } = useGalleries();
  
  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      amount: 0,
      status: "pending",
      galleryId: undefined, 
    },
  });

  const onSubmit = (data: z.infer<typeof invoiceFormSchema>) => {
    createInvoice.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/25">
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Generate a new invoice linked to a gallery.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Invoice Number</Label>
            <Input {...form.register("invoiceNumber")} />
          </div>
          <div className="space-y-2">
            <Label>Gallery / Client</Label>
            <Select 
              onValueChange={(val) => form.setValue("galleryId", parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gallery" />
              </SelectTrigger>
              <SelectContent>
                {galleries?.map(g => (
                  <SelectItem key={g.id} value={g.id.toString()}>
                    {g.title} ({g.clientName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.galleryId && (
              <p className="text-sm text-destructive">Please select a gallery</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Amount (in cents)</Label>
            <Input type="number" {...form.register("amount")} placeholder="50000 = $500.00" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createInvoice.isPending}>
              {createInvoice.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  };
  
  const icons = {
    pending: Clock,
    paid: CheckCircle,
    cancelled: AlertCircle,
  };

  const Icon = icons[status as keyof typeof icons] || AlertCircle;
  
  return (
    <Badge variant="outline" className={`${styles[status as keyof typeof styles] || ""} pl-2 pr-3 py-1 gap-1.5`}>
      <Icon className="w-3 h-3" />
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

export default function InvoiceList() {
  const { data: invoices, isLoading } = useInvoices();
  const downloadPdf = useDownloadInvoice();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Track payments and manage client billing.</p>
        </div>
        <CreateInvoiceDialog />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : invoices?.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-border/60">
          <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No invoices yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first invoice to start billing your clients.
          </p>
          <CreateInvoiceDialog />
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Invoice #</TableHead>
                <TableHead>Client / Gallery</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{invoice.gallery.clientName}</span>
                      <span className="text-xs text-muted-foreground">{invoice.gallery.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>${(invoice.amount / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => downloadPdf(invoice.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
}
