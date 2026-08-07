// src/components/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { VideoCallModal } from './VideoCallModal';
import { supabase } from '../lib/supabaseClient';

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  recipientName: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUserId,
  recipientName,
}) => {
  const { messages, loading, error, sendMessage, uploadFile } = useChat(
    conversationId,
    currentUserId
  );

  const [textInput, setTextInput] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Video Call State
  const [activeCall, setActiveCall] = useState<{
    isOpen: boolean;
    isCaller: boolean;
  }>({ isOpen: false, isCaller: false });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for incoming call notifications
  useEffect(() => {
    const channel = supabase.channel(`call:${conversationId}`);

    channel
      .on('broadcast', { event: 'offer' }, ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          // Open call modal for receiver
          setActiveCall({ isOpen: true, isCaller: false });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const handleStartCall = () => {
    setActiveCall({ isOpen: true, isCaller: true });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(textInput);
      setTextInput('');
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSending(true);
      await uploadFile(file);
    } catch (err) {
      alert('Failed to upload file.');
    } finally {
      setSending(false);
      e.target.value = '';
    }
  };

  if (loading) return <div className="p-4">Loading messages...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white shadow-sm relative">
      {/* Video Call Overlay Modal */}
      {activeCall.isOpen && (
        <VideoCallModal
          conversationId={conversationId}
          currentUserId={currentUserId}
          recipientName={recipientName}
          isCaller={activeCall.isCaller}
          onClose={() => setActiveCall({ isOpen: false, isCaller: false })}
        />
      )}

      {/* Chat Header with Video Call Button */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Chat with {recipientName}</h3>

        <button
          onClick={handleStartCall}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-colors"
        >
          📹 Start Video Call
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg text-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.content && <p>{msg.content}</p>}
                {msg.file_url && (
                  <a
                    href={msg.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-xs block mt-1 opacity-90 hover:opacity-100"
                  >
                    📎 View Attachment
                  </a>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t flex items-center gap-2">
        <label className="cursor-pointer text-gray-500 hover:text-gray-700 p-2 transition-colors">
          📎
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            disabled={sending}
          />
        </label>

        <input
          type="text"
          value={textInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextInput(e.target.value)
          }
          placeholder="Type a message..."
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={sending || !textInput.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm disabled:opacity-50 transition-colors"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};