'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { VideoCallModal } from './VideoCallModal';
import { OfferCard } from './OfferCard';
import { CreateOfferModal } from './CreateOfferModal';
import { JobOffer } from '../types/negotiation';
import { backend } from '../lib/backend';

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  recipientName: string;
  jobId?: string;
  recipientId?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUserId,
  recipientName,
  jobId: initialJobId,
  recipientId: initialRecipientId,
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

  // Offer Negotiation State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [convMeta, setConvMeta] = useState<{
    jobId: string;
    employerId: string;
    candidateId: string;
  } | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, offers]);

  // Fetch Conversation metadata and Job Offers from custom backend
  const fetchOffersAndMeta = useCallback(async () => {
    try {
      const convRes = await backend.list('conversations');
      const conversations = Array.isArray(convRes) ? convRes : convRes?.records || [];
      const convData = conversations.find((c: any) => c.id === conversationId);

      if (convData) {
        setConvMeta({
          jobId: initialJobId || convData.job_id || '',
          employerId: convData.employer_id || '',
          candidateId: convData.candidate_id || '',
        });
      } else if (initialJobId || initialRecipientId) {
        setConvMeta({
          jobId: initialJobId || '',
          employerId: currentUserId,
          candidateId: initialRecipientId || '',
        });
      }

      const [offersRes, milestonesRes] = await Promise.all([
        backend.list('job_offers'),
        backend.list('offer_milestones'),
      ]);

      const allOffers = Array.isArray(offersRes) ? offersRes : offersRes?.records || [];
      const allMilestones = Array.isArray(milestonesRes) ? milestonesRes : milestonesRes?.records || [];

      const convOffers = allOffers
        .filter((o: any) => o.conversation_id === conversationId)
        .map((o: any) => ({
          ...o,
          milestones: allMilestones.filter((m: any) => m.offer_id === o.id),
        }))
        .sort(
          (a: any, b: any) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );

      setOffers(convOffers);
    } catch (err) {
      console.error('Failed to fetch conversation metadata or offers:', err);
    }
  }, [conversationId, initialJobId, initialRecipientId, currentUserId]);

  useEffect(() => {
    fetchOffersAndMeta();

    const interval = setInterval(async () => {
      await fetchOffersAndMeta();

      // Check for incoming call signaling records
      try {
        const signalsRes = await backend.list('call_signals');
        const signals = Array.isArray(signalsRes) ? signalsRes : signalsRes?.records || [];
        const incomingOffer = signals.find(
          (s: any) =>
            s.conversation_id === conversationId &&
            s.event === 'offer' &&
            s.sender_id !== currentUserId &&
            Date.now() - new Date(s.created_at || 0).getTime() < 20000
        );
        if (incomingOffer) {
          setActiveCall((prev) =>
            prev.isOpen ? prev : { isOpen: true, isCaller: false }
          );
        }
      } catch {
        // Ignore signal polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, currentUserId, fetchOffersAndMeta]);

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
    } catch {
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
    } catch {
      alert('Failed to upload file.');
    } finally {
      setSending(false);
      e.target.value = '';
    }
  };

  const isEmployer = convMeta?.employerId === currentUserId;

  if (loading) return <div className="p-4">Loading messages...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col h-[650px] border rounded-lg bg-white shadow-sm relative">
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

      {/* Create Offer Modal */}
      {isOfferModalOpen && convMeta && (
        <CreateOfferModal
          conversationId={conversationId}
          jobId={convMeta.jobId}
          employerId={convMeta.employerId}
          candidateId={convMeta.candidateId}
          onClose={() => setIsOfferModalOpen(false)}
          onOfferCreated={() => fetchOffersAndMeta()}
        />
      )}

      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center gap-2">
        <h3 className="font-semibold text-base md:text-lg truncate">
          Chat with {recipientName}
        </h3>

        <div className="flex items-center gap-2">
          {/* Make Custom Offer Button (Visible to Employers) */}
          {isEmployer && (
            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-colors"
            >
              Make Offer
            </button>
          )}

          {/* Video Call Button */}
          <button
            onClick={handleStartCall}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-colors"
          >
            Call
          </button>
        </div>
      </div>

      {/* Messages & Active Offers List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {/* Render Official Offers inside the conversation flow */}
        {offers.map((offer) => (
          <div key={offer.id} className="flex justify-center my-2">
            <OfferCard
              offer={offer}
              currentUserId={currentUserId}
              onStatusChange={() => fetchOffersAndMeta()}
            />
          </div>
        ))}

        {/* Render Regular Chat Messages */}
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
                    View Attachment
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
        <label
          htmlFor="chat-file-input"
          className="cursor-pointer text-gray-500 hover:text-gray-700 p-2 transition-colors text-xs font-semibold"
        >
          Attach
          <input
            id="chat-file-input"
            name="chat-file-input"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            disabled={sending}
          />
        </label>

        <input
          id="chat-message-input"
          name="chat-message-input"
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
