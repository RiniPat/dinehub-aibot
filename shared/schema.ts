import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address"),
  contactNumber: text("contact_number"),
  whatsappNumber: text("whatsapp_number"),
  cuisineType: text("cuisine_type"),
  description: text("description"),
  coverImage: text("cover_image"),
  tableCount: integer("table_count").default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  name: text("name").notNull(), // e.g., "Dinner Menu"
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  category: text("category").notNull(), // "Appetizer", "Main", "Dessert", etc.
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  isBestseller: boolean("is_bestseller").default(false),
  isChefsPick: boolean("is_chefs_pick").default(false),
  isTodaysSpecial: boolean("is_todays_special").default(false),
});

// Relations
export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  user: one(users, { fields: [restaurants.userId], references: [users.id] }),
  menus: many(menus),
}));

export const menusRelations = relations(menus, ({ one, many }) => ({
  restaurant: one(restaurants, { fields: [menus.restaurantId], references: [restaurants.id] }),
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  menu: one(menus, { fields: [menuItems.menuId], references: [menus.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  userId: true,
  createdAt: true
});

export const insertMenuSchema = createInsertSchema(menus).omit({
  id: true,
  createdAt: true
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type Menu = typeof menus.$inferSelect;
export type InsertMenu = z.infer<typeof insertMenuSchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

// AI Generation Types
export const generateMenuSchema = z.object({
  restaurantId: z.number(),
  cuisine: z.string(),
  tone: z.string().optional(),
});
export type GenerateMenuRequest = z.infer<typeof generateMenuSchema>;
