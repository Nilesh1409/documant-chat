"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { qaService, type QAHistoryItem } from "@/services/qa-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage } from "@/components/qa/chat-message";
import { HistoryItem } from "@/components/qa/history-item";
import { Send, History, Trash2 } from "lucide-react";

export default function QAPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chat");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ type: "user" | "assistant"; content: any }>
  >([]);
  const [history, setHistory] = useState<QAHistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/auth/login?redirect=/qa");
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, historyPage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const { history, pagination } = await qaService.getHistory(historyPage);
      setHistory(history);
      setHistoryPagination(pagination);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load history",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setQuestion("");
    setMessages((prev) => [...prev, { type: "user", content: userQuestion }]);

    try {
      setIsLoading(true);
      const response = await qaService.askQuestion(userQuestion);
      setMessages((prev) => [
        ...prev,
        { type: "assistant", content: response },
      ]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to get answer",
      });
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: {
            answer:
              "I'm sorry, I couldn't process your question. Please try again.",
            sources: [],
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await qaService.deleteHistoryItem(id);
      toast({
        title: "Success",
        description: "History item deleted successfully",
      });
      fetchHistory();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete history item",
      });
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear all your Q&A history?")) {
      return;
    }

    try {
      await qaService.clearHistory();
      toast({
        title: "Success",
        description: "History cleared successfully",
      });
      fetchHistory();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to clear history",
      });
    }
  };

  const handleHistoryItemClick = (item: QAHistoryItem) => {
    setMessages([
      { type: "user", content: item.question },
      {
        type: "assistant",
        content: {
          answer: item.answer,
          sources: item.sources,
          confidence: item.confidence,
        },
      },
    ]);
    setActiveTab("chat");
  };

  if (isAuthLoading) {
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Document Q&A</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {activeTab === "history" && (
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            )}
          </div>

          <TabsContent value="chat" className="mt-0">
            <div className="border rounded-lg overflow-hidden">
              <div className="h-[500px] overflow-y-auto p-4 bg-muted/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <History className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No messages yet
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Ask a question about your documents to get started. The AI
                      will provide answers based on your document content.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <ChatMessage
                        key={index}
                        type={message.type}
                        content={message.content}
                      />
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
                <div className="flex gap-2">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !question.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="border rounded-lg overflow-hidden">
              <div className="min-h-[500px] bg-muted/30">
                {isLoadingHistory ? (
                  <div className="p-4 space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : history.length === 0 ? (
                  <div className="h-[500px] flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <History className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No history yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Your question history will appear here once you start
                      asking questions.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {history.map((item) => (
                      <HistoryItem
                        key={item._id}
                        item={item}
                        onDelete={() => handleDeleteHistoryItem(item._id)}
                        onClick={() => handleHistoryItemClick(item)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
