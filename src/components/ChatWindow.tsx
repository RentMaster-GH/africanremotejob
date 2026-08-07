// src/components/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  recipientName: string; // e.g., "Google" or "John Doe"
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUserId,
  recipientName,
}) => {
  // Destructure uploadFile along with other hook utilities
  const { messages, loading, error, sendMessage, uploadFile } = useChat(
    conversationId,
    currentUserId
  );
  
  const [textInput, setTextInput] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending text messages
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

  // Handle file uploads (PDFs, Resumes, Images)
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
      e.target.value = ''; // Reset file input
    }
  };

  if (loading) return <div className="p-4">Loading messages...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white shadow-sm">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Chat with {recipientName}</h3>
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
        {/* Hidden File Input + Paperclip Button */}
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

        {/* Text Input */}
        <input
          type="text"
          value={textInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTextInput(e.target.value)
          }
          placeholder="Type a message..."
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Send Button */}
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