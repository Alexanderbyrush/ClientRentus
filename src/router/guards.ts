// router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { authService } from "../services/auth";

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const isAuthenticated = authService.isAuthenticated();

  // Rutas que requieren autenticación
  const protectedRoutes = ["/", "/profile", "/properties", "/contracts"];

  // Rutas que no deben ser accesibles si ya está autenticado
  const guestRoutes = ["/login", "/register"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    to.path.startsWith(route)
  );
  const isGuestRoute = guestRoutes.includes(to.path);

  if (isProtectedRoute && !isAuthenticated) {
    // Redirigir a login si intenta acceder a ruta protegida sin autenticación
    next("/login");
  } else if (isGuestRoute && isAuthenticated) {
    // Redirigir a dashboard si intenta acceder a login/register estando autenticado
    next("/dashboard");
  } else {
    // Permitir navegación
    next();
  }
};
