import { EstimatingPage } from './app.po';

describe('estimating App', () => {
  let page: EstimatingPage;

  beforeEach(() => {
    page = new EstimatingPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
