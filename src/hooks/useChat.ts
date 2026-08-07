// src/hooks/useChat.ts
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adjust path to your supabase client
import { Message, NewMessagePayload } from '../types/chat';
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

export function useChat(conversationId: string, currentUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch initial message history
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data as Message[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // 2. Set up Realtime Subscription
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat_room:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresInsertPayload<Message>) => {
          const newMessage = payload.new;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  // 3. Send Text Message Function
  const sendMessage = async (content: string, fileUrl?: string) => {
    if (!content.trim() && !fileUrl) return;

    const payload: NewMessagePayload = {
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content.trim() || undefined,
      file_url: fileUrl || undefined,
    };

    const { error } = await supabase.from('messages').insert([payload]);

    if (error) {
      console.error('Error sending message:', error.message);
      throw error;
    }
  };

  // 4. Upload File Function (PDFs, Images, Resumes)
  const uploadFile = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      // Unique file path inside bucket
      const filePath = `${conversationId}/${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      // Upload to Supabase Storage bucket ('chat-attachments')
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public access URL
      const { data } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      // Send the message with the file attachment URL
      await sendMessage(`Sent an attachment: ${file.name}`, data.publicUrl);
    } catch (err: any) {
      console.error('Upload Error:', err.message);
      throw err;
    }
  };

  return { messages, loading, error, sendMessage, uploadFile };
}