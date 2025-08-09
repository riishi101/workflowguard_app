/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(email: string, password: string): Chainable<void>
    selectWorkflow(workflowIndex: number): Chainable<void>
    startProtection(): Chainable<void>
  }
}
