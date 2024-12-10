// types/interfaces.ts
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

export interface Institution {
  id: number;
  name: string;
  type: 'GOVERNMENT' | 'PARASTATAL' | 'AGENCY' | 'CORPORATION';
  avatar?: string | null;
  description?: string | null;
  website?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_INVESTIGATION' | 'SUSPENDED';
  rating: InstitutionRating[];
  comments?: InstitutionComment[];
  totalRatings: number;
  averageRating?: number | null;
}

export interface InstitutionRating {
  id: number;
  userId: number;
  institutionId: number;
  ratingCategoryId: number;
  score: number;
  severity: number;
  evidence?: string | null;
  documents?: string[];
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW';
  ratingCategory: RatingCategory;
  createdAt: string;
  updatedAt: string;
}

export interface RatingCategory {
  id: number;
  keyword: string;
  name: string;
  icon: string;
  description: string;
  weight: number;
}

export interface InstitutionComment {
  id: number;
  content: string;
  userId: number;
  institutionId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  user: User;
  createdAt: string;
  updatedAt: string;
}