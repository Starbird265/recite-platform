'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import Link from 'next/link';

type MessageType = {
  id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  is_chatbot: boolean;
  profiles?: { email: string }; // For displaying sender's email
};

const ChatInterface = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*, profiles(email)') // Select messages and join with sender's email
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch messages.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        // Fetch the profile data for the new message's sender
        supabase.from('profiles').select('email').eq('id', payload.new.sender_id).single()
          .then(({ data: profileData, error: profileError }) => {
            if (profileError) {
              console.error('Error fetching profile for new message:', profileError);
              setMessages((prev) => [...prev, { ...payload.new, profiles: { email: 'Unknown' } }]);
            } else {
              setMessages((prev) => [...prev, { ...payload.new, profiles: profileData }]);
            }
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        message_text: newMessage,
        is_chatbot: false, // User message
      });
      if (error) throw error;
      setNewMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    }
  };

  if (loading) return <div>Loading chat...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header"><h2>Doubt Solving Chat</h2></div>
        <div className="card-body" style={{ height: '400px', overflowY: 'scroll' }}>
          {messages.length === 0 ? (
            <p className="text-muted text-center">No messages yet. Start a conversation!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`d-flex mb-2 ${msg.sender_id === user?.id ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className={`card p-2 ${msg.sender_id === user?.id ? 'bg-primary text-white' : 'bg-light'}`}>
                  <small className="text-muted">{msg.profiles?.email || 'Unknown'}</small>
                  <p className="mb-0">{msg.message_text}</p>
                  <small className="text-muted text-end">{new Date(msg.created_at).toLocaleTimeString()}</small>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="card-footer">
          <form onSubmit={handleSendMessage} className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!user}
            />
            <button type="submit" className="btn btn-primary" disabled={!user}>Send</button>
          </form>
        </div>
        <div className="card-footer">
          <Link href="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
