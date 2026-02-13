import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import QRCode from "qrcode";
import multer from "multer";
import mammoth from "mammoth";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Available env vars with 'API' or 'KEY':", 
        Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY') || k.includes('OPENAI')));
      throw new Error("No OpenAI API key found. Set OPENAI_API_KEY in Railway variables.");
    }
    console.log("OpenAI client initialized with key starting with:", apiKey.substring(0, 7) + "...");
    openaiClient = new OpenAI({
      apiKey,
      ...(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? { baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL } : {}),
    });
  }
  return openaiClient;
}

let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not found in env vars.");
      throw new Error("No Anthropic API key found. Set ANTHROPIC_API_KEY in Railway variables.");
    }
    console.log("Anthropic client initialized with key starting with:", apiKey.substring(0, 10) + "...");
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: new SessionStore({ checkPeriod: 86400000 }),
  }));

  // Auth Middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.session.userId) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(input);
      (req.session as any).userId = user.id;
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      (req.session as any).userId = user.id;
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!(req.session as any).userId) return res.status(401).json(null);
    const user = await storage.getUser((req.session as any).userId);
    res.json(user || null);
  });

  // Restaurant Routes
  app.post(api.restaurants.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.restaurants.create.input.parse(req.body);
      // Check slug uniqueness logic could be here, but DB will throw too.
      // Basic duplicate check for slug:
      const existing = await storage.getRestaurantBySlug(input.slug);
      if (existing) {
        return res.status(400).json({ message: "Restaurant slug already exists" });
      }

      const restaurant = await storage.createRestaurant({
        ...input,
        userId: (req.session as any).userId,
      });
      res.status(201).json(restaurant);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.restaurants.list.path, isAuthenticated, async (req, res) => {
    const restaurants = await storage.getRestaurantsByUser((req.session as any).userId);
    res.json(restaurants);
  });

  app.get(api.restaurants.get.path, async (req, res) => {
    const restaurant = await storage.getRestaurant(parseInt(req.params.id));
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  });

  app.get(api.restaurants.getBySlug.path, async (req, res) => {
    const restaurant = await storage.getRestaurantBySlug(req.params.slug);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  });

  // Menu Routes
  app.get(api.menus.list.path, async (req, res) => {
    const menus = await storage.getMenus(parseInt(req.params.restaurantId));
    res.json(menus);
  });

  app.post(api.menus.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.menus.create.input.parse(req.body);
      const menu = await storage.createMenu(input);
      res.status(201).json(menu);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.menus.get.path, async (req, res) => {
    const menu = await storage.getMenu(parseInt(req.params.id));
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    res.json(menu);
  });

  // Menu Item Routes
  app.post(api.menuItems.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.menuItems.create.input.parse(req.body);
      const item = await storage.createMenuItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.patch(api.menuItems.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.menuItems.update.input.parse(req.body);
      const item = await storage.updateMenuItem(parseInt(req.params.id), input);
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.menuItems.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteMenuItem(parseInt(req.params.id));
    res.status(204).send();
  });

  // AI Generation
  app.post(api.menus.generate.path, isAuthenticated, async (req, res) => {
    try {
      const { cuisine, tone, restaurantId } = api.menus.generate.input.parse(req.body);
      
      const prompt = `Generate a menu for a ${cuisine} restaurant with about 15 items spread across categories (Appetizer, Main, Dessert, Drink). 
      The tone should be ${tone || "standard"}. 
      All prices must be in AED (United Arab Emirates Dirham).
      For each item, include an "imageUrl" field with a relevant food image URL using this format:
      https://source.unsplash.com/400x300/?FOOD_NAME_HERE (replace spaces with hyphens, use specific food terms).
      
      Return a JSON object with the following structure:
      {
        "name": "Menu Name",
        "description": "Menu Description",
        "items": [
          {
            "name": "Item Name",
            "description": "Brief 1-line description",
            "price": "45.00",
            "category": "Appetizer" | "Main" | "Dessert" | "Drink",
            "imageUrl": "https://source.unsplash.com/400x300/?spaghetti-carbonara",
            "isBestseller": true/false,
            "isChefsPick": true/false,
            "isTodaysSpecial": true/false
          }
        ]
      }
      Rules: Mark 2-3 items as bestseller, 2 as chef's pick, 1-2 as today's special. Generate around 15 items total. Keep descriptions short (one line). Prices should be realistic in AED (e.g. appetizers 25-55 AED, mains 45-120 AED, desserts 25-50 AED, drinks 15-40 AED).
      Make imageUrl specific to each dish - use the dish name in the URL with hyphens.
      Do not include any markdown formatting.`;

      const response = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates restaurant menus in JSON format. Always use AED currency for prices." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No content generated");
      
      const generatedData = JSON.parse(content);
      
      // We could save it here, but for now we return it so the user can review/edit/save
      res.json(generatedData);

    } catch (err: any) {
      console.error("AI Generation Error:", err);
      const message = err?.message || "Failed to generate menu";
      // Surface OpenAI-specific errors
      if (err?.status === 401) {
        res.status(500).json({ message: "Invalid OpenAI API key. Please check your OPENAI_API_KEY in Railway variables." });
      } else if (err?.status === 429) {
        res.status(500).json({ message: "OpenAI rate limit or quota exceeded. Check your billing at platform.openai.com." });
      } else if (err?.code === 'insufficient_quota') {
        res.status(500).json({ message: "OpenAI quota exceeded. Please add credits at platform.openai.com/billing." });
      } else {
        res.status(500).json({ message: `AI generation failed: ${message}` });
      }
    }
  });

  // Menu File Upload (PDF/DOCX)
  app.post(api.menus.uploadFile.path, isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const restaurantId = parseInt(req.body.restaurantId);
      if (!restaurantId) {
        return res.status(400).json({ message: "Restaurant ID is required" });
      }

      let extractedText = "";
      const mimeType = file.mimetype;
      const fileName = file.originalname.toLowerCase();

      if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
        // Dynamic import for pdf-parse (ESM compatibility)
        const pdfParse = (await import("pdf-parse")).default;
        const pdfData = await pdfParse(file.buffer);
        extractedText = pdfData.text;
      } else if (
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
      ) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value;
      } else if (mimeType === "text/plain" || fileName.endsWith(".txt")) {
        extractedText = file.buffer.toString("utf-8");
      } else {
        return res.status(400).json({ message: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." });
      }

      if (!extractedText || extractedText.trim().length < 10) {
        return res.status(400).json({ message: "Could not extract enough text from the file. Please check the file content." });
      }

      // Truncate to avoid token limits
      const truncatedText = extractedText.substring(0, 8000);

      const prompt = `I have extracted the following text from a restaurant menu file. Please parse it and return a structured JSON menu.

--- EXTRACTED MENU TEXT ---
${truncatedText}
--- END ---

Return a JSON object with the following structure:
{
  "name": "Menu Name (infer from the content or use 'Uploaded Menu')",
  "description": "Brief description of the menu",
  "items": [
    {
      "name": "Item Name",
      "description": "Brief 1-line description (infer if not present)",
      "price": "45.00",
      "category": "Appetizer" | "Main" | "Dessert" | "Drink" | "Starter" | "Soup" | "Salad" | "Beverage" | "Side",
      "imageUrl": "https://source.unsplash.com/400x300/?FOOD_NAME_HERE",
      "isBestseller": false,
      "isChefsPick": false,
      "isTodaysSpecial": false
    }
  ]
}
Rules:
- Extract ALL items you can find from the text
- All prices must be in AED. If prices are in another currency, convert approximately to AED.
- If no prices are found, estimate reasonable prices in AED
- Categorize items appropriately (Appetizer, Main, Dessert, Drink, etc.)
- Generate a short description if one isn't present in the text
- For imageUrl, use the dish name with hyphens in the Unsplash URL
- Mark 2-3 items as bestseller if they seem popular
- Mark 1-2 as chef's pick
- Do not include any markdown formatting in the response`;

      const response = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert at parsing restaurant menus from raw text. Extract all menu items accurately, preserving names and prices. Always return valid JSON. Use AED currency." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No content generated from AI");

      const generatedData = JSON.parse(content);
      res.json(generatedData);

    } catch (err) {
      console.error("Menu Upload Error:", err);
      res.status(500).json({ message: "Failed to process menu file. Please try again." });
    }
  });

  // QR Code
  app.get(api.qr.generate.path, async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

      const host = req.get("host");
      const protocol = req.protocol;
      const url = `${protocol}://${host}/menu/${restaurant.slug}`;
      
      const qrCodeUrl = await QRCode.toDataURL(url);
      res.json({ qrCodeUrl });
    } catch (err) {
      console.error("QR Code Generation Error:", err);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // AI Chat Agent
  app.post(api.chat.send.path, async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const { message, history } = api.chat.send.input.parse(req.body);

      // Fetch restaurant and menu data
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

      const menus = await storage.getMenus(restaurantId);
      const allItems = menus.flatMap(m => m.items.filter(i => i.isAvailable !== false));

      // Build menu context for the AI
      const menuContext = allItems.map(item => {
        const tags = [];
        if ((item as any).isBestseller) tags.push("BESTSELLER");
        if ((item as any).isChefsPick) tags.push("CHEF'S PICK");
        if ((item as any).isTodaysSpecial) tags.push("TODAY'S SPECIAL");
        const tagStr = tags.length > 0 ? ` [${tags.join(", ")}]` : "";
        return `- ${item.name} (${item.category}) — AED ${item.price}${tagStr}\n  ${item.description || ""}`;
      }).join("\n");

      const systemPrompt = `You are a friendly, knowledgeable AI assistant for "${restaurant.name}"${restaurant.cuisineType ? `, a ${restaurant.cuisineType} restaurant` : ""}${restaurant.address ? ` located at ${restaurant.address}` : ""}.
${restaurant.description ? `About: ${restaurant.description}` : ""}

Here is the current menu:
${menuContext}

Your role:
- Help customers explore the menu, answer questions about dishes, ingredients, and prices
- Make personalized recommendations based on preferences (spicy, vegetarian, budget, etc.)
- Be warm, helpful, and enthusiastic about the food
- If asked about allergens or dietary info, share what you can infer from descriptions but always recommend asking staff for confirmation
- Keep responses concise (2-4 sentences) unless the customer asks for detail
- Always mention actual dish names and prices from the menu
- If asked about something not on the menu, politely say so and suggest alternatives
- Never make up dishes that aren't on the menu
- You can use food emojis sparingly to be friendly
- All prices are in AED`;

      // Build conversation messages
      const messages: { role: "user" | "assistant"; content: string }[] = [];
      if (history && history.length > 0) {
        for (const msg of history.slice(-10)) { // Keep last 10 messages for context
          messages.push({ role: msg.role, content: msg.content });
        }
      }
      messages.push({ role: "user", content: message });

      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages,
      });

      const reply = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map(block => block.text)
        .join("");

      res.json({ reply });

    } catch (err: any) {
      console.error("Chat Agent Error:", err);
      if (err?.status === 401) {
        res.status(500).json({ message: "Invalid Anthropic API key. Set ANTHROPIC_API_KEY in Railway variables." });
      } else if (err?.status === 429) {
        res.status(500).json({ message: "Rate limit reached. Please try again in a moment." });
      } else {
        res.status(500).json({ message: err?.message || "Chat agent failed. Please try again." });
      }
    }
  });

  // Seeding - Demo restaurant for landing page
  const existingDemo = await storage.getRestaurantBySlug("demo-bistro");
  if (!existingDemo) {
    const existingUser = await storage.getUserByUsername("admin");
    const user = existingUser || await storage.createUser({ username: "admin", password: "password" });
    
    const demoRestaurant = await storage.createRestaurant({
      userId: user.id,
      name: "The Golden Fork",
      slug: "demo-bistro",
      address: "Downtown Dubai, UAE",
      cuisineType: "Mediterranean",
      description: "A modern Mediterranean bistro serving fresh, vibrant dishes with a Middle Eastern twist.",
      tableCount: 12,
      whatsappNumber: "",
    });
    const demoMenu = await storage.createMenu({
      restaurantId: demoRestaurant.id,
      name: "Signature Menu",
      description: "Our chef's handpicked selection of Mediterranean & Middle Eastern favorites",
    });

    const demoItems = [
      { name: "Truffle Hummus", description: "Creamy chickpea hummus drizzled with truffle oil, served with warm pita.", price: "38.00", category: "Appetizer", imageUrl: "https://images.unsplash.com/photo-1637361973-e2ef1e177713?w=400&h=300&fit=crop", isBestseller: true },
      { name: "Grilled Halloumi Salad", description: "Crispy halloumi over mixed greens with pomegranate and za'atar dressing.", price: "45.00", category: "Appetizer", imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop", isChefsPick: true },
      { name: "Lamb Kibbeh", description: "Crispy fried lamb and bulgur croquettes with yogurt mint dip.", price: "42.00", category: "Appetizer", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop" },
      { name: "Seafood Risotto", description: "Arborio rice with prawns, calamari, and saffron broth. Finished with parmesan.", price: "95.00", category: "Main", imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop", isBestseller: true },
      { name: "Grilled Lamb Chops", description: "New Zealand lamb chops with rosemary jus, roasted vegetables, and mashed potato.", price: "120.00", category: "Main", imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop", isChefsPick: true },
      { name: "Pan-Seared Salmon", description: "Atlantic salmon with lemon butter sauce, asparagus, and quinoa pilaf.", price: "98.00", category: "Main", imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" },
      { name: "Chicken Shawarma Plate", description: "Marinated chicken with garlic sauce, pickles, fries, and fresh tabouleh.", price: "65.00", category: "Main", imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop", isTodaysSpecial: true },
      { name: "Truffle Mushroom Pasta", description: "Fresh pappardelle with wild mushroom ragout and shaved black truffle.", price: "85.00", category: "Main", imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop" },
      { name: "Kunafa Cheesecake", description: "Fusion dessert blending crispy kunafa with creamy New York cheesecake.", price: "42.00", category: "Dessert", imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop", isBestseller: true },
      { name: "Pistachio Baklava", description: "Layers of golden phyllo pastry with crushed pistachios and rose syrup.", price: "35.00", category: "Dessert", imageUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64571?w=400&h=300&fit=crop" },
      { name: "Chocolate Lava Cake", description: "Warm chocolate fondant with vanilla bean ice cream and berry coulis.", price: "48.00", category: "Dessert", imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop", isChefsPick: true },
      { name: "Fresh Mint Lemonade", description: "House-made lemonade with fresh mint leaves and a hint of rose water.", price: "22.00", category: "Drink", imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop" },
      { name: "Turkish Coffee", description: "Traditional slow-brewed Turkish coffee served with dates.", price: "18.00", category: "Drink", imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&h=300&fit=crop" },
      { name: "Mango Lassi", description: "Chilled yogurt smoothie with Alphonso mango and a touch of cardamom.", price: "25.00", category: "Drink", imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop", isTodaysSpecial: true },
    ];

    for (const item of demoItems) {
      await storage.createMenuItem({
        menuId: demoMenu.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl,
        isAvailable: true,
        isBestseller: item.isBestseller || false,
        isChefsPick: item.isChefsPick || false,
        isTodaysSpecial: item.isTodaysSpecial || false,
      });
    }
  }

  return httpServer;
}
