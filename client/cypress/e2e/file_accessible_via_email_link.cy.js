describe('Batch Download - File Accessible via Email Link', () => {
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

  it('file_accessible_via_email_link', () => {
    const downloadUrl =
      'https://mnaibbkeljjobzecnsrk.supabase.co/storage/v1/object/sign/certificates/test-certificates.zip?token=test-token';

    // Mock batch export request
    cy.intercept('POST', '**/api/certificates/batch-export', {
      statusCode: 202,
      body: {
        success: true,
        jobId: 'test-job-456',
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
      '**/api/certificates/batch-export/test-job-456',
      (req) => {
        statusCallCount++;

        if (statusCallCount < 2) {
          req.reply({
            statusCode: 200,
            body: {
              success: true,
              status: 'processing',
              progress: 50,
              completed: 1,
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
              downloadUrl,
            },
          });
        }
      }
    ).as('batchExportStatus');

    // Intercept the ZIP download
    cy.intercept(
      'GET',
      'https://mnaibbkeljjobzecnsrk.supabase.co/storage/**',
      {
        statusCode: 200,
        headers: {
          'content-type': 'application/zip',
        },
        body: 'test zip content',
      }
    ).as('supabaseDownload');

    // Intercept EmailJS
cy.intercept(
  'POST',
  'https://api.emailjs.com/api/v1.0/email/send',
  (req) => {
    // Verify expected email information
    expect(req.body).to.have.property('template_params');
    expect(req.body.template_params).to.have.property(
      'certificate_count',
      3
    );
    expect(req.body.template_params).to.have.property(
      'download_url',
      downloadUrl
    );

    req.reply({
      statusCode: 200,
      body: {
        status: 200,
        text: 'OK',
      },
    });
  }
).as('emailSend');

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

    // Select 3 records
    cy.get('.dropdown-scroll input[type="checkbox"]')
      .eq(1)
      .check({ force: true });

    cy.get('.dropdown-scroll input[type="checkbox"]')
      .eq(2)
      .check({ force: true });

    cy.get('.dropdown-scroll input[type="checkbox"]')
      .eq(3)
      .check({ force: true });

    // Verify all 3 records are selected
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

    // Verify batch export request
    cy.wait('@batchExport')
      .its('response.statusCode')
      .should('eq', 202);

    // Wait for Supabase ZIP download
    cy.wait('@supabaseDownload')
      .its('response.statusCode')
      .should('eq', 200);

    // Verify EmailJS request
    cy.wait('@emailSend')
      .its('response.statusCode')
      .should('eq', 200);

    // Verify success popup
    cy.contains('Certificates Generated Successfully')
      .should('be.visible');

    // Verify email success message
    cy.contains(
      'A download link has also been sent to your email.'
    ).should('be.visible');
  });
});
