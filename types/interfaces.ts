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
export interface Rating {
  id: number;
  userId: number;
  nomineeId: number;
  ratingCategoryId: number;
  score: number;
  severity: number;
  evidence: string | null;
  createdAt: string;
  ratingCategory: RatingCategory;
}

export interface Position {
  id: number;
  name: string;
  createdAt: string;
}

export interface District {
  id: number;
  name: string;
  region: string;
  createdAt: string;
}

export interface Nominee {
  id: number;
  name: string;
  positionId: number;
  institutionId: number;
  districtId: number;
  status: boolean;
  evidence: string | null;
  avatar?: string;
  comments?: Comment[];
  createdAt: string;
  rating: Rating[];
  position: Position;
  institution: Institution;
  district: District;
}
export interface Comment {
  id: number;
  userId: number;
  nomineeId: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}
export interface NomineeResponse {
  count: number;
  pages: number;
  currentPage: number;
  data: Nominee[];
}

export interface InstitutionResponse {
  count: number;
  pages: number;
  currentPage: number;
  data: Institution[];
}

export interface CommentResponse {
  count: number;
  pages: number;
  currentPage: number;
  data: Comment[] | InstitutionComment[];
}