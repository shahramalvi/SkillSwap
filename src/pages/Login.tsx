import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { getAuthErrorMessage } from "../lib/authErrors";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getAuthErrorMessage(err), { duration: 6000 });
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getAuthErrorMessage(err), { duration: 6000 });
    } finally { setLoading(false); }
  };

  return (
    <PageWrapper className="min-h-screen flex bg-canvas">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient flex-col justify-center px-16 dot-pattern relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Logo variant="light" className="h-16 mb-10" />
          <h1 className="text-5xl font-extrabold text-on-hero leading-tight mb-4">
            Welcome<br /><span className="text-teal">back</span>
          </h1>
          <p className="text-on-hero-muted text-base leading-relaxed max-w-sm">
            Sign in to manage your skills, check your token balance, and connect with Karachi's community.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl border border-border shadow-soft p-8">
            <h2 className="text-2xl font-extrabold text-navy mb-1">Log in</h2>
            <p className="text-muted text-sm mb-8">
              No account?{" "}
              <Link to="/register" className="text-teal font-semibold hover:underline">Register here</Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
              <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
              <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted font-medium">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button variant="ghost" fullWidth size="lg" onClick={handleGoogle} disabled={loading}>
              Continue with Google
            </Button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
