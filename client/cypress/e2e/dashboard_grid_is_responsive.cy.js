describe('Dashboard - Responsive Certificate Grid', () => {
  // Mock certificates so the grid always renders enough cards to prove
  // multi-column vs single-column layout, regardless of DB state.
  const mockDesigns = Array.from({ length: 6 }, (_, i) => ({
    id: `11111111-1111-1111-1111-11111111111${i}`,
    name: `Certificate ${i + 1}`,
    designPreview: { url: '/images/logos/logo.png' },
  }));

  beforeEach(() => {
    cy.env(['TEST_USER_WITH_DESIGN_EMAIL', 'TEST_USER_WITH_DESIGN_PASSWORD']).then(
      (envVars) => {
        const email =
          envVars?.TEST_USER_WITH_DESIGN_EMAIL ?? envVars?.[0];

        const password =
          envVars?.TEST_USER_WITH_DESIGN_PASSWORD ?? envVars?.[1];

        cy.session('dashboard-grid-user', () => {
          cy.visit('/login');

          cy.get('input[placeholder="Email"]').type(email);

          cy.get('input[placeholder="Password"]').type(password, {
            log: false,
          });

          cy.get('button[type="submit"]').click();

          cy.url().should('include', '/dashboard');
        });

        cy.visit('/dashboard');
      }
    );
  });

  it('dashboard_grid_is_responsive', () => {
    // Mock the designs API so the dashboard always has multiple
    // certificate cards to lay out, independent of real user data.
    cy.intercept('GET', '**/api/designs', mockDesigns).as('getDesigns');

    cy.visit('/dashboard/certificates');

    cy.wait('@getDesigns');

    // Certificate cards are the "Create New" card plus one link per
    // design, all pointing to /designs/<id>.
    const getCards = () => cy.get('a[href^="/designs/"]');

    // STEP 1: Desktop viewport - cards should form a multi-column grid.
    cy.viewport('macbook-15');

    getCards().should('have.length', mockDesigns.length + 1);

    getCards().then(($cards) => {
      const tops = [...$cards].map((el) => el.getBoundingClientRect().top);

      // In a multi-column layout, at least the first two cards share
      // the same row (same top offset).
      const uniqueTops = new Set(tops);
      expect(uniqueTops.size).to.be.lessThan(tops.length);
    });

    // STEP 2: Mobile viewport - cards should stack in a single column.
    cy.viewport('iphone-x');

    getCards().then(($cards) => {
      const tops = [...$cards].map((el) => el.getBoundingClientRect().top);

      // In a single-column layout, every card sits on its own row, so
      // all top offsets are unique.
      const uniqueTops = new Set(tops);
      expect(uniqueTops.size).to.equal(tops.length);
    });

    // No horizontal scrolling should be introduced at mobile width.
    cy.document().then((doc) => {
      expect(doc.documentElement.scrollWidth).to.be.at.most(
        doc.documentElement.clientWidth
      );
    });
  });
});
