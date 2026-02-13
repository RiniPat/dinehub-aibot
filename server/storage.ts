import { 
  users, restaurants, menus, menuItems,
  type User, type InsertUser,
  type Restaurant, type InsertRestaurant,
  type Menu, type InsertMenu,
  type MenuItem, type InsertMenuItem
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Restaurant
  createRestaurant(restaurant: InsertRestaurant & { userId: number }): Promise<Restaurant>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurantBySlug(slug: string): Promise<Restaurant | undefined>;
  getRestaurantsByUser(userId: number): Promise<Restaurant[]>;
  getAllRestaurants(): Promise<Restaurant[]>;

  // Menu
  createMenu(menu: InsertMenu): Promise<Menu>;
  getMenus(restaurantId: number): Promise<(Menu & { items: MenuItem[] })[]>;
  getMenu(id: number): Promise<(Menu & { items: MenuItem[] }) | undefined>;

  // Menu Item
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createRestaurant(restaurant: InsertRestaurant & { userId: number }): Promise<Restaurant> {
    const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
    return newRestaurant;
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
    return restaurant;
  }

  async getRestaurantsByUser(userId: number): Promise<Restaurant[]> {
    return db.select().from(restaurants).where(eq(restaurants.userId, userId));
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return db.select().from(restaurants);
  }

  async createMenu(menu: InsertMenu): Promise<Menu> {
    const [newMenu] = await db.insert(menus).values(menu).returning();
    return newMenu;
  }

  async getMenus(restaurantId: number): Promise<(Menu & { items: MenuItem[] })[]> {
    const restaurantMenus = await db.select().from(menus).where(eq(menus.restaurantId, restaurantId));
    
    // Fetch items for each menu (could be optimized with a join, but this is simple for MVP)
    const result = [];
    for (const menu of restaurantMenus) {
      const items = await db.select().from(menuItems).where(eq(menuItems.menuId, menu.id));
      result.push({ ...menu, items });
    }
    return result;
  }

  async getMenu(id: number): Promise<(Menu & { items: MenuItem[] }) | undefined> {
    const [menu] = await db.select().from(menus).where(eq(menus.id, id));
    if (!menu) return undefined;
    
    const items = await db.select().from(menuItems).where(eq(menuItems.menuId, id));
    return { ...menu, items };
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updatedItem] = await db.update(menuItems).set(item).where(eq(menuItems.id, id)).returning();
    return updatedItem;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }
}

export const storage = new DatabaseStorage();
