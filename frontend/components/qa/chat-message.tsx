"use client";

import { useState } from "react";
import Link from "next/link";
import type { Source } from "@/services/qa-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { User, Bot, ChevronDown, ChevronUp, FileText } from "lucide-react";

interface ChatMessageProps {
  type: "user" | "assistant";
  content: any;
}

export function ChatMessage({ type, content }: ChatMessageProps) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  if (type === "user") {
    return (
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">You</p>
          <div className="prose prose-sm max-w-none">
            <p>{content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  const { answer, sources = [], confidence = "medium" } = content;
  const hasSources = sources && sources.length > 0;

  return (
    <div className="flex items-start gap-3">
      <div className="bg-primary/10 p-2 rounded-full">
        <Bot className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium">Assistant</p>
          {confidence && (
            <Badge
              variant={
                confidence === "high"
                  ? "default"
                  : confidence === "medium"
                  ? "outline"
                  : "secondary"
              }
            >
              {confidence.charAt(0).toUpperCase() + confidence.slice(1)}{" "}
              confidence
            </Badge>
          )}
        </div>
        <div className="prose prose-sm max-w-none mb-3">
          <p>{answer}</p>
        </div>

        {hasSources && (
          <Collapsible
            open={isSourcesOpen}
            onOpenChange={setIsSourcesOpen}
            className="border rounded-md overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex justify-between p-3 h-auto"
              >
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Sources ({sources.length})
                </span>
                {isSourcesOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-3 pt-0 space-y-3">
                {sources.map((source: Source, index: number) => (
                  <SourceItem key={index} source={source} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

interface SourceItemProps {
  source: Source;
}

function SourceItem({ source }: SourceItemProps) {
  const [isExcerptsOpen, setIsExcerptsOpen] = useState(false);

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link
              href={`/documents/${source.documentId}`}
              className="text-sm font-medium hover:underline"
            >
              {source.title}
            </Link>
            {source.metadata?.author && (
              <p className="text-xs text-muted-foreground">
                By {source.metadata.author}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExcerptsOpen(!isExcerptsOpen)}
            className="h-6 px-2"
          >
            {isExcerptsOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>

        {isExcerptsOpen && source.excerpts && source.excerpts.length > 0 && (
          <div className="mt-2 space-y-2">
            {source.excerpts.map((excerpt, i) => (
              <div key={i} className="text-sm bg-muted/50 p-2 rounded-md">
                "{excerpt}"
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
