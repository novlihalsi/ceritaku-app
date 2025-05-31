import HomePresenter from "./home-presenter";
import * as StoryAPI from '../../data/api'
import { generateEmptyStoriesTemplate, generateStoriesErrorTemplate, generateStoryItemTemplate } from "../../templates/story";
import { generateLoaderAbsoluteTemplate } from "../../templates/loader";
import Map from "../../utils/map";
import template from './home-page.html?raw';

export default class HomePage {
  _presenter = null
  _map = null


  async render() {
    return template
  }

  async afterRender() {
    this._presenter = new HomePresenter({
      view: this,
      model: StoryAPI
    })

    await this._presenter.init()
  }

  async initialMap() {
    this._map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
  }

  generateStories(stories = []) {
    if (stories.length <= 0) {
      this.handleStoryEmpty()
      return
    }



    const html = stories.reduce((acc, story) => {
      if (this._map) {
        const coordinate = [story.lat ?? '', story.lon ?? ''];
        const markerOptions = { alt: story.description };
        const popupOptions = { content: story.description };
        this._map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return acc.concat(generateStoryItemTemplate(story))
    }, '')

    document.getElementById('story-list').innerHTML = `
      <div class="story-list">${html}</div>
    `;
  }

  handleStoryEmpty() {
    document.getElementById('story-list').innerHTML = generateEmptyStoriesTemplate()
  }

  handleStoryError(message) {
    document.getElementById('story-list').innerHTML = generateStoriesErrorTemplate(message);
  }

  showMapLoading() {
    document.getElementById('map-loading').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading').innerHTML = '';
  }

  showLoading() {
    document.getElementById('story-list-loading').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    const storyListLoading = document.getElementById('story-list-loading')
    if (storyListLoading) {
      storyListLoading.innerHTML = '';
    }
  }
}
