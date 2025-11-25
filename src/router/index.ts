import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "./guards";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import HomeView from "../views/HomeView.vue";
import NosotrosView from "../views/NosotrosView.vue";
import PropertyView from "../views/PropertyView.vue";
import PropertyCreate from "../views/PropertyCreate.vue";



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
    path: '/properties/create',
    name: 'PropertyCreate',
    component: PropertyCreate,
  },
  {
  path: "/solicitudes",
  name: "request",
  component: () => import("../components/modals/ModalRequest/RequestsView.vue"),
  },
  {
  path: "/ajustes",
  name: "settings",
  component: () => import("../views/SettingsView.vue")
  },
  {
  path: "/pagos",
  name: "pays",
  component: () => import("../views/PagosView.vue")
  },
  { 
    path: '/perfil', 
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
    { 
    path: '/contratos', 
    component: () => import('@/views/ContractsView.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // Compatible con Vue CLI
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta?.requiresAuth) {
    return authGuard(to, from, next);
  }
  return next();
});

export default router;