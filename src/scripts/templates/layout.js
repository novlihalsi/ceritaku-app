export function generateNavigationListTemplate() {
  return `
    <li class="nav-list-item"><a href="#/">Beranda</a></li>
    <li><a class="add-story-button" href="#/add-story"><i class="fas fa-solid fa-plus"></i> Add Story</a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `
}