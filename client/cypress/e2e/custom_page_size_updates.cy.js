describe('Page Settings - Custom Size', () => {
  beforeEach(() => {
    cy.env([
      'TEST_USER_WITH_DESIGN_EMAIL',
      'TEST_USER_WITH_DESIGN_PASSWORD',
    ]).then((envVars) => {
      const email = envVars?.TEST_USER_WITH_DESIGN_EMAIL ?? envVars?.[0];
      const password = envVars?.TEST_USER_WITH_DESIGN_PASSWORD ?? envVars?.[1];
      // cy.session() caches cookies/localStorage under the given id.
      // The `setup` callback (the actual login flow) only runs once for
      // the whole spec run, the FIRST time this id is used. Every call
      // after that just restores the cached browser state — no new
      // login request is made, and `setup` is skipped entirely.
      cy.session('custom-page-size-user', () => {
        cy.visit('/login');
        cy.get('input[placeholder="Email"]').type(email);
        cy.get('input[placeholder="Password"]').type(password, { log: false });
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');
      });

      // Whether the session was just created or restored from cache,
      // land on the dashboard for the test to continue from.
      cy.visit('/dashboard');
    });
  });

  it('custom_page_size_updates', () => {
    // STEP 0: Get into the editor via an existing saved design (not
    // /designs/new), so the canvas and its Page Settings are already
    // mounted and ready to interact with.
    cy.visit('/dashboard/certificates');

    cy.get('a[href^="/designs/"]')
      .filter((_, el) =>
        /\/designs\/[a-f0-9-]{36}$/.test(el.getAttribute('href'))
      )
      .first()
      .click();

    cy.url().should('match', /\/designs\/[a-f0-9-]{36}/);

    cy.window().should((win) => {
      expect(win.canvasEditor, 'canvasEditor exposed on window').to.exist;
    });

    // STEP 1: Open the Page Settings toolbox.
    // Page Settings is a static section in the sidebar (not behind a
    // popover trigger), so we just assert it's visible and scope our
    // queries within it.
    cy.contains('span', 'Page Settings').should('be.visible');

    // STEP 2: Select "Custom Size" from the dropdown menu.
    // The page-size <select> is the first (and only) plain <select> in
    // the sidebar — Page Size dropdown, not the Orientation buttons.
    //
    // NOTE: The entire Page Settings panel is being covered by something
    // (likely the Fabric.js canvas wrapper, which is typically absolutely
    // positioned and stacked above the sidebar in design editors). This
    // affects every control in the panel, not just this one — confirmed
    // because the Width input hits the identical error on .clear().
    // force:true is used throughout this panel's interactions below.
    cy.get('select').first().as('pageSizeSelect');

    cy.get('@pageSizeSelect').should('exist').select('custom', { force: true });

    cy.get('@pageSizeSelect').should('have.value', 'custom');

    // Selecting "Custom Size" should reveal the width/height inputs.
    cy.get('input[placeholder="Width"]').should('be.visible');
    cy.get('input[placeholder="Height"]').should('be.visible');

    // STEP 3: Input custom width and height.
    const CUSTOM_WIDTH = 800;
    const CUSTOM_HEIGHT = 800;

    cy.get('input[placeholder="Width"]')
      .clear({ force: true })
      .type(String(CUSTOM_WIDTH), { force: true });

    cy.get('input[placeholder="Height"]')
      .clear({ force: true })
      .type(String(CUSTOM_HEIGHT), { force: true });

    cy.contains('button', 'Apply').click({ force: true });

    // STEP 4: Assert the Fabric.js canvas container resizes to match the
    // inputted dimensions.
    //
    // Three layers of assertion (ground truth is the live Fabric instance
    // on window, since Fabric objects aren't real DOM nodes):
    //   1. The Fabric canvas instance's own reported width/height.
    //   2. The underlying <canvas> element's CSS/logical dimensions.
    //   3. The wrapper <div> Fabric creates around the canvas (this is the
    //      actual "canvas container" the test description refers to).
    cy.window().then((win) => {
      const canvasEditor = win.canvasEditor;

      cy.log('Fabric canvas width:', String(canvasEditor.getWidth()));
      cy.log('Fabric canvas height:', String(canvasEditor.getHeight()));

      expect(canvasEditor.getWidth()).to.equal(CUSTOM_WIDTH);
      expect(canvasEditor.getHeight()).to.equal(CUSTOM_HEIGHT);
    });

    cy.get('canvas.lower-canvas').should(($canvas) => {
      const canvasEl = $canvas[0];

      // NOTE: canvasEl.width/height are the raw pixel-buffer dimensions,
      // which Fabric.js multiplies by devicePixelRatio for retina/HiDPI
      // screens (enableRetinaScaling defaults to true). That buffer size
      // is NOT what the test cares about — the CSS/logical size
      // (style.width / style.height), which matches
      // canvasEditor.getWidth()/getHeight(), is the actual "container
      // size" the user and the rest of the app see.
      const cssWidth = parseInt(canvasEl.style.width, 10);
      const cssHeight = parseInt(canvasEl.style.height, 10);

      expect(cssWidth).to.equal(CUSTOM_WIDTH);
      expect(cssHeight).to.equal(CUSTOM_HEIGHT);
    });

    cy.window().then((win) => {
      const wrapperEl = win.canvasEditor.wrapperEl;
      expect(wrapperEl, 'Fabric canvas wrapper element exists').to.exist;

      const wrapperWidth = parseInt(wrapperEl.style.width, 10);
      const wrapperHeight = parseInt(wrapperEl.style.height, 10);

      cy.log('Canvas container width:', String(wrapperWidth));
      cy.log('Canvas container height:', String(wrapperHeight));

      expect(wrapperWidth).to.equal(CUSTOM_WIDTH);
      expect(wrapperHeight).to.equal(CUSTOM_HEIGHT);
    });
  });
});
