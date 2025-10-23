import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "./guards";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import HomeView from "../views/HomeView.vue";
import NosotrosView from "../views/NosotrosView.vue";
import PropertyView from "../views/PropertyView.vue";

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
