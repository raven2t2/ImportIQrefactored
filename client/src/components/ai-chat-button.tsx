import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Bot, X, Minus, Send, Loader2, Calculator, Search, Shield, Zap, Star, Briefcase } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AiResponse {
  response: string;
  confidence: 'high' | 'medium' | 'low';
  suggestions: string[];
}

interface PersonalizedIcon {
  iconType: string;
  iconPersonality: string;
  totalInteractions?: number;
  expertiseLevel?: string;
  reason: string;
}

export function AiChatButton() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get personalized icon for authenticated users
  const { data: personalizedIcon } = useQuery<PersonalizedIcon>({
    queryKey: ['/api/chat/personalized-icon', user?.email || user?.id],
    enabled: !!isAuthenticated && !!user,
    retry: false,
  });

  // Function to get the appropriate icon based on user's profile
  const getPersonalizedIcon = () => {
    if (!personalizedIcon) return MessageCircle;
    
    switch (personalizedIcon.iconType) {
      case 'calculator':
        return Calculator;
      case 'search':
        return Search;
      case 'shield':
        return Shield;
      case 'expert':
        return Star;
      case 'professional':
        return Briefcase;
      case 'enthusiastic':
        return Zap;
      default:
        return MessageCircle;
    }
  };

  // Function to get icon color based on personality
  const getIconColor = () => {
    if (!personalizedIcon) return "text-blue-600";
    
    switch (personalizedIcon.iconPersonality) {
      case 'expert':
        return "text-purple-600";
      case 'professional':
        return "text-slate-600";
      case 'enthusiastic':
        return "text-orange-600";
      default:
        return "text-blue-600";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging from header, button container, or button itself
    const target = e.target as HTMLElement;
    const isButton = target.tagName === 'BUTTON' || target.closest('button');
    
    // Prevent dragging if clicking on interactive elements (except when it's the main chat button)
    if (isButton && !target.closest('[data-chat-button]')) {
      return;
    }
    
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x - 24; // Adjust for default bottom-right position
      const newY = e.clientY - dragOffset.y - 24;

      // Keep within viewport bounds
      const maxX = window.innerWidth - (isOpen ? 384 : 56); // Adjust for chat width
      const maxY = window.innerHeight - (isOpen && !isMinimized ? 500 : 56);

      setPosition({
        x: Math.max(-24, Math.min(newX, maxX)),
        y: Math.max(-24, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isOpen, isMinimized]);

  const chatMutation = useMutation({
    mutationFn: async ({ message, page }: { message: string; page: string }) => {
      const response = await apiRequest("POST", "/api/ai-chat", { message, page });
      return await response.json();
    },
    onSuccess: (data: AiResponse) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '-ai',
        content: data.response,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        content: "Sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate({ message: inputValue, page: location });
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPageContext = (path: string) => {
    const pageContexts: { [key: string]: string } = {
      '/': 'homepage and general import questions',
      '/calculator': 'import cost calculations',
      '/mod-estimator': 'vehicle modification estimates',
      '/features': 'platform features and tools',
      '/trial-dashboard': 'trial dashboard and user account'
    };
    return pageContexts[path] || 'general import assistance';
  };

  // Only show chat button for authenticated users
  if (!isAuthenticated || isLoading) {
    return null;
  }

  // If completely closed, show small reopener
  if (isClosed) {
    return (
      <div 
        className="fixed z-[9999] cursor-move"
        style={{
          bottom: position.y === 0 ? '24px' : 'auto',
          right: position.x === 0 ? '24px' : 'auto',
          top: position.y !== 0 ? `${position.y + 24}px` : 'auto',
          left: position.x !== 0 ? `${position.x + 24}px` : 'auto',
        }}
        onMouseDown={handleMouseDown}
      >
        <Button
          data-chat-button
          onClick={() => {
            setIsClosed(false);
            setIsOpen(true);
          }}
          className={`rounded-full w-12 h-12 shadow-lg border transition-all duration-200 hover:scale-105 opacity-75 hover:opacity-100 ${
            personalizedIcon?.iconPersonality === 'expert' ? 'bg-purple-600 hover:bg-purple-700 border-purple-400' :
            personalizedIcon?.iconPersonality === 'professional' ? 'bg-slate-600 hover:bg-slate-700 border-slate-400' :
            personalizedIcon?.iconPersonality === 'enthusiastic' ? 'bg-orange-600 hover:bg-orange-700 border-orange-400' :
            'bg-gray-600 hover:bg-amber-600 border-gray-400'
          }`}
          title={`AI Assistant${personalizedIcon ? ` (${personalizedIcon.expertiseLevel || 'beginner'} level)` : ''}`}
        >
          {(() => {
            const IconComponent = getPersonalizedIcon();
            return <IconComponent className="w-5 h-5 text-white" />;
          })()}
        </Button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div 
        className="fixed z-[9999] cursor-move"
        style={{
          bottom: position.y === 0 ? '24px' : 'auto',
          right: position.x === 0 ? '24px' : 'auto',
          top: position.y !== 0 ? `${position.y + 24}px` : 'auto',
          left: position.x !== 0 ? `${position.x + 24}px` : 'auto',
        }}
        onMouseDown={handleMouseDown}
      >
        <Button
          data-chat-button
          onClick={() => setIsOpen(true)}
          className={`rounded-full w-14 h-14 shadow-xl border-2 transition-all duration-200 hover:scale-105 ${
            personalizedIcon?.iconPersonality === 'expert' ? 'bg-purple-600 hover:bg-purple-700 border-purple-400' :
            personalizedIcon?.iconPersonality === 'professional' ? 'bg-slate-600 hover:bg-slate-700 border-slate-400' :
            personalizedIcon?.iconPersonality === 'enthusiastic' ? 'bg-orange-600 hover:bg-orange-700 border-orange-400' :
            'bg-amber-600 hover:bg-amber-700 border-amber-400'
          }`}
          title={`AI Assistant${personalizedIcon ? ` - ${personalizedIcon.reason}` : ''}`}
        >
          {(() => {
            const IconComponent = getPersonalizedIcon();
            return <IconComponent className="w-6 h-6 text-white" />;
          })()}
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="fixed z-[9999]"
      style={{
        bottom: position.y === 0 ? '24px' : 'auto',
        right: position.x === 0 ? '24px' : 'auto',
        top: position.y !== 0 ? `${position.y + 24}px` : 'auto',
        left: position.x !== 0 ? `${position.x + 24}px` : 'auto',
      }}
    >
      <Card className={`bg-gray-900 border-amber-500/30 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        <CardHeader className="pb-3 border-b border-gray-700 cursor-move" onMouseDown={handleMouseDown}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {(() => {
                const IconComponent = getPersonalizedIcon();
                return <IconComponent className={`w-5 h-5 ${
                  personalizedIcon?.iconPersonality === 'expert' ? 'text-purple-400' :
                  personalizedIcon?.iconPersonality === 'professional' ? 'text-slate-400' :
                  personalizedIcon?.iconPersonality === 'enthusiastic' ? 'text-orange-400' :
                  'text-amber-500'
                }`} />;
              })()}
              <div className="flex flex-col">
                <span className="text-amber-100 font-medium">ImportIQ Assistant</span>
                {personalizedIcon && (
                  <span className="text-xs text-gray-400 capitalize">
                    {personalizedIcon.expertiseLevel || 'Beginner'} Level • {personalizedIcon.iconPersonality}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-amber-400"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setIsClosed(true);
                }}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <p className="text-xs text-gray-400 mt-1">
              Get help with {getPageContext(location)}
            </p>
          )}
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[416px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                  <p className="text-sm">
                    Hi! I'm your ImportIQ assistant. Ask me anything about vehicle imports!
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-gray-100 border border-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-700 p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about imports, costs, compliance..."
                  className="flex-1 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-amber-500"
                  disabled={chatMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || chatMutation.isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}