import { useRoute, useSearch } from "wouter";
import { useRestaurantBySlug, useMenus } from "@/hooks/use-restaurants";
import { Loader2, ShoppingBag, Plus, Minus, X, Flame, ChefHat, Star, Send, MessageCircle, Droplets, Receipt, HandPlatter, Cake, UtensilsCrossed, Coffee, HelpCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ChatAgent from "@/components/chat-agent";

// Cuisine theme config
const cuisineThemes: Record<string, { accent: string; bg: string; headerBg: string; badge: string; pattern: string }> = {
  italian: { accent: "#D4380D", bg: "bg-amber-50", headerBg: "from-red-900 to-amber-900", badge: "bg-red-100 text-red-700", pattern: "🍝" },
  indian: { accent: "#D97706", bg: "bg-orange-50", headerBg: "from-orange-900 to-red-900", badge: "bg-orange-100 text-orange-700", pattern: "🍛" },
  chinese: { accent: "#DC2626", bg: "bg-red-50", headerBg: "from-red-900 to-rose-950", badge: "bg-red-100 text-red-700", pattern: "🥢" },
  japanese: { accent: "#0F766E", bg: "bg-slate-50", headerBg: "from-slate-900 to-slate-800", badge: "bg-teal-100 text-teal-700", pattern: "🍣" },
  sushi: { accent: "#0F766E", bg: "bg-slate-50", headerBg: "from-slate-900 to-slate-800", badge: "bg-teal-100 text-teal-700", pattern: "🍣" },
  mexican: { accent: "#CA8A04", bg: "bg-yellow-50", headerBg: "from-green-900 to-red-900", badge: "bg-green-100 text-green-700", pattern: "🌮" },
  thai: { accent: "#9333EA", bg: "bg-purple-50", headerBg: "from-purple-900 to-pink-900", badge: "bg-purple-100 text-purple-700", pattern: "🍜" },
  american: { accent: "#2563EB", bg: "bg-blue-50", headerBg: "from-blue-900 to-slate-900", badge: "bg-blue-100 text-blue-700", pattern: "🍔" },
  burger: { accent: "#2563EB", bg: "bg-blue-50", headerBg: "from-blue-900 to-slate-900", badge: "bg-blue-100 text-blue-700", pattern: "🍔" },
  mediterranean: { accent: "#0369A1", bg: "bg-cyan-50", headerBg: "from-cyan-900 to-blue-900", badge: "bg-cyan-100 text-cyan-700", pattern: "🫒" },
  french: { accent: "#7C3AED", bg: "bg-violet-50", headerBg: "from-violet-950 to-slate-900", badge: "bg-violet-100 text-violet-700", pattern: "🥐" },
  korean: { accent: "#E11D48", bg: "bg-rose-50", headerBg: "from-rose-900 to-slate-900", badge: "bg-rose-100 text-rose-700", pattern: "🍖" },
};
const defaultTheme = { accent: "#7C3AED", bg: "bg-gray-50", headerBg: "from-gray-900 to-gray-800", badge: "bg-primary/10 text-primary", pattern: "🍽️" };

function getTheme(cuisine?: string | null) {
  if (!cuisine) return defaultTheme;
  const key = cuisine.toLowerCase().trim();
  for (const [k, v] of Object.entries(cuisineThemes)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return defaultTheme;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);

function sendWhatsApp(waNumber: string | undefined, message: string) {
  if (waNumber) {
    const cleanNum = waNumber.replace(/[^0-9+]/g, "").replace(/^\+/, "");
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`, "_blank");
  } else {
    alert(message.replace(/\*/g, "").replace(/\n/g, "\n"));
  }
}

interface CartItem { id: number; name: string; price: string; qty: number; }

export default function PublicMenu() {
  const [, params] = useRoute("/menu/:slug");
  const search = useSearch();
  const tableNum = new URLSearchParams(search).get("table");
  const { data: restaurant, isLoading: restLoading, error } = useRestaurantBySlug(params?.slug || "");
  const { data: menus, isLoading: menuLoading } = useMenus(restaurant?.id || 0);

  const [activeTab, setActiveTab] = useState<"menu" | "service">("menu");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const theme = getTheme(restaurant?.cuisineType);
  const waNumber = (restaurant as any)?.whatsappNumber;

  const addToCart = (item: { id: number; name: string; price: string }) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const cartTotal = cart.reduce((sum, c) => {
    const price = parseFloat(c.price.replace(/[^0-9.]/g, "")) || 0;
    return sum + price * c.qty;
  }, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const sendServiceRequest = (emoji: string, label: string) => {
    const msg = `${emoji} *Service Request${tableNum ? ` — Table ${tableNum}` : ""}*\n*${restaurant?.name}*\n\n${label}`;
    sendWhatsApp(waNumber, msg);
    setSentRequests(prev => [...prev, label]);
  };

  const sendCustomMsg = () => {
    if (!customRequest.trim()) return;
    const msg = `💬 *Customer Request${tableNum ? ` — Table ${tableNum}` : ""}*\n*${restaurant?.name}*\n\n${customRequest}`;
    sendWhatsApp(waNumber, msg);
    setSentRequests(prev => [...prev, customRequest]);
    setCustomRequest("");
  };

  if (restLoading || menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-500 font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant || !menus || menus.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold mb-2">Menu Not Found</h1>
          <p className="text-gray-500">This restaurant may not have published their menu yet.</p>
        </div>
      </div>
    );
  }

  const activeMenu = menus[0];
  const availableItems = activeMenu.items.filter(i => i.isAvailable !== false);
  const categories = ["All", ...Array.from(new Set(availableItems.map(i => i.category || "Other")))];
  const filteredItems = activeCategory === "All"
    ? availableItems
    : availableItems.filter(i => (i.category || "Other") === activeCategory);

  // Quick service actions
  const serviceActions = [
    { emoji: "💧", label: "Refill water please", icon: Droplets, color: "bg-blue-50 text-blue-600 border-blue-200" },
    { emoji: "🍰", label: "Recommend a dessert", icon: Cake, color: "bg-pink-50 text-pink-600 border-pink-200" },
    { emoji: "🧾", label: "Get me the cheque", icon: Receipt, color: "bg-amber-50 text-amber-600 border-amber-200" },
    { emoji: "🙋", label: "Call a waiter", icon: HandPlatter, color: "bg-purple-50 text-purple-600 border-purple-200" },
    { emoji: "☕", label: "Another round of drinks", icon: Coffee, color: "bg-orange-50 text-orange-600 border-orange-200" },
    { emoji: "🍽️", label: "Extra cutlery / napkins", icon: UtensilsCrossed, color: "bg-green-50 text-green-600 border-green-200" },
    { emoji: "❓", label: "I have an allergy question", icon: HelpCircle, color: "bg-red-50 text-red-600 border-red-200" },
    { emoji: "🎂", label: "It's a special occasion!", icon: Star, color: "bg-violet-50 text-violet-600 border-violet-200" },
  ];

  return (
    <div className={`min-h-screen ${theme.bg} pb-28`}>
      {/* Header */}
      <div className={`relative h-48 md:h-64 bg-gradient-to-br ${theme.headerBg} overflow-hidden`}>
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-8xl select-none">
            {Array(12).fill(theme.pattern).join("  ")}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {restaurant.cuisineType && (
              <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-3 ${theme.badge}`}>
                {restaurant.cuisineType}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-1">{restaurant.name}</h1>
            <p className="text-white/70 max-w-xl text-sm md:text-base">{restaurant.description}</p>
            {tableNum && (
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                Table {tableNum}
              </span>
            )}
          </motion.div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="max-w-4xl mx-auto px-4 -mt-5 relative z-10">
        <div className="bg-white rounded-t-3xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                activeTab === "menu"
                  ? "border-b-2 text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              style={activeTab === "menu" ? { borderColor: theme.accent, color: theme.accent } : {}}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Menu
              {cartCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: theme.accent }}>
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("service")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                activeTab === "service"
                  ? "border-b-2 text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              style={activeTab === "service" ? { borderColor: theme.accent, color: theme.accent } : {}}
            >
              <MessageCircle className="w-4 h-4" />
              Service
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ═══ MENU TAB ═══ */}
            {activeTab === "menu" && (
              <motion.div key="menu" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                {/* Categories */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-gray-100">
                  <div className="overflow-x-auto hide-scrollbar">
                    <div className="flex px-4 pt-2 pb-0 min-w-max">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-5 py-3 font-medium text-sm transition-all border-b-2 relative ${
                            activeCategory === cat ? "font-bold border-current" : "text-gray-500 border-transparent hover:text-gray-800"
                          }`}
                          style={activeCategory === cat ? { color: theme.accent, borderColor: theme.accent } : {}}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 md:p-8">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeCategory} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                      {filteredItems.map(item => {
                        const inCart = cart.find(c => c.id === item.id);
                        return (
                          <div key={item.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-display font-bold text-base text-gray-900">{item.name}</h3>
                                {(item as any).isBestseller && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase"><Flame className="w-3 h-3" /> Bestseller</span>}
                                {(item as any).isChefsPick && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold uppercase"><ChefHat className="w-3 h-3" /> Chef's Pick</span>}
                                {(item as any).isTodaysSpecial && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase"><Star className="w-3 h-3" /> Today's Special</span>}
                              </div>
                              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{item.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-sm" style={{ color: theme.accent }}>AED {item.price.replace(/[^0-9.]/g, "")}</span>
                                {inCart ? (
                                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1">
                                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white transition-colors"><Minus className="w-3 h-3" /></button>
                                    <span className="text-sm font-bold w-5 text-center">{inCart.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white transition-colors"><Plus className="w-3 h-3" /></button>
                                  </div>
                                ) : (
                                  <button onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 hover:border-gray-400 transition-colors">
                                    <Plus className="w-3 h-3" /> Add
                                  </button>
                                )}
                              </div>
                            </div>
                            {item.imageUrl && (
                              <div className="shrink-0">
                                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-xl shadow-sm border border-gray-100" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {filteredItems.length === 0 && <div className="text-center py-12 text-gray-400">No items found in this category.</div>}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ═══ SERVICE TAB ═══ */}
            {activeTab === "service" && (
              <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="p-5 md:p-8">
                  <div className="mb-6">
                    <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Need something?</h2>
                    <p className="text-gray-500 text-sm">Tap a button below to instantly notify our staff{tableNum ? ` (Table ${tableNum})` : ""}.</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {serviceActions.map((action, i) => {
                      const Icon = action.icon;
                      const wasSent = sentRequests.includes(action.label);
                      return (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => sendServiceRequest(action.emoji, action.label)}
                          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-95 ${
                            wasSent ? "bg-green-50 border-green-300" : action.color + " hover:shadow-md"
                          }`}
                        >
                          {wasSent ? (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                              <span className="text-green-600 text-sm">✓</span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shrink-0 shadow-sm">
                              <Icon className="w-4 h-4" />
                            </div>
                          )}
                          <span className={`text-sm font-semibold leading-tight ${wasSent ? "text-green-700" : ""}`}>
                            {wasSent ? "Sent!" : action.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Custom Request */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-700 text-sm mb-3">Or send a custom request</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customRequest}
                        onChange={e => setCustomRequest(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendCustomMsg()}
                        placeholder="Type your request here..."
                        className="flex-1 h-12 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <button
                        onClick={sendCustomMsg}
                        disabled={!customRequest.trim()}
                        className="h-12 w-12 rounded-xl text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sent History */}
                  {sentRequests.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sent requests</p>
                      <div className="space-y-2">
                        {sentRequests.map((req, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-green-500">✓</span>
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp indicator */}
                  <div className="mt-6 text-center">
                    {waNumber ? (
                      <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <WhatsAppIcon className="w-3.5 h-3.5 text-green-500" /> Requests sent via WhatsApp
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Requests will be shown as notifications</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center py-6 text-gray-400 text-xs">
          Powered by <span className="font-display font-bold text-gray-500">DineHub</span>
        </div>
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && activeTab === "menu" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setShowCart(!showCart)}
              className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-white font-bold shadow-2xl transition-all hover:scale-[1.01]"
              style={{ backgroundColor: theme.accent }}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <span>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
              </div>
              <span>AED {cartTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowCart(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[70vh] overflow-auto shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold">Your Order</h2>
                  <button onClick={() => setShowCart(false)} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
                </div>
                {tableNum && <p className="text-sm text-gray-500 mb-4">Table {tableNum}</p>}
                <div className="space-y-4">
                  {cart.map(item => {
                    const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">AED {price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-1">
                            <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white"><Minus className="w-3 h-3" /></button>
                            <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white"><Plus className="w-3 h-3" /></button>
                          </div>
                          <span className="font-bold text-sm w-20 text-right">AED {(price * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-200 mt-6 pt-4 flex items-center justify-between">
                  <span className="font-display font-bold text-lg">Total</span>
                  <span className="font-display font-bold text-lg" style={{ color: theme.accent }}>AED {cartTotal.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full h-14 mt-4 text-lg font-bold rounded-2xl gap-2"
                  style={{ backgroundColor: theme.accent }}
                  onClick={() => {
                    const orderLines = cart.map(c => {
                      const p = parseFloat(c.price.replace(/[^0-9.]/g, "")) || 0;
                      return `• ${c.qty}x ${c.name} — AED ${(p * c.qty).toFixed(2)}`;
                    }).join("\n");
                    const orderMsg = `🍽️ *New Order${tableNum ? ` — Table ${tableNum}` : ""}*\n*${restaurant.name}*\n\n${orderLines}\n\n*Total: AED ${cartTotal.toFixed(2)}*`;
                    sendWhatsApp(waNumber, orderMsg);
                    setCart([]);
                    setShowCart(false);
                  }}
                >
                  {waNumber ? <><WhatsAppIcon className="w-5 h-5" /> Send Order via WhatsApp</> : <><Send className="w-5 h-5" /> Place Order</>}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Chat Agent */}
      <ChatAgent
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        accentColor={theme.accent}
      />
    </div>
  );
}
