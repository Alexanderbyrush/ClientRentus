<template>
  <transition name="fade">
    <div v-if="open" class="overlay" @click.self="close">
      <transition name="modal">
        <div class="modal">
          <!-- HEADER -->
          <header class="modal-header">
            <div class="title-box">
              <h2>Solicitudes de Arriendo</h2>
              <p class="subtitle">Revisa y gestiona solicitudes pendientes</p>
            </div>

            <button class="btn-close" @click="close">✕</button>
          </header>

          <!-- LISTA -->
          <section class="modal-body">
            <div
              class="request-item"
              v-for="(solicitud, index) in solicitudes"
              :key="index"
            >
              <div class="request-info">
                <div class="avatar">{{ solicitud.nombre.charAt(0) }}</div>

                <div class="text">
                  <p class="name">{{ solicitud.nombre }}</p>
                  <p class="msg">{{ solicitud.mensaje }}</p>
                  <p class="date">📅 {{ solicitud.fecha }}</p>
                </div>
              </div>

              <div class="actions">
                <button class="btn success">Revisar</button>
                <button class="btn danger">Rechazar</button>
              </div>
            </div>

            <!-- SI QUIERES AGREGAR LOADING O VACÍO -->

            <div v-if="solicitudes.length === 0" class="empty">
              <img src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png" />
              <p>No hay solicitudes por ahora</p>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  open: Boolean,
});

const emit = defineEmits(["close"]);
const close = () => emit("close");

const solicitudes = [
  {
    nombre: "Juan Pérez",
    mensaje: "Está interesado en el apartamento en Medellín.",
    fecha: "2025-07-25",
  },
  {
    nombre: "Camila Torres",
    mensaje: "Desea visitar la casa en Envigado.",
    fecha: "2025-07-24",
  },
];
</script>

<style scoped>
/* =================== OVERLAY =================== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(25, 25, 25, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}

/* =================== MODAL =================== */
.modal {
  width: 530px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: pop 0.25s ease;
}

/* =================== HEADER =================== */
.modal-header {
  padding: 18px 22px;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-box h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.subtitle {
  font-size: 13px;
  color: #6d6d6d;
  margin-top: 3px;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #555;
}
.btn-close:hover {
  color: #111;
}

/* =================== BODY =================== */
.modal-body {
  padding: 18px 22px;
  overflow-y: auto;
}

/* =================== ITEM =================== */
.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1px solid #ececec;
  margin-bottom: 16px;
  transition: 0.2s ease;
}

.request-item:hover {
  background: #f3f3f3;
  transform: translateX(3px);
}

/* =================== AVATAR =================== */
.avatar {
  width: 42px;
  height: 42px;
  background: #0077ff;
  color: white;
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
}

.request-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.text .name {
  font-weight: 600;
  font-size: 16px;
  margin: 0;
}

.msg {
  margin: 2px 0;
  color: #5a5a5a;
  font-size: 14px;
}

.date {
  font-size: 12px;
  color: #777;
}

/* =================== BUTTONS =================== */
.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 7px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.success {
  background: #2ecc71;
  color: white;
}
.success:hover {
  background: #27ae60;
}

.danger {
  background: #e74c3c;
  color: white;
}
.danger:hover {
  background: #c0392b;
}

/* ================= EMPTY ================= */
.empty {
  text-align: center;
  padding: 40px 0;
}
.empty img {
  width: 90px;
  opacity: 0.7;
}
.empty p {
  margin-top: 15px;
  font-size: 15px;
  color: #666;
}

/* =================== ANIMACIONES =================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active {
  animation: pop 0.25s;
}
@keyframes pop {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
