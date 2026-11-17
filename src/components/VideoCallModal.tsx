'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { backend } from '@/lib/backend';

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
  const processedSignalIdsRef = useRef<Set<string>>(new Set());
  const remoteDescSetRef = useRef<boolean>(false);

  const [callStatus, setCallStatus] = useState<string>(
    isCaller ? 'Calling...' : 'Incoming Call...'
  );
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);

  const sendSignal = useCallback(
    async (event: string, payload: Record<string, any>) => {
      try {
        await backend.create('call_signals', {
          conversation_id: conversationId,
          sender_id: currentUserId,
          event,
          payload,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error('Failed to send call signal:', err);
      }
    },
    [conversationId, currentUserId]
  );

  const handleEndCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;
    const mountTime = Date.now() - 10000;
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        if (isMounted) setCallStatus('Connected');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ice-candidate', {
          candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
        });
      }
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(async (stream) => {
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendSignal('offer', { sdp: offer });
        }
      })
      .catch((err) => {
        console.error('Media access error:', err);
        if (isMounted) {
          alert('Could not access camera/microphone.');
          onClose();
        }
      });

    const pollInterval = setInterval(async () => {
      if (!isMounted || !pcRef.current) return;
      try {
        const res = await backend.list('call_signals');
        const records = Array.isArray(res) ? res : res?.records || [];
        const signals = records
          .filter(
            (s: any) =>
              s.conversation_id === conversationId &&
              s.sender_id !== currentUserId &&
              (s.timestamp || 0) >= mountTime &&
              !processedSignalIdsRef.current.has(s.id)
          )
          .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));

        for (const sig of signals) {
          processedSignalIdsRef.current.add(sig.id);

          if (sig.event === 'offer' && !isCaller && sig.payload?.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(sig.payload.sdp));
            remoteDescSetRef.current = true;
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal('answer', { sdp: answer });
          } else if (sig.event === 'answer' && isCaller && sig.payload?.sdp) {
            if (!remoteDescSetRef.current) {
              await pc.setRemoteDescription(new RTCSessionDescription(sig.payload.sdp));
              remoteDescSetRef.current = true;
            }
          } else if (sig.event === 'ice-candidate' && sig.payload?.candidate) {
            if (remoteDescSetRef.current) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(sig.payload.candidate));
              } catch (e) {
                console.error('Error adding ICE candidate:', e);
              }
            }
          } else if (sig.event === 'end-call') {
            handleEndCall();
          }
        }
      } catch (err) {
        console.error('Error polling call signals:', err);
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      sendSignal('end-call', {});
      handleEndCall();
    };
  }, [conversationId, currentUserId, isCaller, handleEndCall, onClose, sendSignal]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

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

      <div className="relative w-full max-w-4xl h-[450px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

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

export default VideoCallModal;
