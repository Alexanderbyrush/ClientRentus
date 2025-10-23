<template>
  <div class="main-container">
    <!-- Panel Izquierdo -->
    <div class="left-panel">
      <div class="left-inner">
        <div class="left-content">
          <div class="logo">
            <img
              src="@/assets/img/logodark.png"
              alt="Logo RentUs"
              class="logo-img"
            />
            <h1>
              <span class="logo-black">Rent</span>
              <span class="logo-brown">Us</span>
            </h1>
          </div>

          <h3><em>¡Únete a Rent Us!</em></h3>
          <p>
            Crea tu cuenta y empieza a construir el camino hacia tu próximo
            hogar.
          </p>
        </div>
        <img class="house-img" src="@/assets/img/casa.png" alt="Casa" />
      </div>
    </div>

    <!-- Panel Derecho -->
    <div class="right-panel">
      <h2><strong>Registrarse</strong></h2>

      <div class="nav-buttons">
        <span class="slider-bg" style="left: calc(100% / 3 + 4px)"></span>
        <button class="nav-btn" @click="setTab('login')">Iniciar Sesión</button>
        <button class="nav-btn active" @click="setTab('register')">
          Registrarse
        </button>
        <button class="nav-btn" @click="goBack">Volver</button>
      </div>

      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Formulario -->
      <form class="login-form" @submit.prevent="handleRegister">
        <input
          v-model="name"
          type="text"
          placeholder="Nombre completo"
          required
        />
        <input v-model="phone" type="text" placeholder="Teléfono" required />
        <input
          v-model="email"
          type="email"
          placeholder="Correo electrónico"
          required
        />
        <input v-model="address" type="text" placeholder="Dirección" required />
        <input
          v-model="id_documento"
          type="text"
          placeholder="Documento"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          required
        />
        <input
          v-model="password_confirmation"
          type="password"
          placeholder="Confirmar contraseña"
          required
        />

        <button type="submit" class="login-btn">Crear Cuenta</button>
      </form>

      <!-- Redes Sociales -->
      <p class="or">O continua con</p>
      <div class="social-login">
        <img
          src="https://img.icons8.com/ios-filled/40/mac-os.png"
          alt="Apple"
        />
        <img
          src="https://img.icons8.com/ios-filled/40/facebook-new.png"
          alt="Facebook"
        />
        <img
          src="https://img.icons8.com/ios-filled/40/google-logo.png"
          alt="Google"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const { register } = useAuth();

const name = ref("");
const phone = ref("");
const email = ref("");
const address = ref("");
const id_documento = ref("");
const password = ref("");
const password_confirmation = ref("");
const errorMessage = ref("");

const handleRegister = async () => {
  errorMessage.value = "";
  try {
    const response = await register({
      name: name.value,
      phone: phone.value,
      email: email.value,
      address: address.value,
      id_documento: id_documento.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
      status: "active",
    });

    if (response?.token && response?.user) {
      // Guardar token y usuario en localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: response.user.name,
        })
      );

      // Redirigir al Home
      router.push("/");
    } else {
      errorMessage.value = "No se pudo crear la cuenta. Verifica los datos.";
    }
  } catch (err) {
    errorMessage.value = "Error en el registro. Intenta nuevamente.";
  }
};

const setTab = (tab: string) => {
  if (tab === "login") router.push("/login");
  if (tab === "register") router.push("/register");
};

const goBack = () => {
  router.push("/");
};
</script>

<style scoped>
@import "@/assets/css/login/login.css";

.error-message {
  color: red;
  background: #ffe5e5;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 4px;
}
</style>
