import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'


export default createVuetify({
  theme: { // 
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
  defaults: { 
    global: {
      style: 'font-family: "Poppins", sans-serif',
    },
  },
})