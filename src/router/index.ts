import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "./guards";

import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import HomeView from "../views/HomeView.vue";
import NosotrosView from "../views/NosotrosView.vue";
import PropertyView from "../views/PropertyView.vue";
import PropertyCreate from "../views/PropertyCreate.vue";
import PropertyEdit from "../views/PropertyEdit.vue";
import MapView from "../components/MapView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
  },
  {
    path: "/sobre-nosotros",
    name: "SobreNosotros",
    component: NosotrosView,
  },
  {
    path: "/propiedades",
    name: "Properties",
    component: PropertyView,
  },
  {
    path: "/map/:id",
    name: "MapView",
    component: MapView,
    props: true,
  },
  {
    path: "/properties/create",
    name: "PropertyCreate",
    component: PropertyCreate,
  },
  {
    path: "/properties/edit/:id",
    name: "PropertyEdit",
    component: PropertyEdit,
    props: true,
  },
  {
    path: "/solicitudes",
    name: "request",
    component: () => import("../components/modals/ModalRequest/RequestsView.vue"),
  },
  {
    path: "/ajustes",
    name: "settings",
    component: () => import("../views/SettingsView.vue"),
  },
  {
    path: "/pagos",
    name: "pays",
    component: () => import("../views/PagosView.vue"),
  },
  {
    path: "/perfil",
    component: () => import("../views/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/contratos",
    component: () => import("../views/ContractsView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  try {
    if (to.meta?.requiresAuth) {
      await authGuard(to, from, next);
    } else {
      next();
    }
  } catch (error) {
    console.error("Error en navigation guard:", error);
    next("/login"); // Redirigir al login en caso de error
  }
});

// Capturar errores de navegación
router.onError((error) => {
  console.error("Error en router:", error);
});

export default router;