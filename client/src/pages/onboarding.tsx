import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRestaurantSchema } from "@shared/routes";
import { useCreateRestaurant } from "@/hooks/use-restaurants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Store } from "lucide-react";
import type { z } from "zod";

const formSchema = insertRestaurantSchema.extend({});

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { mutate, isPending } = useCreateRestaurant();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      cuisineType: "",
      description: "",
      address: "",
      contactNumber: "",
      whatsappNumber: "",
      tableCount: 10,
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("name", e.target.value);
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    form.setValue("slug", slug);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values, {
      onSuccess: () => setLocation("/dashboard/menus"),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-in-up">
        <div className="text-center mb-10">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Tell us about your restaurant</h1>
          <p className="text-gray-500 mt-2">Let's set up your digital presence.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Luigi's Trattoria"
                        {...field}
                        onChange={(e) => { field.onChange(e); handleNameChange(e); }}
                        className="h-12 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          /menu/
                        </span>
                        <Input placeholder="luigis-trattoria" {...field} className="h-12 rounded-l-none rounded-r-xl" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cuisineType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuisine Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Italian, Sushi, Indian" {...field} value={field.value ?? ""} className="h-12 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Authentic Italian pasta made fresh daily..." {...field} value={field.value ?? ""} className="min-h-[100px] rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} value={field.value ?? ""} className="h-12 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+971 50 123 4567" {...field} value={field.value ?? ""} className="h-12 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number (for orders)</FormLabel>
                    <FormControl>
                      <Input placeholder="+971501234567 (no spaces)" {...field} value={field.value ?? ""} className="h-12 rounded-xl" />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">Customers will send orders to this WhatsApp number.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tableCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Tables</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={200}
                        placeholder="10"
                        {...field}
                        value={field.value ?? 10}
                        onChange={e => field.onChange(parseInt(e.target.value) || 10)}
                        className="h-12 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              <strong>Next step:</strong> After creating your profile, you can add your menu items manually or use AI to auto-generate a menu based on your cuisine type.
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold rounded-xl shadow-lg shadow-primary/25"
                disabled={isPending}
              >
                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Restaurant Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
