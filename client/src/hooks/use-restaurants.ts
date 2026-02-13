import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertRestaurant, type InsertMenu, type InsertMenuItem, type GenerateMenuRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// === RESTAURANTS ===

export function useRestaurants() {
  return useQuery({
    queryKey: [api.restaurants.list.path],
    queryFn: async () => {
      const res = await fetch(api.restaurants.list.path);
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      return api.restaurants.list.responses[200].parse(await res.json());
    },
  });
}

export function useRestaurant(id: number) {
  return useQuery({
    queryKey: [api.restaurants.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.restaurants.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch restaurant");
      return api.restaurants.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useRestaurantBySlug(slug: string) {
  return useQuery({
    queryKey: [api.restaurants.getBySlug.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.restaurants.getBySlug.path, { slug });
      const res = await fetch(url);
      if (res.status === 404) throw new Error("Restaurant not found");
      if (!res.ok) throw new Error("Failed to fetch restaurant");
      return api.restaurants.getBySlug.responses[200].parse(await res.json());
    },
    enabled: !!slug,
    retry: false,
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertRestaurant) => {
      const res = await fetch(api.restaurants.create.path, {
        method: api.restaurants.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create restaurant");
      return api.restaurants.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.restaurants.list.path] });
      toast({ title: "Success", description: "Restaurant created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useRestaurantQR(id: number) {
  return useQuery({
    queryKey: [api.qr.generate.path, id],
    queryFn: async () => {
      const url = buildUrl(api.qr.generate.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to generate QR");
      return api.qr.generate.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// === MENUS ===

export function useMenus(restaurantId: number) {
  return useQuery({
    queryKey: [api.menus.list.path, restaurantId],
    queryFn: async () => {
      const url = buildUrl(api.menus.list.path, { restaurantId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch menus");
      return api.menus.list.responses[200].parse(await res.json());
    },
    enabled: !!restaurantId,
  });
}

export function useMenu(id: number) {
  return useQuery({
    queryKey: [api.menus.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.menus.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch menu");
      return api.menus.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMenu) => {
      const res = await fetch(api.menus.create.path, {
        method: api.menus.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create menu");
      return api.menus.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.menus.list.path, variables.restaurantId] });
      toast({ title: "Success", description: "Menu created successfully" });
    },
  });
}

export function useGenerateMenu() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: GenerateMenuRequest) => {
      const res = await fetch(api.menus.generate.path, {
        method: api.menus.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to generate menu" }));
        throw new Error(err.message);
      }
      return api.menus.generate.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({ title: "AI Generation Failed", description: error.message, variant: "destructive" });
    },
  });
}

export function useUploadMenu() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { file: File; restaurantId: number }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('restaurantId', data.restaurantId.toString());
      
      const res = await fetch(api.menus.uploadFile.path, {
        method: api.menus.uploadFile.method,
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to process file" }));
        throw new Error(error.message);
      }
      return api.menus.uploadFile.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    },
  });
}

// === MENU ITEMS ===

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMenuItem) => {
      const res = await fetch(api.menuItems.create.path, {
        method: api.menuItems.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create item");
      return api.menuItems.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate both the individual menu and the menus list (used by dashboard)
      queryClient.invalidateQueries({ queryKey: [api.menus.get.path, variables.menuId] });
      queryClient.invalidateQueries({ queryKey: [api.menus.list.path] });
      toast({ title: "Success", description: "Item added successfully" });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, menuId, ...data }: { id: number; menuId: number } & Record<string, any>) => {
      const url = buildUrl(api.menuItems.update.path, { id });
      const res = await fetch(url, {
        method: api.menuItems.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return api.menuItems.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.menus.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.menus.get.path, variables.menuId] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, menuId }: { id: number, menuId: number }) => {
      const url = buildUrl(api.menuItems.delete.path, { id });
      const res = await fetch(url, { method: api.menuItems.delete.method });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.menus.get.path, variables.menuId] });
      queryClient.invalidateQueries({ queryKey: [api.menus.list.path] });
      toast({ title: "Deleted", description: "Item removed from menu" });
    },
  });
}
