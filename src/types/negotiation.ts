// src/types/negotiation.ts

export type JobType = 
  | 'full-time' 
  | 'part-time' 
  | 'contract' 
  | 'project-based' 
  | 'milestone-based';

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered';

export interface Milestone {
  id?: string;
  title: string;
  amount: number;
  due_date?: string;
  status?: string;
}

export interface JobOffer {
  id: string;
  conversation_id: string;
  job_id: string;
  employer_id: string;
  candidate_id: string;
  job_type: JobType;
  min_salary?: number;
  max_salary?: number;
  proposed_amount: number;
  currency: string;
  deadline?: string;
  terms_description?: string;
  status: OfferStatus;
  created_at: string;
  milestones?: Milestone[];
}