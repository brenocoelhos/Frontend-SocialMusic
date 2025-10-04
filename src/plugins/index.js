/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import router from '@/router'

export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(router)
}

import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#B39DDB',
          secondary: '#E6E0FF',
          background: '#FFFFFF',
          surface: '#F8F9FA',
        }
      },
      dark: {
        colors: {
          primary: '#B39DDB',
          secondary: '#7E57C2',
          background: '#121212',
          surface: '#1E1E1E',
        }
      }
    }
  }
})