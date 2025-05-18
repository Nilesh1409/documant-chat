describe("Authentication", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should allow a user to register", () => {
    // Generate a unique email
    const email = `test-${Date.now()}@example.com`;

    // Navigate to register page
    cy.contains("Sign up").click();
    cy.url().should("include", "/auth/register");

    // Fill out registration form
    cy.get('input[name="firstName"]').type("Test");
    cy.get('input[name="lastName"]').type("User");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type("Password123!");
    cy.get('input[name="confirmPassword"]').type("Password123!");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should redirect to documents page
    cy.url().should("include", "/documents");

    // User should be logged in
    cy.contains("Test User").should("be.visible");
  });

  it("should allow a user to login", () => {
    // Navigate to login page
    cy.contains("Log in").click();
    cy.url().should("include", "/auth/login");

    // Fill out login form
    cy.get('input[name="email"]').type("admin@example.com");
    cy.get('input[name="password"]').type("Password123!");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should redirect to documents page
    cy.url().should("include", "/documents");

    // User should be logged in
    cy.contains("Admin User").should("be.visible");
  });

  it("should show error for invalid login", () => {
    // Navigate to login page
    cy.contains("Log in").click();

    // Fill out login form with invalid credentials
    cy.get('input[name="email"]').type("wrong@example.com");
    cy.get('input[name="password"]').type("WrongPassword");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.contains("Invalid credentials").should("be.visible");

    // Should stay on login page
    cy.url().should("include", "/auth/login");
  });

  it("should allow a user to logout", () => {
    // Login first
    cy.login("admin@example.com", "Password123!");

    // Click on user dropdown
    cy.contains("Admin User").click();

    // Click logout
    cy.contains("Log out").click();

    // Should redirect to home page
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Login button should be visible
    cy.contains("Log in").should("be.visible");
  });
});
