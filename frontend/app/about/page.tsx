import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, FileText, Shield, Users, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6 text-center mb-12">
          <h1 className="text-4xl font-bold">About DocManager</h1>
          <p className="text-xl text-muted-foreground">
            A modern document management system designed to help you organize, share, and collaborate on your important
            files.
          </p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground">
              At DocManager, we believe that effective document management is essential for any organization. Our
              mission is to provide a secure, intuitive, and powerful platform that simplifies document workflows and
              enhances collaboration.
            </p>
            <p className="text-muted-foreground">
              We're committed to helping teams of all sizes manage their documents more efficiently, with powerful
              features that make it easy to organize, find, and share important files.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                    Document Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Upload, organize, and manage all your documents in one secure place with comprehensive version
                    control.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-emerald-600" />
                    User Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Control who can view, edit, or manage your documents with granular permission settings.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-emerald-600" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Keep your documents secure with role-based access control and comprehensive audit trails.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-emerald-600" />
                    Fast Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Quickly find the documents you need with powerful search capabilities and tagging.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Get Started Today</h2>
            <p className="text-muted-foreground">
              Ready to experience the benefits of a modern document management system? Sign up for DocManager today and
              start organizing your documents more efficiently.
            </p>
            <div className="flex justify-center mt-6">
              <Button asChild size="lg">
                <Link href="/auth/register">
                  Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
