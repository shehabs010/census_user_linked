import Vue from "vue";
import App from "./App.vue";
import vuetify from "@/plugins/vuetify.js"; // path to vuetify export
import "vuetify/dist/vuetify.min.css";
import i18n from "./i18n";
import * as VueGoogleMaps from "vue2-google-maps";
import "./assets/css/custom.css";
Vue.config.productionTip = false;

Vue.component("NoBarcode", require("@/components/NoBarCode.vue").default);
Vue.component("GoogleMap", require("@/components/GoogleMap.vue").default);
Vue.use(VueGoogleMaps, {
  //AIzaSyDBgpkPQaTs9j8qdqlLueBo6mTcaDz64OE
  load: {
    //key: "AIzaSyBwCde04nYYUhez1sgy-n5G53UoyN4gtuU",
    key: "AIzaSyDBgpkPQaTs9j8qdqlLueBo6mTcaDz64OE",
    libraries: "places",
    installComponents: true,
  },
});
export const bus = new Vue();
new Vue({
  vuetify,
  i18n,
  rtl: true,
  render: (h) => h(App),
}).$mount("#app");
