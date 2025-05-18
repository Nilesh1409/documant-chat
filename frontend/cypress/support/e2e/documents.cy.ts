describe("Document Management", () => {
  beforeEach(() => {
    // Login before each test
    cy.login("admin@example.com", "Password123!");
  });

  it("should display documents list", () => {
    cy.visit("/documents");

    // Page title should be visible
    cy.contains("Documents").should("be.visible");

    // Document cards should be visible
    cy.get('[data-testid="document-card"]').should("have.length.at.least", 1);

    // Document titles should be visible
    cy.contains("Annual Report 2023").should("be.visible");
  });

  it("should allow uploading a new document", () => {
    cy.visit("/documents");

    // Create a test file
    cy.fixture("sample.pdf", "base64").then((fileContent) => {
      const fileName = "sample.pdf";
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName,
        mimeType: "application/pdf",
      });
    });

    // Click upload button
    cy.contains("Upload Document").click();

    // Fill out form
    cy.get('input[name="title"]').type("Test Document");
    cy.get('textarea[name="description"]').type("This is a test document");
    cy.get('input[name="tags"]').type("test, cypress");

    // Submit form
    cy.contains("Upload").click();

    // Success message should be visible
    cy.contains("Document uploaded successfully").should("be.visible");

    // New document should be in the list
    cy.contains("Test Document").should("be.visible");
  });

  it("should allow viewing document details", () => {
    cy.visit("/documents");

    // Click on a document
    cy.contains("Annual Report 2023").click();

    // Should navigate to document details page
    cy.url().should("include", "/documents/");

    // Document title should be visible
    cy.contains("Annual Report 2023").should("be.visible");

    // Document metadata should be visible
    cy.contains("Details").should("be.visible");
    cy.contains("Owner").should("be.visible");
    cy.contains("Created").should("be.visible");

    // Tabs should be visible
    cy.contains("Preview").should("be.visible");
    cy.contains("Versions").should("be.visible");
  });

  it("should allow downloading a document", () => {
    cy.visit("/documents");

    // Click on a document
    cy.contains("Annual Report 2023").click();

    // Click download button
    cy.contains("Download").click();

    // Download should start (can't verify actual download in Cypress)
    cy.contains("Downloading...").should("be.visible");
  });

  it("should allow searching for documents", () => {
    cy.visit("/documents");

    // Enter search term
    cy.get('input[placeholder="Search documents..."]').type("Annual");

    // Click search button
    cy.contains("Search").click();

    // Results should be filtered
    cy.contains("Annual Report 2023").should("be.visible");
    cy.contains("Project Proposal").should("not.exist");
  });

  it("should allow filtering documents by tag", () => {
    cy.visit("/documents");

    // Open tag dropdown
    cy.contains("Filter by tag").click();

    // Select a tag
    cy.contains("financial").click();

    // Results should be filtered
    cy.contains("Annual Report 2023").should("be.visible");
    cy.contains("Project Proposal").should("not.exist");
  });

  it("should allow editing document metadata", () => {
    cy.visit("/documents");

    // Find a document and click edit
    cy.contains("Annual Report 2023")
      .parent()
      .find("a")
      .contains("Edit")
      .click();

    // Should navigate to edit page
    cy.url().should("include", "/edit");

    // Update title
    cy.get('input[name="title"]').clear().type("Updated Annual Report 2023");

    // Update description
    cy.get('textarea[name="description"]').clear().type("Updated description");

    // Submit form
    cy.contains("Save Changes").click();

    // Success message should be visible
    cy.contains("Document updated successfully").should("be.visible");

    // Updated title should be visible
    cy.contains("Updated Annual Report 2023").should("be.visible");
  });

  it("should allow uploading a new version", () => {
    cy.visit("/documents");

    // Click on a document
    cy.contains("Annual Report 2023").click();

    // Click upload new version button
    cy.contains("Upload New Version").click();

    // Create a test file
    cy.fixture("sample.pdf", "base64").then((fileContent) => {
      const fileName = "sample.pdf";
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName,
        mimeType: "application/pdf",
      });
    });

    // Add change summary
    cy.get('textarea[name="changeSummary"]').type(
      "Updated content for testing"
    );

    // Submit form
    cy.contains("Upload").click();

    // Success message should be visible
    cy.contains("New version uploaded successfully").should("be.visible");

    // Click versions tab
    cy.contains("Versions").click();

    // New version should be in the list
    cy.contains("Updated content for testing").should("be.visible");
  });

  it("should allow deleting a document", () => {
    cy.visit("/documents");

    // Create a test document to delete
    cy.contains("Upload Document").click();
    cy.fixture("sample.pdf", "base64").then((fileContent) => {
      const fileName = "sample.pdf";
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName,
        mimeType: "application/pdf",
      });
    });
    cy.get('input[name="title"]').type("Document to Delete");
    cy.get('textarea[name="description"]').type(
      "This document will be deleted"
    );
    cy.get('input[name="tags"]').type("delete, test");
    cy.contains("Upload").click();

    // Find the document and click delete
    cy.contains("Document to Delete")
      .parent()
      .find("button")
      .contains("Delete")
      .click();

    // Confirm deletion
    cy.on("window:confirm", () => true);

    // Success message should be visible
    cy.contains("Document deleted successfully").should("be.visible");

    // Document should no longer be in the list
    cy.contains("Document to Delete").should("not.exist");
  });
});
