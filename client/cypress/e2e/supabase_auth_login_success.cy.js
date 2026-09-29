describe('Supabase Auth Login', () => {
  it('supabase_auth_login_success', () => {
    cy.env(['TEST_USER_EMAIL', 'TEST_USER_PASSWORD']).then((envVars) => {
      const email = envVars?.TEST_USER_EMAIL ?? envVars?.[0];
      const password = envVars?.TEST_USER_PASSWORD ?? envVars?.[1];

      // Intercept BEFORE triggering login, since the auth request fires
      // directly from the client to Supabase's GoTrue endpoint as part of
      // the login flow (grant_type=password against
      // supabase.co/auth/v1/token). This is distinct from the
      // rest/v1/users session-fetch that happens after auth succeeds —
      // here we only care about the auth call itself.
      cy.intercept('POST', '**/auth/v1/token**').as('supabaseLogin');

      // STEP 1: Visit the login page.
      cy.visit('/login');

      // STEP 2: Enter the user's email and password.
      cy.get('input[placeholder="Email"]').type(email);
      cy.get('input[placeholder="Password"]').type(password, { log: false });

      // STEP 3: Click "Login".
      cy.get('button[type="submit"]').click();

      // STEP 4: Assert the network request to Supabase Auth returns 200 OK.
      cy.wait('@supabaseLogin', { timeout: 10000 }).then(
        ({ request, response }) => {
          cy.log('Auth request URL:', request.url);
          cy.log('Status code:', String(response?.statusCode));

          expect(request.url).to.include('supabase.co/auth/v1/token');
          expect(response.statusCode).to.eq(200);

          // Sanity check that this really is a Supabase auth session
          // response (access token + token type), not some other
          // provider's payload shape.
          expect(response.body).to.have.property('access_token');
          expect(response.body.token_type).to.eq('bearer');
        }
      );

      // STEP 5: Assert the user is redirected to /dashboard.
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });
  });
});
