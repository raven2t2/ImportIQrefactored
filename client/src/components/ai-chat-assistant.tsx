import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIResponse {
  message: string;
  confidence: 'high' | 'medium' | 'low';
  suggestions: string[];
}

export function AiChatAssistant() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show for all users to debug
  console.log("AI Chat Assistant:", { isLoading, isAuthenticated, user });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with contextual welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const contextualMessage = getContextualWelcome(location);
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: contextualMessage,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, location]);

  const getContextualWelcome = (path: string): string => {
    switch (path) {
      case '/cost-calculator':
        return "Hi! I'm here to help with import cost calculations. Ask me about duties, taxes, shipping costs, or any step in the process.";
      case '/vehicle-lookup':
        return "Hello! I can help you find vehicle specifications, market values, and import requirements. What vehicle are you researching?";
      case '/mod-estimator':
        return "Hi there! I'll help you understand modification costs and compliance requirements for your import. What modifications are you considering?";
      case '/trial-dashboard':
        return "Welcome to your dashboard! I can explain any features, help track your import progress, or answer questions about your trial.";
      case '/affiliate-portal':
        return "Hi! I'm here to help with your affiliate activities, commission tracking, and referral strategies. How can I assist?";
      default:
        return "Hi! I'm your ImportIQ assistant. I can help with vehicle imports, costs, compliance, and any questions about our platform.";
    }
  };

  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/ai-chat", {
        message: query,
        context: {
          page: location,
          userType: 'trial',
          previousMessages: messages.slice(-3) // Last 3 messages for context
        }
      });
      return await response.json();
    },
    onSuccess: (data: AIResponse) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    },
    onError: () => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment, or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!inputValue.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="sticky bottom-4 float-right mr-4 z-50 flex justify-end">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-amber-600 hover:bg-amber-700 shadow-2xl border-2 border-amber-400"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="sticky bottom-4 float-right mr-4 z-50 flex justify-end">
      <Card className={`bg-gray-900 border-amber-500/30 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        <CardHeader className="pb-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-white text-sm">ImportIQ Assistant</CardTitle>
              <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                Online
              </Badge>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(500px-80px)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`rounded-full w-6 h-6 flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-amber-600' 
                        : 'bg-gray-700'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-3 h-3 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 text-amber-400" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="rounded-full w-6 h-6 flex items-center justify-center bg-gray-700">
                      <Bot className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about import costs, compliance, or anything..."
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-sm"
                  disabled={chatMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || chatMutation.isPending}
                  className="bg-amber-600 hover:bg-amber-700 px-3"
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