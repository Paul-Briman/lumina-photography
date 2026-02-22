import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Download, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export default function CreateInvoice() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [clientName, setClientName] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientCountry, setClientCountry] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "Wedding Photography", quantity: 1, price: 150000 }, // Changed to Naira
  ]);
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [hideZeroValues, setHideZeroValues] = useState(true);

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      price: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header with Business Name
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("INVOICE", 14, 22);
    
    // Business Name
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text(user?.businessName || "Your Business Name", 14, 32);
    
    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice #: INV-${Date.now().toString().slice(-6)}`, 14, 42);
    doc.text(`Date: ${new Date(invoiceDate).toLocaleDateString()}`, 14, 48);
    doc.text(`Due Date: ${new Date(dueDate).toLocaleDateString()}`, 14, 54);
    
    // Client details
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text("Bill To:", 14, 65);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(clientName || "Client Name", 14, 72);
    doc.text(`${clientCity || "City"}, ${clientState || "State"}`, 14, 78);
    doc.text(clientCountry || "Country", 14, 84);
    doc.text(clientPhone || "Phone Number", 14, 90);
    
    // Items table
    const itemsForPDF = items.map(item => ({
      ...item,
      displayQty: hideZeroValues && item.quantity === 0 && item.price === 0 ? "" : item.quantity.toString(),
      displayPrice: hideZeroValues && item.quantity === 0 && item.price === 0 ? "" : `₦${item.price.toLocaleString()}`,
      displayAmount: hideZeroValues && item.quantity === 0 && item.price === 0 ? "" : `₦${(item.quantity * item.price).toLocaleString()}`
    }));

    autoTable(doc, {
      startY: 105,
      head: [["Description", "Qty", "Price (₦)", "Amount (₦)"]],
      body: itemsForPDF.map(item => [
        item.description || "Item description",
        item.displayQty,
        item.displayPrice,
        item.displayAmount
      ]),
      foot: [
        ["", "", "Subtotal:", `₦${calculateSubtotal().toLocaleString()}`],
        ["", "", `Tax (${taxRate}%):`, `₦${calculateTax().toLocaleString()}`],
        ["", "", "Total:", `₦${calculateTotal().toLocaleString()}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    });
    
    // Notes
    if (notes) {
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("Notes:", 14, finalY + 10);
      doc.setFontSize(9);
      doc.text(notes, 14, finalY + 18);
    }
    
    // Save PDF
    doc.save(`invoice-${clientName || "draft"}.pdf`);
    
    toast({
      title: "Success",
      description: "PDF generated successfully.",
    });
  };

  const saveDraft = () => {
    // Here you would save to your backend
    toast({
      title: "Draft saved",
      description: "Invoice draft has been saved.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
          Create Invoice
        </h1>
        <p className="text-muted-foreground mb-8">
          Fill in the details below to generate a professional invoice.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border dark:border-neutral-700">
              <h2 className="text-lg font-semibold mb-4">Your Business</h2>
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="font-medium">{user?.businessName || "Your Business Name"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border dark:border-neutral-700">
              <h2 className="text-lg font-semibold mb-4">Client Details</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientCity">City</Label>
                    <Input
                      id="clientCity"
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      placeholder="Lagos"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientState">State</Label>
                    <Input
                      id="clientState"
                      value={clientState}
                      onChange={(e) => setClientState(e.target.value)}
                      placeholder="Lagos"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clientCountry">Country</Label>
                  <Input
                    id="clientCountry"
                    value={clientCountry}
                    onChange={(e) => setClientCountry(e.target.value)}
                    placeholder="Nigeria"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Phone Number</Label>
                  <Input
                    id="clientPhone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+234 801 234 5678"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border dark:border-neutral-700">
              <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border dark:border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Line Items</h2>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={hideZeroValues}
                      onChange={(e) => setHideZeroValues(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Hide zero values
                  </label>
                  <Button onClick={addItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Price (₦)"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t dark:border-neutral-700">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-medium">₦{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>Tax Rate:</span>
                    <Input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-20 h-8"
                    />%
                  </div>
                  <span className="font-medium">₦{calculateTax().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₦{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border dark:border-neutral-700">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thank you for your business!"
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={saveDraft} variant="outline" className="flex-1">
                <Save className="h-4 w-4 mr-2" /> Save Draft
              </Button>
              <Button onClick={generatePDF} className="flex-1">
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </div>
          </div>

          {/* Right Column - Live Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border dark:border-neutral-700 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Invoice Preview</h2>
              <div className="bg-white text-black rounded-lg p-6 shadow-inner" style={{ minHeight: "600px" }}>
                {/* Preview Header with Business Name */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
                    <p className="text-primary font-medium mt-1">{user?.businessName || "Your Business Name"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Invoice #: INV-{Date.now().toString().slice(-6)}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(invoiceDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Due: {new Date(dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Client Info */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h3>
                  <p className="text-gray-800">{clientName || "Client Name"}</p>
                  <p className="text-gray-600 text-sm">{clientCity || "City"}, {clientState || "State"}</p>
                  <p className="text-gray-600 text-sm">{clientCountry || "Country"}</p>
                  <p className="text-gray-600 text-sm">{clientPhone || "Phone Number"}</p>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">Description</th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-700">Price (₦)</th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-700">Amount (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const isZero = item.quantity === 0 && item.price === 0;
                      const hideValue = hideZeroValues && isZero;
                      
                      return (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="py-2 text-gray-800">{item.description || "Item description"}</td>
                          <td className="py-2 text-right text-gray-800">
                            {hideValue ? "-" : item.quantity}
                          </td>
                          <td className="py-2 text-right text-gray-800">
                            {hideValue ? "-" : `₦${item.price.toLocaleString()}`}
                          </td>
                          <td className="py-2 text-right text-gray-800">
                            {hideValue ? "-" : `₦${(item.quantity * item.price).toLocaleString()}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                  <div className="w-64">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₦{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Tax ({taxRate}%):</span>
                      <span className="font-medium">₦{calculateTax().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-300 font-bold">
                      <span>Total:</span>
                      <span>₦{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div className="text-sm text-gray-600 border-t border-gray-300 pt-4">
                    <p className="font-semibold mb-1">Notes:</p>
                    <p>{notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}