import type { Timestamp } from "firebase/firestore";
import type { PlanId } from "../lib/plans";

export type { PlanId };

export const TRIAL_DAYS = 30;

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

export type SubscriptionStatus = "trial" | "active" | "expired";

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
  createdAt: Timestamp;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: PlanId;
  trialEndsAt: Timestamp;
  subscriptionEndsAt?: Timestamp;
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
  tags: string[];
  projectLinks: ProjectLink[];
  createdAt: Timestamp;
}

export type ExchangeStatus =
  | "pending"
  | "negotiating"
  | "accepted"
  | "completed"
  | "rejected"
  | "cancelled";

export interface BarterOffer {
  skillId?: string;
  skillTitle?: string;
  description: string;
}

export interface ExchangeOffer {
  fromUserId: string;
  fromUserName: string;
  scopeDescription: string;
  barterOffer?: BarterOffer;
  createdAt: Timestamp;
}

export interface ExchangeRequest {
  id: string;
  skillId: string;
  skillTitle: string;
  requesterId: string;
  requesterName: string;
  providerId: string;
  providerName: string;
  status: ExchangeStatus;
  scopeDescription: string;
  barterOffer?: BarterOffer;
  offers: ExchangeOffer[];
  requesterMarkedComplete: boolean;
  providerMarkedComplete: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateSkillInput = Omit<
  Skill,
  "id" | "userId" | "userName" | "userAvatar" | "createdAt"
>;

export interface CreateExchangeRequestInput {
  skillId: string;
  skillTitle: string;
  providerId: string;
  providerName: string;
  scopeDescription: string;
  barterOffer: BarterOffer;
}

export interface CounterOfferInput {
  scopeDescription: string;
  barterOffer: BarterOffer;
}

export interface SkillFilters {
  search?: string;
  category?: SkillCategory | "All";
}

export function normalizeSkill(skill: Skill): Skill {
  return {
    ...skill,
    projectLinks: skill.projectLinks ?? [],
  };
}

export type ComplaintStatus = "pending" | "resolved";

export type ComplaintCategory =
  | "exchange"
  | "member"
  | "billing"
  | "technical"
  | "other";

export const COMPLAINT_CATEGORIES: { id: ComplaintCategory; label: string }[] = [
  { id: "exchange", label: "Exchange / barter issue" },
  { id: "member", label: "Member behavior" },
  { id: "billing", label: "Subscription / billing" },
  { id: "technical", label: "Technical problem" },
  { id: "other", label: "Something else" },
];

export interface Complaint {
  id: string;
  userId: string;
  ticketId: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  relatedTo?: string;
  email: string;
  status: ComplaintStatus;
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}

export interface CreateComplaintInput {
  category: ComplaintCategory;
  subject: string;
  description: string;
  relatedTo?: string;
  email: string;
}

export type ConversationStatus = "active" | "locked";

export interface Conversation {
  id: string;
  exchangeRequestId: string;
  requesterId: string;
  requesterName: string;
  providerId: string;
  providerName: string;
  skillTitle: string;
  exchangeStatus: ExchangeStatus;
  locked: boolean;
  requesterMarkedComplete: boolean;
  providerMarkedComplete: boolean;
  requesterUnread: number;
  providerUnread: number;
  lastMessageText: string;
  lastMessageAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  system?: boolean;
  createdAt: Timestamp;
}

export type NotificationType =
  | "new_request"
  | "new_message"
  | "request_accepted"
  | "barter_complete";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  exchangeRequestId: string;
  read: boolean;
  createdAt: Timestamp;
}
