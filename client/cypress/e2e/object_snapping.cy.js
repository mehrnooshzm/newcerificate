describe('Object Snapping', () => {
  beforeEach(() => {
    cy.env([
      'TEST_USER_WITH_DESIGN_EMAIL',
      'TEST_USER_WITH_DESIGN_PASSWORD',
    ]).then((envVars) => {
      const email = envVars?.TEST_USER_WITH_DESIGN_EMAIL ?? envVars?.[0];
      const password = envVars?.TEST_USER_WITH_DESIGN_PASSWORD ?? envVars?.[1];

      cy.session('object-snapping-user', () => {
        cy.visit('/login');
        cy.get('input[placeholder="Email"]').type(email);
        cy.get('input[placeholder="Password"]').type(password, { log: false });
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');
      });

      cy.visit('/dashboard');
    });
  });

  it('object_snapping', () => {
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

    // Open the Shapes toolbox and add two shapes to the canvas
    cy.contains('span', 'Shapes').should('be.visible');
    cy.get('[data-cy="toolbox-shapes-trigger"]')
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true });

    // Add a square and a circle to the canvas
    cy.get('[data-cy="shape-square"]')
      .should('be.visible')
      .click({ force: true });
    cy.get('[data-cy="shape-circle"]')
      .should('be.visible')
      .click({ force: true });

    cy.window().then((win) => {
      const canvas = win.canvasEditor;

      const objects = canvas
        .getObjects()
        .filter(
          (obj) =>
            !obj.id?.startsWith('alignment-guide-') &&
            typeof obj.type === 'string' &&
            ['rect', 'circle', 'triangle'].includes(obj.type)
        );

      expect(
        objects.length,
        'only the two added shape objects remain'
      ).to.be.at.least(2);

      const moving = objects[0];
      const target = objects[1];

      //Move the first object away from the second object.
      //The objects are initially created in the same position, so we need to separate them
      //before testing snapping.

      moving.set({
        left: 100,
        top: 140,
      });

      moving.setCoords();
      canvas.setActiveObject(moving);
      canvas.requestRenderAll();

      target.setCoords();

      const originalGetScenePoint = canvas.getScenePoint.bind(canvas);
      const movingCenterX = moving.left + moving.getScaledWidth() / 2;
      const movingCenterY = moving.top + moving.getScaledHeight() / 2;
      const targetCenterX = target.left + target.getScaledWidth() / 2;
      const targetCenterY = target.top + target.getScaledHeight() / 2;

      // Simulate dragging the moving object towards the target object
      canvas.getScenePoint = () => ({
        x: movingCenterX,
        y: movingCenterY,
      });

      canvas.fire('mouse:down', {
        target: moving,
        e: {
          clientX: movingCenterX,
          clientY: movingCenterY,
        },
      });

      canvas.getScenePoint = () => ({
        x: targetCenterX,
        y: targetCenterY,
      });

      canvas.fire('object:moving', {
        target: moving,
        e: {
          clientX: targetCenterX,
          clientY: targetCenterY,
        },
      });

      // Assert that smart alignment guides are visible during the drag operation
      const guideObjects = canvas
        .getObjects()
        .filter((obj) => obj.id && obj.id.startsWith('alignment-guide-'));

      expect(
        guideObjects.length,
        'smart alignment guides are visible'
      ).to.be.greaterThan(0);

      canvas.fire('mouse:up', {
        target: moving,
        e: {
          clientX: targetCenterX,
          clientY: targetCenterY,
        },
      });

      canvas.fire('object:modified', {
        target: moving,
      });

      // Assert that the moving object has snapped to the target object on either the X or Y axis
      const movingCenterAfterSnap = {
        x: moving.left + moving.getScaledWidth() / 2,
        y: moving.top + moving.getScaledHeight() / 2,
      };

      const targetCenter = {
        x: target.left + target.getScaledWidth() / 2,
        y: target.top + target.getScaledHeight() / 2,
      };

      const xSnapped = Math.abs(movingCenterAfterSnap.x - targetCenter.x) <= 1;

      const ySnapped = Math.abs(movingCenterAfterSnap.y - targetCenter.y) <= 1;

      expect(
        xSnapped || ySnapped,
        'moving object snapped to target on X or Y axis'
      ).to.be.true;

      canvas.getScenePoint = originalGetScenePoint;
    });
  });
});
