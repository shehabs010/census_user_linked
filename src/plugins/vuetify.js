import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

import ar from "vuetify/es5/locale/ar";
import en from "vuetify/es5/locale/en";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi",
  },
  lang: {
    locales: { ar, en },
    current: "ar",
  },
  rtl: true,
});
