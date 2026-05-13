import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    setForm({ name: "", email: "", message: "" });
  }

  const info = [
    { icon: MapPin, label: "Address", value: "123, Chandni Chowk Market, Old Delhi, Delhi - 110006" },
    { icon: Phone, label: "Phone", value: "+91 98765 43210" },
    { icon: Mail, label: "Email", value: "support@dukaanbazar.com" },
    { icon: Clock, label: "Hours", value: "Mon-Sat: 9am - 9pm | Sun: 10am - 6pm" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-2">Contact Us</h1>
      <p className="text-center text-muted-foreground mb-10">We'd love to hear from you. Reach out anytime.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required data-testid="input-name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required data-testid="input-email" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="How can we help?" rows={5} value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} required data-testid="textarea-message" />
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit">Send Message</Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Get in Touch</h2>
          {info.map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4 flex gap-3 items-start">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="text-sm">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
