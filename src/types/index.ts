import type { Timestamp } from "firebase/firestore";

export const DEFAULT_TOKEN_BALANCE = 100;

export type SkillCategory =
  | "Design"
  | "Dev"
  | "AI"
  | "Writing"
  | "Music"
  | "Marketing"
  | "Other";

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Design",
  "Dev",
  "AI",
  "Writing",
  "Music",
  "Marketing",
  "Other",
];

export type TransactionStatus = "pending" | "completed" | "disputed";

export interface ProjectLink {
  title: string;
  url: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  tokenBalance: number;
  createdAt: Timestamp;
  resumeUrl?: string;
  resumeStoragePath?: string;
  resumeFileName?: string;
  resumeUpdatedAt?: Timestamp;
}

export interface Skill {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  description: string;
  category: SkillCategory;
  tokenRate: number;
  tags: string[];
  projectLinks: ProjectLink[];
  acceptsTokens: boolean;
  acceptsBarter: boolean;
  createdAt: Timestamp;
}

export interface Transaction {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  tokens: number;
  description: string;
  status: TransactionStatus;
  createdAt: Timestamp;
}

export type ExchangeMode = "token" | "barter";

export type ExchangeStatus =
  | "pending"
  | "negotiating"
  | "accepted"
  | "completed"
  | "rejected"
  | "cancelled";

export type EscrowStatus = "none" | "held" | "released" | "refunded";

export interface BarterOffer {
  skillId?: string;
  skillTitle?: string;
  description: string;
}

export interface ExchangeOffer {
  fromUserId: string;
  fromUserName: string;
  scopeDescription: string;
  proposedTokens?: number;
  barterOffer?: BarterOffer;
  createdAt: Timestamp;
}

export interface ExchangeRequest {
  id: string;
  skillId: string;
  skillTitle: string;
  listedTokenRate: number;
  mode: ExchangeMode;
  requesterId: string;
  requesterName: string;
  providerId: string;
  providerName: string;
  status: ExchangeStatus;
  scopeDescription: string;
  proposedTokens?: number;
  barterOffer?: BarterOffer;
  agreedTokens?: number;
  offers: ExchangeOffer[];
  escrowStatus: EscrowStatus;
  requesterMarkedComplete: boolean;
  providerMarkedComplete: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateSkillInput = Omit<
  Skill,
  "id" | "userId" | "userName" | "userAvatar" | "createdAt"
>;

export type CreateTransactionInput = Omit<
  Transaction,
  "id" | "status" | "createdAt"
>;

export interface CreateExchangeRequestInput {
  skillId: string;
  skillTitle: string;
  listedTokenRate: number;
  mode: ExchangeMode;
  providerId: string;
  providerName: string;
  scopeDescription: string;
  proposedTokens?: number;
  barterOffer?: BarterOffer;
}

export interface CounterOfferInput {
  scopeDescription: string;
  proposedTokens?: number;
  barterOffer?: BarterOffer;
}

export interface SkillFilters {
  search?: string;
  category?: SkillCategory | "All";
  minTokens?: number;
  maxTokens?: number;
}

export function normalizeSkill(skill: Skill): Skill {
  return {
    ...skill,
    projectLinks: skill.projectLinks ?? [],
    acceptsTokens: skill.acceptsTokens ?? true,
    acceptsBarter: skill.acceptsBarter ?? true,
  };
}

export function skillAcceptsMode(skill: Skill, mode: ExchangeMode): boolean {
  const s = normalizeSkill(skill);
  return mode === "token" ? s.acceptsTokens : s.acceptsBarter;
}
