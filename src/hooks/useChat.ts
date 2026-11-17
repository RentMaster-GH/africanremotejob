// src/hooks/useChat.ts
import { useEffect, useState, useCallback } from 'react';
import { backend } from '../lib/backend';
import { Message, NewMessagePayload } from '../types/chat';

export function useChat(conversationId: string, currentUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch message history from custom backend
  const fetchMessages = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await backend.list('messages');
      const filtered = (Array.isArray(data) ? data : [])
        .filter((m: any) => m.conversation_id === conversationId)
        .sort(
          (a: any, b: any) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
      setMessages(filtered as Message[]);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load messages');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [conversationId]);

  // 2. Initial load + lightweight polling for real-time updates
  useEffect(() => {
    fetchMessages(true);

    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // 3. Send Text or Attachment Message
  const sendMessage = async (content: string, fileUrl?: string) => {
    if (!content.trim() && !fileUrl) return;

    const payload: NewMessagePayload & { created_at: string } = {
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content.trim() || undefined,
      file_url: fileUrl || undefined,
      created_at: new Date().toISOString(),
    };

    try {
      const created = await backend.create('messages', payload);
      setMessages((prev) => [...prev, (created || payload) as Message]);
    } catch (err: any) {
      console.error('Error sending message:', err?.message);
      throw err;
    }
  };

  // 4. Upload File Function (PDFs, Images, Resumes up to 5MB stored as Data URL)
  const uploadFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be under 5MB.');
    }

    const fileDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });

    await sendMessage(`Sent an attachment: ${file.name}`, fileDataUrl);
  };

  return { messages, loading, error, sendMessage, uploadFile };
}
