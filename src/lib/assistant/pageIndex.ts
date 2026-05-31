import { PAYMENT_PLANS } from "../plans";
import { SKILL_CATEGORIES, TRIAL_DAYS } from "../../types";

export interface PageIndexEntry {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  authRequired: boolean;
  commonTasks: string[];
}

export const SITE_PAGE_INDEX: PageIndexEntry[] = [
  {
    path: "/",
    title: "Landing / Home",
    description: "Public homepage explaining SkillSwap — Karachi's skill barter network.",
    keywords: ["home", "landing", "about", "what is skillswap", "start"],
    authRequired: false,
    commonTasks: ["Learn how barter works", "Sign up", "Log in"],
  },
  {
    path: "/register",
    title: "Sign up",
    description: "Create a new account. Starts a 30-day free trial automatically.",
    keywords: ["register", "sign up", "create account", "join", "new user"],
    authRequired: false,
    commonTasks: ["Create account", "Start free trial"],
  },
  {
    path: "/login",
    title: "Log in",
    description: "Sign in to an existing SkillSwap account.",
    keywords: ["login", "sign in", "log in", "existing account"],
    authRequired: false,
    commonTasks: ["Sign in"],
  },
  {
    path: "/dashboard",
    title: "Dashboard",
    description:
      "Your home hub with KPIs, activity charts, upcoming exchanges, and trial/subscription status.",
    keywords: ["dashboard", "home", "overview", "stats", "analytics", "charts"],
    authRequired: true,
    commonTasks: [
      "See activity overview",
      "Check upcoming exchanges",
      "View trial days remaining",
    ],
  },
  {
    path: "/jobs",
    title: "Browse jobs",
    description:
      "Search and filter skills posted by other members. Find someone to barter with.",
    keywords: [
      "jobs",
      "browse",
      "search skills",
      "find skill",
      "discover",
      "marketplace",
      "categories",
    ],
    authRequired: true,
    commonTasks: [
      "Search for a skill",
      "Filter by category",
      "Request a service from a member",
      "View member profiles",
    ],
  },
  {
    path: "/post-skill",
    title: "Post a skill",
    description:
      "List a skill you offer for barter. Requires a PDF resume upload. Optional project links and tags.",
    keywords: [
      "post skill",
      "add skill",
      "list skill",
      "create listing",
      "offer skill",
      "resume",
      "upload",
    ],
    authRequired: true,
    commonTasks: [
      "Post a new skill listing",
      "Upload resume",
      "Add project portfolio links",
      "Add tags",
    ],
  },
  {
    path: "/requests",
    title: "Requests",
    description:
      "Manage incoming and outgoing barter requests. Tabs: Incoming (need response), Sent, Active.",
    keywords: [
      "requests",
      "incoming",
      "received",
      "respond",
      "need response",
      "sent requests",
      "active exchanges",
    ],
    authRequired: true,
    commonTasks: [
      "Respond to incoming proposals",
      "View requests you sent",
      "See active negotiations",
    ],
  },
  {
    path: "/proposals",
    title: "Proposals",
    description:
      "Proposals you have sent to other members. Tabs: All, Pending, Active, Closed.",
    keywords: [
      "proposals",
      "sent proposals",
      "my proposals",
      "pending",
      "awaiting response",
      "closed",
    ],
    authRequired: true,
    commonTasks: [
      "Track proposals you sent",
      "Check pending responses",
      "View active and closed proposals",
    ],
  },
  {
    path: "/profile/me",
    title: "My profile",
    description:
      "Edit your name and bio, view resume, manage subscription badge, and delete your skill listings.",
    keywords: [
      "my profile",
      "profile",
      "edit bio",
      "edit name",
      "my skills",
      "delete skill",
      "resume",
      "account",
    ],
    authRequired: true,
    commonTasks: [
      "Edit profile",
      "View your skills",
      "Delete a skill",
      "Go to subscription plan",
    ],
  },
  {
    path: "/profile/:id",
    title: "Member profile",
    description:
      "View another member's profile and skills. Request their service via the Request button on a skill card.",
    keywords: ["member profile", "user profile", "view member", "request service"],
    authRequired: true,
    commonTasks: ["View someone's skills", "Send a barter proposal to a member"],
  },
  {
    path: "/help",
    title: "Help center",
    description:
      "File and track complaints with the guided complaint bot. View pending and resolved tickets.",
    keywords: [
      "help",
      "support",
      "complaint",
      "complain",
      "issue",
      "report",
      "ticket",
      "help center",
    ],
    authRequired: true,
    commonTasks: [
      "File a complaint",
      "Track pending complaints",
      "View resolved complaints",
    ],
  },
  {
    path: "/plan",
    title: "Subscription plans",
    description: `Choose a paid plan after the ${TRIAL_DAYS}-day trial. Plans: Starter, Pro, Premium.`,
    keywords: [
      "plan",
      "subscription",
      "pricing",
      "trial",
      "upgrade",
      "pay",
      "starter",
      "pro",
      "premium",
    ],
    authRequired: true,
    commonTasks: ["Subscribe", "Compare plans", "Upgrade", "Renew after trial"],
  },
];

export const SKILLSWAP_FAQS: { question: string; answer: string; relatedPath?: string }[] = [
  {
    question: "What is SkillSwap?",
    answer:
      "SkillSwap is a barter-only platform for Karachi where members trade skills directly — no cash, no tokens. You offer what you're good at and exchange it for someone else's expertise.",
    relatedPath: "/",
  },
  {
    question: "How does barter work?",
    answer:
      "Post a skill you offer, browse jobs to find a match, send a proposal describing what you want in exchange, negotiate, then complete the exchange. Everything happens through proposals and requests.",
    relatedPath: "/jobs",
  },
  {
    question: "Do I need to pay money?",
    answer:
      `SkillSwap uses skill-for-skill barter between members. You do need a subscription after the ${TRIAL_DAYS}-day free trial to keep using the platform. Plans start at Rs. 499/month.`,
    relatedPath: "/plan",
  },
  {
    question: "What subscription plans are available?",
    answer: PAYMENT_PLANS.map(
      (p) => `${p.name} (Rs. ${p.pricePKR}/mo): ${p.features.slice(0, 2).join(", ")}`,
    ).join(". "),
    relatedPath: "/plan",
  },
  {
    question: "How do I post a skill?",
    answer:
      "Go to Post skill, upload your PDF resume (required), fill in title, description, category, optional project links and tags, then submit. You'll land on your profile with the new listing.",
    relatedPath: "/post-skill",
  },
  {
    question: "Why is a resume required?",
    answer:
      "Resume verification helps build trust in the community. You must upload a PDF resume before posting your first skill.",
    relatedPath: "/post-skill",
  },
  {
    question: "How do I find skills to barter for?",
    answer:
      "Open Browse jobs, search by title or filter by category (Design, Dev, AI, Writing, Music, Marketing, Other). Click a job card to view the member's profile and request their service.",
    relatedPath: "/jobs",
  },
  {
    question: "How do I send a proposal?",
    answer:
      "From Browse jobs, open a member's profile, click Request on a skill card, describe what you're offering in return, and submit. Track it under Proposals.",
    relatedPath: "/proposals",
  },
  {
    question: "Where do I see incoming requests?",
    answer:
      "Open Requests, Incoming tab. Requests needing your response show a badge count. You can accept, reject, or negotiate from the request card.",
    relatedPath: "/requests",
  },
  {
    question: "What skill categories exist?",
    answer: `Categories: ${SKILL_CATEGORIES.join(", ")}.`,
    relatedPath: "/jobs",
  },
  {
    question: "What happens when my trial ends?",
    answer:
      `After ${TRIAL_DAYS} days, you need an active subscription to access the app. You'll be redirected to the Plan page to choose Starter, Pro, or Premium.`,
    relatedPath: "/plan",
  },
  {
    question: "Can I edit my profile?",
    answer:
      "Yes. Go to My profile, click Edit profile, update your name or bio, and save. Your resume link appears if you've uploaded one.",
    relatedPath: "/profile/me",
  },
  {
    question: "How do I delete a skill?",
    answer:
      "Open My profile, find the skill in your grid, and click Delete below the skill card.",
    relatedPath: "/profile/me",
  },
  {
    question: "Is payment real?",
    answer:
      "Subscription payment is simulated for this demo — no card is charged. Pick a plan and it activates immediately.",
    relatedPath: "/plan",
  },
  {
    question: "How do I file a complaint?",
    answer:
      "Go to Help center and use the complaint bot. It asks about issue type, subject, details, and email, then registers your ticket. Track it under Pending or Resolved.",
    relatedPath: "/help",
  },
];

export function formatPageIndexForPrompt(): string {
  return SITE_PAGE_INDEX.map(
    (p) =>
      `- ${p.path} | ${p.title}${p.authRequired ? " [login required]" : ""}\n  ${p.description}\n  Tasks: ${p.commonTasks.join("; ")}\n  Keywords: ${p.keywords.join(", ")}`,
  ).join("\n");
}

export function formatFaqsForPrompt(): string {
  return SKILLSWAP_FAQS.map(
    (f) => `Q: ${f.question}\nA: ${f.answer}${f.relatedPath ? `\nPage: ${f.relatedPath}` : ""}`,
  ).join("\n\n");
}

export interface AssistantContext {
  isAuthenticated: boolean;
  currentPath: string;
  userName?: string;
  subscriptionLabel?: string;
}

export function buildAssistantSystemPrompt(ctx: AssistantContext): string {
  return `You are Swap Assistant — a helpful guide for SkillSwap, Karachi's skill barter platform.

RULES:
1. Answer questions about SkillSwap using the SITE MAP and FAQ below. Be concise, friendly, and practical.
2. When the user asks where to do something ("where can I...", "how do I...", "take me to..."), tell them clearly AND suggest navigation.
3. To trigger in-app navigation, add EXACTLY ONE line at the very end of your reply:
   NAVIGATE:/path
   Use a valid path from the site map. Use /login if they need to sign in first for a protected page.
   If no navigation is needed, do not add a NAVIGATE line.
4. Never invent features or pages not listed below.
5. SkillSwap is barter-only (no cash between members). Subscriptions are for platform access after trial.
6. Keep replies under 150 words unless listing plan details.

USER CONTEXT:
- Signed in: ${ctx.isAuthenticated ? "yes" : "no"}
- Current page: ${ctx.currentPath}
${ctx.userName ? `- Name: ${ctx.userName}` : ""}
${ctx.subscriptionLabel ? `- Subscription: ${ctx.subscriptionLabel}` : ""}

SITE MAP:
${formatPageIndexForPrompt()}

FAQ:
${formatFaqsForPrompt()}`;
}

export function findPageByPath(path: string): PageIndexEntry | undefined {
  if (path === "/profile/me") {
    return SITE_PAGE_INDEX.find((p) => p.path === "/profile/me");
  }
  if (path.startsWith("/profile/")) {
    return SITE_PAGE_INDEX.find((p) => p.path === "/profile/:id");
  }
  return SITE_PAGE_INDEX.find((p) => p.path === path);
}
