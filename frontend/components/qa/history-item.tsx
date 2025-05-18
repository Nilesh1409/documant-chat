"use client";

import type React from "react";

import { formatDistanceToNow } from "date-fns";
import type { QAHistoryItem } from "@/services/qa-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, MessageSquare } from "lucide-react";

interface HistoryItemProps {
  item: QAHistoryItem;
  onDelete: () => void;
  onClick: () => void;
}

export function HistoryItem({ item, onDelete, onClick }: HistoryItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <Card
      className="hover:bg-muted/20 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium line-clamp-1">{item.question}</p>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {item.answer}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </p>
              {item.confidence && (
                <Badge
                  variant={
                    item.confidence === "high"
                      ? "default"
                      : item.confidence === "medium"
                      ? "outline"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {item.confidence}
                </Badge>
              )}
              {item.sources && (
                <p className="text-xs text-muted-foreground">
                  {item.sources.length} source
                  {item.sources.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 ml-2"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
