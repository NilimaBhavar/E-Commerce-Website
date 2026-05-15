"use strict";
import { Link } from "wouter";
import { Users, Package, ShoppingBag, IndianRupee, TrendingUp, LayoutDashboard } from "lucide-react";
import { useGetAdminStats } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#6366f1",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444"
};
const CHART_COLORS = ["#f97316", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
export function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetAdminStats();
  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Products", value: stats?.totalProducts, icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Orders", value: stats?.totalOrders, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Revenue", value: stats?.totalRevenue ? `\u20B9${Number(stats.totalRevenue).toLocaleString("en-IN")}` : void 0, icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" }
  ];
  return <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {
    /* Stat cards */
  }
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => <Card key={label}>
            <CardContent className="pt-6">
              {isLoading ? <Skeleton className="h-12" /> : <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value ?? "\u2014"}</p>
                  </div>
                  <div className={`${bg} p-2 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                </div>}
            </CardContent>
          </Card>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {
    /* Revenue chart */
  }
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-48" /> : <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.revenueByMonth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `\u20B9${v}`} />
                  <Tooltip formatter={(v) => [`\u20B9${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(28 95% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>}
          </CardContent>
        </Card>

        {
    /* Order status pie */
  }
        <Card>
          <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-48" /> : <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats?.ordersByStatus ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} label={false}>
                    {(stats?.ordersByStatus ?? []).map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.status] ?? CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Legend formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {
    /* Recent orders */
  }
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-32" /> : <div className="space-y-3">
                {stats?.recentOrders?.slice(0, 5).map((o) => <div key={o.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">#{o.id} — {o.userName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">₹{o.totalAmount}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium`} style={{ background: (STATUS_COLORS[o.status] ?? "#666") + "20", color: STATUS_COLORS[o.status] }}>
                        {o.status}
                      </span>
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>

        {
    /* Top categories */
  }
        <Card>
          <CardHeader><CardTitle>Top Categories</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-32" /> : <div className="space-y-3">
                {stats?.topCategories?.map((cat, i) => <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground">{cat.orderCount} orders</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, cat.orderCount / (stats.topCategories[0]?.orderCount ?? 1) * 100)}%` }} />
                      </div>
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
}
