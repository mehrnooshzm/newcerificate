describe('Batch Download - Email Delivery', () => {
  beforeEach(() => {
    cy.env([
      'TEST_USER_WITH_DESIGN_EMAIL',
      'TEST_USER_WITH_DESIGN_PASSWORD',
    ]).then((envVars) => {
      const email =
        envVars?.TEST_USER_WITH_DESIGN_EMAIL ?? envVars?.[0];

      const password =
        envVars?.TEST_USER_WITH_DESIGN_PASSWORD ?? envVars?.[1];

      cy.session('batch-download-user', () => {
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

  it('batch_download_email_delivery_success', () => {
    // Mock batch export request
    cy.intercept('POST', '**/api/certificates/batch-export', {
      statusCode: 202,
      body: {
        success: true,
        jobId: 'test-job-123',
        status: 'queued',
        progress: 0,
        completed: 0,
        total: 3,
      },
    }).as('batchExport');

    // Mock progress polling
    let statusCallCount = 0;

    cy.intercept(
      'GET',
      '**/api/certificates/batch-export/test-job-123',
      (req) => {
        statusCallCount++;

        if (statusCallCount === 1) {
          req.reply({
            statusCode: 200,
            body: {
              success: true,
              status: 'processing',
              progress: 0,
              completed: 0,
              total: 3,
            },
          });
        } else if (statusCallCount === 2) {
          req.reply({
            statusCode: 200,
            body: {
              success: true,
              status: 'processing',
              progress: 66,
              completed: 2,
              total: 3,
            },
          });
        } else {
          req.reply({
            statusCode: 200,
            body: {
              success: true,
              status: 'completed',
              progress: 100,
              completed: 3,
              total: 3,
              downloadUrl: '/test-certificates.zip',
            },
          });
        }
      }
    ).as('batchExportStatus');

    // Mock ZIP download
    cy.intercept('GET', '/test-certificates.zip', {
      statusCode: 200,
      headers: {
        'content-type': 'application/zip',
      },
      body: 'test zip content',
    }).as('zipDownload');

    // Intercept EmailJS request
    cy.intercept('POST', '**/api.emailjs.com/**', {
      statusCode: 200,
      body: {
        status: 200,
        text: 'OK',
      },
    }).as('emailSend');

    // Open certificates page
    cy.visit('/dashboard/certificates');

    // Open first design
    cy.get('a[href^="/designs/"]')
      .filter((_, el) =>
        /\/designs\/[a-f0-9-]{36}$/.test(
          el.getAttribute('href')
        )
      )
      .first()
      .click();

    cy.url().should(
      'match',
      /\/designs\/[a-f0-9-]{36}/
    );

    // Make sure canvas is loaded
    cy.window().should((win) => {
      expect(
        win.canvasEditor,
        'canvasEditor exposed on window'
      ).to.exist;
    });

    // Open record selector
    cy.get('[data-cy="record-selector"]')
      .click({ force: true });

    // Select record 1
    cy.get('.dropdown-scroll input[type="checkbox"]')
      .eq(1)
      .check({ force: true });

    // Select record 2
    cy.get('.dropdown-scroll input[type="checkbox"]')
      .eq(2)
      .check({ force: true });

    // Select record 3
    cy.get('.dropdown-scroll input[type="checkbox"]')
      .eq(3)
      .check({ force: true });

    // Verify records are selected
    cy.get('.dropdown-scroll input[type="checkbox"]')
      .eq(1)
      .should('be.checked');

    cy.get('.dropdown-scroll input[type="checkbox"]')
      .eq(2)
      .should('be.checked');

    cy.get('.dropdown-scroll input[type="checkbox"]')
      .eq(3)
      .should('be.checked');

    // Click PDF ZIP
    cy.get('button[aria-label="Export as PDF"]')
      .should('be.visible')
      .click();

    // Progress tracker should appear
    cy.contains('Processing certificates')
      .should('be.visible');

    // Verify batch export request
    cy.wait('@batchExport').then((interception) => {
      expect(interception.response?.statusCode).to.eq(202);

      expect(interception.response?.body)
        .to.have.property('success', true);

      expect(interception.response?.body)
        .to.have.property('jobId')
        .that.is.a('string')
        .and.not.be.empty;
    });

    // Wait for ZIP download
    cy.wait('@zipDownload')
      .its('response.statusCode')
      .should('eq', 200);

    // EmailJS should be called after ZIP download
    cy.wait('@emailSend')
      .its('response.statusCode')
      .should('eq', 200);

    // Success popup should appear
    cy.contains('Certificates Generated Successfully')
      .should('be.visible');

    // Verify email success message
    cy.contains('A download link has also been sent to your email.')
      .should('be.visible');

    // Verify Copy Link and Close buttons
    cy.contains('Copy Link')
      .should('be.visible');

    cy.contains('Close')
      .should('be.visible');
  });
});

