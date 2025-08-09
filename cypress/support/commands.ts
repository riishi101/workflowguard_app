// ***********************************************
// This command file contains reusable custom commands
// ***********************************************

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('selectWorkflow', (workflowIndex: number) => {
  cy.visit('/workflows/select');
  cy.get('[data-testid="workflow-item"]').eq(workflowIndex).within(() => {
    cy.get('[data-testid="protect-checkbox"]').check();
  });
});

Cypress.Commands.add('startProtection', () => {
  cy.get('[data-testid="start-protection-button"]').click();
  cy.get('[data-testid="protection-status"]').should('contain', 'Protected');
});
