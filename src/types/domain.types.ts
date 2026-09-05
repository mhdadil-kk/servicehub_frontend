/** Shared frontend domain types for populated API payloads. */

export interface PopulatedUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
  role?: "admin" | "user" | "provider" | string;
}

export interface PopulatedService {
  _id: string;
  name: string;
  description?: string;
  basePrice?: number;
}

export interface PopulatedAddress {
  _id: string;
  label: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface PopulatedProviderProfile {
  _id: string;
  userId: string | PopulatedUser;
  profilePhoto?: string;
  address?: string;
  bio?: string;
  hourlyRate?: number;
  serviceId?: string | PopulatedService;
  averageRating?: number;
  totalReviews?: number;
}

export interface WalletInfo {
  _id?: string;
  userId?: string;
  balance: number;
  currency?: string;
}

export interface WalletTransaction {
  _id: string;
  type: string;
  amount: number;
  description?: string;
  status?: string;
  createdAt: string;
  bookingId?: string;
}

export interface WalletData {
  wallet: WalletInfo;
  transactions: WalletTransaction[];
}

export interface DashboardBookingSummary {
  _id: string;
  date: string;
  slot?: { start: string; end: string };
  status: string;
  providerId?: string | PopulatedProviderProfile;
  userId?: string | PopulatedUser;
  serviceId?: string | PopulatedService;
  totalAmount?: number;
}

export interface UserDashboardData {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalSpent: number;
  recentBookings: DashboardBookingSummary[];
}

export interface ProviderDashboardData {
  totalRequests: number;
  activeBookings: number;
  completedJobs: number;
  totalEarnings: number;
  recentBookings: DashboardBookingSummary[];
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalRevenue: number;
  pendingProviders?: number;
  openReports?: number;
  userGrowth?: { label: string; users: number; providers: number }[];
  bookingTrends?: { label: string; val: number; color?: string }[];
}

export type ReportCategory =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "fraud"
  | "no_show"
  | "other"
  | string;

export type ReportStatus = "pending" | "under_review" | "resolved" | "rejected";

export interface ReportEntity {
  _id: string;
  reporterId: string | PopulatedUser;
  reportedId: string | PopulatedUser;
  bookingId?: string | { _id: string };
  category: ReportCategory;
  description: string;
  screenshot?: string;
  status: ReportStatus;
  adminNotes?: string;
  actionTaken?: string;
  createdAt: string;
  updatedAt: string;
}

export function isPopulatedUser(value: unknown): value is PopulatedUser {
  return typeof value === "object" && value !== null && "_id" in value && "name" in value;
}

export function isPopulatedProvider(
  value: unknown
): value is PopulatedProviderProfile {
  return typeof value === "object" && value !== null && "_id" in value;
}

export function isPopulatedService(value: unknown): value is PopulatedService {
  return typeof value === "object" && value !== null && "_id" in value && "name" in value;
}

export function isPopulatedAddress(value: unknown): value is PopulatedAddress {
  return typeof value === "object" && value !== null && "_id" in value && "fullAddress" in value;
}

export function getId(value: string | { _id: string } | undefined | null): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id;
}

export function getUserName(value: string | PopulatedUser | undefined | null): string {
  if (!value) return "User";
  if (typeof value === "string") return "User";
  return value.name || "User";
}

/** Admin bookings table row (populated booking summary). */
export interface AdminBookingListItem {
  _id: string;
  date: string;
  slot?: { start: string; end: string };
  status: string;
  totalAmount?: number;
  userId?: string;
  providerId?: string;
  serviceId?: string;
  addressId?: { _id?: string; street?: string; city?: string; state?: string; zipCode?: string; fullAddress?: string };
  user?: { _id: string; name: string; profilePhoto?: string; email?: string; phone?: string };
    provider?: {
    _id: string;
    userId: { name: string; email?: string; phone?: string; profilePhoto?: string };
    profilePhoto?: string;
    hourlyRate?: number;
  };
  service?: { _id: string; name: string; description?: string };
  address?: { _id: string; label: string; fullAddress: string };
  completionInvoice?: {
    additionalCharges?: number;
    finalAmount?: number;
  };
}

export interface ProviderDocument {
  docType?: "identity" | "license" | string;
  url: string;
}

export type ProviderDocumentEntry = ProviderDocument | string;
