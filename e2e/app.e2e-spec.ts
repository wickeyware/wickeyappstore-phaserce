import { WasTutorialPage } from './app.po';

describe('wickeyappstore-phaserce App', () => {
  let page: WasTutorialPage;

  beforeEach(() => {
    page = new WasTutorialPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
