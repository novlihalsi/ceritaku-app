import { storyMapper } from "../../data/api-mapper";
import DBHelper from '../../data/db-helper'; // Import DBHelper

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

    // Helper method to load stories from IndexedDB
    async _loadStoriesFromDB(errorMessagePrefix = 'Error loading stories') {
        try {
            const storiesFromDB = await DBHelper.getAllStories();
            if (storiesFromDB && storiesFromDB.length > 0) {
                console.log('Loaded stories from IndexedDB');
                this.#view.generateStories(storiesFromDB);
            } else {
                console.log('No stories found in IndexedDB.');
                this.#view.handleStoryError(`${errorMessagePrefix} No cached stories available.`);
            }
        } catch (dbError) {
            console.error('Error fetching stories from IndexedDB:', dbError);
            this.#view.handleStoryError(`${errorMessagePrefix} Failed to access local cache.`);
        }
    }

    async init() {
        await this.showStoriesMap(); // Keep map logic
        this.#view.showLoading();
        try {
            // Try fetching from network first
            const response = await this.#model.getStories();

            if (!response.ok) {
                console.error('init: API response not ok:', response);
                // Attempt to load from DB if network response is not ok
                await this._loadStoriesFromDB('Failed to fetch stories from network. Trying local cache.');
                return; // Exit after attempting DB load
            }

            const fetchedStories = [];
            for (const story of response.listStory) {
                const newStory = await storyMapper(story);
                fetchedStories.push(newStory);
                // Save/update each story in IndexedDB
                try {
                    await DBHelper.putStory(newStory);
                    console.log(`Story ${newStory.id} saved/updated in DB.`);
                } catch (dbError) {
                    console.error(`Failed to save story ${newStory.id} to DB:`, dbError);
                    // Continue processing other stories even if one fails to save
                }
            }

            this.#view.generateStories(fetchedStories); // Display fresh stories

        } catch (networkError) {
            console.warn('init: Network error fetching stories:', networkError.message, '- Attempting to load from cache.');
            // If network fails, try loading from IndexedDB
            await this._loadStoriesFromDB('Network unavailable. Displaying cached stories.');

        } finally {
            this.#view.hideLoading();
        }
    }
}

