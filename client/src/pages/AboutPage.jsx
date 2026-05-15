"use strict";
import { Shield, Truck, Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
export function AboutPage() {
  const values = [
    { icon: Shield, title: "Quality Assured", desc: "Every product on Tara Shop is sourced from trusted brands and verified suppliers." },
    { icon: Truck, title: "Fast Delivery", desc: "Free delivery on orders above \u20B9500. Same-day delivery available in select areas." },
    { icon: Star, title: "Best Prices", desc: "We negotiate directly with brands to bring you the most competitive prices every day." },
    { icon: Users, title: "Community First", desc: "Started as a neighbourhood store, we serve thousands of families across India." }
  ];
  return <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Tara Shop</h1>
        <p className="text-lg text-muted-foreground">
          Tara Shop started with a simple idea: bring the warmth and convenience of your neighbourhood kirana store to the internet. We believe shopping for daily essentials should be simple, affordable, and trustworthy.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {values.map(({ icon: Icon, title, desc }) => <Card key={title} className="border-border">
            <CardContent className="pt-6 flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            </CardContent>
          </Card>)}
      </div>
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
        <p className="text-primary-foreground/90 max-w-xl mx-auto">
          To make quality daily essentials accessible to every Indian household — delivered with the personal touch of your local kirana store and the convenience of modern e-commerce.
        </p>
      </div>
    </div>;
}
