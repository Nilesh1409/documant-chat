import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">Document Management System</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Create and manage user accounts with different access levels: Admin, Editor, and Viewer roles.</p>
            </CardContent>
            <CardFooter>
              <Link href="/users" className="w-full">
                <Button className="w-full">Manage Users</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Repository</CardTitle>
              <CardDescription>Upload, organize, and manage documents</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Upload documents, manage versions, and control access permissions for your team.</p>
            </CardContent>
            <CardFooter>
              <Link href="/documents" className="w-full">
                <Button className="w-full">Browse Documents</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}
