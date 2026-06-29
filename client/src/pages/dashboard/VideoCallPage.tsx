import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSocket } from '../../context/SocketContext';

export default function VideoCallPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const createOffer = async () => {
    if (!peerConnectionRef.current || !socket) return;
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit('webrtc_offer', { bookingId, offer });
  };

  const setupWebRTC = (stream: MediaStream) => {
    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks to connection
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // ICE Candidate generation
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket && bookingId) {
        socket.emit('webrtc_ice_candidate', {
          bookingId,
          candidate: event.candidate,
        });
      }
    };

    if (!socket) return;

    socket.emit('join_booking_room', bookingId);

    // If I'm the caller, create offer
    // For simplicity, we just trigger an offer immediately. In reality, you'd trigger this when clicking "Call"
    createOffer();

    // Socket listeners for signaling
    socket.on('webrtc_offer', async (offer) => {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit('webrtc_answer', { bookingId, answer });
    });

    socket.on('webrtc_answer', async (answer) => {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('webrtc_ice_candidate', async (candidate) => {
      if (!peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });
  };

  useEffect(() => {
    // 1. Get local media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setupWebRTC(stream);
      })
      .catch(err => {
        console.error("Error accessing media devices.", err);
      });

    return () => {
      // Cleanup
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      peerConnectionRef.current?.close();
    };
  }, []);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    peerConnectionRef.current?.close();
    navigate(-1); // go back
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-black rounded-2xl overflow-hidden relative shadow-2xl">
        
        {/* Remote Video (Full Screen) */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        {/* Local Video (PiP) */}
        <div className="absolute top-6 right-6 w-48 h-72 bg-zinc-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]"
          />
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md px-8 py-4 rounded-full border border-white/10">
          <button 
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMicOn ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          
          <button 
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOn ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          
          <button 
            onClick={endCall}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors ml-4 shadow-lg shadow-red-500/20"
          >
            <PhoneOff size={24} />
          </button>
        </div>

        {/* Connection Status */}
        <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          <span className="text-white text-sm font-medium">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
