import { createApp } from 'vue';
import './plugins/assets';
import {
  setupAppVersionNotification,
  setupDayjs,
  setupIconifyOffline,
  setupLoading,
  setupNProgress,
  setupUI
} from './plugins';
import { setupStore } from './store';
import { setupRouter } from './router';
import { setupI18n } from './locales';
import App from './App.vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Add passive event listeners to improve scroll performance
if (typeof window !== 'undefined') {
  const passiveSupported = (() => {
    let supported = false;
    try {
      const options = {
        get passive() {
          supported = true;
          return false;
        }
      };
      window.addEventListener('test', null as any, options);
      window.removeEventListener('test', null as any, options);
    } catch (err) {
      supported = false;
    }
    return supported;
  })();

  if (passiveSupported) {
    const addEventListenerOriginal = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      const usesListenerOptions = typeof options === 'object' && options !== null;
      const useCapture = usesListenerOptions ? options.capture : options;

      // Make touchstart, touchmove, wheel, and mousewheel passive by default
      if (['touchstart', 'touchmove', 'wheel', 'mousewheel'].includes(type)) {
        options = usesListenerOptions
          ? { ...options, passive: options.passive !== false }
          : { passive: true, capture: !!useCapture };
      }

      addEventListenerOriginal.call(this, type, listener, options);
    };
  }
}

async function setupApp() {
  setupLoading();

  setupNProgress();

  setupIconifyOffline();

  setupDayjs();

  const app = createApp(App);
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
  setupUI(app);

  setupStore(app);

  await setupRouter(app);

  setupI18n(app);

  setupAppVersionNotification();

  app.mount('#app');
}

setupApp();
