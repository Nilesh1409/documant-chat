"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { documentService } from "@/services/document-service";
import { Upload, Loader2, X } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const formSchema = z.object({
  changeSummary: z.string().optional(),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than 10MB`,
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: `File type must be one of: PDF, DOCX, JPG, PNG`,
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface DocumentVersionUploadProps {
  documentId: string;
  onSuccess?: () => void;
}

export default function DocumentVersionUpload({
  documentId,
  onSuccess,
}: DocumentVersionUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      changeSummary: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to upload document versions.",
      });
      setIsOpen(false);
      return;
    }

    try {
      setIsUploading(true);

      await documentService.uploadNewVersion(documentId, {
        file: values.file,
        changeSummary: values.changeSummary,
        userId: user._id,
      });

      toast({
        title: "Version uploaded",
        description: "Your document version has been uploaded successfully.",
      });

      // Reset form
      form.reset();
      setSelectedFile(null);
      setIsOpen(false);

      // Refresh document
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload document version",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("file", file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("file", file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeFile = () => {
    setSelectedFile(null);
    form.setValue("file", undefined as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload New Version
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Upload New Version</DialogTitle>
          <DialogDescription>
            Upload a new version of this document.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, ref, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                        selectedFile
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-muted-foreground/25"
                      }`}
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-emerald-100 p-2 rounded-full mr-3">
                              <Upload className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto bg-muted rounded-full p-2 w-10 h-10 flex items-center justify-center">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium">
                              Click to upload or drag and drop
                            </p>
                            <p>PDF, DOCX, JPG, PNG (max 10MB)</p>
                          </div>
                        </div>
                      )}
                      <input
                        id="file-upload"
                        type="file"
                        accept={ACCEPTED_FILE_TYPES.join(",")}
                        className="sr-only" /* using sr-only instead of hidden is safer */
                        {...fieldProps} /* name, disabled, etc. */
                        onChange={(e) => {
                          /* 1️⃣ keep RHF happy, 2️⃣ keep your state */
                          handleFileChange(e); // your logic
                          onChange(e); // RHF’s own handler
                        }}
                        ref={(el) => {
                          /* merge the two refs */
                          fileInputRef.current = el as HTMLInputElement | null;
                          ref(el); // pass DOM node back to RHF
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="changeSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Change Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what changed in this version (optional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Briefly describe the changes made in this version
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Version"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
