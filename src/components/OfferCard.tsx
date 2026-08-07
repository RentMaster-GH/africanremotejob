// src/components/OfferCard.tsx
import React, { useState } from 'react';
import { JobOffer, OfferStatus } from '../types/negotiation';
import { supabase } from '../lib/supabaseClient';

interface OfferCardProps {
  offer: JobOffer;
  currentUserId: string;
  onStatusChange: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  currentUserId,
  onStatusChange,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const isCandidate = currentUserId === offer.candidate_id;

  const handleUpdateStatus = async (newStatus: OfferStatus) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('job_offers')
        .update({ status: newStatus })
        .eq('id', offer.id);

      if (error) throw error;

      // Send automated chat message about status change
      await supabase.from('messages').insert([
        {
          conversation_id: offer.conversation_id,
          sender_id: currentUserId,
          content: `📋 Offer status updated to: ${newStatus.toUpperCase()}`,
        },
      ]);

      onStatusChange();
    } catch (err: any) {
      alert('Error updating offer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case 'accepted':
        return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold">Accepted</span>;
      case 'declined':
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold">Declined</span>;
      case 'countered':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-bold">Negotiating</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">Pending Approval</span>;
    }
  };

  return (
    <div className="my-4 p-5 border-2 border-blue-500 rounded-xl bg-blue-50/30 shadow-md max-w-md w-full">
      {/* Card Header */}
      <div className="flex justify-between items-center border-b pb-3 mb-3">
        <div>
          <h4 className="font-bold text-gray-900 capitalize">
            {offer.job_type.replace('-', ' ')} Offer
          </h4>
          <span className="text-xs text-gray-500">Official Compensation Terms</span>
        </div>
        {getStatusBadge(offer.status)}
      </div>

      {/* Salary Comparison Reference */}
      {(offer.min_salary || offer.max_salary) && (
        <div className="text-xs text-gray-500 mb-2">
          Job Post Range: {offer.currency} {offer.min_salary?.toLocaleString()} - {offer.max_salary?.toLocaleString()}
        </div>
      )}

      {/* Main Proposed Payment */}
      <div className="bg-white p-3 rounded-lg border mb-3">
        <span className="text-xs text-gray-500 uppercase block font-semibold">Proposed Payment Amount</span>
        <span className="text-2xl font-extrabold text-blue-600">
          {offer.currency} {offer.proposed_amount.toLocaleString()}
        </span>
        {offer.deadline && (
          <span className="text-xs text-gray-500 block mt-1">
            Deadline: 📅 {new Date(offer.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Milestones List (If Milestone-based) */}
      {offer.milestones && offer.milestones.length > 0 && (
        <div className="mb-3 space-y-2">
          <span className="text-xs font-semibold text-gray-700">Project Milestones:</span>
          {offer.milestones.map((m, idx) => (
            <div key={idx} className="flex justify-between text-xs bg-white p-2 rounded border">
              <span>{m.title}</span>
              <span className="font-bold">{offer.currency} {m.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {offer.terms_description && (
        <p className="text-xs text-gray-600 mb-4 bg-white p-2 rounded border">
          "{offer.terms_description}"
        </p>
      )}

      {/* Candidate Action Buttons */}
      {isCandidate && offer.status === 'pending' && (
        <div className="flex gap-2 pt-2 border-t">
          <button
            onClick={() => handleUpdateStatus('accepted')}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-xs"
          >
            Accept Offer
          </button>
          <button
            onClick={() => handleUpdateStatus('countered')}
            disabled={loading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg text-xs"
          >
            Negotiate / Counter
          </button>
          <button
            onClick={() => handleUpdateStatus('declined')}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
};