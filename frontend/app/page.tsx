import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Users, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-600 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Manage Your Documents with Ease and Security
              </h1>
              <p className="text-white/90 text-lg md:text-xl mb-8 max-w-lg">
                A powerful document management system that helps you organize,
                share, and collaborate on your important files.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-white/90"
                >
                  <Link href="/documents">
                    Browse Documents <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/10"
                >
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://cdn.prod.website-files.com/62045da4270c887c4de9c45f/62045f0f0935a932684ec7d3_62032d13970ec8406516b6dc_iStock-618963716-800x533.jpeg"
                alt="Document Management System"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your documents efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Document Management
              </h3>
              <p className="text-gray-600">
                Upload, organize, and manage all your documents in one secure
                place with version control.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                User Permissions
              </h3>
              <p className="text-gray-600">
                Control who can view, edit, or manage your documents with
                granular permission settings.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Upload className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Version Control
              </h3>
              <p className="text-gray-600">
                Keep track of document changes with comprehensive version
                history and rollback capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust our platform for their document
            management needs.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-emerald-600 hover:bg-white/90"
          >
            <Link href="/auth/register">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
