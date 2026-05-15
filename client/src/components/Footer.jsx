"use strict";
import { Link } from "wouter";
import { Store, Facebook, Twitter, Instagram } from "lucide-react";
export function Footer() {
  return <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Store className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">Tara Shop</span>
            </Link>
            <p className="text-muted-foreground mb-4">
              Your neighbourhood Indian kirana store brought online. Daily essentials delivered fresh and fast.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">View All</Link></li>
              <li><Link href="/products?categoryId=1" className="text-muted-foreground hover:text-primary transition-colors">Groceries</Link></li>
              <li><Link href="/products?categoryId=2" className="text-muted-foreground hover:text-primary transition-colors">Snacks</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Trust & Safety</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2"><span>100% Secure Payments</span></li>
              <li className="flex items-center gap-2"><span>Free Delivery over ₹500</span></li>
              <li className="flex items-center gap-2"><span>Quality Guarantee</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-muted-foreground/20 mt-8 pt-8 text-center text-muted-foreground text-sm">
          &copy; {(/* @__PURE__ */ new Date()).getFullYear()} Tara Shop. All rights reserved.
        </div>
      </div>
    </footer>;
}
