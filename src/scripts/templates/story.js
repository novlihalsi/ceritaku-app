import { showFormattedDate } from "../utils";

export function generateStoryItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  placeName,
}) {
  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <div class="story-item__image-wrapper">
        <img class="story-item__image" src="${photoUrl}" alt="${name}">
      </div>
      <div class="story-item__body">
        <div class="story-item__main">
          <h2 id="story-title" class="story-item__title">${name}</h2>
          <div class="story-item__more-info">
            <div class="story-item__createdat">
              <i class="fas fa-calendar-alt"></i> ${showFormattedDate(createdAt, 'id-ID')}
            </div>
            <div class="story-item__location">
              <i class="fas fa-map"></i> ${placeName}
            </div>
          </div>
          <div id="story-description" class="story-item__description">
            ${description}
          </div>
        </div>
        <a class="btn story-item__read-more" href="#/story/${id}">
          Selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

export function generateEmptyStoriesTemplate() {
  return `
    <div id="story-list-empty" class="story-list__empty">
      <h2>Tidak ada cerita yang tersedia</h2>
      <p>Saat ini, tidak ada cerita yang dapat ditampilkan.</p>
    </div>
    `
}

export function generateStoriesErrorTemplate(message) {
  return `
    <div id="story-list-error" class="story-list__error">
      <h2>Terjadi kesalahan pengambilan cerita</h2>
      <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}