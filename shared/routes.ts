import { z } from 'zod';
import { 
  insertUserSchema, 
  insertRestaurantSchema, 
  insertMenuSchema, 
  insertMenuItemSchema,
  generateMenuSchema,
  users,
  restaurants,
  menus,
  menuItems
} from './schema';

export * from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: insertUserSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.internal, // Using internal for unauthorized as a placeholder
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.null(),
      },
    },
  },
  restaurants: {
    create: {
      method: 'POST' as const,
      path: '/api/restaurants' as const,
      input: insertRestaurantSchema,
      responses: {
        201: z.custom<typeof restaurants.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/restaurants' as const,
      responses: {
        200: z.array(z.custom<typeof restaurants.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/restaurants/:id' as const,
      responses: {
        200: z.custom<typeof restaurants.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    getBySlug: {
      method: 'GET' as const,
      path: '/api/restaurants/slug/:slug' as const,
      responses: {
        200: z.custom<typeof restaurants.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  menus: {
    list: {
      method: 'GET' as const,
      path: '/api/restaurants/:restaurantId/menus' as const,
      responses: {
        200: z.array(z.custom<typeof menus.$inferSelect & { items: (typeof menuItems.$inferSelect)[] }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/menus' as const,
      input: insertMenuSchema,
      responses: {
        201: z.custom<typeof menus.$inferSelect>(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/menus/:id' as const,
      responses: {
        200: z.custom<typeof menus.$inferSelect & { items: (typeof menuItems.$inferSelect)[] }>(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/menus/generate' as const,
      input: generateMenuSchema,
      responses: {
        200: z.object({
          name: z.string(),
          description: z.string(),
          items: z.array(insertMenuItemSchema.omit({ menuId: true }))
        }),
      },
    },
    uploadFile: {
      method: 'POST' as const,
      path: '/api/menus/upload' as const,
      responses: {
        200: z.object({
          name: z.string(),
          description: z.string(),
          items: z.array(insertMenuItemSchema.omit({ menuId: true }))
        }),
      },
    },
  },
  menuItems: {
    create: {
      method: 'POST' as const,
      path: '/api/menu-items' as const,
      input: insertMenuItemSchema,
      responses: {
        201: z.custom<typeof menuItems.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/menu-items/:id' as const,
      input: insertMenuItemSchema.partial(),
      responses: {
        200: z.custom<typeof menuItems.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/menu-items/:id' as const,
      responses: {
        204: z.void(),
      },
    },
  },
  qr: {
    generate: {
      method: 'GET' as const,
      path: '/api/restaurants/:id/qr' as const,
      responses: {
        200: z.object({
          qrCodeUrl: z.string(), // Data URL
        }),
      },
    },
  },
  chat: {
    send: {
      method: 'POST' as const,
      path: '/api/restaurants/:restaurantId/chat' as const,
      input: z.object({
        message: z.string(),
        history: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
      }),
      responses: {
        200: z.object({
          reply: z.string(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
