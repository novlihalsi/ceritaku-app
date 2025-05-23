import HomePresenter from "./home-presenter";
import * as StoryAPI from '../../data/api'
import { generateEmptyStoriesTemplate, generateStoriesErrorTemplate, generateStoryItemTemplate } from "../../templates/story";
import { generateLoaderAbsoluteTemplate } from "../../templates/loader";
import Map from "../../utils/map";

export default class HomePage {
  _presenter = null
  _map = null


  async render() {
    return `
      <section>
        <div class="story-map-container">
          <div id="map" class="story-map"></div>
          <div id="map-loading"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Cerita</h1>
        <div class="story-list__container">
          <div id="story-list"></div>
          <div id="story-list-loading"></div>
        </div>
      </section>
    `;
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
    document.getElementById('story-list-loading').innerHTML = '';
  }
}
