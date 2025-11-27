<template>
  <transition name="fade">
    <div v-if="open" class="overlay" @click.self="close">
      <transition name="modal">
        <div class="modal">
          <header class="modal-header">
            <div class="title-box">
              <h2>Proponer otra fecha</h2>
              <p class="subtitle">{{ request?.user?.name }}</p>
            </div>
            <button class="btn-close" @click="close">✕</button>
          </header>

          <section class="modal-body">
            <!-- Fecha original solicitada -->
            <div class="info-box original">
              <h4>📅 Fecha solicitada originalmente:</h4>
              <p>
                <strong>{{ formatDate(request?.requested_date) }}</strong> 
                a las 
                <strong>{{ request?.requested_time }}</strong>
              </p>
            </div>

            <!-- Formulario de nueva propuesta -->
            <form @submit.prevent="submitCounter" class="counter-form">
              <div class="form-group">
                <label>📅 Nueva fecha propuesta</label>
                <input 
                  v-model="form.counter_date" 
                  type="date" 
                  :min="minDate"
                  class="input" 
                  required 
                />
              </div>

              <div class="form-group">
                <label>🕐 Nueva hora propuesta</label>
                <input 
                  v-model="form.counter_time" 
                  type="time" 
                  class="input" 
                  required 
                />
              </div>

              <div class="info-box">
                <i class="fas fa-info-circle"></i>
                <p>El usuario recibirá una notificación con tu propuesta y podrá aceptarla o rechazarla.</p>
              </div>

              <div class="actions">
                <button type="button" class="btn secondary" @click="close">
                  Cancelar
                </button>
                <button type="submit" class="btn primary" :disabled="loading">
                  <span v-if="!loading">Enviar Propuesta</span>
                  <span v-else>Enviando...</span>
                </button>
              </div>
            </form>

            <!-- Mensaje de éxito -->
            <div v-if="success" class="success-message">
              <i class="fas fa-check-circle"></i>
              <p>¡Propuesta enviada exitosamente!</p>
            </div>

            <!-- Mensaje de error -->
            <div v-if="error" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <p>{{ error }}</p>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { rentalRequestService } from "@/services/rentalRequestService";
import type { RentalRequestItem } from "@/services/rentalRequestService";

const props = defineProps<{
  open: boolean;
  request: RentalRequestItem | null;
}>();

const emit = defineEmits(["close", "success"]);

const form = ref({
  counter_date: "",
  counter_time: "",
});

const loading = ref(false);
const success = ref(false);
const error = ref("");

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    form.value = {
      counter_date: "",
      counter_time: "",
    };
    success.value = false;
    error.value = "";
  }
});

const formatDate = (date?: string) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

const submitCounter = async () => {
  if (!props.request) return;

  loading.value = true;
  error.value = "";

  try {
    await rentalRequestService.counterPropose(props.request.id, {
      counter_date: form.value.counter_date,
      counter_time: form.value.counter_time,
    });

    success.value = true;
    
    setTimeout(() => {
      emit("success");
      close();
    }, 2000);
  } catch (err: any) {
    error.value = err.response?.data?.message || "Error al enviar la propuesta";
  } finally {
    loading.value = false;
  }
};

const close = () => {
  emit("close");
};
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(25, 25, 25, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
}

.modal {
  width: 500px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-box h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.subtitle {
  font-size: 13px;
  color: #6d6d6d;
  margin-top: 4px;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #555;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f0f0f0;
  color: #111;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.info-box {
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  font-size: 14px;
}

.info-box.original {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  color: #856404;
  flex-direction: column;
  gap: 8px;
}

.info-box.original h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.info-box.original p {
  margin: 0;
  font-size: 15px;
}

.info-box:not(.original) {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  color: #1565c0;
  align-items: flex-start;
}

.info-box i {
  font-size: 16px;
  margin-top: 2px;
}

.counter-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.input {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.1);
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.secondary {
  background: #e0e0e0;
  color: #555;
}

.btn.secondary:hover {
  background: #d0d0d0;
}

.btn.primary {
  background: #f39c12;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #e67e22;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message,
.error-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 16px;
}

.success-message {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

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

@media (max-width: 768px) {
  .modal {
    width: 90%;
    max-width: 500px;
  }

  .actions {
    flex-direction: column;
  }
}
</style>