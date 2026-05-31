import { Timestamp } from "firebase/firestore";
import type { ExchangeRequest, ExchangeStatus, Skill, SkillCategory, SkillFilters, User } from "../types";

const DEMO_PREFIX = "demo-";

function ts(daysAgo: number, hour = 12): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return Timestamp.fromDate(d);
}

function monthAgo(monthsBack: number, day = 15): Timestamp {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsBack);
  d.setDate(day);
  d.setHours(10, 0, 0, 0);
  return Timestamp.fromDate(d);
}

interface DemoRequestSeed {
  id: string;
  skillTitle: string;
  role: "requester" | "provider";
  partnerName: string;
  status: ExchangeStatus;
  daysAgo: number;
  scope: string;
}

const REQUEST_SEEDS: DemoRequestSeed[] = [
  { id: "1", skillTitle: "React dashboard UI", role: "provider", partnerName: "Ayesha Khan", status: "pending", daysAgo: 1, scope: "Build analytics widgets for my startup landing page." },
  { id: "2", skillTitle: "Logo & brand kit", role: "requester", partnerName: "Bilal Ahmed", status: "negotiating", daysAgo: 2, scope: "Offer Figma design in exchange for Next.js landing page." },
  { id: "3", skillTitle: "Python automation", role: "provider", partnerName: "Sana Malik", status: "accepted", daysAgo: 4, scope: "Scrape and clean 500 product listings weekly." },
  { id: "4", skillTitle: "SEO blog posts", role: "requester", partnerName: "Omar Farooq", status: "accepted", daysAgo: 6, scope: "Four 1,200-word articles on Karachi tech scene." },
  { id: "5", skillTitle: "Mobile app wireframes", role: "provider", partnerName: "Hira Shah", status: "completed", daysAgo: 8, scope: "Wireframe 12 screens for a food delivery MVP." },
  { id: "6", skillTitle: "GitHub CI setup", role: "requester", partnerName: "Usman Ali", status: "completed", daysAgo: 11, scope: "Configure GitHub Actions for lint, test, and deploy." },
  { id: "7", skillTitle: "Social media reels", role: "provider", partnerName: "Fatima Noor", status: "pending", daysAgo: 3, scope: "Edit 6 short-form reels with captions and hooks." },
  { id: "8", skillTitle: "WordPress theme tweak", role: "requester", partnerName: "Zain Raza", status: "negotiating", daysAgo: 5, scope: "Customize WooCommerce checkout and product pages." },
  { id: "9", skillTitle: "Data viz in D3", role: "provider", partnerName: "Mariam Hussain", status: "completed", daysAgo: 14, scope: "Interactive chart for monthly sales dashboard." },
  { id: "10", skillTitle: "Voice-over for ad", role: "requester", partnerName: "Hamza Siddiqui", status: "completed", daysAgo: 18, scope: "30-second Urdu/English ad read for podcast sponsor." },
  { id: "11", skillTitle: "Firebase security rules", role: "provider", partnerName: "Laiba Qureshi", status: "accepted", daysAgo: 7, scope: "Audit and tighten Firestore + Storage rules." },
  { id: "12", skillTitle: "Illustration pack", role: "requester", partnerName: "Danish Iqbal", status: "rejected", daysAgo: 21, scope: "Swap 8 custom icons for API documentation site." },
  { id: "13", skillTitle: "Email drip campaign", role: "provider", partnerName: "Rabia Tariq", status: "completed", daysAgo: 25, scope: "Write and schedule 5 onboarding emails in Mailchimp." },
  { id: "14", skillTitle: "React Native bug fix", role: "requester", partnerName: "Arslan Javed", status: "completed", daysAgo: 32, scope: "Fix crash on Android 14 during camera upload." },
  { id: "15", skillTitle: "Pitch deck design", role: "provider", partnerName: "Nida Sheikh", status: "pending", daysAgo: 2, scope: "12-slide investor deck with charts and icons." },
  { id: "16", skillTitle: "SQL reporting queries", role: "requester", partnerName: "Kamran Baig", status: "negotiating", daysAgo: 9, scope: "Build weekly KPI report queries for ops team." },
  { id: "17", skillTitle: "Podcast editing", role: "provider", partnerName: "Sara Imran", status: "completed", daysAgo: 45, scope: "Edit and master two 40-minute interview episodes." },
  { id: "18", skillTitle: "Tailwind landing page", role: "requester", partnerName: "Imran Hashmi", status: "completed", daysAgo: 52, scope: "Responsive marketing page with pricing section." },
  { id: "19", skillTitle: "ChatGPT prompt library", role: "provider", partnerName: "Areeba Mir", status: "accepted", daysAgo: 10, scope: "20 marketing prompts tailored for e-commerce brand." },
  { id: "20", skillTitle: "Shopify store setup", role: "requester", partnerName: "Fahad Malik", status: "cancelled", daysAgo: 60, scope: "Theme install, 10 products, payment gateway config." },
  { id: "21", skillTitle: "UX audit", role: "provider", partnerName: "Hania Aziz", status: "completed", daysAgo: 75, scope: "Heuristic review with annotated Figma suggestions." },
  { id: "22", skillTitle: "TypeScript refactor", role: "requester", partnerName: "Tariq Mehmood", status: "completed", daysAgo: 90, scope: "Convert JS utils folder to strict TypeScript." },
  { id: "23", skillTitle: "Instagram carousel", role: "provider", partnerName: "Mehwish Anwar", status: "completed", daysAgo: 120, scope: "Design 5-slide carousel for product launch." },
  { id: "24", skillTitle: "API documentation", role: "requester", partnerName: "Saad Rizvi", status: "completed", daysAgo: 150, scope: "OpenAPI spec + readme for REST endpoints." },
  { id: "25", skillTitle: "Motion graphics intro", role: "provider", partnerName: "Yasmin Kazi", status: "completed", daysAgo: 180, scope: "8-second animated logo sting for YouTube." },
  { id: "26", skillTitle: "Notion workspace", role: "requester", partnerName: "Ali Raza", status: "completed", daysAgo: 210, scope: "Team wiki with templates for sprints and OKRs." },
  { id: "27", skillTitle: "LinkedIn ghostwriting", role: "provider", partnerName: "Saba Farooqui", status: "completed", daysAgo: 240, scope: "Four founder posts per month for Q1." },
  { id: "28", skillTitle: "E-commerce SEO", role: "requester", partnerName: "Waqar Hussain", status: "completed", daysAgo: 270, scope: "On-page SEO for 30 category pages." },
  { id: "29", skillTitle: "Figma component library", role: "provider", partnerName: "Anum Saleem", status: "completed", daysAgo: 300, scope: "Design system with buttons, forms, and tables." },
  { id: "30", skillTitle: "Node.js API", role: "requester", partnerName: "Rehan Akhtar", status: "completed", daysAgo: 330, scope: "CRUD API with JWT auth for mobile app backend." },
];

/** Monthly spread for year view — extra historical entries */
const MONTHLY_EXTRA: { monthsBack: number; total: number; completed: number }[] = [
  { monthsBack: 11, total: 2, completed: 1 },
  { monthsBack: 10, total: 3, completed: 2 },
  { monthsBack: 9, total: 2, completed: 1 },
  { monthsBack: 8, total: 4, completed: 3 },
  { monthsBack: 7, total: 3, completed: 2 },
  { monthsBack: 6, total: 5, completed: 4 },
  { monthsBack: 5, total: 4, completed: 3 },
  { monthsBack: 4, total: 6, completed: 5 },
  { monthsBack: 3, total: 5, completed: 4 },
  { monthsBack: 2, total: 7, completed: 5 },
  { monthsBack: 1, total: 8, completed: 6 },
  { monthsBack: 0, total: 9, completed: 4 },
];

export function isDemoRequest(id: string): boolean {
  return id.startsWith(DEMO_PREFIX);
}

export function isDemoSkill(id: string): boolean {
  return id.startsWith(DEMO_PREFIX);
}

export function isDemoMemberId(uid: string): boolean {
  return uid.startsWith("demo-member-");
}

export function getDemoExchangeRequests(user: User): ExchangeRequest[] {
  const requests = REQUEST_SEEDS.map((seed) => {
    const createdAt = ts(seed.daysAgo);
    const updatedAt = ts(Math.max(0, seed.daysAgo - 1));
    const requesterId = seed.role === "requester" ? user.uid : `demo-partner-${seed.id}`;
    const providerId = seed.role === "provider" ? user.uid : `demo-partner-${seed.id}`;
    const requesterName = seed.role === "requester" ? user.name : seed.partnerName;
    const providerName = seed.role === "provider" ? user.name : seed.partnerName;

    return {
      id: `${DEMO_PREFIX}${seed.id}`,
      skillId: `${DEMO_PREFIX}skill-${seed.id}`,
      skillTitle: seed.skillTitle,
      requesterId,
      requesterName,
      providerId,
      providerName,
      status: seed.status,
      scopeDescription: seed.scope,
      barterOffer: {
        skillTitle: "My offered skill",
        description: "SkillSwap barter offer (sample data)",
      },
      offers: [
        {
          fromUserId: requesterId,
          fromUserName: requesterName,
          scopeDescription: seed.scope,
          barterOffer: {
            skillTitle: "Portfolio website",
            description: "One-page portfolio in React",
          },
          createdAt,
        },
      ],
      requesterMarkedComplete: seed.status === "completed",
      providerMarkedComplete: seed.status === "completed",
      createdAt,
      updatedAt,
    } satisfies ExchangeRequest;
  });

  // Pad year chart with additional dated entries
  let extraId = 100;
  for (const bucket of MONTHLY_EXTRA) {
    for (let i = 0; i < bucket.total; i++) {
      const completed = i < bucket.completed;
      const createdAt = monthAgo(bucket.monthsBack, 5 + i * 3);
      requests.push({
        id: `${DEMO_PREFIX}month-${extraId}`,
        skillId: `${DEMO_PREFIX}skill-month-${extraId}`,
        skillTitle: "Sample exchange",
        requesterId: i % 2 === 0 ? user.uid : `demo-partner-m${extraId}`,
        requesterName: i % 2 === 0 ? user.name : "Sample Partner",
        providerId: i % 2 === 1 ? user.uid : `demo-partner-m${extraId}`,
        providerName: i % 2 === 1 ? user.name : "Sample Partner",
        status: completed ? "completed" : "rejected",
        scopeDescription: "Historical sample exchange for chart preview.",
        barterOffer: { skillTitle: "Sample skill", description: "Sample barter offer" },
        offers: [],
        requesterMarkedComplete: completed,
        providerMarkedComplete: completed,
        createdAt,
        updatedAt: createdAt,
      });
      extraId++;
    }
  }

  return requests.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export function getDemoSkills(user: User): Skill[] {
  const listings: Omit<Skill, "id" | "createdAt">[] = [
    {
      userId: user.uid,
      userName: user.name,
      userAvatar: user.avatar,
      title: "React & dashboard UI",
      description: "Modern dashboards, charts, and admin panels.",
      category: "Dev",
      tags: ["react", "typescript", "tailwind"],
      projectLinks: [],
    },
    {
      userId: user.uid,
      userName: user.name,
      userAvatar: user.avatar,
      title: "Brand identity design",
      description: "Logos, style guides, and social templates.",
      category: "Design",
      tags: ["figma", "branding"],
      projectLinks: [],
    },
    {
      userId: user.uid,
      userName: user.name,
      userAvatar: user.avatar,
      title: "SEO content writing",
      description: "Blog posts, landing copy, and newsletters.",
      category: "Writing",
      tags: ["seo", "copywriting"],
      projectLinks: [],
    },
    {
      userId: user.uid,
      userName: user.name,
      userAvatar: user.avatar,
      title: "AI workflow automation",
      description: "ChatGPT integrations and prompt systems.",
      category: "AI",
      tags: ["automation", "prompts"],
      projectLinks: [],
    },
    {
      userId: user.uid,
      userName: user.name,
      userAvatar: user.avatar,
      title: "Instagram marketing",
      description: "Carousels, reels scripts, and growth strategy.",
      category: "Marketing",
      tags: ["social", "content"],
      projectLinks: [],
    },
    {
      userId: user.uid,
      userName: user.name,
      userAvatar: user.avatar,
      title: "Podcast production",
      description: "Editing, mixing, and show notes.",
      category: "Music",
      tags: ["audio", "podcast"],
      projectLinks: [],
    },
  ];

  return listings.map((skill, i) => ({
    ...skill,
    id: `${DEMO_PREFIX}skill-listing-${i}`,
    createdAt: ts(i * 12),
  }));
}

interface BrowseSkillSeed {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  title: string;
  description: string;
  category: SkillCategory;
  tags: string[];
  daysAgo: number;
}

const BROWSE_SKILL_SEEDS: BrowseSkillSeed[] = [
  { id: "b1", memberId: "demo-member-1", memberName: "Ayesha Khan", memberAvatar: "AK", title: "React dashboard UI", description: "Analytics dashboards, admin panels, and chart-heavy interfaces with React + Tailwind.", category: "Dev", tags: ["react", "typescript", "charts"], daysAgo: 2 },
  { id: "b2", memberId: "demo-member-2", memberName: "Bilal Ahmed", memberAvatar: "BA", title: "Logo & brand identity", description: "Complete brand kits — logo, colors, typography, and social templates.", category: "Design", tags: ["figma", "branding", "logo"], daysAgo: 4 },
  { id: "b3", memberId: "demo-member-3", memberName: "Sana Malik", memberAvatar: "SM", title: "Python data automation", description: "Web scraping, CSV pipelines, and scheduled reports for small teams.", category: "Dev", tags: ["python", "automation", "data"], daysAgo: 1 },
  { id: "b4", memberId: "demo-member-4", memberName: "Omar Farooq", memberAvatar: "OF", title: "SEO blog writing", description: "Long-form articles, landing page copy, and newsletter drafts optimized for search.", category: "Writing", tags: ["seo", "blog", "copy"], daysAgo: 6 },
  { id: "b5", memberId: "demo-member-5", memberName: "Hira Shah", memberAvatar: "HS", title: "Mobile app wireframes", description: "User flows and high-fidelity wireframes for iOS and Android MVPs.", category: "Design", tags: ["figma", "ux", "mobile"], daysAgo: 3 },
  { id: "b6", memberId: "demo-member-6", memberName: "Fatima Noor", memberAvatar: "FN", title: "Short-form video editing", description: "Reels and TikTok edits with captions, hooks, and light motion graphics.", category: "Marketing", tags: ["reels", "video", "social"], daysAgo: 5 },
  { id: "b7", memberId: "demo-member-7", memberName: "Hamza Siddiqui", memberAvatar: "HS", title: "Podcast production", description: "Editing, mixing, noise cleanup, and show notes for interview-style podcasts.", category: "Music", tags: ["audio", "podcast", "editing"], daysAgo: 8 },
  { id: "b8", memberId: "demo-member-8", memberName: "Laiba Qureshi", memberAvatar: "LQ", title: "Firebase & Firestore setup", description: "Auth, security rules, indexes, and hosting for Firebase-backed apps.", category: "Dev", tags: ["firebase", "firestore", "auth"], daysAgo: 7 },
  { id: "b9", memberId: "demo-member-9", memberName: "Nida Sheikh", memberAvatar: "NS", title: "Pitch deck design", description: "Investor-ready slide decks with clean charts, icons, and narrative flow.", category: "Design", tags: ["pitch", "slides", "startup"], daysAgo: 9 },
  { id: "b10", memberId: "demo-member-10", memberName: "Areeba Mir", memberAvatar: "AM", title: "AI prompt engineering", description: "Custom GPT workflows, prompt libraries, and automation for marketing teams.", category: "AI", tags: ["chatgpt", "prompts", "automation"], daysAgo: 4 },
  { id: "b11", memberId: "demo-member-11", memberName: "Kamran Baig", memberAvatar: "KB", title: "SQL & analytics reports", description: "Weekly KPI dashboards and SQL queries for ops and growth teams.", category: "Dev", tags: ["sql", "analytics", "reports"], daysAgo: 11 },
  { id: "b12", memberId: "demo-member-12", memberName: "Mehwish Anwar", memberAvatar: "MA", title: "Instagram carousel design", description: "On-brand carousel posts and launch creatives for product drops.", category: "Marketing", tags: ["instagram", "design", "social"], daysAgo: 10 },
];

export function getDemoBrowseSkills(): Skill[] {
  return BROWSE_SKILL_SEEDS.map((seed) => ({
    id: `${DEMO_PREFIX}browse-${seed.id}`,
    userId: seed.memberId,
    userName: seed.memberName,
    userAvatar: seed.memberAvatar,
    title: seed.title,
    description: seed.description,
    category: seed.category,
    tags: seed.tags,
    projectLinks: [],
    createdAt: ts(seed.daysAgo),
  }));
}

export function getDemoMemberProfile(memberId: string): User | null {
  const seed = BROWSE_SKILL_SEEDS.find((s) => s.memberId === memberId);
  if (!seed) return null;
  return {
    uid: seed.memberId,
    name: seed.memberName,
    email: `${seed.memberName.toLowerCase().replace(/\s+/g, ".")}@sample.skillswap`,
    avatar: seed.memberAvatar,
    bio: `Karachi-based SkillSwap member offering ${seed.category.toLowerCase()} skills. Sample profile for preview.`,
    createdAt: ts(90),
    subscriptionStatus: "active",
    trialEndsAt: ts(-30),
  } as User;
}

export function getDemoMemberSkills(memberId: string): Skill[] {
  return getDemoBrowseSkills().filter((s) => s.userId === memberId);
}

export function filterDemoSkills(skills: Skill[], filters?: SkillFilters): Skill[] {
  let result = skills;
  if (filters?.search?.trim()) {
    const term = filters.search.toLowerCase();
    result = result.filter((s) => s.title.toLowerCase().includes(term));
  }
  if (filters?.category && filters.category !== "All") {
    result = result.filter((s) => s.category === filters.category);
  }
  return result;
}

export function withDemoExchangeRequests(
  user: User,
  requests: ExchangeRequest[],
): { requests: ExchangeRequest[]; isDemo: boolean } {
  if (requests.length > 0) return { requests, isDemo: false };
  return { requests: getDemoExchangeRequests(user), isDemo: true };
}

export function withDemoUserSkills(
  user: User,
  skills: Skill[],
): { skills: Skill[]; isDemo: boolean } {
  if (skills.length > 0) return { skills, isDemo: false };
  return { skills: getDemoSkills(user), isDemo: true };
}

export function withDemoBrowseSkills(
  skills: Skill[],
  filters?: SkillFilters,
): { skills: Skill[]; isDemo: boolean } {
  if (skills.length > 0) {
    return { skills, isDemo: false };
  }
  return {
    skills: filterDemoSkills(getDemoBrowseSkills(), filters),
    isDemo: true,
  };
}

export function withDashboardDemoData(
  user: User,
  requests: ExchangeRequest[],
  skills: Skill[],
): {
  requests: ExchangeRequest[];
  skills: Skill[];
  isDemo: boolean;
} {
  const needsDemo = requests.length === 0;
  const needsSkillDemo = skills.length === 0;

  if (!needsDemo && !needsSkillDemo) {
    return { requests, skills, isDemo: false };
  }

  return {
    requests: needsDemo ? getDemoExchangeRequests(user) : requests,
    skills: needsSkillDemo ? getDemoSkills(user) : skills,
    isDemo: needsDemo || needsSkillDemo,
  };
}