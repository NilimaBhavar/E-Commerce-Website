"use strict";
import { useState } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListCategories,
  getListProductsQueryKey
} from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
const emptyForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  categoryId: "",
  brand: "",
  stock: "",
  imageUrl: "",
  isFeatured: false
};
export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const { data: result, isLoading } = useListProducts({ page, limit: 15 });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({}) });
  }
  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }
  function openEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      categoryId: p.categoryId ? String(p.categoryId) : "",
      brand: p.brand ?? "",
      stock: String(p.stock),
      imageUrl: p.imageUrl,
      isFeatured: p.isFeatured
    });
    setDialogOpen(true);
  }
  function handleSave() {
    const data = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : void 0,
      categoryId: form.categoryId ? form.categoryId : void 0,
      brand: form.brand,
      stock: Number(form.stock),
      imageUrl: form.imageUrl,
      isFeatured: form.isFeatured
    };
    if (editingId) {
      updateProduct.mutate({ productId: editingId, data }, {
        onSuccess: () => {
          invalidate();
          setDialogOpen(false);
          toast({ title: "Product updated" });
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" })
      });
    } else {
      createProduct.mutate({ data }, {
        onSuccess: () => {
          invalidate();
          setDialogOpen(false);
          toast({ title: "Product created" });
        },
        onError: () => toast({ title: "Failed to create", variant: "destructive" })
      });
    }
  }
  function handleDelete() {
    if (!deleteId) return;
    deleteProduct.mutate({ productId: deleteId }, {
      onSuccess: () => {
        invalidate();
        setDeleteId(null);
        toast({ title: "Product deleted" });
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" })
    });
  }
  const field = (key, label, props = {}) => <div>
      <Label className="mb-1 block">{label}</Label>
      <Input value={String(form[key])} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} {...props} />
    </div>;
  return <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> Products</h1>
        <Button onClick={openCreate} data-testid="button-add-product"><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6"><Skeleton className="h-64" /></div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result?.products?.map((p) => <TableRow key={p.id} data-testid={`row-product-${p.id}`}>
                      <TableCell><img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-muted" /></TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                          {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.categoryName || "\u2014"}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-sm">₹{p.price}</p>
                          {p.originalPrice && p.originalPrice > p.price && <p className="text-xs text-muted-foreground line-through">₹{p.originalPrice}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium ${p.stock === 0 ? "text-destructive" : p.stock < 10 ? "text-yellow-600" : "text-secondary"}`}>
                          {p.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {p.isFeatured && <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">Featured</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(p)} data-testid={`button-edit-product-${p.id}`}><Pencil className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => setDeleteId(p.id)} className="text-destructive hover:text-destructive" data-testid={`button-delete-product-${p.id}`}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
              {result?.totalPages && result.totalPages > 1 && <div className="flex justify-center gap-2 p-4">
                  <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                  <span className="px-3 py-1 text-sm">{page} / {result.totalPages}</span>
                  <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))} disabled={page === result.totalPages}>Next</Button>
                </div>}
            </div>}
        </CardContent>
      </Card>

      {
    /* Create/Edit Dialog */
  }
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {field("name", "Name *", { placeholder: "Product name", required: true })}
            {field("description", "Description", { placeholder: "Brief description" })}
            <div className="grid grid-cols-2 gap-3">
              {field("price", "Price (\u20B9) *", { type: "number", placeholder: "299" })}
              {field("originalPrice", "Original Price (\u20B9)", { type: "number", placeholder: "399" })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("brand", "Brand", { placeholder: "Brand name" })}
              {field("stock", "Stock *", { type: "number", placeholder: "100" })}
            </div>
            <div>
              <Label className="mb-1 block">Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {field("imageUrl", "Image URL", { placeholder: "https://..." })}
            <div className="flex items-center gap-2">
              <Checkbox id="featured" checked={form.isFeatured} onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: !!v }))} />
              <Label htmlFor="featured" className="cursor-pointer">Mark as Featured</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createProduct.isPending || updateProduct.isPending} data-testid="button-save-product">
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {
    /* Delete confirmation */
  }
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this product from the store.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}
