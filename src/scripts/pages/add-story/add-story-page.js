import AddStoryPresenter from './add-story-presenter';
import { convertBase64ToBlob } from '../../utils';
import * as StoryApi from '../../data/api';
import Camera from '../../utils/camera';
import Map from '../../utils/map';
import { generateLoaderAbsoluteTemplate } from '../../templates/loader';
import template from './add-story-page.html?raw'

export default class AddStoryPage {
  _presenter;
  _form;
  _camera;
  _isCameraOpen = false;
  _takenPhoto = null;
  _map = null;

  async render() {
    return template
  }

  async afterRender() {
    this._presenter = new AddStoryPresenter({
      view: this,
      model: StoryApi,
    });
    this._takenPhoto = null;

    this._presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupForm() {
    this._form = document.getElementById('new-form');
    this._form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        description: this._form.elements.namedItem('description').value,
        photo: this._takenPhoto.blob,
        lat: this._form.elements.namedItem('latitude').value,
        lon: this._form.elements.namedItem('longitude').value,
      };
      await this._presenter.addNewStory(data);
    });

    document.getElementById('documentations-input').addEventListener('change', async (event) => {
      const insertingPicturesPromises = Object.values(event.target.files).map(async (file) => {
        return await this.#addTakenPicture(file);
      });
      await Promise.all(insertingPicturesPromises);

      await this.#populateTakenPhoto();
    });

    document.getElementById('documentations-input-button').addEventListener('click', () => {
      this._form.elements.namedItem('documentations-input').click();
    });

    const cameraContainer = document.getElementById('camera-container');
    document
      .getElementById('open-documentations-camera-button')
      .addEventListener('click', async (event) => {
        cameraContainer.classList.toggle('open');
        this._isCameraOpen = cameraContainer.classList.contains('open');

        if (this._isCameraOpen) {
          event.currentTarget.textContent = 'Tutup Kamera';
          this.#setupCamera();
          await this._camera.launch();

          return;
        }

        event.currentTarget.textContent = 'Buka Kamera';
        this._camera.stop();
      });
  }

  async initialMap() {
    this._map = await Map.build('#map', {
      zoom: 15,
      locate: true,
    });

    // Preparing marker for select coordinate
    const centerCoordinate = this._map.getCenter();
    const draggableMarker = this._map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: 'true' },
    );
    this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);

    draggableMarker.addEventListener('move', (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this._map.addMapEventListener('click', (event) => {
      draggableMarker.setLatLng(event.latlng);

      event.sourceTarget.flyTo(event.latlng);
    });
  }

  #updateLatLngInput(latitude, longitude) {
    this._form.elements.namedItem('latitude').value = latitude;
    this._form.elements.namedItem('longitude').value = longitude;
  }

  #setupCamera() {
    if (!this._camera) {
      this._camera = new Camera({
        video: document.getElementById('camera-video'),
        cameraSelect: document.getElementById('camera-select'),
        canvas: document.getElementById('camera-canvas'),
      });
    }

    this._camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this._camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPhoto();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;

    if (image instanceof String) {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    const newDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
    this._takenPhoto = newDocumentation;
  }

  async #populateTakenPhoto() {
    let html = ''

    if (this._takenPhoto) {
      const imageUrl = URL.createObjectURL(this._takenPhoto.blob);
      html = `
      <li class="new-form__documentations__outputs-item">
            <button type="button" data-deletepictureid="${this._takenPhoto.id}" class="new-form__documentations__outputs-item__delete-btn">
              <img src="${imageUrl}" alt="Photo Cerita">
            </button>
          </li>
      `
    }

    document.getElementById('documentations-taken-list').innerHTML = html;

    document.querySelectorAll('button[data-deletepictureid]').forEach((button) =>
      button.addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;

        const deleted = this.#removePicture(pictureId);
        if (!deleted) {
          console.log(`Picture with id ${pictureId} was not found`);
        }

        // Updating taken pictures
        this.#populateTakenPhoto();
      }),
    );
  }

  #removePicture(id) {
    const selectedPicture = this._takenPhoto

    // Check if founded selectedPicture is available
    if (!selectedPicture) {
      return null;
    }

    // Deleting selected selectedPicture from takenPictures
    this._takenPhoto = null

    return selectedPicture;
  }

  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();

    // Redirect page
    location.hash = '/';
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this._form.reset();
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Buat Laporan
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit">Buat Laporan</button>
    `;
  }
}
