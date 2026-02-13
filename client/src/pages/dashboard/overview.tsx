import { useRestaurants } from "@/hooks/use-restaurants";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Plus, QrCode, Utensils } from "lucide-react";
import { DashboardLayout } from "@/components/layout";

export default function DashboardOverview() {
  const { data: restaurants, isLoading } = useRestaurants();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const restaurant = restaurants?.[0];

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">No restaurant found</h2>
          <Link href="/onboarding">
            <Button>Create Restaurant</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back to {restaurant.name}</p>
        </div>
        <Link href={`/menu/${restaurant.slug}`} target="_blank">
          <Button variant="outline" className="gap-2">
            View Live Menu <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Quick Actions</CardTitle>
            <Utensils className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/menus">
              <Button className="w-full justify-between" variant="secondary">
                Manage Menus <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">QR Code</CardTitle>
            <QrCode className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/qr">
              <Button className="w-full justify-between" variant="secondary">
                Download QR <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-gray-100 bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Public URL</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <code className="text-xs bg-white px-2 py-1 rounded border border-primary/20 text-primary block truncate">
              dinehub.com/menu/{restaurant.slug}
            </code>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">Your Restaurant Details</h2>
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cuisine</label>
            <p className="mt-1 font-medium">{restaurant.cuisineType}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</label>
            <p className="mt-1 font-medium">{restaurant.contactNumber || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">WhatsApp (Orders)</label>
            <p className="mt-1 font-medium">
              {(restaurant as any).whatsappNumber 
                ? <span className="text-green-600">{(restaurant as any).whatsappNumber} ✓</span>
                : <span className="text-gray-400">Not set — orders won't go to WhatsApp</span>
              }
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
            <p className="mt-1 text-gray-600 leading-relaxed">{restaurant.description}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</label>
            <p className="mt-1 text-gray-600">{restaurant.address}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
