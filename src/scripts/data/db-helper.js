const DB_NAME = 'ceritaku-db';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event.target.errorCode);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      console.log('Database opened successfully');
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('Database upgrade needed');
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        const objectStore = db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('name', 'name', { unique: false });
        console.log(`Object store '${OBJECT_STORE_NAME}' created.`);
      }
    };
  });
};

const DBHelper = {
  async getAllStories() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OBJECT_STORE_NAME, 'readonly');
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Error getting all stories:', event.target.errorCode);
        reject('Error getting stories');
      };
    });
  },

  async getStory(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OBJECT_STORE_NAME, 'readonly');
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error(`Error getting story ${id}:`, event.target.errorCode);
        reject('Error getting story');
      };
    });
  },

  async putStory(story) {
    if (!story || !story.id) {
        console.error('Attempted to add invalid story object:', story);
        return Promise.reject('Story object must have an id.');
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OBJECT_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.put(story);

      request.onsuccess = () => {
        console.log('Story added/updated successfully:', story.id);
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Error putting story:', event.target.errorCode);
        reject('Error putting story');
      };
    });
  },

  async deleteStory(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OBJECT_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`Story ${id} deleted successfully`);
        resolve();
      };

      request.onerror = (event) => {
        console.error(`Error deleting story ${id}:`, event.target.errorCode);
        reject('Error deleting story');
      };
    });
  },
};

export default DBHelper;

