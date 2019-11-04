import { getGreeting } from '../support/app.po';

describe('jav-ui', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to jav-ui!');
  });
});
