<template>
  <div class="ajustes-container">

    <!-- Barra superior -->
    <header class="barra">
      <div class="logo">
        <img src="/img/logo.png" alt="Rentus Logo" @click="goHome" class="logo-click" />
      </div>

      <nav class="acciones-barra">
        <i class="fas fa-arrow-left volver" @click="goHome"></i>
        <i class="fas fa-bell notificaciones" @click="openNotifications"></i>
      </nav>
    </header>

    <h1>Ajustes de Usuario</h1>
    <p>Configura tu perfil, seguridad, notificaciones y preferencias.</p>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Contenido dinámico -->
    <div class="tab-content" v-if="activeTab === 'perfil'">
      <h2>Perfil</h2>

      <label>Nombre:</label>
      <input type="text" v-model="form.nombre" placeholder="Tu nombre" />

      <label>Email:</label>
      <input type="email" v-model="form.email" placeholder="correo@ejemplo.com" />

      <label>Avatar:</label>
      <input type="file" @change="handleAvatar" />

      <button class="save-btn" @click="savePerfil">Guardar cambios</button>
    </div>

    <div class="tab-content" v-if="activeTab === 'seguridad'">
      <h2>Seguridad</h2>

      <label>Contraseña actual:</label>
      <input type="password" v-model="form.actualPass" />

      <label>Nueva contraseña:</label>
      <input type="password" v-model="form.newPass" />

      <button class="save-btn" @click="savePassword">Actualizar contraseña</button>
    </div>

    <div class="tab-content" v-if="activeTab === 'notificaciones'">
      <h2>Notificaciones</h2>

      <label>
        <input type="checkbox" v-model="form.novedades" />
        Recibir correos de novedades
      </label>

      <label>
        <input type="checkbox" v-model="form.alertas" />
        Alertas de propiedades
      </label>

      <button class="save-btn" @click="saveNotificaciones">Guardar preferencias</button>
    </div>

    <div class="tab-content" v-if="activeTab === 'preferencias'">
      <h2>Preferencias</h2>

      <label>Tema:</label>
      <select v-model="form.tema">
        <option>Claro</option>
        <option>Oscuro</option>
        <option>Futurista</option>
      </select>

      <label>Idioma:</label>
      <select v-model="form.idioma">
        <option>Español</option>
        <option>Inglés</option>
      </select>

      <button class="save-btn" @click="savePreferencias">Guardar preferencias</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// pestañas dinámicas
const tabs = [
  { id: "perfil", label: "Perfil" },
  { id: "seguridad", label: "Seguridad" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "preferencias", label: "Preferencias" },
];

const activeTab = ref("perfil");

// FORMULARIO
const form = ref({
  nombre: "",
  email: "",
  actualPass: "",
  newPass: "",
  novedades: false,
  alertas: false,
  tema: "Claro",
  idioma: "Español",
});

// FUNCIONES
const goHome = () => router.push("/home");
const openNotifications = () => alert("Abrir modal de notificaciones");
const handleAvatar = (e) => console.log("Avatar seleccionado:", e.target.files[0]);

const savePerfil = () => console.log("Guardado Perfil:", form.value);
const savePassword = () => console.log("Actualizada contraseña");
const saveNotificaciones = () => console.log("Guardadas notificaciones");
const savePreferencias = () => console.log("Guardadas preferencias");
</script>

<style scoped>
/* -------- FONDO -------- */
.ajustes-container {
  max-width: 900px;
  margin: 60px auto;
  background: rgba(255,255,255,0.05);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  backdrop-filter: blur(10px);
  color: #f5f0eb;
  font-family: 'Inter', sans-serif;
}

/* -------- NAV BAR -------- */
.barra {
  width: 90%;
  margin: 20px auto;
  background-color: rgba(86,44,29,0.85);
  border-radius: 20px;
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-click {
  height: 40px;
  cursor: pointer;
}

.volver,
.notificaciones {
  font-size: 22px;
  margin-left: 20px;
  cursor: pointer;
  transition: 0.2s;
}

.volver:hover,
.notificaciones:hover {
  transform: scale(1.2);
  color: #da9c5f;
}

/* -------- TITULOS -------- */
h1 {
  text-align: center;
  font-size: 2rem;
}
p {
  text-align: center;
  color: #d3cfc9;
  margin-bottom: 30px;
}

/* -------- TABS -------- */
.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 25px;
  border-bottom: 2px solid rgba(255,255,255,0.2);
}
.tab-button {
  background: none;
  border: none;
  color: #d3cfc9;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  transition: .2s;
}
.tab-button.active,
.tab-button:hover {
  border-bottom: 3px solid #d2b48c;
  color: #fff;
}

/* -------- CONTENIDO -------- */
.tab-content {
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
label {
  margin-top: 15px;
  display: block;
}
input, select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  margin-bottom: 15px;
  background: rgba(255,255,255,0.15);
  color: #fff;
}

/* -------- BOTONES -------- */
.save-btn {
  margin-top: 15px;
  background: #d2b48c;
  color: #382e2b;
  font-weight: 700;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  width: 100%;
  transition: 0.3s;
}
.save-btn:hover {
  background: #e6c79c;
}
</style>
