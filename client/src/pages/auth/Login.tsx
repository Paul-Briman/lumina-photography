import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { loginSchema } from "@shared/schema";

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear any autofilled values on mount
  useEffect(() => {
    form.setValue("email", "");
    form.setValue("password", "");
  }, [form]);

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    if (isPending) return;

    setIsPending(true);
    try {
      await login(values);
      // Small delay to ensure auth state is propagated
      setTimeout(() => {
        setLocation("/galleries");
      }, 100);
    } catch (error) {
      // Error handled by auth provider toast
      console.error("Login error:", error);
    } finally {
      setTimeout(() => setIsPending(false), 500);
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      // This would connect to your backend to send a reset email
      // For now, we'll simulate it
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Reset email sent",
        description: "Check your inbox for password reset instructions.",
      });

      setForgotPasswordOpen(false);
      setResetEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Hero Section */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary/5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Camera className="h-6 w-6" />
            </div>
            <h1 className="font-display font-semibold text-2xl text-primary">
              Lumina
            </h1>
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            Showcase your work
            <br />
            with elegance.
          </h2>
          <p className="text-muted-foreground text-lg max-w-md">
            The professional platform for photographers to deliver stunning
            galleries and manage clients.
          </p>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10 text-sm text-muted-foreground">
          © 2026 Lumina. All rights reserved.
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Sign in
            </CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                autoComplete="off"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>{" "}
                      {/* Add htmlFor */}
                      <FormControl>
                        <Input
                          id="email" // Add id
                          placeholder="name@example.com"
                          type="email"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Password</FormLabel>{" "}
                      {/* Add htmlFor */}
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password" // Add id
                            type={showPassword ? "text" : "password"}
                            {...field}
                            autoComplete="current-password"
                            className="pr-10"
                          />
                          {/* ... */}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end">
                  <Dialog
                    open={forgotPasswordOpen}
                    onOpenChange={setForgotPasswordOpen}
                  >
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Reset password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to
                          reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setForgotPasswordOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleForgotPassword}
                            disabled={isResetting}
                          >
                            {isResetting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              "Send reset link"
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Button
                  className="w-full h-11 text-base"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Register now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
