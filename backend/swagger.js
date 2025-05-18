const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Document Management System API",
      version: "1.0.0",
      description: "API documentation for Document Management System",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:8080",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["admin", "editor", "viewer"] },
            isActive: { type: "boolean" },
            fullName: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Document: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            filePath: { type: "string" },
            fileType: { type: "string" },
            fileSize: { type: "number" },
            createdBy: { type: "string" },
            isDeleted: { type: "boolean" },
            tags: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        DocumentVersion: {
          type: "object",
          properties: {
            _id: { type: "string" },
            documentId: { type: "string" },
            versionNumber: { type: "number" },
            filePath: { type: "string" },
            createdBy: { type: "string" },
            changeSummary: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        DocumentPermission: {
          type: "object",
          properties: {
            _id: { type: "string" },
            documentId: { type: "string" },
            userId: { type: "string" },
            permissionType: {
              type: "string",
              enum: ["read", "write", "admin"],
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        IngestionJob: {
          type: "object",
          properties: {
            _id: { type: "string" },
            documentId: { type: "string" },
            status: {
              type: "string",
              enum: ["pending", "processing", "completed", "failed"],
            },
            startedAt: { type: "string", format: "date-time" },
            completedAt: { type: "string", format: "date-time" },
            errorMessage: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js", "./swagger-docs/*.js"], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Function to setup our docs
const swaggerDocs = (app, port) => {
  // Route-Handler to visit our docs
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Document Management System API Documentation",
    })
  );

  // Make our docs in JSON format available
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(
    `📚 API Documentation available at http://localhost:${port}/api-docs`
  );
};

module.exports = { swaggerDocs };
