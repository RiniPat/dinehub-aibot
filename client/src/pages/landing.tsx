import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, UtensilsCrossed, Smartphone, Sparkles, QrCode, ChefHat, Flame, Star, Eye, Pencil, BarChart3, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const demoMenuItems = [
  { id: 1, name: "Truffle Hummus", description: "Creamy chickpea hummus drizzled with truffle oil, served with warm pita.", price: "38.00", category: "Appetizer", imageUrl: "https://images.unsplash.com/photo-1637361973-e2ef1e177713?w=400&h=300&fit=crop", isBestseller: true },
  { id: 2, name: "Grilled Halloumi Salad", description: "Crispy halloumi over mixed greens with pomegranate and za'atar.", price: "45.00", category: "Appetizer", imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop", isChefsPick: true },
  { id: 3, name: "Seafood Risotto", description: "Arborio rice with prawns, calamari, and saffron broth.", price: "95.00", category: "Main", imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop", isBestseller: true },
  { id: 4, name: "Grilled Lamb Chops", description: "NZ lamb chops with rosemary jus and roasted vegetables.", price: "120.00", category: "Main", imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop", isChefsPick: true },
  { id: 5, name: "Chicken Shawarma Plate", description: "Marinated chicken with garlic sauce, pickles and tabouleh.", price: "65.00", category: "Main", imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop", isTodaysSpecial: true },
  { id: 6, name: "Kunafa Cheesecake", description: "Crispy kunafa meets creamy New York cheesecake.", price: "42.00", category: "Dessert", imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop", isBestseller: true },
  { id: 7, name: "Fresh Mint Lemonade", description: "House-made lemonade with mint and a hint of rose water.", price: "22.00", category: "Drink", imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop" },
  { id: 8, name: "Chocolate Lava Cake", description: "Warm chocolate fondant with vanilla ice cream.", price: "48.00", category: "Dessert", imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop" },
];

function DemoMenuPreview() {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Appetizer", "Main", "Dessert", "Drink"];
  const filtered = activeCategory === "All" ? demoMenuItems : demoMenuItems.filter(i => i.category === activeCategory);

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-orange-900 p-6 text-white">
        <p className="text-amber-200 text-xs font-medium tracking-wider uppercase mb-1">The Golden Fork</p>
        <h3 className="font-display text-xl font-bold">Signature Menu</h3>
        <p className="text-amber-100 text-xs mt-1 opacity-80">Downtown Dubai</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-amber-800 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="px-4 pb-4 space-y-3 max-h-[420px] overflow-y-auto">
        {filtered.map(item => (
          <div key={item.id} className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg shadow-sm shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                {(item as any).isBestseller && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[9px] font-bold"><Flame className="w-2.5 h-2.5" />Bestseller</span>}
                {(item as any).isChefsPick && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[9px] font-bold"><ChefHat className="w-2.5 h-2.5" />Chef's Pick</span>}
                {(item as any).isTodaysSpecial && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-bold"><Star className="w-2.5 h-2.5" />Special</span>}
              </div>
              <p className="text-gray-500 text-[11px] leading-snug mt-0.5 line-clamp-1">{item.description}</p>
              <span className="font-bold text-xs text-amber-800 mt-1 block">AED {item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg text-white">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-gray-900">
            DineHub
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold">Log in</Button>
          </Link>
          <Link href="/register">
            <Button className="font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" /> AI-Powered Digital Menus
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Your Menu, <br />
              <span className="text-primary">Reimagined.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
              Create stunning digital menus in seconds. Generate QR codes for every table, update prices instantly, and let AI build your menu from scratch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                  Create Free Menu
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl hover:bg-gray-50">
                  Try Live Demo
                </Button>
              </Link>
              <Link href="/discover">
                <Button size="lg" variant="ghost" className="h-14 px-8 text-lg rounded-xl text-primary hover:bg-primary/5">
                  Discover Dubai 🇦🇪
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full filter blur-3xl opacity-30 transform translate-y-10" />
            <DemoMenuPreview />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Go from zero to a live digital menu in under 5 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Sign Up", desc: "Create your free account in seconds.", icon: CheckCircle2 },
              { step: "2", title: "Add Restaurant", desc: "Enter your restaurant name, cuisine type, and details.", icon: UtensilsCrossed },
              { step: "3", title: "Build Your Menu", desc: "Add items manually or let AI generate your entire menu.", icon: Sparkles },
              { step: "4", title: "Go Live", desc: "Print QR codes for each table. Customers scan and order.", icon: QrCode },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg shadow-primary/20">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Focus on cooking. We'll handle the digital experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI Menu Generation",
                desc: "Tell us your cuisine type. AI writes descriptions, sets prices in AED, and even adds food photos — all in one click."
              },
              {
                icon: QrCode,
                title: "Per-Table QR Codes",
                desc: "Generate unique QR codes for each table. Customers scan with their phone and see your full menu instantly."
              },
              {
                icon: Smartphone,
                title: "Mobile First Design",
                desc: "Beautiful, themed menus that look stunning on every device. No app download required for customers."
              },
              {
                icon: Pencil,
                title: "Live Menu Editing",
                desc: "Update prices, toggle items on/off, mark bestsellers — changes go live to customers in real-time."
              },
              {
                icon: Eye,
                title: "Availability Control",
                desc: "Ran out of an ingredient? Toggle any item to 'Hidden' with one tap. Bring it back when you're ready."
              },
              {
                icon: BarChart3,
                title: "Restaurant Dashboard",
                desc: "Manage all your menus, items, and QR codes from one simple dashboard. No tech skills needed."
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to go digital?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join restaurants across the UAE already using DineHub to serve their customers better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-white text-primary hover:bg-gray-100 shadow-xl">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-white/40 text-white hover:bg-white/10">
                  Try Live Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">DineHub</span>
          </div>
          <p className="text-gray-500 text-sm">Digital menus for modern restaurants.</p>
        </div>
      </footer>
    </div>
  );
}
