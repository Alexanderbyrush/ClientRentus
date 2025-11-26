<template>
  <header class="property-header">
    <div class="logo" @click="goHome" style="cursor: pointer">
      <img src="@/assets/img/logo.png" alt="Logo" />
      <div class="logo-text"><strong>Rent</strong><span>Us</span></div>
    </div>

    <nav class="property-nav">
      <router-link to="/" class="nav-link" active-class="active" exact>Home</router-link>
      <router-link to="/propiedades" class="nav-link" active-class="active">Propiedades</router-link>
      <router-link to="/sobre-nosotros" class="nav-link" active-class="active">Sobre nosotros</router-link>
    </nav>

    <!-- Si no está logueado -->
    <button v-if="!isLoggedIn" @click="goLogin" class="login-btn" type="button">
      Iniciar Sesión
    </button>

    <!-- Si está logueado -->
    <div
      v-else
      class="user-box"
      id="userToggle"
      @click="toggleUserDropdown"
      style="cursor: pointer; position: relative"
    >
      <img v-if="profilePhoto" :src="profilePhoto" alt="Usuario" class="user-img" />
      <img v-else src="/img/default.webp" alt="Usuario" class="user-img" />

      <div class="user-info">Hola, {{ firstName }}</div>
      <span class="user-arrow">▾</span>

      <!-- Dropdown -->
      <div
        class="user-dropdown"
        :class="{ show: showDropdown }"
        id="userDropdown"
        @click.stop
      >
        <div @click="goPerfil" class="dropdown-item">
          <img src="https://img.icons8.com/ios-filled/20/user.png" alt="Perfil" />
          Perfil
        </div>

        <div @click="openMaintenanceModal" class="dropdown-item">
          <img src="https://img.icons8.com/ios-filled/20/maintenance.png" alt="Mantenimiento" />
          Mantenimiento
        </div>

        <div @click="goContratos" class="dropdown-item">
          <img src="https://img.icons8.com/ios-filled/20/agreement.png" alt="Contratos" />
          Contratos
        </div>

        <div @click="goPagos" class="dropdown-item">
          <img src="https://img.icons8.com/ios-filled/20/bank-cards.png" alt="Pagos" />
          Pagos
        </div>

        <div @click="openSolicitudesModal" class="dropdown-item">
          <img src="https://img.icons8.com/ios-filled/20/document--v1.png" alt="Solicitudes" />
          Solicitudes
        </div>

        <div @click="openNotificaciones" class="dropdown-item">
          <img src="https://img.icons8.com/ios-filled/20/appointment-reminders--v1.png" alt="Notificaciones" />
          Notificaciones
          <span class="notif-badge">3</span>
        </div>

        <div @click="goAjustes" class="dropdown-item">
          <img src="https://img.icons8.com/ios-filled/20/settings.png" alt="Ajustes" />
          Ajustes
        </div>

        <div @click="logout" class="dropdown-item logout-item">
          Cerrar sesión
        </div>
      </div>
    </div>
  </header>

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <!-- MODAL DE MANTENIMIENTO -->
  <MaintenanceModal 
    :is-visible="showMaintenanceModal"
    @close="showMaintenanceModal = false"
    @submitted="handleMaintenanceSubmitted"
  />

  <!-- MODAL DE SOLICITUDES -->
  <RequestsView
    :open="showRequestModal"
    @close="showRequestModal = false"
  />

  <NotificationsView
    :open="showNotificaciontModal"
    @close="showNotificaciontModal = false"
  />

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";
import MaintenanceModal from '@/components/modals/Maintenance/MaintenanceModal.vue'
import RequestsView from "./modals/ModalRequest/RequestsView.vue";
import NotificationsView from "./modals/Notifications/NotificationsView.vue";
import { eventBus, EVENTS } from '@/services/eventBus'; // ⭐ Importar EventBus

const router = useRouter();
const isLoggedIn = ref(false);
const showDropdown = ref(false);
const fullName = ref("Usuario");
const firstName = ref("Usuario");
const profilePhoto = ref("");
const showMaintenanceModal = ref(false)
const showRequestModal = ref(false)
const showNotificaciontModal = ref(false)

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

    // ⭐ Cambiar de profile_photo a photo
    profilePhoto.value = user.photo || "";
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    logout();
  }
}

// Funciones de navegación
const goHome = () => router.push("/");
const goLogin = () => router.push("/login");
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
  const dropdown = document.getElementById("userDropdown");

  if (!userMenu || !dropdown) return;

  if (
    !userMenu.contains(event.target) &&
    !dropdown.contains(event.target) &&
    showDropdown.value
  ) {
    showDropdown.value = false;
  }
}

// ⭐ Función para actualizar la foto desde el EventBus
const handlePhotoUpdate = (newPhoto) => {
  profilePhoto.value = newPhoto;
  
  // Actualizar también en localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  user.photo = newPhoto;
  localStorage.setItem("user", JSON.stringify(user));
};

// Lifecycle hooks
onMounted(async () => {
  await fetchUserData();
  document.addEventListener("click", handleClickOutsideDropdown);
  
  // ⭐ Escuchar cambios en la foto de perfil
  eventBus.on(EVENTS.PROFILE_PHOTO_UPDATED, handlePhotoUpdate);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutsideDropdown);
  
  // ⭐ Limpiar listener del EventBus
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

.property-nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #f0e5db;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #da9c5f;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  color: #da9c5f;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 1rem;
  right: 1rem;
  height: 2px;
  background: #da9c5f;
  border-radius: 2px;
}

.login-btn {
  background: linear-gradient(45deg, #da9c5f, #b8791f);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(218, 156, 95, 0.3);
}

.user-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.user-box:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #da9c5f;
}

.user-info {
  color: #f0e5db;
  font-weight: 500;
}

.user-arrow {
  color: #f0e5db;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.user-dropdown.show + .user-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  min-width: 220px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-top: 0.5rem;
  overflow: hidden;
  z-index: 1001;
  border: 1px solid #e0d9cc;
}

.user-dropdown.show {
  display: block;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #3b251d;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item img {
  width: 20px;
  height: 20px;
  opacity: 0.7;
}

.notification-item {
  position: relative;
}

.notif-badge {
  position: absolute;
  right: 1.25rem;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.logout-item {
  color: #e74c3c !important;
  font-weight: 600;
  margin-top: 0.5rem;
  border-top: 1px solid #e0d9cc !important;
}

.logout-item:hover {
  background: #ffeaea !important;
}

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

/* Responsive */
@media (max-width: 768px) {
  .property-header {
    padding: 1rem;
  }
  
  .property-nav {
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
  
  .logo-text {
    font-size: 1.2rem;
  }
  
  .user-info {
    display: none;
  }
  
  .user-dropdown {
    min-width: 200px;
    right: -1rem;
  }
}

@media (max-width: 480px) {
  .property-nav {
    gap: 0.5rem;
  }
  
  .nav-link {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
  
  .logo img {
    height: 32px;
  }
  
  .logo-text {
    font-size: 1rem;
  }
}
</style>