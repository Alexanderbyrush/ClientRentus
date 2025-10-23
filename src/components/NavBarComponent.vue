<template>
  <header class="property-header">
    <div class="logo" @click="goHome" style="cursor: pointer">
      <img src="@/assets/img/logo.png" alt="Logo" />
      <div class="logo-text"><strong>Rent</strong><span>Us</span></div>
    </div>

    <nav class="property-nav">
      <router-link to="/" class="nav-link" active-class="active" exact
        >Home</router-link
      >
      <router-link to="/propiedades" class="nav-link" active-class="active"
        >Propiedades</router-link
      >
      <router-link to="/sobre-nosotros" class="nav-link" active-class="active"
        >Sobre nosotros</router-link
      >
    </nav>

    <!-- Si no está logueado, botón Iniciar Sesión -->
    <button v-if="!isLoggedIn" @click="goLogin" class="login-btn" type="button">
      Iniciar Sesión
    </button>

    <!-- Si está logueado, mostrar saludo con primer nombre -->
    <div
      v-else
      class="user-box"
      id="userToggle"
      @click="toggleUserDropdown"
      style="cursor: pointer; position: relative"
    >
      <img
        v-if="profilePhoto"
        :src="profilePhoto"
        alt="Usuario"
        class="user-img"
      />
      <img v-else src="/img/default.webp" alt="Usuario" class="user-img" />
      <div class="user-info">Hola, {{ firstName }}</div>
      <span class="user-arrow">▾</span>

      <!-- Menú desplegable -->
      <div
        class="user-dropdown"
        :class="{ show: showDropdown }"
        id="userDropdown"
        @click.stop
      >
        <div @click="goPerfil" style="cursor: pointer">
          <img
            src="https://img.icons8.com/ios-filled/20/user.png"
            alt="Perfil"
          />
          Perfil
        </div>
        <div
          @click="openMaintenanceModal"
          class="menu-item"
          style="cursor: pointer"
        >
          <img
            src="https://img.icons8.com/ios-filled/20/maintenance.png"
            alt="Mantenimiento"
          />
          Mantenimiento
        </div>
        <div @click="goContratos" style="cursor: pointer">
          <img
            src="https://img.icons8.com/ios-filled/20/agreement.png"
            alt="Contratos"
          />
          Contratos
        </div>
        <div @click="goPagos" style="cursor: pointer">
          <img
            src="https://img.icons8.com/ios-filled/20/bank-cards.png"
            alt="Pagos"
          />
          Pagos
        </div>
        <div @click="openSolicitudesModal" style="cursor: pointer">
          <img
            src="https://img.icons8.com/ios-filled/20/document--v1.png"
            alt="Solicitudes"
          />
          Solicitudes
        </div>
        <div
          id="openModalBtn"
          @click="openNotificaciones"
          style="cursor: pointer; position: relative"
        >
          <img
            src="https://img.icons8.com/ios-filled/20/appointment-reminders--v1.png"
            alt="Notificaciones"
          />
          Notificaciones
          <span class="notif-badge">3</span>
        </div>
        <div @click="goAjustes" style="cursor: pointer">
          <img
            src="https://img.icons8.com/ios-filled/20/settings.png"
            alt="Ajustes"
          />
          Ajustes
        </div>
        <div
          @click="logout"
          style="cursor: pointer; margin-top: 10px; color: red"
        >
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
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

const router = useRouter();
const isLoggedIn = ref(false);
const showDropdown = ref(false);
const fullName = ref("Usuario");
const firstName = ref("Usuario");
const profilePhoto = ref("");

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

    profilePhoto.value = user.profile_photo || "";
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    logout();
  }
}

// Funciones de navegación existentes
const goHome = () => router.push("/");
const goLogin = () => router.push("/login");
const goPerfil = () => router.push("/perfil.html");
const goContratos = () => router.push("/contratos.html");
const goPagos = () => router.push("/pagos.html");
const goAjustes = () => router.push("/ajustes.html");

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

// Lifecycle hooks
onMounted(async () => {
  await fetchUserData();
  document.addEventListener("click", handleClickOutsideDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutsideDropdown);
});
</script>

<style scoped>
.user-dropdown {
  display: none;
  position: absolute;
  right: 0;
  background: #fff;
}

.user-dropdown.show {
  display: block;
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
</style>
