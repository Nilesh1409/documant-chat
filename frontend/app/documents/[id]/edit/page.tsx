"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { documentService } from "@/services/document-service"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(255),
  description: z.string().optional(),
  tags: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function EditDocumentPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [document, setDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  })

  useEffect(() => {
    fetchDocument()
  }, [params.id])

  const fetchDocument = async () => {
    try {
      setIsLoading(true)
      const response = await documentService.getDocumentById(params.id)
      setDocument(response.document)

      // Set form values
      form.reset({
        title: response.document.title,
        description: response.document.description || "",
        tags: response.document.tags.join(", "),
      })
    } catch (error: any) {
      console.error("Error fetching document:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load document",
      })
      router.push("/documents")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to edit documents.",
      })
      router.push("/auth/login")
      return
    }

    try {
      setIsSaving(true)

      // Parse tags
      const tags = values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []

      await documentService.updateDocument(
        params.id,
        {
          title: values.title,
          description: values.description,
          tags,
        },
        user._id,
      )

      toast({
        title: "Document updated",
        description: "Your document has been updated successfully.",
      })

      router.push(`/documents/${params.id}`)
    } catch (error: any) {
      console.error("Update error:", error)
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update document",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href={`/documents/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to document
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium">Document not found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            The document you are trying to edit does not exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to documents
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href={`/documents/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to document
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Document</h1>
          <p className="text-muted-foreground">Update your document information</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Document title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a description (optional)" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="report, annual, 2023" {...field} />
                  </FormControl>
                  <FormDescription>Separate tags with commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/documents/${params.id}`)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
