import Link from "next/link";
import { FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl">DocManager</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              A modern document management system for organizing, sharing, and
              collaborating on your important files.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-sm mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/documents"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documents
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
