import { storyMapper } from "../../data/api-mapper";


export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showStoriesMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoriesMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }


  async init() {
    await this.showStoriesMap();
    this.#view.showLoading();
    try {
      const response = await this.#model.getStories();

      if (!response.ok) {
        console.error('init: response:', response);
        return;
      }

      const stories = []
      for (const story of response.listStory) {
        const newStory = await storyMapper(story)
        stories.push(newStory)
      }

      this.#view.generateStories(stories)

    } catch (error) {
      console.error('init: error:', error);
      this.#view.handleStoryError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
