import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, MessageSquare, User, Tag, ArrowLeft, Clock } from 'lucide-react';
import socialService from '../../services/socialService';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, timeAgo } from '../../utils/formatters';

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedConvId = searchParams.get('conversationId');

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const res = await socialService.getConversations();
        if (res.success) {
          const convList = res.conversations || [];
          setConversations(convList);

          if (requestedConvId) {
            const found = convList.find((c) => c._id === requestedConvId);
            if (found) setSelectedConversation(found);
          } else if (convList.length > 0) {
            setSelectedConversation(convList[0]);
          }
        }
      } catch (err) {
        toast.error('Failed to load conversations.');
      } finally {
        setLoadingConvs(false);
      }
    };
    fetchConvs();
  }, [requestedConvId]);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      setLoadingMsgs(true);
      try {
        const res = await socialService.getMessages(selectedConversation._id);
        if (res.success) {
          setMessages(res.messages || []);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        toast.error('Failed to load messages.');
      } finally {
        setLoadingMsgs(false);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const res = await socialService.sendMessage(selectedConversation._id, inputText.trim());
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message]);
        setInputText('');
        setTimeout(scrollToBottom, 50);

        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c._id === selectedConversation._id
              ? { ...c, lastMessage: inputText.trim(), lastMessageAt: new Date() }
              : c
          )
        );
      }
    } catch (err) {
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== user.id) || conv.participants?.[0];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="card border border-gray-200 overflow-hidden h-[calc(100vh-180px)] min-h-[500px] flex flex-col md:flex-row">
        {/* Left column: Conversation list */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" /> Messages
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loadingConvs ? (
              <div className="p-4 text-center text-xs text-gray-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No active messages yet. Contact sellers directly from listing pages!
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = selectedConversation?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setSearchParams({ conversationId: conv._id });
                    }}
                    className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 ${
                      isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-sm">
                      {other?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <p className="text-xs font-bold text-gray-900 truncate">{other?.name}</p>
                        <span className="text-[10px] text-gray-400">
                          {timeAgo(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-indigo-600 truncate mb-1">
                        📦 {conv.listing?.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage || 'Started conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Chat Box */}
        <div className="flex-1 flex flex-col bg-gray-50/50">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {getOtherParticipant(selectedConversation)?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">
                      {getOtherParticipant(selectedConversation)?.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {getOtherParticipant(selectedConversation)?.course}{' '}
                      {getOtherParticipant(selectedConversation)?.branch
                        ? `· ${getOtherParticipant(selectedConversation)?.branch}`
                        : ''}
                    </p>
                  </div>
                </div>

                {/* Product badge */}
                {selectedConversation.listing && (
                  <Link
                    to={`/listings/${selectedConversation.listing._id}`}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg border border-gray-200 transition-colors text-right"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[140px]">
                        {selectedConversation.listing.title}
                      </p>
                      <p className="text-xs font-black text-emerald-600">
                        {formatPrice(selectedConversation.listing.price)}
                      </p>
                    </div>
                  </Link>
                )}
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMsgs ? (
                  <div className="text-center text-xs text-gray-400 py-8">Loading history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-xs text-gray-400 py-12">
                    Send a message to propose a price or agree on a safe campus meeting point!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender?._id === user.id || m.sender === user.id;

                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {m.message}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="input-field"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="btn-primary px-4 py-2 flex items-center justify-center gap-1 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <MessageSquare className="w-12 h-12 mb-2 stroke-1 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">Select a conversation</p>
              <p className="text-xs text-gray-400 mt-1">
                Choose a chat from the left panel to message a campus buyer or seller.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
