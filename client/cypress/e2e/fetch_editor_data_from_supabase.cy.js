describe('Editor Data Source', () => {
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
      // login request is made, and `setup` is skipped entirely. This is
      // why the Supabase-vs-Firebase assertion below only needs to
      // (and only does) run once, even though beforeEach calls
      // cy.session() before every test.
      cy.session('editor-data-source-user', () => {
        // Intercept BEFORE triggering login, since the session/user
        // request fires directly from the client to Supabase as part
        // of the login flow (confirmed via network inspection: a
        // direct `fetch` to
        // `supabase.co/rest/v1/users?select=*&id=eq.<uid>`). This is
        // the one place in the app where the browser talks to
        // Supabase directly — everything else (designs, templates)
        // goes through our own backend at /api/designs, which Cypress
        // cannot observe as a direct-to-Supabase call.
        cy.intercept('GET', '**/rest/v1/users**').as('fetchUserSession');

        cy.visit('/login');
        cy.get('input[placeholder="Email"]').type(email);
        cy.get('input[placeholder="Password"]').type(password, { log: false });
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');

        // Assert this session-fetching request went to Supabase's
        // PostgREST endpoint, not Firebase — this is the actual
        // client-observable "Supabase, not Firebase" check the
        // original spec was after. Because this whole callback only
        // runs on the one real login of the suite, this assertion
        // effectively runs exactly once too.
        cy.wait('@fetchUserSession', { timeout: 10000 }).then(
          ({ request, response }) => {
            cy.log('Session request URL:', request.url);
            expect(request.url).to.include('supabase.co/rest/v1/');
            expect(request.url).to.not.include('firebaseio.com');
            expect(response.statusCode).to.eq(200);
          }
        );
      });

      // Whether the session was just created or restored from cache,
      // land on the dashboard for the test to continue from.
      cy.visit('/dashboard');
    });
  });

  it('fetch_editor_data_from_supabase', () => {
    // STEP 1-3: Fetch the designs list from our backend, and confirm
    // the backend itself sourced the data from Supabase (not Firebase).
    //
    // NOTE: visiting the editor page directly (/designs/:id) does NOT
    // fire its own network request — the editor reads the design data
    // that's already in front-end state/cache from this designs-list
    // fetch. So the Supabase-vs-Firebase check has to happen here,
    // against /api/designs, since that's the actual request that
    // supplies the editor's data. There is nothing to intercept once
    // we're on the editor page itself.
    cy.intercept('GET', '**/api/designs').as('fetchDesigns');

    cy.visit('/dashboard/certificates');

    // 304 (Not Modified) is a valid, successful outcome when the browser
    // already has a cached copy — it is not an error, so both 200 and 304
    // are accepted here.
    cy.wait('@fetchDesigns', { timeout: 10000 }).then(
      ({ request, response }) => {
        cy.log('Actual request URL:', request.url);
        cy.log('Status code:', String(response?.statusCode));

        expect([200, 304]).to.include(response.statusCode);
        expect(response.body).to.exist;

        // Backend-set header confirming this list was read from Supabase
        // (set only after a successful supabaseAdmin call — see
        // designsController.js getAllDesigns). Requires
        // exposedHeaders: ['X-Data-Source'] in the backend's CORS config,
        // otherwise the browser hides custom headers on cross-origin
        // responses.
        expect(response.headers['x-data-source']).to.eq('supabase');
      }
    );

    // STEP 4: Open a saved design and confirm its saved font/color
    // populate the editor UI.
    //
    // CertificateItem renders <Link to={`/designs/${id}`}> for each existing
    // design. Exclude the "create new" link (/designs/new) by matching only
    // hrefs that end in a UUID.
    cy.get('a[href^="/designs/"]')
      .filter((_, el) =>
        /\/designs\/[a-f0-9-]{36}$/.test(el.getAttribute('href'))
      )
      .first()
      .click();

    cy.url().should('match', /\/designs\/[a-f0-9-]{36}/);

    // Wait for the canvas to finish loading/rendering objects from the
    // saved design JSON (async, separate from the designs list fetch
    // above), then select the existing text object. FontFamily and
    // FillColor both sync their local state from `activeObject` via
    // useEffect, so the object's OWN saved fontFamily/fill is our ground
    // truth here.
    cy.window().should((win) => {
      expect(win.canvasEditor, 'canvasEditor exposed on window').to.exist;
      expect(
        win.canvasEditor.getObjects().length,
        'canvas has loaded at least one object'
      ).to.be.greaterThan(0);
    });

    cy.window().then((win) => {
      const allObjects = win.canvasEditor.getObjects();

      cy.log('Canvas object count:', String(allObjects.length));
      cy.log('Canvas object types:', allObjects.map((o) => o.type).join(', '));

      // Match case-insensitively and by substring, since Fabric.js has
      // been inconsistent across contexts about 'i-text' vs 'IText'.
      const textObject = allObjects.find(
        (obj) =>
          typeof obj.type === 'string' &&
          obj.type.toLowerCase().includes('text')
      );

      expect(textObject, 'a text object exists on the saved design').to.exist;

      cy.log('Saved fontFamily:', String(textObject.fontFamily));
      cy.log('Saved fill (normalized):', normalizeColor(textObject.fill));

      cy.wrap(textObject.fontFamily).as('savedFontFamily');
      cy.wrap(normalizeColor(textObject.fill)).as('savedColorRgb');

      // Prefer a real click on the canvas over firing selection:created
      // manually, so we exercise the actual selection handler the user
      // path relies on. Fall back to programmatic selection only if
      // bounding-rect info isn't available.
      const canvasEl =
        win.canvasEditor.upperCanvasEl || win.canvasEditor.getElement?.();

      if (canvasEl && typeof textObject.getBoundingRect === 'function') {
        const rect = textObject.getBoundingRect();
        const cx = rect.left + rect.width / 2;
        const cyPos = rect.top + rect.height / 2;
        cy.wrap(canvasEl).click(cx, cyPos);
      } else {
        win.canvasEditor.setActiveObject(textObject);
        win.canvasEditor.fire('selection:created', { selected: [textObject] });
      }
    });

    // Assert the selected text's saved font/color populate the
    // Text Settings panel (font-select / text-color-trigger).
    cy.get('@savedFontFamily').then((savedFontFamily) => {
      cy.get('[data-cy="font-select"]').should('contain.text', savedFontFamily);
    });

    cy.get('@savedColorRgb').then((savedRgb) => {
      // data-cy="fill-color-trigger" lives directly on the PopoverTrigger
      // element that has the backgroundColor style — no need to drill
      // into a child selector.
      cy.get('[data-cy="fill-color-trigger"]').then(($el) => {
        const bg = $el.css('background-color');
        const normalizedActual = normalizeColor(bg);
        cy.log('Actual background-color CSS:', bg);
        cy.log('Normalized actual:', normalizedActual);
        expect(normalizedActual).to.eq(savedRgb);
      });
    });
  });
});

// Normalizes hex (#rrggbb / #rgb) or rgb(a)(...) strings into a canonical
// "r,g,b" form so comparisons don't silently no-op when formats differ
// (e.g. saved fill is hex but computed CSS background-color is rgb()).
function normalizeColor(color) {
  if (!color || typeof color !== 'string') return '';

  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r},${g},${b}`;
  }

  const match = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return match ? `${match[1]},${match[2]},${match[3]}` : '';
}
