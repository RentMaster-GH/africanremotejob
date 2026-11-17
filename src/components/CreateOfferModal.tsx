'use client'

import React, { useState } from 'react';
import { JobType, Milestone } from '../types/negotiation';
import { backend } from '../lib/backend';

interface CreateOfferModalProps {
  conversationId: string;
  jobId: string;
  employerId: string;
  candidateId: string;
  onClose: () => void;
  onOfferCreated: () => void;
}

export const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  conversationId,
  jobId,
  employerId,
  candidateId,
  onClose,
  onOfferCreated,
}) => {
  const [jobType, setJobType] = useState<JobType>('project-based');
  const [proposedAmount, setProposedAmount] = useState<number>(500);
  const [currency, setCurrency] = useState<string>('USD');
  const [deadline, setDeadline] = useState<string>('');
  const [terms, setTerms] = useState<string>('');
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: 'Initial Deliverable', amount: 250 },
    { title: 'Final Delivery', amount: 250 },
  ]);

  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', amount: 0 }]);
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const validMilestones =
        jobType === 'milestone-based'
          ? milestones.filter((m) => m.title.trim())
          : [];

      // 1. Insert Job Offer into custom backend
      const offerData = await backend.create('job_offers', {
        conversation_id: conversationId,
        job_id: jobId,
        employer_id: employerId,
        candidate_id: candidateId,
        job_type: jobType,
        proposed_amount: proposedAmount,
        currency,
        deadline: deadline || null,
        terms_description: terms,
        milestones: validMilestones,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      // 2. Insert individual milestone records if milestone-based
      if (validMilestones.length > 0 && offerData?.id) {
        await Promise.all(
          validMilestones.map((m) =>
            backend.create('offer_milestones', {
              offer_id: offerData.id,
              title: m.title,
              amount: m.amount,
            })
          )
        );
      }

      // 3. Trigger Chat Message notification
      await backend.create('messages', {
        conversation_id: conversationId,
        sender_id: employerId,
        content: `💼 SENT AN OFFICIAL OFFER: ${currency} ${proposedAmount} (${jobType})`,
        created_at: new Date().toISOString(),
      });

      onOfferCreated();
      onClose();
    } catch (err: any) {
      alert('Failed to send offer: ' + (err?.message || 'Unexpected error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Create Custom Job Offer</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Type Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Job Contract Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as JobType)}
              className="w-full border rounded-lg p-2 text-sm text-gray-900"
            >
              <option value="full-time">Full-Time (Monthly Salary)</option>
              <option value="part-time">Part-Time (Monthly/Hourly)</option>
              <option value="contract">Fixed Contract</option>
              <option value="project-based">Project-Based (Deadline/Deliverables)</option>
              <option value="milestone-based">Milestone/Task-Based</option>
            </select>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Proposed Amount</label>
              <input
                type="number"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(Number(e.target.value))}
                className="w-full border rounded-lg p-2 text-sm font-bold text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm text-gray-900"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="GHS">GHS (₵)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="KES">KES (KSh)</option>
                <option value="ZAR">ZAR (R)</option>
              </select>
            </div>
          </div>

          {/* Deadline for Project-Based */}
          {(jobType === 'project-based' || jobType === 'contract') && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Project Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm text-gray-900"
              />
            </div>
          )}

          {/* Milestone Breakdown UI */}
          {jobType === 'milestone-based' && (
            <div className="space-y-2 border p-3 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700">Milestone Breakdown</span>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  + Add Task
                </button>
              </div>

              {milestones.map((m, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Milestone Title"
                    value={m.title}
                    onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                    className="flex-1 border rounded p-1.5 text-xs text-gray-900"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={m.amount}
                    onChange={(e) => handleMilestoneChange(idx, 'amount', Number(e.target.value))}
                    className="w-24 border rounded p-1.5 text-xs font-bold text-gray-900"
                    required
                  />
                </div>
              ))}
            </div>
          )}

          {/* Terms & Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Terms & Scope Notes</label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Specify deliverable expectations or negotiation notes..."
              className="w-full border rounded-lg p-2 text-sm text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Official Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOfferModal;
