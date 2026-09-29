describe('Design Editor - Responsive Preview on Tablet', () => {
  beforeEach(() => {
    cy.env([
      'TEST_USER_WITH_DESIGN_EMAIL',
      'TEST_USER_WITH_DESIGN_PASSWORD',
    ]).then((envVars) => {
      const email =
        envVars?.TEST_USER_WITH_DESIGN_EMAIL ?? envVars?.[0];

      const password =
        envVars?.TEST_USER_WITH_DESIGN_PASSWORD ?? envVars?.[1];

      cy.session('tablet-preview-user', () => {
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

  it('canvas_editor_provides_responsive_preview_on_tablet', () => {
    // Simulate an instructor opening the editor on a tablet.
    cy.viewport('ipad-2');

    // NOTE: The app doesn't expose a standalone "/editor" route — the
    // certificate editor lives at /designs/new (or /designs/:id). Visit
    // the new-design route, which is the actual editor entry point.
    cy.visit('/designs/new');

    cy.window().should((win) => {
      expect(win.canvasEditor, 'canvasEditor exposed on window').to.exist;
    });

    // Before entering preview, the editing chrome (left toolbox, right
    // properties panel, sidebar toggles) should be present.
    cy.contains('span', 'Page Settings').should('be.visible');
    cy.get('button[aria-label="Open sidebar"]').should('exist');
    cy.get('button[aria-label="Open properties"]').should('exist');

    // STEP 1: The "Quick Preview" button should be visible on a tablet
    // viewport (it's hidden on desktop/xl widths).
    cy.get('button[aria-label="Quick preview"]')
      .should('be.visible')
      .and('have.attr', 'aria-pressed', 'false')
      .click();

    // STEP 2: The editor should now be in preview mode - full-screen
    // certificate rendering, with the complex editing controls hidden.
    cy.get('button[aria-label="Exit preview"]')
      .should('be.visible')
      .and('have.attr', 'aria-pressed', 'true');

    // Sidebar editing controls are removed from the DOM while previewing.
    cy.contains('span', 'Page Settings').should('not.exist');
    cy.get('button[aria-label="Open sidebar"]').should('not.exist');
    cy.get('button[aria-label="Open properties"]').should('not.exist');

    // The certificate canvas itself remains rendered and visible.
    cy.get('canvas').should('be.visible');
  });
});
