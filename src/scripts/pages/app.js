import { routes } from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { generateNavigationListTemplate, generateSubscribeButtonTemplate, generateUnsubscribeButtonTemplate } from '../templates/layout';
import { isServiceWorkerAvailable, setupSkipToContent, transitionHelper } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLinkButton = null;

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;

    this._init();
  }


  _init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this._setupDrawer()
  }
  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      })
    });
  }

  _setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navList = this.#navigationDrawer.children.namedItem('nav-list');

    if (!isLogin) {
      navList.innerHTML = '';
      return;
    }

    navList.innerHTML = generateNavigationListTemplate();

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (confirm('Apakah Anda yakin ingin keluar?')) {
        getLogout();

        // Redirect
        location.hash = '/login';
      }
    });
  }

  async _setupPushNotification() {
    const isLogin = !!getAccessToken();
    if (isLogin) {

      const pushNotificationTools = document.getElementById('push-notification-tools');
      const isSubscribed = await isCurrentPushSubscriptionAvailable();


      if (isSubscribed) {
        pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
        document.getElementById('unsubscribe-button').addEventListener('click', () => {
          unsubscribe().finally(() => {
            this._setupPushNotification();
          });
        });

        return;
      }

      pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
      document.getElementById('subscribe-button').addEventListener('click', () => {
        subscribe().finally(() => {
          this._setupPushNotification();
        });
      });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    let route = routes[url];

    if (!route) {
      route = routes['*']
    }


    const page = route()

    if (page) {
      const transition = transitionHelper({
        updateDOM: async () => {
          this.#content.innerHTML = await page.render();
          page.afterRender();
        },
      });

      transition.ready.catch(console.error);
      transition.updateCallbackDone.then(() => {
        scrollTo({ top: 0, behavior: 'instant' });
        this._setupNavigationList();

        if (isServiceWorkerAvailable()) {
          this._setupPushNotification();
        }
      });
    }

  }
}

export default App;
