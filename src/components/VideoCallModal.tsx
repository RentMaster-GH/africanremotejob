// src/components/VideoCallModal.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface VideoCallModalProps {
  conversationId: string;
  currentUserId: string;
  recipientName: string;
  isCaller: boolean;
  onClose: () => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  conversationId,
  currentUserId,
  recipientName,
  isCaller,
  onClose,
}) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [callStatus, setCallStatus] = useState<string>(
    isCaller ? 'Calling...' : 'Incoming Call...'
  );
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);

  // Helper to safely end call and stop media tracks
  const handleEndCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    const channel = supabase.channel(`call:${conversationId}`);

    // 1. Get Camera/Microphone media stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Add stream tracks to WebRTC peer connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      })
      .catch((err) => {
        console.error('Media access error:', err);
        alert('Could not access camera/microphone.');
        onClose();
      });

    // 2. Handle incoming remote video stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCallStatus('Connected');
      }
    };

    // 3. Handle ICE Candidates (network routing)
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate, senderId: currentUserId },
        });
      }
    };

    // 4. Listen for signaling events via Supabase Broadcast
    channel
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          channel.send({
            type: 'broadcast',
            event: 'answer',
            payload: { sdp: answer, senderId: currentUserId },
          });
        }
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.senderId !== currentUserId && payload.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (e) {
            console.error('Error adding ICE candidate', e);
          }
        }
      })
      .on('broadcast', { event: 'end-call' }, ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          handleEndCall();
        }
      })
      .subscribe(async (status) => {
        // If caller, create and send WebRTC Offer
        if (status === 'SUBSCRIBED' && isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          channel.send({
            type: 'broadcast',
            event: 'offer',
            payload: { sdp: offer, senderId: currentUserId },
          });
        }
      });

    return () => {
      channel.send({
        type: 'broadcast',
        event: 'end-call',
        payload: { senderId: currentUserId },
      });
      supabase.removeChannel(channel);
      handleEndCall();
    };
  }, [conversationId, currentUserId, isCaller, handleEndCall, onClose]);

  // Toggle Mute Audio
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Mute Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="text-white mb-4 text-center">
        <h2 className="text-xl font-bold">{recipientName}</h2>
        <p className="text-sm text-gray-300">{callStatus}</p>
      </div>

      {/* Video Screens Container */}
      <div className="relative w-full max-w-4xl h-[450px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
        {/* Remote Video (Large) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local Video (Small Overlay) */}
        <div className="absolute bottom-4 right-4 w-36 h-48 bg-gray-800 rounded-xl overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded-full font-semibold text-white ${
            isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isMuted ? 'Unmute Mic' : 'Mute Mic'}
        </button>

        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded-full font-semibold text-white ${
            isVideoOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
        </button>

        <button
          onClick={handleEndCall}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full font-bold text-white shadow-lg"
        >
          End Call
        </button>
      </div>
    </div>
  );
};