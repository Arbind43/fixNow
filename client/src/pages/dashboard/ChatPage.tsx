import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Send, User as UserIcon } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Input, Button, Avatar } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function ChatPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  // Replaced with dynamic resolution from DB below

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedReceiver, setResolvedReceiver] = useState<any>(location.state?.receiver || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial history and booking details to resolve receiver
  useEffect(() => {
    const fetchChatData = async () => {
      if (!bookingId) return;
      try {
        // 1. Fetch chat history
        const resHistory = await axios.get(`/api/messages/${bookingId}`);
        setMessages(resHistory.data.data);

        // 2. Fetch booking details to figure out the receiver if not passed
        if (!resolvedReceiver || resolvedReceiver._id === 'unknown') {
          const resBooking = await axios.get(`/api/bookings/${bookingId}`);
          const booking = resBooking.data.data;
          
          if (user) {
            // If I am the customer, receiver is technician's user profile
            if (booking.customer._id === user._id || booking.customer === user._id) {
              setResolvedReceiver({
                _id: booking.technician?.user?._id || booking.technician?._id,
                name: booking.technician?.user?.name || 'Technician',
                avatar: booking.technician?.user?.avatar || '',
              });
            } else {
              // I am the technician, receiver is customer
              setResolvedReceiver({
                _id: booking.customer._id,
                name: booking.customer.name || 'Customer',
                avatar: booking.customer.avatar || '',
              });
            }
          }
        }
      } catch (error) {
        showToast.error('Failed to load chat data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [bookingId, user, resolvedReceiver]);

  // Fallback while loading
  const receiverInfo = resolvedReceiver || { _id: 'unknown', name: 'Loading...' };

  // Setup Socket Listeners
  useEffect(() => {
    if (!socket || !bookingId) return;

    // Join room for this specific booking
    socket.emit('join_booking_room', bookingId);

    const handleReceiveMessage = (message: any) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('receive_message', handleReceiveMessage);

    const handleMessageError = (data: { error: string }) => {
      showToast.error(data.error);
    };
    socket.on('message_error', handleMessageError);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_error', handleMessageError);
    };
  }, [socket, bookingId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !bookingId) return;

    const messageData = {
      bookingId,
      receiverId: receiverInfo._id,
      content: newMessage.trim(),
    };

    // Emit via socket
    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] overflow-hidden shadow-sm">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-elevated)] shrink-0">
          <div className="flex items-center gap-3">
            <Avatar src={receiverInfo.avatar} name={receiverInfo.name} />
            <div>
              <h2 className="font-bold text-[var(--text-primary)]">{receiverInfo.name}</h2>
              <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'}`}></span>
                {isConnected ? 'Connected' : 'Reconnecting...'}
              </p>
            </div>
          </div>
          <div className="text-xs text-[var(--text-tertiary)] hidden sm:block">
            Booking Ref: <span className="font-mono">{bookingId?.slice(-6).toUpperCase()}</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/50">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-[var(--text-tertiary)]">
              Loading chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
              <div className="w-16 h-16 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center mb-3">
                <UserIcon size={24} />
              </div>
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.sender._id === user?._id || msg.sender === user?._id;
              
              return (
                <div key={msg._id || index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl
                    ${isMine 
                      ? 'bg-[var(--color-primary-600)] text-white rounded-tr-none' 
                      : 'bg-white dark:bg-zinc-800 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-tl-none'
                    }
                  `}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)] mt-1 px-1">
                    {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : 'Just now'}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-primary)] shrink-0 flex items-center gap-3">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
                         className="mb-0 border-none bg-[var(--bg-secondary)]"
          />
          <Button type="submit" disabled={!newMessage.trim() || !isConnected} className="shrink-0 h-[42px] w-[42px] p-0 flex items-center justify-center rounded-xl">
            <Send size={18} className="ml-1" />
          </Button>
        </form>

      </div>
    </DashboardLayout>
  );
}
