/// <reference types="cypress" />

describe('Workflow Protection', () => {
  beforeEach(() => {
    // Perform login before each test
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('testpassword');
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for login to complete and redirect
    cy.url().should('include', '/dashboard');
  });

  it('should protect a workflow successfully', () => {
    // Navigate to workflow selection
    cy.visit('/workflows/select');
    
    // Select a workflow
    cy.get('[data-testid="workflow-item"]').first().within(() => {
      cy.get('[data-testid="protect-checkbox"]').check();
    });

    // Start protection process
    cy.get('[data-testid="start-protection-button"]').click();

    // Verify protection started
    cy.get('[data-testid="protection-status"]').should('contain', 'Protected');
    
    // Verify version was created
    cy.get('[data-testid="version-list"]').should('exist');
    cy.get('[data-testid="version-item"]').should('have.length.at.least', 1);
  });

  it('should handle protection errors gracefully', () => {
    // Navigate to workflow selection
    cy.visit('/workflows/select');
    
    // Select an invalid workflow (you'll need to set up this test data)
    cy.get('[data-testid="invalid-workflow-item"]').within(() => {
      cy.get('[data-testid="protect-checkbox"]').check();
    });

    // Try to start protection
    cy.get('[data-testid="start-protection-button"]').click();

    // Verify error message
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to protect workflow');
  });

  it('should enforce plan limits on workflow protection', () => {
    // Navigate to workflow selection with a starter plan (limited to 10 workflows)
    cy.visit('/workflows/select');
    
    // Try to select more than allowed workflows
    for (let i = 0; i < 11; i++) {
      cy.get('[data-testid="workflow-item"]').eq(i).within(() => {
        cy.get('[data-testid="protect-checkbox"]').check();
      });
    }

    // Verify plan limit warning
    cy.get('[data-testid="plan-limit-warning"]').should('be.visible');
    cy.get('[data-testid="plan-limit-warning"]').should('contain', 'Upgrade your plan');
    
    // Verify protection button is disabled
    cy.get('[data-testid="start-protection-button"]').should('be.disabled');
  });

  it('should show workflow details after protection', () => {
    // Start with a protected workflow
    cy.visit('/workflows/protected');
    
    // Click on a protected workflow
    cy.get('[data-testid="protected-workflow-item"]').first().click();
    
    // Verify workflow details are shown
    cy.get('[data-testid="workflow-name"]').should('be.visible');
    cy.get('[data-testid="protection-status"]').should('contain', 'Protected');
    cy.get('[data-testid="version-history"]').should('exist');
    cy.get('[data-testid="audit-log"]').should('exist');
  });

  it('should allow workflow version restoration', () => {
    // Navigate to a protected workflow with versions
    cy.visit('/workflows/protected');
    cy.get('[data-testid="protected-workflow-item"]').first().click();
    
    // Go to version history
    cy.get('[data-testid="version-history-tab"]').click();
    
    // Select a version to restore
    cy.get('[data-testid="version-item"]').first().within(() => {
      cy.get('[data-testid="restore-button"]').click();
    });
    
    // Confirm restoration
    cy.get('[data-testid="confirm-restore-button"]').click();
    
    // Verify restoration success
    cy.get('[data-testid="success-message"]').should('contain', 'Version restored successfully');
    cy.get('[data-testid="version-list"]').should('contain', 'Restored from version');
  });
});
