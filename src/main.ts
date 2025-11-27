import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "bootstrap-icons/font/bootstrap-icons.css";

const app = createApp(App);

// Configurar manejador de errores ANTES de montar
app.config.errorHandler = (err, instance, info) => {
  console.error("Error global de Vue:", err, info);
};

app.use(store);
app.use(router);

// Solo montar cuando los plugins ya estén registrados
app.mount("#app");