import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UtensilsCrossed } from "lucide-react";

export default function AuthPage({ mode = "login" }: { mode?: "login" | "register" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      login({ username, password }, { onSuccess: () => setLocation("/dashboard") });
    } else {
      register({ username, password }, { onSuccess: () => setLocation("/onboarding") });
    }
  };

  const isLoading = isLoggingIn || isRegistering;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Panel - Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 animate-in-up">
          <div className="text-center lg:text-left">
            <Link href="/">
              <div className="inline-flex items-center gap-2 mb-8 cursor-pointer">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <span className="font-display font-bold text-xl">DineHub</span>
              </div>
            </Link>
            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-gray-600">
              {mode === "login" 
                ? "Enter your details to access your restaurant dashboard." 
                : "Get started with your digital menu in seconds."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                required 
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
                className="h-12 rounded-xl"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base rounded-xl font-semibold shadow-lg shadow-primary/20" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <Link href={mode === "login" ? "/register" : "/login"} className="font-semibold text-primary hover:text-primary/80">
              {mode === "login" ? "Sign up" : "Log in"}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block relative bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&auto=format&fit=crop" 
          alt="Restaurant interior" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="font-display text-4xl font-bold mb-4">
            "The best digital menu platform we've ever used."
          </h2>
          <p className="text-lg text-white/80">Join 10,000+ restaurants modernizing their dining experience.</p>
        </div>
      </div>
    </div>
  );
}
