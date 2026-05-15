"use strict";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetCart, useCreateOrder, useClearCart, useGetUserProfile, getGetCartQueryKey } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Banknote, Smartphone, CreditCard } from "lucide-react";
const schema = z.object({
  fullName: z.string().min(2, "Full name required"),
  address: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  pincode: z.string().min(6, "Valid pincode required"),
  phone: z.string().min(10, "Valid phone required"),
  paymentMethod: z.enum(["cod", "upi", "card"])
});
export function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: profile } = useGetUserProfile();
  const createOrder = useCreateOrder();
  const clearCart = useClearCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", address: "", city: "", state: "", pincode: "", phone: "", paymentMethod: "cod" }
  });
  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.name || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        phone: profile.phone || "",
        paymentMethod: "cod"
      });
    }
  }, [profile, form]);
  const subtotal = cart?.subtotal ?? 0;
  const shippingFee = subtotal >= 500 ? 0 : 49;
  const total = subtotal + shippingFee;
  function onSubmit(data) {
    createOrder.mutate({
      data: {
        shippingAddress: { fullName: data.fullName, address: data.address, city: data.city, state: data.state, pincode: data.pincode, phone: data.phone },
        paymentMethod: data.paymentMethod
      }
    }, {
      onSuccess: (order) => {
        clearCart.mutate(void 0, {
          onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
        });
        toast({ title: "Order placed successfully!", description: `Order #${order.id} confirmed.` });
        setLocation(`/orders/${order.id}`);
      },
      onError: () => {
        toast({ title: "Failed to place order", description: "Please try again.", variant: "destructive" });
      }
    });
  }
  if (cartLoading) return <div className="container mx-auto px-4 py-10"><Skeleton className="h-96" /></div>;
  if (!cart?.items?.length) {
    return <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <Button onClick={() => setLocation("/products")}>Browse Products</Button>
      </div>;
  }
  return <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Rahul Sharma" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="House/Flat, Street, Area" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Mumbai" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="Maharashtra" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="pincode" render={({ field }) => <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="400001" {...field} /></FormControl><FormMessage /></FormItem>} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
                <CardContent>
                  <FormField control={form.control} name="paymentMethod" render={({ field }) => <FormItem>
                      <FormControl>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-2">
                          {[
    { value: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives", icon: Banknote },
    { value: "upi", label: "UPI", desc: "Google Pay, PhonePe, Paytm", icon: Smartphone },
    { value: "card", label: "Credit / Debit Card", desc: "All major cards accepted", icon: CreditCard }
  ].map(({ value, label, desc, icon: Icon }) => <div
    key={value}
    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${field.value === value ? "border-primary bg-accent" : "border-border hover:bg-muted"}`}
    onClick={() => field.onChange(value)}
  >
                              <RadioGroupItem value={value} id={value} />
                              <Icon className="h-5 w-5 text-primary" />
                              <div>
                                <Label htmlFor={value} className="font-semibold cursor-pointer">{label}</Label>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                              </div>
                            </div>)}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>} />
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" size="lg" disabled={createOrder.isPending} data-testid="button-place-order">
                {createOrder.isPending ? "Placing Order..." : `Place Order \u2014 \u20B9${total.toFixed(0)}`}
              </Button>
            </form>
          </Form>
        </div>

        <div className="lg:sticky lg:top-20 h-fit">
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {cart.items.map((item) => <div key={item.id} className="flex gap-3 items-center text-sm">
                  <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 object-cover rounded bg-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 font-medium">{item.productName}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>)}
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={shippingFee === 0 ? "text-secondary font-medium" : ""}>{shippingFee === 0 ? "FREE" : `\u20B9${shippingFee}`}</span></div>
                <Separator />
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
