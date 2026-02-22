import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { registerSchema } from "@shared/schema";

// Extend the register schema with confirm password and terms
const extendedRegisterSchema = registerSchema
  .extend({
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof extendedRegisterSchema>;

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let score = 0;
  if (!password) return { score: 0, label: "", color: "bg-gray-200" };

  // Length check
  if (password.length >= 8) score += 1;

  // Contains number
  if (/\d/.test(password)) score += 1;

  // Contains lowercase
  if (/[a-z]/.test(password)) score += 1;

  // Contains uppercase
  if (/[A-Z]/.test(password)) score += 1;

  // Contains special character
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const strengthMap = {
    0: { label: "Very Weak", color: "bg-red-500", textColor: "text-red-500" },
    1: { label: "Weak", color: "bg-orange-500", textColor: "text-orange-500" },
    2: { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-500" },
    3: { label: "Good", color: "bg-blue-500", textColor: "text-blue-500" },
    4: { label: "Strong", color: "bg-green-500", textColor: "text-green-500" },
    5: {
      label: "Very Strong",
      color: "bg-green-600",
      textColor: "text-green-600",
    },
  };

  return {
    score,
    label: strengthMap[score as keyof typeof strengthMap]?.label || "",
    color:
      strengthMap[score as keyof typeof strengthMap]?.color || "bg-gray-200",
    textColor:
      strengthMap[score as keyof typeof strengthMap]?.textColor ||
      "text-gray-500",
  };
};

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(extendedRegisterSchema),
    defaultValues: {
      email: "",
      businessName: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const watchPassword = form.watch("password", "");
  const passwordStrength = checkPasswordStrength(watchPassword);

  // Clear any autofilled values on mount
  useEffect(() => {
    form.setValue("email", "");
    form.setValue("businessName", "");
    form.setValue("password", "");
    form.setValue("confirmPassword", "");
  }, [form]);

  async function onSubmit(values: RegisterFormValues) {
    if (isPending) return;

    setIsPending(true);
    try {
      // Remove confirmPassword and terms before sending to API
      const { confirmPassword, terms, ...registerData } = values;
      await register(registerData);
      // Small delay to ensure auth state is propagated
      setTimeout(() => {
        setLocation("/galleries");
      }, 100);
    } catch (error) {
      // Error handled by auth provider toast
      console.error("Register error:", error);
    } finally {
      setTimeout(() => setIsPending(false), 500);
    }
  }

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
            Join the community
            <br />
            of professionals.
          </h2>
          <p className="text-muted-foreground text-lg max-w-md">
            Start delivering premium experiences to your clients today.
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
              Create an account
            </CardTitle>
            <CardDescription>
              Enter your details to get started with Lumina
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
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="businessName">
                        Business Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="businessName"
                          placeholder="Studio Photography"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
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

                {/* Add id to password and confirmPassword as well */}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                            autoComplete="new-password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>

                      {/* Password Strength Indicator */}
                      {watchPassword && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-1 h-1.5">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`flex-1 rounded-full transition-all ${
                                  level <= passwordStrength.score
                                    ? passwordStrength.color
                                    : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              />
                            ))}
                          </div>
                          <p
                            className={`text-xs ${passwordStrength.textColor}`}
                          >
                            {passwordStrength.label}
                          </p>
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            autoComplete="new-password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>

                      {/* Password match indicator */}
                      {field.value && watchPassword && (
                        <div className="flex items-center gap-1 mt-1">
                          {field.value === watchPassword ? (
                            <>
                              <Check className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-green-500">
                                Passwords match
                              </span>
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 text-red-500" />
                              <span className="text-xs text-red-500">
                                Passwords don't match
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I accept the{" "}
                          <Link
                            href="/terms"
                            className="text-primary hover:underline"
                          >
                            terms and conditions
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            className="text-primary hover:underline"
                          >
                            privacy policy
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  className="w-full h-11 text-base"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
