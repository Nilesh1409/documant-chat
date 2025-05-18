const { rest } = require("msw");
const { documents } = require("./data/documents");
const { users } = require("./data/users");
const { versions } = require("./data/versions");
const { qaHistory } = require("./data/qa-history");

// Define handlers that catch the corresponding requests and returns the mock data
const handlers = [
  // Auth handlers
  rest.post("/api/auth/login", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          _id: "user123",
          email: "user@example.com",
          fullName: "Test User",
          role: "admin",
        },
        token: "fake-jwt-token",
      })
    );
  }),

  rest.post("/api/auth/register", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        user: {
          _id: "newuser123",
          email: "newuser@example.com",
          fullName: "New User",
          role: "viewer",
        },
        token: "fake-jwt-token",
      })
    );
  }),

  rest.post("/api/auth/logout", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  rest.get("/api/auth/me", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        _id: "user123",
        email: "user@example.com",
        fullName: "Test User",
        role: "admin",
      })
    );
  }),

  // Document handlers
  rest.get("/api/documents", (req, res, ctx) => {
    const page = Number.parseInt(req.url.searchParams.get("page") || "1");
    const limit = Number.parseInt(req.url.searchParams.get("limit") || "10");
    const search = req.url.searchParams.get("search") || "";
    const tag = req.url.searchParams.get("tag") || "";

    let filteredDocs = [...documents];

    if (search) {
      filteredDocs = filteredDocs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(search.toLowerCase()) ||
          doc.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (tag) {
      filteredDocs = filteredDocs.filter((doc) => doc.tags.includes(tag));
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

    return res(
      ctx.status(200),
      ctx.json({
        documents: paginatedDocs,
        pagination: {
          page,
          limit,
          total: filteredDocs.length,
          pages: Math.ceil(filteredDocs.length / limit),
        },
      })
    );
  }),

  rest.get("/api/documents/:id", (req, res, ctx) => {
    const { id } = req.params;
    const document = documents.find((doc) => doc._id === id);

    if (!document) {
      return res(ctx.status(404), ctx.json({ message: "Document not found" }));
    }

    return res(ctx.status(200), ctx.json(document));
  }),

  rest.post("/api/documents", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        _id: "newdoc123",
        title: "New Document",
        description: "A newly created document",
        fileType: "application/pdf",
        fileSize: 1024 * 1024,
        createdBy: {
          _id: "user123",
          email: "user@example.com",
          fullName: "Test User",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["new", "test"],
      })
    );
  }),

  rest.put("/api/documents/:id", (req, res, ctx) => {
    const { id } = req.params;
    const document = documents.find((doc) => doc._id === id);

    if (!document) {
      return res(ctx.status(404), ctx.json({ message: "Document not found" }));
    }

    return res(ctx.status(200), ctx.json({ ...document, ...req.body }));
  }),

  rest.delete("/api/documents/:id", (req, res, ctx) => {
    const { id } = req.params;
    const document = documents.find((doc) => doc._id === id);

    if (!document) {
      return res(ctx.status(404), ctx.json({ message: "Document not found" }));
    }

    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  // Document versions handlers
  rest.get("/api/documents/:id/versions", (req, res, ctx) => {
    const { id } = req.params;
    const documentVersions = versions.filter((v) => v.documentId === id);

    return res(ctx.status(200), ctx.json(documentVersions));
  }),

  rest.post("/api/documents/:id/versions", (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(201),
      ctx.json({
        _id: "newversion123",
        documentId: id,
        versionNumber: 2,
        fileSize: 1024 * 1024,
        createdBy: {
          _id: "user123",
          email: "user@example.com",
          fullName: "Test User",
        },
        createdAt: new Date().toISOString(),
        notes: "Updated version",
      })
    );
  }),

  // User handlers
  rest.get("/api/users", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(users));
  }),

  rest.get("/api/users/:id", (req, res, ctx) => {
    const { id } = req.params;
    const user = users.find((u) => u._id === id);

    if (!user) {
      return res(ctx.status(404), ctx.json({ message: "User not found" }));
    }

    return res(ctx.status(200), ctx.json(user));
  }),

  rest.post("/api/users", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        _id: "newuser123",
        email: "newuser@example.com",
        fullName: "New User",
        role: "viewer",
        createdAt: new Date().toISOString(),
      })
    );
  }),

  rest.put("/api/users/:id", (req, res, ctx) => {
    const { id } = req.params;
    const user = users.find((u) => u._id === id);

    if (!user) {
      return res(ctx.status(404), ctx.json({ message: "User not found" }));
    }

    return res(ctx.status(200), ctx.json({ ...user, ...req.body }));
  }),

  rest.delete("/api/users/:id", (req, res, ctx) => {
    const { id } = req.params;
    const user = users.find((u) => u._id === id);

    if (!user) {
      return res(ctx.status(404), ctx.json({ message: "User not found" }));
    }

    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  // QA handlers
  rest.post("/api/qa/ask", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        answer: "This is a mock answer to your question.",
        sources: [
          {
            documentId: "doc123",
            documentTitle: "Sample Document",
            pageNumber: 5,
            excerpt: "Relevant excerpt from the document...",
          },
        ],
      })
    );
  }),

  rest.get("/api/qa/history", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(qaHistory));
  }),

  // Ingestion handlers
  rest.get("/api/ingestion", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          _id: "ingestion123",
          documentId: "doc123",
          documentTitle: "Sample Document",
          status: "completed",
          startTime: "2023-01-01T00:00:00.000Z",
          endTime: "2023-01-01T00:05:00.000Z",
          pages: 10,
          error: null,
        },
        {
          _id: "ingestion124",
          documentId: "doc124",
          documentTitle: "Another Document",
          status: "processing",
          startTime: "2023-01-02T00:00:00.000Z",
          endTime: null,
          pages: null,
          error: null,
        },
        {
          _id: "ingestion125",
          documentId: "doc125",
          documentTitle: "Failed Document",
          status: "failed",
          startTime: "2023-01-03T00:00:00.000Z",
          endTime: "2023-01-03T00:01:00.000Z",
          pages: null,
          error: "Invalid file format",
        },
      ])
    );
  }),
];

module.exports = { handlers };
