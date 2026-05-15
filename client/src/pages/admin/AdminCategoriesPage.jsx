"use strict";
import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import {
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  getListCategoriesQueryKey
} from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
export function AdminCategoriesPage() {
  const { data: categories, isLoading } = useListCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "" });
  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
  }
  function openCreate() {
    setEditingId(null);
    setForm({ name: "", description: "", imageUrl: "" });
    setDialogOpen(true);
  }
  function openEdit(cat) {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description ?? "", imageUrl: cat.imageUrl ?? "" });
    setDialogOpen(true);
  }
  function handleSave() {
    if (!form.name.trim()) return;
    if (editingId) {
      updateCategory.mutate({ categoryId: editingId, data: form }, {
        onSuccess: () => {
          invalidate();
          setDialogOpen(false);
          toast({ title: "Category updated" });
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" })
      });
    } else {
      createCategory.mutate({ data: form }, {
        onSuccess: () => {
          invalidate();
          setDialogOpen(false);
          toast({ title: "Category created" });
        },
        onError: () => toast({ title: "Failed to create", variant: "destructive" })
      });
    }
  }
  function handleDelete() {
    if (!deleteId) return;
    deleteCategory.mutate({ categoryId: deleteId }, {
      onSuccess: () => {
        invalidate();
        setDeleteId(null);
        toast({ title: "Category deleted" });
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" })
    });
  }
  return <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="h-6 w-6 text-primary" /> Categories</h1>
        <Button onClick={openCreate} data-testid="button-add-category"><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="p-6"><Skeleton className="h-64" /></div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories?.map((cat) => <TableRow key={cat.id} data-testid={`row-category-${cat.id}`}>
                      <TableCell>
                        {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-cover rounded-lg bg-muted" />}
                      </TableCell>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{cat.description || "\u2014"}</TableCell>
                      <TableCell>{cat.productCount}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(cat)} data-testid={`button-edit-category-${cat.id}`}><Pencil className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => setDeleteId(cat.id)} className="text-destructive hover:text-destructive" data-testid={`button-delete-category-${cat.id}`}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>}
        </CardContent>
      </Card>

      {
    /* Create/Edit Dialog */
  }
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g., Snacks & Namkeen" data-testid="input-category-name" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description" /></div>
            <div><Label>Image URL</Label><Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createCategory.isPending || updateCategory.isPending} data-testid="button-save-category">
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
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the category. Products in this category won't be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}
