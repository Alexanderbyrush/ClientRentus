// router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { authService } from "../services/auth";

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  try {
    const isAuthenticated = authService.isAuthenticated();

    // Rutas que requieren autenticación
    const protectedRoutes = ["/profile", "/perfil", "/properties", "/contratos", "/contracts"];

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
      // Redirigir a home si intenta acceder a login/register estando autenticado
      next("/"); // Cambiado de /dashboard a /
    } else {
      // Permitir navegación
      next();
    }
  } catch (error) {
    console.error("Error en authGuard:", error);
    // En caso de error, redirigir al login por seguridad
    next("/login");
  }
};