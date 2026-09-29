describe('Design Editor - Sidebar Collapses and Toggles on Mobile', () => {
  beforeEach(() => {
    cy.env([
      'TEST_USER_WITH_DESIGN_EMAIL',
      'TEST_USER_WITH_DESIGN_PASSWORD',
    ]).then((envVars) => {
      const email =
        envVars?.TEST_USER_WITH_DESIGN_EMAIL ?? envVars?.[0];

      const password =
        envVars?.TEST_USER_WITH_DESIGN_PASSWORD ?? envVars?.[1];

      cy.session('mobile-sidebar-user', () => {
        cy.visit('/login');

        cy.get('input[placeholder="Email"]').type(email);

        cy.get('input[placeholder="Password"]').type(password, {
          log: false,
        });

        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/dashboard');
      });

      cy.visit('/dashboard');
    });
  });

  it('sidebar_collapses_and_toggles_on_mobile', () => {
    // GIVEN: The user is navigating the application on a mobile device.
    cy.viewport('iphone-x');

    // NOTE: The app doesn't expose a standalone "/design" route — the
    // certificate editor lives at /designs/new (or /designs/:id). Visit
    // the new-design route, which is the actual editor entry point.
    cy.visit('/designs/new');

    cy.window().should((win) => {
      expect(win.canvasEditor, 'canvasEditor exposed on window').to.exist;
    });

    // The main toolbox sidebar is collapsed off-screen by default on
    // mobile widths (translated fully out of view via -translate-x-full).
    cy.contains('span', 'Page Settings')
      .closest('div[class*="translate-x"]')
      .as('sidebarPanel')
      .should('have.class', '-translate-x-full');

    // The hamburger menu icon should be visible for toggling navigation.
    cy.get('button[aria-label="Open sidebar"]')
      .should('be.visible')
      .and('have.attr', 'aria-expanded', 'false');

    // Click the hamburger menu icon.
    cy.get('button[aria-label="Open sidebar"]').click();

    // The sidebar slides in and becomes visible for navigation.
    cy.get('button[aria-label="Open sidebar"]').should(
      'have.attr',
      'aria-expanded',
      'true'
    );

    cy.get('@sidebarPanel').should('have.class', 'translate-x-0');
    cy.contains('span', 'Page Settings').should('be.visible');
  });
});
