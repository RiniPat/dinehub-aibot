import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Loader2, MapPin, ChefHat, ExternalLink, ArrowLeft, Star, UtensilsCrossed, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const cuisineEmojis: Record<string, string> = {
  japanese: "🍣",
  "japanese-peruvian": "🍣",
  "japanese-brazilian-peruvian": "🍣",
  "french-mediterranean": "🥐",
  french: "🥐",
  seafood: "🦞",
  "indian fine dining": "🍛",
  "greek-mediterranean": "🫒",
  lebanese: "🧆",
  "british fine dining": "🇬🇧",
  mediterranean: "🫒",
};

function getEmoji(cuisine?: string | null) {
  if (!cuisine) return "🍽️";
  const key = cuisine.toLowerCase().trim();
  for (const [k, v] of Object.entries(cuisineEmojis)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return "🍽️";
}

const accentColors: Record<string, string> = {
  japanese: "#0F766E",
  "japanese-peruvian": "#DC2626",
  "japanese-brazilian-peruvian": "#D97706",
  "french-mediterranean": "#7C3AED",
  french: "#7C3AED",
  seafood: "#0369A1",
  "indian fine dining": "#D97706",
  "greek-mediterranean": "#2563EB",
  lebanese: "#16A34A",
  "british fine dining": "#991B1B",
};

function getAccent(cuisine?: string | null) {
  if (!cuisine) return "#7C3AED";
  const key = cuisine.toLowerCase().trim();
  for (const [k, v] of Object.entries(accentColors)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return "#7C3AED";
}

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const { data: allRestaurants, isLoading } = useQuery({
    queryKey: [api.restaurants.discover.path],
    queryFn: async () => {
      const res = await fetch(api.restaurants.discover.path);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<any[]>;
    },
  });

  // Filter out the demo restaurant
  const restaurants = (allRestaurants || []).filter(r => r.slug !== "demo-bistro");

  const cuisines = Array.from(new Set(restaurants.map(r => r.cuisineType).filter(Boolean)));

  const filtered = restaurants.filter(r => {
    const matchesSearch = !search || 
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.cuisineType || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCuisine = !selectedCuisine || r.cuisineType === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900">Discover Dubai</h1>
              <p className="text-xs text-gray-500">Top restaurants & their menus</p>
            </div>
          </div>
          <Link href="/">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-primary hidden sm:block">DineHub</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-3">
            Dubai's Top Restaurants
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Explore menus from Dubai's most iconic restaurants — from DIFC fine dining to beachside Mediterranean
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search restaurants, cuisines..."
              className="h-12 pl-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Cuisine Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setSelectedCuisine(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCuisine
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            All ({restaurants.length})
          </button>
          {cuisines.map(cuisine => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCuisine === cuisine
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {getEmoji(cuisine)} {cuisine}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No restaurants found matching your search.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((restaurant, i) => {
              const accent = getAccent(restaurant.cuisineType);
              return (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/menu/${restaurant.slug}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all cursor-pointer overflow-hidden group">
                      {/* Color bar */}
                      <div className="h-2" style={{ backgroundColor: accent }} />

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                              style={{ backgroundColor: accent + "15" }}
                            >
                              {getEmoji(restaurant.cuisineType)}
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                                {restaurant.name}
                              </h3>
                              <p className="text-sm font-medium" style={{ color: accent }}>
                                {restaurant.cuisineType}
                              </p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors shrink-0 mt-1" />
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {restaurant.description}
                        </p>

                        {restaurant.address && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {restaurant.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 text-center py-12 bg-white rounded-2xl border border-gray-100">
          <ChefHat className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Own a restaurant?</h3>
          <p className="text-gray-500 mb-4">Get your menu on DineHub — free setup, QR codes included.</p>
          <Link href="/register">
            <Button className="gap-2 px-6">
              <Star className="w-4 h-4" /> Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
