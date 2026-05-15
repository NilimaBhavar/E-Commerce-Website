"use strict";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Phone, MapPin } from "lucide-react";
import { useGetUserProfile, useUpdateUserProfile, getGetUserProfileQueryKey } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional()
});
export function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetUserProfile();
  const updateProfile = useUpdateUserProfile();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", address: "", city: "", state: "", pincode: "" }
  });
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || ""
      });
    }
  }, [profile, form]);
  function onSubmit(data) {
    updateProfile.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
        toast({ title: "Profile updated successfully!" });
      },
      onError: () => {
        toast({ title: "Failed to update profile", variant: "destructive" });
      }
    });
  }
  if (isLoading) {
    return <div className="container mx-auto px-4 py-10"><Skeleton className="h-96 w-full" /></div>;
  }
  return <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-4 rounded-full">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile?.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{profile?.email}</span>
            {user?.role === "admin" && <Badge className="text-xs">Admin</Badge>}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => <FormItem>
                  <FormLabel className="flex items-center gap-1"><User className="h-3 w-3" /> Full Name</FormLabel>
                  <FormControl><Input {...field} data-testid="input-name" /></FormControl>
                  <FormMessage />
                </FormItem>} />
              <FormField control={form.control} name="phone" render={({ field }) => <FormItem>
                  <FormLabel className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</FormLabel>
                  <FormControl><Input placeholder="+91 98765 43210" {...field} data-testid="input-phone" /></FormControl>
                  <FormMessage />
                </FormItem>} />
              <FormField control={form.control} name="address" render={({ field }) => <FormItem>
                  <FormLabel className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</FormLabel>
                  <FormControl><Input placeholder="House/Flat, Street" {...field} data-testid="input-address" /></FormControl>
                  <FormMessage />
                </FormItem>} />
              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="city" render={({ field }) => <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>} />
                <FormField control={form.control} name="state" render={({ field }) => <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl><Input placeholder="Maharashtra" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>} />
                <FormField control={form.control} name="pincode" render={({ field }) => <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl><Input placeholder="400001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>} />
              </div>
              <Button type="submit" disabled={updateProfile.isPending} data-testid="button-save">
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>;
}
