export const mockDocuments = [
  {
    _id: "doc-1",
    title: "Annual Report 2023",
    description: "Annual financial report for the year 2023",
    fileType: "application/pdf",
    fileSize: 1024 * 1024 * 2, // 2MB
    fileUrl: "/uploads/annual-report-2023.pdf",
    tags: ["report", "financial", "2023"],
    createdBy: {
      _id: "user-1",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      fullName: "Admin User",
    },
    createdAt: "2023-01-15T00:00:00.000Z",
    updatedAt: "2023-01-15T00:00:00.000Z",
  },
  {
    _id: "doc-2",
    title: "Project Proposal",
    description: "Proposal for the new marketing campaign",
    fileType: "application/docx",
    fileSize: 1024 * 512, // 512KB
    fileUrl: "/uploads/project-proposal.docx",
    tags: ["proposal", "marketing"],
    createdBy: {
      _id: "user-2",
      email: "editor@example.com",
      firstName: "Editor",
      lastName: "User",
      fullName: "Editor User",
    },
    createdAt: "2023-02-10T00:00:00.000Z",
    updatedAt: "2023-02-12T00:00:00.000Z",
  },
  {
    _id: "doc-3",
    title: "Product Specifications",
    description: "Technical specifications for the new product line",
    fileType: "application/pdf",
    fileSize: 1024 * 1024 * 1.5, // 1.5MB
    fileUrl: "/uploads/product-specs.pdf",
    tags: ["technical", "product", "specifications"],
    createdBy: {
      _id: "user-2",
      email: "editor@example.com",
      firstName: "Editor",
      lastName: "User",
      fullName: "Editor User",
    },
    createdAt: "2023-03-05T00:00:00.000Z",
    updatedAt: "2023-03-05T00:00:00.000Z",
  },
];
