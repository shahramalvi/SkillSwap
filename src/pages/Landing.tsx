import { motion } from "framer-motion";
import { ArrowRight, Handshake, Users, Zap, Star, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../components/layout/Container";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Logo } from "../components/ui/Logo";
import { SKILL_CATEGORIES, TRIAL_DAYS } from "../types";

const steps = [
  { num: "01", icon: Zap, title: "Post your skill", desc: "List what you offer. Takes 2 minutes — resume optional." },
  { num: "02", icon: Users, title: "Find someone", desc: "Browse jobs and discover the perfect barter match in Karachi." },
  { num: "03", icon: Handshake, title: "Trade skills", desc: "Propose a barter, negotiate scope, and complete the exchange." },
];

const features = [
  { icon: Shield, label: "Barter-only economy", desc: "No tokens or cash — trade skills directly with other members." },
  { icon: Sparkles, label: `${TRIAL_DAYS}-day free trial`, desc: "Try the full app free, then subscribe to keep bartering." },
  { icon: Star, label: "Build reputation", desc: "Complete trades, grow your profile, earn trust." },
];

const marqueeItems = [...SKILL_CATEGORIES, ...SKILL_CATEGORIES, ...SKILL_CATEGORIES];

export function Landing() {
  return (
    <PageWrapper className="bg-canvas">
      <section className="relative min-h-screen flex flex-col bg-hero-gradient overflow-hidden dot-pattern">
        <div className="absolute top-32 left-[10%] w-64 h-64 rounded-full bg-teal/20 blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-20 right-[8%] w-80 h-80 rounded-full bg-purple/15 blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: "1.5s" }} />

        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-5 lg:px-6 pt-28 pb-16 text-center relative z-10 w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Logo variant="light" className="h-24 mx-auto mb-8 animate-float" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass text-on-hero-muted text-xs font-semibold px-4 py-2 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal inline-block animate-pulse" />
              Karachi&apos;s skill barter network — now live
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-on-hero leading-[1.05] tracking-tight">
              Trade skills.{" "}
              <span className="text-teal">Skip the cash.</span>
              <br />
              <span className="text-on-hero-muted">Build together.</span>
            </h1>

            <p className="mt-6 text-teal/80 max-w-xl mx-auto text-lg leading-relaxed">
              Swap your expertise for someone else&apos;s. A barter-only circular economy — just for Karachi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  type="button"
                  className="flex items-center gap-2 justify-center bg-white text-navy font-bold px-8 py-4 rounded-2xl text-base shadow-none hover:bg-teal-light transition-colors"
                >
                  Start free trial <ArrowRight size={20} />
                </motion.button>
              </Link>
              <a href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  type="button"
                  className="flex items-center gap-2 justify-center glass text-on-hero font-semibold px-8 py-4 rounded-2xl text-base hover:bg-teal/20 transition-colors"
                >
                  See how it works
                </motion.button>
              </a>
            </div>

            <motion.div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-on-hero-muted text-sm">
              <span className="flex items-center gap-1.5"><Sparkles size={15} className="text-gold" /> {TRIAL_DAYS}-day free trial</span>
              <span className="w-px h-4 bg-teal/30" />
              <span className="flex items-center gap-1.5"><Handshake size={15} className="text-teal" /> Barter-only exchanges</span>
              <span className="w-px h-4 bg-teal/30" />
              <span className="flex items-center gap-1.5"><Users size={15} className="text-purple" /> Karachi community</span>
            </motion.div>
          </motion.div>
        </div>

        <div className="overflow-hidden border-y border-teal/20 py-4 bg-navy/30 backdrop-blur-sm relative z-10">
          <div className="flex animate-marquee whitespace-nowrap">
            {marqueeItems.map((cat, i) => (
              <span key={`${cat}-${i}`} className="mx-3 px-4 py-1.5 rounded-full bg-teal/15 text-on-hero-muted text-sm font-medium shrink-0 hover:bg-teal/30 hover:text-on-hero transition-colors cursor-default">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24">
        <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-teal/10 text-teal text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">How it works</span>
          <h2 className="text-4xl font-extrabold text-navy">Three steps to start bartering</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white border border-border rounded-2xl p-8 shadow-card hover:shadow-soft hover:border-teal/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-extrabold text-black">{step.num}</span>
                <div className="w-11 h-11 rounded-xl bg-teal-gradient flex items-center justify-center shadow-colored">
                  <step.icon size={22} className="text-navy" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-navy mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
        </Container>
      </section>

      <section className="py-16 bg-navy-gradient">
        <Container className="relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon size={24} className="text-teal" />
                </div>
                <h3 className="font-bold text-on-hero text-lg mb-2">{f.label}</h3>
                <p className="text-on-hero-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container size="narrow" className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-extrabold text-navy mb-4">Ready to trade skills?</h2>
          <p className="text-muted mb-10">Join Karachi&apos;s growing barter community. {TRIAL_DAYS} days free, then subscribe to continue.</p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              type="button"
              className="inline-flex items-center gap-2 bg-navy-gradient text-on-hero font-bold px-10 py-4 rounded-2xl text-lg shadow-none hover:opacity-90 transition-opacity"
            >
              Create your account <ArrowRight size={22} />
            </motion.button>
          </Link>
        </motion.div>
        </Container>
      </section>

      <footer className="border-t border-border py-10 text-center bg-white">
        <Container>
        <Logo variant="dark" className="h-10 mx-auto mb-3" />
        <p className="text-sm text-muted">© 2026 SkillSwap Karachi — Trade skills, not cash.</p>
        </Container>
      </footer>
    </PageWrapper>
  );
}
