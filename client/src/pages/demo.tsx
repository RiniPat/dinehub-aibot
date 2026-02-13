import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRestaurantBySlug, useMenus, useUpdateMenuItem, useDeleteMenuItem } from "@/hooks/use-restaurants";
import { QRCodeSVG } from "qrcode.react";
import {
  LayoutDashboard, Menu as MenuIcon, QrCode, UtensilsCrossed,
  Pencil, Trash2, Eye, EyeOff, Download, ExternalLink,
  Loader2, ArrowLeft, Sparkles,
  Image as ImageIcon, CheckCircle2, Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Demo Layout Shell ───
function DemoLayout({ children, activeTab, setActiveTab }: { children: React.ReactNode; activeTab: string; setActiveTab: (t: string) => void }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "menus", label: "Menus", icon: MenuIcon },
    { id: "qr", label: "QR Codes", icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-gray-900">DineHub</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-medium text-gray-900">Demo User</p>
            <p className="text-xs text-gray-500">Restaurant Owner</p>
          </div>
          <Link href="/register">
            <Button className="w-full gap-2">
              <Sparkles className="w-4 h-4" /> Create Your Own
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Demo Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span className="font-medium">Interactive Demo</span>
            <span className="hidden sm:inline opacity-80">— Try editing items, toggling availability, and generating QR codes!</span>
          </div>
          <Link href="/register">
            <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-semibold transition-colors">
              Sign Up Free →
            </button>
          </Link>
        </div>

        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg">Demo</span>
          </Link>
        </header>

        {/* Mobile Nav */}
        <nav className="md:hidden flex border-b border-gray-200 bg-white">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  activeTab === item.id ? "text-primary border-b-2 border-primary" : "text-gray-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab({ items, setActiveTab }: { items: any[]; setActiveTab: (t: string) => void }) {
  const liveItems = items.filter(i => i.isAvailable !== false).length;
  const hiddenItems = items.filter(i => i.isAvailable === false).length;
  const categories = Array.from(new Set(items.map(i => i.category))).length;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">The Golden Fork</h1>
      <p className="text-gray-500 mb-8">Downtown Dubai · Mediterranean · <a href="/menu/demo-bistro" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">View Public Menu <ExternalLink className="w-3 h-3" /></a></p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Items", value: items.length, color: "bg-blue-50 text-blue-700" },
          { label: "Live Items", value: liveItems, color: "bg-green-50 text-green-700" },
          { label: "Hidden", value: hiddenItems, color: "bg-red-50 text-red-600" },
          { label: "Categories", value: categories, color: "bg-purple-50 text-purple-700" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="font-display text-lg font-bold mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <button onClick={() => setActiveTab("menus")} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-primary/30 hover:shadow-md transition-all text-left group">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center text-primary mb-3 group-hover:bg-primary/20 transition-colors">
            <Pencil className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Edit Menu Items</h3>
          <p className="text-sm text-gray-500">Update prices, descriptions, and availability.</p>
        </button>
        <button onClick={() => setActiveTab("qr")} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-primary/30 hover:shadow-md transition-all text-left group">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center text-primary mb-3 group-hover:bg-primary/20 transition-colors">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Generate QR Codes</h3>
          <p className="text-sm text-gray-500">Create per-table QR codes for customers.</p>
        </button>
        <a href="/menu/demo-bistro" target="_blank" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-primary/30 hover:shadow-md transition-all text-left group">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center text-primary mb-3 group-hover:bg-primary/20 transition-colors">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">View Public Menu</h3>
          <p className="text-sm text-gray-500">See what your customers see when they scan.</p>
        </a>
      </div>

      {/* How It Works */}
      <h2 className="font-display text-lg font-bold mb-4">How DineHub Works</h2>
      <div className="space-y-4">
        {[
          { icon: CheckCircle2, title: "1. Create your restaurant", desc: "Add your restaurant name, cuisine type, and address in onboarding." },
          { icon: MenuIcon, title: "2. Build your menu", desc: "Add items manually with photos and prices, or let AI generate your entire menu in one click." },
          { icon: Pencil, title: "3. Manage in real-time", desc: "Edit prices, toggle items on/off, mark bestsellers — changes go live instantly." },
          { icon: QrCode, title: "4. Print QR codes", desc: "Generate a unique QR code for each table. Customers scan with their phone to browse and order." },
        ].map((step, i) => (
          <div key={i} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-5">
            <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <step.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{step.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Menu Tab (Real API) ───
function MenuTab({ items, menuId }: { items: any[]; menuId: number }) {
  const { toast } = useToast();
  const updateItem = useUpdateMenuItem();
  const deleteItemMutation = useDeleteMenuItem();

  const [editItem, setEditItem] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editBestseller, setEditBestseller] = useState(false);
  const [editChefsPick, setEditChefsPick] = useState(false);
  const [editTodaysSpecial, setEditTodaysSpecial] = useState(false);

  const openEdit = (item: any) => {
    setEditItem(item);
    setEditName(item.name);
    setEditDesc(item.description || "");
    setEditPrice(item.price?.replace(/[^0-9.]/g, "") || "");
    setEditCategory(item.category || "");
    setEditImage(item.imageUrl || "");
    setEditBestseller(!!item.isBestseller);
    setEditChefsPick(!!item.isChefsPick);
    setEditTodaysSpecial(!!item.isTodaysSpecial);
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editItem) return;
    try {
      await updateItem.mutateAsync({
        id: editItem.id,
        menuId: menuId,
        name: editName,
        description: editDesc,
        price: editPrice,
        category: editCategory,
        imageUrl: editImage,
        isBestseller: editBestseller,
        isChefsPick: editChefsPick,
        isTodaysSpecial: editTodaysSpecial,
      });
      setIsEditOpen(false);
      toast({ title: "Item Updated", description: `"${editName}" saved successfully.` });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update item.", variant: "destructive" });
    }
  };

  const toggleAvail = async (item: any) => {
    try {
      await updateItem.mutateAsync({
        id: item.id,
        menuId: menuId,
        isAvailable: !item.isAvailable,
      });
      toast({
        title: item.isAvailable ? "Item Hidden" : "Item Live",
        description: item.isAvailable ? `"${item.name}" hidden from customers.` : `"${item.name}" is now visible.`,
      });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update availability.", variant: "destructive" });
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await deleteItemMutation.mutateAsync({ id: item.id, menuId: menuId });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
    }
  };

  const grouped = items.reduce((acc: Record<string, any[]>, item: any) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Signature Menu</h1>
          <p className="text-gray-500 mt-1">{items.length} items · {items.filter((i: any) => i.isAvailable !== false).length} live · Try editing, toggling, and deleting!</p>
        </div>
        <a href="/menu/demo-bistro" target="_blank">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" /> View Public Menu
          </Button>
        </a>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No items in this menu yet.</div>
      ) : (
        <div className="grid gap-6">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 font-bold text-gray-700">{category}</div>
              <div className="divide-y divide-gray-100">
                {catItems.map((item: any) => {
                  const isAvailable = item.isAvailable !== false;
                  return (
                    <div key={item.id} className={`p-5 flex items-start gap-4 transition-colors group ${isAvailable ? "hover:bg-gray-50/50" : "bg-gray-50/80 opacity-60"}`}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className={`w-20 h-20 object-cover rounded-lg shadow-sm shrink-0 ${!isAvailable ? "grayscale" : ""}`} />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0"><ImageIcon className="w-6 h-6 text-gray-300" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className={`font-bold text-gray-900 ${!isAvailable ? "line-through text-gray-500" : ""}`}>{item.name}</h3>
                            <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{item.description}</p>
                          </div>
                          <span className="font-bold text-primary whitespace-nowrap text-sm">AED {item.price?.replace(/[^0-9.]/g, "")}</span>
                        </div>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {item.isBestseller && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">🔥 Bestseller</span>}
                          {item.isChefsPick && <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold">👨‍🍳 Chef's Pick</span>}
                          {item.isTodaysSpecial && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">⭐ Today's Special</span>}
                          {!isAvailable && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">Hidden</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <Switch checked={isAvailable} onCheckedChange={() => toggleAvail(item)} />
                            <span className={isAvailable ? "text-green-600 font-semibold" : "text-gray-400"}>
                              {isAvailable ? <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Live</span> : <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> Hidden</span>}
                            </span>
                          </label>
                          <div className="flex-1" />
                          <Button variant="ghost" size="sm" className="gap-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-8 px-2" onClick={() => openEdit(item)}>
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1 text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-2" onClick={() => handleDelete(item)}>
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Menu Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price (AED)</Label><Input value={editPrice} onChange={e => setEditPrice(e.target.value)} /></div>
              <div><Label>Category</Label><Input value={editCategory} onChange={e => setEditCategory(e.target.value)} /></div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={editImage} onChange={e => setEditImage(e.target.value)} />
              {editImage && <img src={editImage} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2 border" />}
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={editBestseller} onCheckedChange={setEditBestseller} /> 🔥 Bestseller</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={editChefsPick} onCheckedChange={setEditChefsPick} /> 👨‍🍳 Chef's Pick</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={editTodaysSpecial} onCheckedChange={setEditTodaysSpecial} /> ⭐ Today's Special</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={updateItem.isPending}>
              {updateItem.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── QR Tab ───
function QRTab() {
  const [tableCount, setTableCount] = useState(12);
  const [generated, setGenerated] = useState(false);
  const { toast } = useToast();

  const tables = generated ? Array.from({ length: tableCount }, (_, i) => i + 1) : [];

  const getTableUrl = (table: number) =>
    `${window.location.protocol}//${window.location.host}/menu/demo-bistro?table=${table}`;

  const downloadQR = (table: number) => {
    const svgEl = document.getElementById(`demo-qr-table-${table}`) as unknown as SVGSVGElement;
    if (!svgEl) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    canvas.width = 400;
    canvas.height = 480;
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 400, 480);
        ctx.drawImage(img, 50, 30, 300, 300);
        ctx.fillStyle = "#111";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Table ${table}`, 200, 390);
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText("The Golden Fork", 200, 420);
        ctx.fillText("Scan to view menu", 200, 450);
        const link = document.createElement("a");
        link.download = `golden-fork-table-${table}-qr.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadAll = () => {
    tables.forEach((t, i) => setTimeout(() => downloadQR(t), i * 200));
    toast({ title: "Downloading", description: `${tables.length} QR codes being saved.` });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">QR Codes</h1>
      <p className="text-gray-500 mb-8">Generate a unique QR code for each table. Customers scan to see the menu and place orders.</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <Label className="text-sm font-semibold text-gray-700">Number of Tables</Label>
            <Input
              type="number" min={1} max={100}
              value={tableCount}
              onChange={e => setTableCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="mt-1.5 h-12 text-lg"
            />
          </div>
          <Button onClick={() => setGenerated(true)} className="gap-2 h-12 px-8">
            <QrCode className="w-4 h-4" /> Generate {tableCount} QR Code{tableCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>

      {generated && tables.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">{tables.length} QR codes generated · Each links to <a href="/menu/demo-bistro" target="_blank" className="text-primary hover:underline">your public menu</a></p>
            <Button variant="outline" onClick={downloadAll} className="gap-2">
              <Download className="w-4 h-4" /> Download All
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              <strong>Try it!</strong> Click any QR code table to open the customer's view. Each table number is embedded in the URL so waitstaff know which table ordered.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map(table => (
              <div key={table} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center gap-3 group hover:shadow-lg hover:border-primary/20 transition-all">
                <span className="font-bold text-sm text-gray-700">Table {table}</span>
                <a href={getTableUrl(table)} target="_blank" className="cursor-pointer hover:opacity-80 transition-opacity">
                  <QRCodeSVG id={`demo-qr-table-${table}`} value={getTableUrl(table)} size={140} level="H" includeMargin={false} />
                </a>
                <div className="flex gap-1 w-full">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => downloadQR(table)}>
                    <Download className="w-3 h-3 mr-1" /> Save
                  </Button>
                  <a href={getTableUrl(table)} target="_blank" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                      <ExternalLink className="w-3 h-3 mr-1" /> Open
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Demo Page ───
export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [demoReady, setDemoReady] = useState(false);

  // Silently auto-login as demo admin so edits persist to the database
  useEffect(() => {
    async function ensureDemoAuth() {
      try {
        // Check if already logged in
        const meRes = await fetch("/api/user");
        if (meRes.ok) {
          const user = await meRes.json();
          if (user) { setDemoReady(true); return; }
        }
        // Not logged in — silently login as demo admin
        await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "admin", password: "password" }),
        });
      } catch (err) {
        // Ignore — demo will still show data, just edits won't work
      }
      setDemoReady(true);
    }
    ensureDemoAuth();
  }, []);

  // Fetch real data from the database instead of using hardcoded items
  const { data: restaurant, isLoading: restLoading } = useRestaurantBySlug("demo-bistro");
  const { data: menus, isLoading: menuLoading } = useMenus(restaurant?.id || 0);

  const isLoading = !demoReady || restLoading || menuLoading;
  const activeMenu = menus?.[0];
  const items = activeMenu?.items || [];

  if (isLoading) {
    return (
      <DemoLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DemoLayout>
    );
  }

  if (!restaurant || !activeMenu) {
    return (
      <DemoLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-gray-600">Demo restaurant not found</h2>
          <p className="text-gray-400 mt-2">The demo data may not have been seeded yet. Try refreshing.</p>
        </div>
      </DemoLayout>
    );
  }

  return (
    <DemoLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <OverviewTab items={items} setActiveTab={setActiveTab} />}
          {activeTab === "menus" && <MenuTab items={items} menuId={activeMenu.id} />}
          {activeTab === "qr" && <QRTab />}
        </motion.div>
      </AnimatePresence>
    </DemoLayout>
  );
}
