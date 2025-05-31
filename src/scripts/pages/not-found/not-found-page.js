import NotFoundPageTemplate from './not-found-page.html';

class NotFoundPage {
  async render() {
    return NotFoundPageTemplate;
  }

  async afterRender() {
    // Add any additional functionality here if needed
    console.log('Not Found page rendered');
  }
}

export default NotFoundPage;
