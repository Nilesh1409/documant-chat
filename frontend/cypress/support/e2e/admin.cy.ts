describe("Admin Dashboard", () => {
  beforeEach(() => {
    // Login as admin
    cy.login("admin@example.com", "Password123!");
  });

  it("should navigate to admin dashboard", () => {
    cy.visit("/");
    cy.contains("Admin").click();

    cy.url().should("include", "/admin");
    cy.contains("Admin Dashboard").should("be.visible");
  });

  it("should display users list", () => {
    cy.visit("/admin/users");

    // Page title should be visible
    cy.contains("User Management").should("be.visible");

    // User table should be visible
    cy.get("table").should("be.visible");
    cy.contains("Email").should("be.visible");
    cy.contains("Role").should("be.visible");
    cy.contains("Status").should("be.visible");

    // At least one user should be in the table
    cy.get("table tbody tr").should("have.length.at.least", 1);
  });

  it("should allow creating a new user", () => {
    cy.visit("/admin/users");

    // Click add user button
    cy.contains("Add User").click();

    // Fill out form
    const email = `new-user-${Date.now()}@example.com`;
    cy.get('input[name="firstName"]').type("New");
    cy.get('input[name="lastName"]').type("User");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type("Password123!");

    // Select role
    cy.get('select[name="role"]').select("editor");

    // Submit form
    cy.contains("Create User").click();

    // Success message should be visible
    cy.contains("User created successfully").should("be.visible");

    // New user should be in the table
    cy.contains(email).should("be.visible");
  });

  it("should allow editing a user", () => {
    cy.visit("/admin/users");

    // Find a user and click edit
    cy.contains("viewer@example.com")
      .parent()
      .parent()
      .find("button")
      .contains("Edit")
      .click();

    // Update role
    cy.get('select[name="role"]').select("editor");

    // Submit form
    cy.contains("Save Changes").click();

    // Success message should be visible
    cy.contains("User updated successfully").should("be.visible");

    // Updated role should be visible
    cy.contains("viewer@example.com")
      .parent()
      .parent()
      .contains("Editor")
      .should("be.visible");
  });

  it("should display documents overview", () => {
    cy.visit("/admin/documents");

    // Page title should be visible
    cy.contains("Document Overview").should("be.visible");

    // Document stats should be visible
    cy.contains("Total Documents").should("be.visible");
    cy.contains("Documents by Type").should("be.visible");

    // Document table should be visible
    cy.get("table").should("be.visible");
    cy.contains("Title").should("be.visible");
    cy.contains("Owner").should("be.visible");
    cy.contains("Created").should("be.visible");

    // At least one document should be in the table
    cy.get("table tbody tr").should("have.length.at.least", 1);
  });

  it("should display ingestion jobs", () => {
    cy.visit("/admin/ingestion");

    // Page title should be visible
    cy.contains("Ingestion Monitor").should("be.visible");

    // Job stats should be visible
    cy.contains("Total Jobs").should("be.visible");
    cy.contains("Completed").should("be.visible");
    cy.contains("In Progress").should("be.visible");
    cy.contains("Failed").should("be.visible");

    // Job table should be visible
    cy.get("table").should("be.visible");
    cy.contains("Document").should("be.visible");
    cy.contains("Status").should("be.visible");
    cy.contains("Started").should("be.visible");

    // At least one job should be in the table
    cy.get("table tbody tr").should("have.length.at.least", 1);
  });
});
