describe("Q&A Interface", () => {
  beforeEach(() => {
    // Login before each test
    cy.login("admin@example.com", "Password123!");
  });

  it("should navigate to Q&A page", () => {
    cy.visit("/");
    cy.contains("Q&A").click();

    cy.url().should("include", "/qa");
    cy.contains("Ask questions about your documents").should("be.visible");
  });

  it("should allow asking a question", () => {
    cy.visit("/qa");

    // Type a question
    cy.get('textarea[placeholder="Ask a question..."]').type(
      "What was the revenue for 2023?"
    );

    // Submit question
    cy.get("button").contains("Ask").click();

    // User message should be visible
    cy.contains("You").should("be.visible");
    cy.contains("What was the revenue for 2023?").should("be.visible");

    // Assistant should respond
    cy.contains("Assistant", { timeout: 10000 }).should("be.visible");
    cy.contains("The revenue for 2023").should("be.visible");
  });

  it("should show sources for answers", () => {
    cy.visit("/qa");

    // Type a question
    cy.get('textarea[placeholder="Ask a question..."]').type(
      "What was the revenue for 2023?"
    );

    // Submit question
    cy.get("button").contains("Ask").click();

    // Wait for response
    cy.contains("Assistant", { timeout: 10000 }).should("be.visible");

    // Click on sources
    cy.contains("Sources").click();

    // Source details should be visible
    cy.contains("Annual Report 2023").should("be.visible");
  });

  it("should show conversation history", () => {
    cy.visit("/qa");

    // Type and submit first question
    cy.get('textarea[placeholder="Ask a question..."]').type(
      "What was the revenue for 2023?"
    );
    cy.get("button").contains("Ask").click();

    // Wait for response
    cy.contains("Assistant", { timeout: 10000 }).should("be.visible");

    // Type and submit second question
    cy.get('textarea[placeholder="Ask a question..."]').type(
      "How does that compare to 2022?"
    );
    cy.get("button").contains("Ask").click();

    // Both questions should be in history
    cy.contains("What was the revenue for 2023?").should("be.visible");
    cy.contains("How does that compare to 2022?").should("be.visible");
  });

  it("should allow clearing conversation", () => {
    cy.visit("/qa");

    // Type and submit a question
    cy.get('textarea[placeholder="Ask a question..."]').type(
      "What was the revenue for 2023?"
    );
    cy.get("button").contains("Ask").click();

    // Wait for response
    cy.contains("Assistant", { timeout: 10000 }).should("be.visible");

    // Click clear conversation button
    cy.contains("Clear conversation").click();

    // Confirm clear
    cy.on("window:confirm", () => true);

    // Conversation should be cleared
    cy.contains("What was the revenue for 2023?").should("not.exist");
    cy.contains("Ask questions about your documents").should("be.visible");
  });
});
