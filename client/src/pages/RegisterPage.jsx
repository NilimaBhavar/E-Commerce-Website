"use strict";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Store } from "lucide-react";
import { useRegisterUser } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional()
});
export function RegisterPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegisterUser();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", phone: "" }
  });
  function onSubmit(data) {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.token);
        toast({ title: `Welcome to Tara Shop, ${res.user.name}!` });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Registration failed", description: "This email may already be registered.", variant: "destructive" });
      }
    });
  }
  return <div className="min-h-screen flex items-center justify-center bg-accent/30 px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <Store className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Join Tara Shop for the best deals</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Rahul Sharma" data-testid="input-name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>} />
              <FormField control={form.control} name="email" render={({ field }) => <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="you@example.com" type="email" data-testid="input-email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>} />
              <FormField control={form.control} name="phone" render={({ field }) => <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl><Input placeholder="+91 98765 43210" type="tel" data-testid="input-phone" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>} />
              <FormField control={form.control} name="password" render={({ field }) => <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input placeholder="Min. 6 characters" type="password" data-testid="input-password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>} />
              <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="button-submit">
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>;
}
