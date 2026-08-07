// src/types/chat.ts

export interface Conversation {
  id: string;
  job_id: string;
  employer_id: string;
  candidate_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NewMessagePayload {
  conversation_id: string;
  sender_id: string;
  content?: string;
  file_url?: string;
}