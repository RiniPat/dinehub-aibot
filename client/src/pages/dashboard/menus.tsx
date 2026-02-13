import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { useRestaurants, useMenus, useCreateMenu, useGenerateMenu, useUploadMenu, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from "@/hooks/use-restaurants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Sparkles, Trash2, Pencil, Eye, EyeOff, Image as ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatAgent from "@/components/chat-agent";

export default function DashboardMenus() {
  const { data: restaurants } = useRestaurants();
  const restaurant = restaurants?.[0];
  const { data: menus, isLoading } = useMenus(restaurant?.id || 0);
  const createMenu = useCreateMenu();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  const generateMenu = useGenerateMenu();
  const uploadMenu = useUploadMenu();
  const { toast } = useToast();

  const [newMenuName, setNewMenuName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  // Upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Item form state (for Add)
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemBestseller, setItemBestseller] = useState(false);
  const [itemChefsPick, setItemChefsPick] = useState(false);
  const [itemTodaysSpecial, setItemTodaysSpecial] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Edit item state
  const [editItem, setEditItem] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editBestseller, setEditBestseller] = useState(false);
  const [editChefsPick, setEditChefsPick] = useState(false);
  const [editTodaysSpecial, setEditTodaysSpecial] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // AI Generation state
  const [aiCuisine, setAiCuisine] = useState("");
  const [aiTone, setAiTone] = useState("Fancy");
  const [isAiOpen, setIsAiOpen] = useState(false);

  if (!restaurant) return null;

  const handleCreateMenu = async () => {
    if (!newMenuName) return;
    await createMenu.mutateAsync({ 
      restaurantId: restaurant.id, 
      name: newMenuName,
      description: "",
      isActive: true 
    });
    setNewMenuName("");
    setIsCreateOpen(false);
  };

  const handleAddItem = async () => {
    if (!selectedMenuId) return;
    await createItem.mutateAsync({
      menuId: parseInt(selectedMenuId),
      name: itemName,
      description: itemDesc,
      price: itemPrice,
      category: itemCategory,
      imageUrl: itemImage,
      isAvailable: true,
      isBestseller: itemBestseller,
      isChefsPick: itemChefsPick,
      isTodaysSpecial: itemTodaysSpecial,
    });
    setItemName(""); setItemDesc(""); setItemPrice(""); setItemCategory(""); setItemImage("");
    setItemBestseller(false); setItemChefsPick(false); setItemTodaysSpecial(false);
    setIsAddItemOpen(false);
    toast({ title: "Item Added", description: "Menu item created successfully." });
  };

  const openEditDialog = (item: any, menuId: number) => {
    setEditItem({ ...item, menuId });
    setEditName(item.name);
    setEditDesc(item.description || "");
    setEditPrice(item.price?.replace(/[^0-9.]/g, "") || "");
    setEditCategory(item.category || "");
    setEditImage(item.imageUrl || "");
    setEditBestseller(!!(item as any).isBestseller);
    setEditChefsPick(!!(item as any).isChefsPick);
    setEditTodaysSpecial(!!(item as any).isTodaysSpecial);
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editItem) return;
    await updateItem.mutateAsync({
      id: editItem.id,
      menuId: editItem.menuId,
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
    setEditItem(null);
    toast({ title: "Item Updated", description: "Changes saved successfully." });
  };

  const toggleAvailability = async (item: any, menuId: number) => {
    await updateItem.mutateAsync({
      id: item.id,
      menuId,
      isAvailable: !item.isAvailable,
    });
    toast({
      title: item.isAvailable ? "Item Hidden" : "Item Live",
      description: item.isAvailable
        ? `"${item.name}" is now hidden from customers.`
        : `"${item.name}" is now visible to customers.`,
    });
  };

  const handleAiGenerate = async () => {
    if (!aiCuisine) return;
    try {
      const result = await generateMenu.mutateAsync({
        restaurantId: restaurant.id,
        cuisine: aiCuisine,
        tone: aiTone
      });
      
      const menu = await createMenu.mutateAsync({
        restaurantId: restaurant.id,
        name: result.name,
        description: result.description,
        isActive: true
      });

      for (const item of result.items) {
        await createItem.mutateAsync({
          ...item,
          menuId: menu.id,
          isBestseller: item.isBestseller || false,
          isChefsPick: item.isChefsPick || false,
          isTodaysSpecial: item.isTodaysSpecial || false,
        });
      }
      
      setIsAiOpen(false);
      toast({ title: "Magic Complete!", description: "Your AI menu has been generated." });
    } catch (err) {
      // Error toast is handled by the hook's onError
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !restaurant) return;
    try {
      const result = await uploadMenu.mutateAsync({
        file: uploadFile,
        restaurantId: restaurant.id,
      });

      const menu = await createMenu.mutateAsync({
        restaurantId: restaurant.id,
        name: result.name || "Uploaded Menu",
        description: result.description || "Menu created from uploaded file",
        isActive: true,
      });

      for (const item of result.items) {
        await createItem.mutateAsync({
          ...item,
          menuId: menu.id,
          isBestseller: item.isBestseller || false,
          isChefsPick: item.isChefsPick || false,
          isTodaysSpecial: item.isTodaysSpecial || false,
        });
      }

      setIsUploadOpen(false);
      setUploadFile(null);
      toast({ title: "Menu Uploaded!", description: `${result.items.length} items imported from your file.` });
    } catch (err) {
      // Error toast is handled by the hook
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Menus</h1>
          <p className="text-gray-500 mt-1">Manage your food and drink offerings.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadOpen} onOpenChange={(open) => { setIsUploadOpen(open); if (!open) setUploadFile(null); }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Upload Menu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-blue-600" /> Upload Menu File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Upload a PDF, DOCX, or TXT file of your menu. AI will read it and create menu items automatically.
                </p>
                <div>
                  <Label>Menu File</Label>
                  <div className="mt-1.5">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  {uploadFile && (
                    <p className="text-xs text-gray-400 mt-2">
                      Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleFileUpload} disabled={!uploadFile || uploadMenu.isPending || createMenu.isPending || createItem.isPending} className="gap-2">
                  {uploadMenu.isPending || createMenu.isPending || createItem.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Import Menu</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAiOpen} onOpenChange={setIsAiOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-600" /> AI Menu Generator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Cuisine Type</Label>
                  <Input value={aiCuisine} onChange={e => setAiCuisine(e.target.value)} placeholder="Italian, Japanese, Indian..." />
                </div>
                <div>
                  <Label>Tone / Style</Label>
                  <Input value={aiTone} onChange={e => setAiTone(e.target.value)} placeholder="Fancy, Casual, Playful..." />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAiGenerate} disabled={generateMenu.isPending} className="gap-2">
                  {generateMenu.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Menu</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> New Menu</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Menu</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Menu Name</Label>
                  <Input value={newMenuName} onChange={e => setNewMenuName(e.target.value)} placeholder="Dinner Menu" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateMenu} disabled={createMenu.isPending}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !menus || menus.length === 0 ? (
        <div className="text-center py-20">
          <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-600">No menus yet</h2>
          <p className="text-gray-400 mt-2">Create your first menu or let AI generate one for you.</p>
        </div>
      ) : (
        <Tabs defaultValue={menus[0]?.id.toString()} onValueChange={setSelectedMenuId}>
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            {menus.map(menu => (
              <TabsTrigger key={menu.id} value={menu.id.toString()}>
                {menu.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {menus.map(menu => (
            <TabsContent key={menu.id} value={menu.id.toString()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">{menu.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{menu.items.length} item{menu.items.length !== 1 ? "s" : ""}</p>
                </div>
                <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2" onClick={() => setSelectedMenuId(menu.id.toString())}>
                      <Plus className="w-4 h-4" /> Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Add Menu Item</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Name</Label><Input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Chicken Tikka" /></div>
                      <div><Label>Description</Label><Textarea value={itemDesc} onChange={e => setItemDesc(e.target.value)} placeholder="A short description..." rows={2} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Price (AED)</Label><Input value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="55.00" /></div>
                        <div><Label>Category</Label><Input value={itemCategory} onChange={e => setItemCategory(e.target.value)} placeholder="Main" /></div>
                      </div>
                      <div><Label>Image URL</Label><Input value={itemImage} onChange={e => setItemImage(e.target.value)} placeholder="https://..." /></div>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Switch checked={itemBestseller} onCheckedChange={setItemBestseller} />
                          🔥 Bestseller
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Switch checked={itemChefsPick} onCheckedChange={setItemChefsPick} />
                          👨‍🍳 Chef's Pick
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <Switch checked={itemTodaysSpecial} onCheckedChange={setItemTodaysSpecial} />
                          ⭐ Today's Special
                        </label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddItem} disabled={createItem.isPending}>Add Item</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {menu.items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No items in this menu yet.</div>
                ) : (
                  Object.entries(menu.items.reduce((acc, item) => {
                    const cat = item.category || "Uncategorized";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(item);
                    return acc;
                  }, {} as Record<string, typeof menu.items>)).map(([category, items]) => (
                    <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 font-bold text-gray-700">
                        {category}
                      </div>
                      <div className="divide-y divide-gray-100">
                        {items.map(item => {
                          const isAvailable = item.isAvailable !== false;
                          return (
                            <div
                              key={item.id}
                              className={`p-5 flex items-start gap-4 transition-colors group ${
                                isAvailable ? "hover:bg-gray-50/50" : "bg-gray-50/80 opacity-60"
                              }`}
                            >
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className={`w-20 h-20 object-cover rounded-lg shadow-sm shrink-0 ${!isAvailable ? "grayscale" : ""}`}
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                  <ImageIcon className="w-6 h-6 text-gray-300" />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="min-w-0">
                                    <h3 className={`font-bold text-gray-900 ${!isAvailable ? "line-through text-gray-500" : ""}`}>
                                      {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{item.description}</p>
                                  </div>
                                  <span className="font-bold text-primary whitespace-nowrap text-sm">
                                    AED {item.price?.replace(/[^0-9.]/g, "")}
                                  </span>
                                </div>

                                <div className="flex gap-1.5 mt-2 flex-wrap">
                                  {(item as any).isBestseller && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">🔥 Bestseller</span>
                                  )}
                                  {(item as any).isChefsPick && (
                                    <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold">👨‍🍳 Chef's Pick</span>
                                  )}
                                  {(item as any).isTodaysSpecial && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">⭐ Today's Special</span>
                                  )}
                                  {!isAvailable && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">Hidden</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <Switch
                                      checked={isAvailable}
                                      onCheckedChange={() => toggleAvailability(item, menu.id)}
                                    />
                                    <span className={isAvailable ? "text-green-600 font-semibold" : "text-gray-400"}>
                                      {isAvailable ? (
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Live</span>
                                      ) : (
                                        <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> Hidden</span>
                                      )}
                                    </span>
                                  </label>

                                  <div className="flex-1" />

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-8 px-2"
                                    onClick={() => openEditDialog(item, menu.id)}
                                  >
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                                    onClick={() => {
                                      if (confirm(`Delete "${item.name}"?`)) {
                                        deleteItem.mutate({ id: item.id, menuId: menu.id });
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* ===== EDIT ITEM DIALOG ===== */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Menu Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (AED)</Label>
                <Input value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="55.00" />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="Main" />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={editImage} onChange={e => setEditImage(e.target.value)} placeholder="https://..." />
              {editImage && (
                <img src={editImage} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2 border" />
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={editBestseller} onCheckedChange={setEditBestseller} />
                🔥 Bestseller
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={editChefsPick} onCheckedChange={setEditChefsPick} />
                👨‍🍳 Chef's Pick
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={editTodaysSpecial} onCheckedChange={setEditTodaysSpecial} />
                ⭐ Today's Special
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={updateItem.isPending}>
              {updateItem.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Chat Agent Preview */}
      <ChatAgent
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        accentColor="#7C3AED"
      />
    </DashboardLayout>
  );
}

function UtensilsCrossed(props: any) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 2 7 7" /><path d="m7 2 5 5" /><path d="M7 22 22 7" /><path d="M2.1 21.9a11 11 0 0 0 14.5-16.1" />
    </svg>
  );
}
