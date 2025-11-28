<template>
  <header class="property-header">
    <div class="logo" @click="goHome" style="cursor: pointer">
      <img src="@/assets/img/logo.png" alt="Logo" />
      <div class="logo-text"><strong>Rent</strong><span>Us</span></div>
    </div>

    <!-- Hamburger menu button -->
    <button 
      class="hamburger-btn" 
      @click="toggleMobileMenu"
      :class="{ active: showMobileMenu }"
      aria-label="Menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Barra de navegación con menú móvil -->
    <nav class="navigation-section" :class="{ 'mobile-active': showMobileMenu }">
      <div class="nav-links">
        <router-link 
          to="/" 
          class="nav-link" 
          active-class="active" 
          exact
          @click="closeMobileMenu"
        >
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Inicio</span>
        </router-link>
        <router-link 
          to="/propiedades" 
          class="nav-link" 
          active-class="active"
          @click="closeMobileMenu"
        >
          <span class="nav-icon">🏢</span>
          <span class="nav-text">Propiedades</span>
        </router-link>
        <router-link 
          to="/sobre-nosotros" 
          class="nav-link" 
          active-class="active"
          @click="closeMobileMenu"
        >
          <span class="nav-icon">👥</span>
          <span class="nav-text">Nosotros</span>
        </router-link>
      </div>

      <!-- Login button en menú móvil -->
      <button 
        v-if="!isLoggedIn" 
        @click="goLogin" 
        class="login-btn mobile-login-btn" 
        type="button"
      >
        Iniciar Sesión
      </button>
    </nav>

    <!-- Login button desktop -->
    <button 
      v-if="!isLoggedIn" 
      @click="goLogin" 
      class="login-btn desktop-login-btn" 
      type="button"
    >
      Iniciar Sesión
    </button>

    <!-- Si está logueado - Dropdown -->
    <div v-else class="user-profile" id="userToggle" @click="toggleUserDropdown">
      <div class="user-avatar">
        <img v-if="profilePhoto" :src="profilePhoto" alt="Usuario" class="avatar-img" />
        <img v-else src="/img/default.webp" alt="Usuario" class="avatar-img" />
        <div class="status-indicator"></div>
      </div>
      
      <div class="user-details">
        <div class="user-greeting">Hola, {{ firstName }}</div>
        <div class="user-role">Inquilino</div>
      </div>
      
      <div class="dropdown-arrow" :class="{ rotated: showDropdown }">
        <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
          <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Dropdown Menu -->
      <transition name="dropdown-fade">
        <div v-if="showDropdown" class="user-dropdown-menu" @click.stop>
          <div class="dropdown-header">
            <div class="dropdown-avatar">
              <img v-if="profilePhoto" :src="profilePhoto" alt="Usuario" />
              <img v-else src="/img/default.webp" alt="Usuario" />
            </div>
            <div class="dropdown-user-info">
              <div class="dropdown-name">{{ fullName }}</div>
              <div class="dropdown-email">usuario@ejemplo.com</div>
            </div>
          </div>
          
          <div class="dropdown-divider"></div>
          
          <div class="dropdown-items">
            <div @click="goPerfil" class="dropdown-item">
              <div class="item-icon">👤</div>
              <div class="item-text">Mi Perfil</div>
            </div>
            
            <div @click="openNotificaciones" class="dropdown-item">
              <div class="item-icon">🔔</div>
              <div class="item-text">Notificaciones</div>
              <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
            </div>
            
            <div @click="goContratos" class="dropdown-item">
              <div class="item-icon">📄</div>
              <div class="item-text">Contratos</div>
            </div>
            
            <div @click="goPagos" class="dropdown-item">
              <div class="item-icon">💳</div>
              <div class="item-text">Pagos</div>
            </div>
            
            <div class="dropdown-section-divider">Solicitudes</div>
            
            <div @click="openMaintenanceModal" class="dropdown-item">
              <div class="item-icon">🔧</div>
              <div class="item-text">Mantenimiento</div>
            </div>
            
            <div @click="openSolicitudesModal" class="dropdown-item">
              <div class="item-icon">📋</div>
              <div class="item-text">Solicitudes (Dueño)</div>
            </div>
            
            <div @click="openMyRequestsModalFn" class="dropdown-item">
              <div class="item-icon">📅</div>
              <div class="item-text">Mis Solicitudes</div>
            </div>
            
            <div class="dropdown-section-divider">Configuración</div>
            
            <div @click="goAjustes" class="dropdown-item">
              <div class="item-icon">⚙️</div>
              <div class="item-text">Ajustes</div>
            </div>
            
            <div @click="logout" class="dropdown-item logout-item">
              <div class="item-icon">🚪</div>
              <div class="item-text">Cerrar Sesión</div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </header>

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <!-- MODAL DE MANTENIMIENTO -->
  <MaintenanceModal :is-visible="showMaintenanceModal" @close="showMaintenanceModal = false"
    @submitted="handleMaintenanceSubmitted" />

  <!-- MODAL DE SOLICITUDES -->
  <RequestsView :open="showRequestModal" @close="showRequestModal = false" />

  <NotificationsView :open="showNotificaciontModal" @close="showNotificaciontModal = false" />

  <MyRequestsModal :open="showMyRequestsModal" @close="showMyRequestsModal = false" />

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import { notificationService } from "@/services/notificationService";
import MaintenanceModal from '@/components/modals/Maintenance/MaintenanceModal.vue'
import RequestsView from "./modals/ModalRequest/RequestsView.vue";
import NotificationsView from "./modals/Notifications/NotificationsView.vue";
import MyRequestsModal from "./modals/ModalRequest/MyRequestsModal.vue";
import { eventBus, EVENTS } from '@/services/eventBus';

const router = useRouter();
const isLoggedIn = ref(false);
const showDropdown = ref(false);
const showMobileMenu = ref(false);
const fullName = ref("Usuario");
const firstName = ref("Usuario");
const profilePhoto = ref("");
const showMaintenanceModal = ref(false)
const showRequestModal = ref(false)
const showNotificaciontModal = ref(false)
const showMyRequestsModal = ref(false)
const unreadCount = ref(0)

// Toggle mobile menu
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

// Cargar contador de notificaciones
const loadUnreadCount = async () => {
  try {
    const response = await notificationService.getUnreadCount();
    unreadCount.value = response.count;
  } catch (error) {
    console.error("Error cargando contador:", error);
  }
};

// Manejar actualizaciones desde el modal de notificaciones
const handleNotificationUpdate = (event) => {
  if (event.action === "refresh_count") {
    loadUnreadCount();
  } else if (event.action === "open_requests") {
    showRequestModal.value = true;
  } else if (event.action === "open_my_requests") {
    showMyRequestsModal.value = true;
  }
};

const openMaintenanceModal = () => {
  showMaintenanceModal.value = true
  showDropdown.value = false
}

const handleMaintenanceSubmitted = (data) => {
  console.log('Solicitud de mantenimiento enviada:', data)
}

const openSolicitudesModal = () => {
  showRequestModal.value = true
  showDropdown.value = false
}

const openMyRequestsModalFn = () => {
  showMyRequestsModal.value = true
  showDropdown.value = false
}

const openNotificaciones = () => {
  showNotificaciontModal.value = true
  showDropdown.value = false
}

// Funciones de API
async function fetchUserData() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      isLoggedIn.value = false;
      return;
    }
    isLoggedIn.value = true;

    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = response.data;
    fullName.value = user.name || "Usuario";
    firstName.value = fullName.value.split(" ")[0];

    if (firstName.value.length > 10) {
      firstName.value = firstName.value.slice(0, 10) + "...";
    }

    profilePhoto.value = user.photo || "";
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    logout();
  }
}

// Funciones de navegación
const goHome = () => {
  router.push("/");
  closeMobileMenu();
};

const goLogin = () => {
  router.push("/login");
  closeMobileMenu();
};

const goPerfil = () => {
  router.push('/perfil');
  showDropdown.value = false;
};

const goContratos = () => {
  router.push("/contratos");
  showDropdown.value = false;
};

const goPagos = () => {
  router.push("/pagos");
  showDropdown.value = false;
};

const goAjustes = () => {
  router.push("/ajustes");
  showDropdown.value = false;
};

const toggleUserDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  isLoggedIn.value = false;
  showDropdown.value = false;
  router.push("/login");
};

// Event handlers
function handleClickOutsideDropdown(event) {
  const userMenu = document.getElementById("userToggle");
  const dropdown = document.querySelector(".user-dropdown-menu");
  const hamburger = document.querySelector(".hamburger-btn");
  const mobileNav = document.querySelector(".navigation-section");

  if (!userMenu || !dropdown) return;

  if (
    !userMenu.contains(event.target) &&
    !dropdown.contains(event.target) &&
    showDropdown.value
  ) {
    showDropdown.value = false;
  }

  // Cerrar menú móvil al hacer clic fuera
  if (
    hamburger &&
    mobileNav &&
    !hamburger.contains(event.target) &&
    !mobileNav.contains(event.target) &&
    showMobileMenu.value
  ) {
    showMobileMenu.value = false;
  }
}

const handlePhotoUpdate = (newPhoto) => {
  profilePhoto.value = newPhoto;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  user.photo = newPhoto;
  localStorage.setItem("user", JSON.stringify(user));
};

// Lifecycle hooks
onMounted(async () => {
  await fetchUserData();
  await loadUnreadCount();
  document.addEventListener("click", handleClickOutsideDropdown);

  eventBus.on(EVENTS.PROFILE_PHOTO_UPDATED, handlePhotoUpdate);

  // Actualizar contador cada 30 segundos
  setInterval(() => {
    if (isLoggedIn.value) {
      loadUnreadCount();
    }
  }, 30000);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutsideDropdown);
  eventBus.off(EVENTS.PROFILE_PHOTO_UPDATED, handlePhotoUpdate);
});
</script>

<style scoped>
.property-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #3b251d 0%, #2e1d17 100%);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  z-index: 1002;
}

.logo img {
  height: 40px;
  width: auto;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
}

.logo-text strong {
  color: #fff;
}

.logo-text span {
  color: #da9c5f;
}

/* Hamburger Menu */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1002;
  position: relative;
}

.hamburger-btn span {
  width: 100%;
  height: 3px;
  background: #fff;
  border-radius: 3px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-btn.active span:nth-child(1) {
  transform: translateY(10.5px) rotate(45deg);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
  transform: translateX(-20px);
}

.hamburger-btn.active span:nth-child(3) {
  transform: translateY(-10.5px) rotate(-45deg);
}

/* Barra de navegación */
.navigation-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.5rem;
  backdrop-filter: blur(10px);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f0e5db;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  color: #fff;
  background: rgba(218, 156, 95, 0.15);
  transform: translateY(-1px);
}

.nav-link.active {
  color: #fff;
  background: linear-gradient(135deg, #da9c5f, #b8791f);
  box-shadow: 0 4px 12px rgba(218, 156, 95, 0.3);
}

.nav-icon {
  font-size: 1.1rem;
}

.nav-text {
  font-size: 0.95rem;
}

/* Login Buttons */
.login-btn {
  background: linear-gradient(45deg, #da9c5f, #b8791f);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(218, 156, 95, 0.3);
}

.mobile-login-btn {
  display: none;
}

.desktop-login-btn {
  display: block;
}

/* User Profile */
.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.08);
}

.user-avatar {
  position: relative;
}

.avatar-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #da9c5f;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4CAF50;
  border: 2px solid #2c1a12;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-greeting {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}

.user-role {
  color: #da9c5f;
  font-size: 0.8rem;
  font-weight: 500;
}

.dropdown-arrow {
  color: #f0e5db;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  min-width: 280px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  margin-top: 1rem;
  overflow: hidden;
  z-index: 1001;
  border: 1px solid #e8e8e8;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.3s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.dropdown-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #da9c5f;
}

.dropdown-user-info {
  flex: 1;
}

.dropdown-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.dropdown-email {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.dropdown-divider {
  height: 1px;
  background: #e9ecef;
  margin: 0;
}

.dropdown-section-divider {
  padding: 0.75rem 1.5rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-items {
  padding: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #3b251d;
}

.item-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.item-text {
  flex: 1;
  font-weight: 500;
}

.notification-badge {
  background: #e74c3c;
  color: white;
  border-radius: 10px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.logout-item {
  color: #e74c3c;
  margin-top: 0.5rem;
  border-top: 1px solid #e9ecef;
}

.logout-item:hover {
  background: #ffeaea;
}

/* Router transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Responsive Tablets */
@media (max-width: 1024px) {
  .nav-text {
    display: none;
  }
  
  .nav-link {
    padding: 0.75rem;
  }

  .user-details {
    display: none;
  }
}

/* Responsive Mobile */
@media (max-width: 768px) {
  .property-header {
    padding: 1rem 1.5rem;
  }

  /* Mostrar hamburger */
  .hamburger-btn {
    display: flex;
  }

  /* Ocultar botón login desktop */
  .desktop-login-btn {
    display: none;
  }

  /* Menú de navegación móvil */
  .navigation-section {
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #3b251d 0%, #2e1d17 100%);
    flex-direction: column;
    padding: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    max-height: calc(100vh - 70px);
    overflow-y: auto;
  }

  .navigation-section.mobile-active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    background: transparent;
    padding: 0;
    gap: 0.5rem;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 1rem 1.5rem;
  }

  .nav-text {
    display: block;
  }

  .nav-icon {
    width: 24px;
    text-align: center;
  }

  /* Mostrar botón login en móvil */
  .mobile-login-btn {
    display: block;
    width: 100%;
    margin-top: 1rem;
  }

  .logo img {
    height: 36px;
  }

  .logo-text {
    font-size: 1.3rem;
  }

  .user-dropdown-menu {
    min-width: 260px;
    right: -0.5rem;
  }

  .user-profile {
    padding: 0.5rem;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .property-header {
    padding: 1rem;
  }

  .logo img {
    height: 32px;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  .logo-text strong,
  .logo-text span {
    font-size: 1.1rem;
  }

  .user-dropdown-menu {
    min-width: calc(100vw - 2rem);
    right: -1rem;
    left: 1rem;
  }

  .avatar-img {
    width: 38px;
    height: 38px;
  }

  .dropdown-header {
    padding: 1rem;
  }

  .dropdown-avatar img {
    width: 45px;
    height: 45px;
  }

  .dropdown-item {
    padding: 0.875rem 1rem;
  }

  .hamburger-btn {
    width: 26px;
    height: 20px;
  }

  .hamburger-btn span {
    height: 2.5px;
  }
}

/* Prevenir scroll cuando el menú móvil está abierto */
body.mobile-menu-open {
  overflow: hidden;
}
</style>