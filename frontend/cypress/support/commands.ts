// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/auth/login");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("eq", Cypress.config().baseUrl + "/documents");
});

// -- This is a child command --
Cypress.Commands.add(
  "uploadDocument",
  (filePath: string, title: string, description: string, tags: string) => {
    cy.get("button").contains("Upload Document").click();
    cy.get('input[type="file"]').selectFile(filePath, { force: true });
    cy.get('input[name="title"]').type(title);
    cy.get('textarea[name="description"]').type(description);
    cy.get('input[name="tags"]').type(tags);
    cy.get("button").contains("Upload").click();
    cy.contains("Document uploaded successfully").should("be.visible");
  }
);

// -- This is a dual command --
Cypress.Commands.add("searchDocuments", (searchTerm: string) => {
  cy.get('input[placeholder="Search documents..."]').clear().type(searchTerm);
  cy.get("button").contains("Search").click();
});

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      uploadDocument(
        filePath: string,
        title: string,
        description: string,
        tags: string
      ): Chainable<void>;
      searchDocuments(searchTerm: string): Chainable<void>;
    }
  }
}
