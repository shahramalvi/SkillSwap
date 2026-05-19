import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export function Register() {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success("Welcome! 100 tokens added to your wallet 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getAuthErrorMessage(err), { duration: 6000 });
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome to SkillSwap Karachi!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getAuthErrorMessage(err), { duration: 6000 });
    } finally { setLoading(false); }
  };

  return (
    <PageWrapper className="min-h-screen flex bg-canvas">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient flex-col justify-center px-16 dot-pattern relative overflow-hidden">
        <div className="absolute top-20 right-10 w-48 h-48 bg-teal/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-0 w-64 h-64 bg-purple/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Logo variant="light" className="h-16 mb-10" />
          <h1 className="text-5xl font-extrabold text-on-hero leading-tight mb-4">
            Start with<br /><span className="text-gold">100 tokens</span>
          </h1>
          <p className="text-on-hero-muted text-base leading-relaxed max-w-sm mb-8">
            Join Karachi's peer-to-peer skill exchange. Trade expertise, not cash.
          </p>
          <div className="flex items-center gap-3 glass rounded-2xl px-5 py-4 w-fit">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
              <Coins size={20} className="text-gold" />
            </div>
            <div>
              <p className="text-on-hero font-bold text-sm">Free signup bonus</p>
              <p className="text-on-hero-muted text-xs">100 tokens instantly on registration</p>
            </div>
          </div>
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
            <h2 className="text-2xl font-extrabold text-navy mb-1">Create account</h2>
            <p className="text-muted text-sm mb-8">
              Have an account?{" "}
              <Link to="/login" className="text-teal font-semibold hover:underline">Log in</Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Full name" placeholder="Your name" error={errors.name?.message} {...register("name")} />
              <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
              <Input label="Password" type="password" placeholder="Min. 6 characters" error={errors.password?.message} {...register("password")} />
              <Input label="Confirm password" type="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
              <Button type="submit" variant="primary" fullWidth size="lg" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
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
