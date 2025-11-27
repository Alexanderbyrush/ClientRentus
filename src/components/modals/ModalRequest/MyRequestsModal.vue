<template>
  <transition name="fade">
    <div v-if="open" class="overlay" @click.self="close">
      <transition name="modal">
        <div class="modal">
          <header class="modal-header">
            <div class="title-box">
              <h2>Mis Solicitudes de Visita</h2>
              <p class="subtitle">Seguimiento de tus citas programadas</p>
            </div>
            <button class="btn-close" @click="close">✕</button>
          </header>

          <section class="modal-body">
            <!-- Loading -->
            <div v-if="loading" class="loading">
              <div class="spinner"></div>
              <p>Cargando solicitudes...</p>
            </div>

            <!-- Solicitudes -->
            <div v-else-if="solicitudes.length > 0">
              <div
                class="request-item"
                v-for="solicitud in solicitudes"
                :key="solicitud.id"
              >
                <!-- Imagen de la propiedad -->
                <div class="property-image">
                  <img 
                    :src="solicitud.property?.image_url" 
                    :alt="solicitud.property?.title" 
                  />
                </div>

                <div class="request-details">
                  <!-- Info de la propiedad -->
                  <div class="property-info">
                    <h4>{{ solicitud.property?.title }}</h4>
                    <p class="address">📍 {{ solicitud.property?.address }}</p>
                  </div>

                  <!-- Fecha solicitada -->
                  <div class="date-info">
                    <p class="label">Fecha solicitada:</p>
                    <p class="value">
                      📅 {{ formatDate(solicitud.requested_date) }} 
                      🕐 {{ solicitud.requested_time }}
                    </p>
                  </div>

                  <!-- Contra-propuesta (si existe) -->
                  <div 
                    v-if="solicitud.status === 'counter_proposed'" 
                    class="counter-proposal"
                  >
                    <p class="label">🔄 Nueva fecha propuesta por el dueño:</p>
                    <p class="value highlight">
                      📅 {{ formatDate(solicitud.counter_date) }} 
                      🕐 {{ solicitud.counter_time }}
                    </p>
                  </div>

                  <!-- Estado -->
                  <div class="status-badge" :class="solicitud.status">
                    {{ getStatusText(solicitud.status) }}
                  </div>

                  <!-- Acciones según estado -->
                  <div class="actions">
                    <!-- Contra-propuesta pendiente -->
                    <template v-if="solicitud.status === 'counter_proposed'">
                      <button 
                        class="btn success" 
                        @click="acceptCounter(solicitud.id)"
                      >
                        ✓ Aceptar nueva fecha
                      </button>
                      <button 
                        class="btn danger" 
                        @click="rejectCounter(solicitud.id)"
                      >
                        ✕ Rechazar
                      </button>
                    </template>

                    <!-- Aceptada - Esperando visita -->
                    <template v-else-if="solicitud.status === 'accepted'">
                      <div class="info-message">
                        ✅ Visita confirmada. El dueño te contactará pronto.
                      </div>
                    </template>

                    <!-- Contrato enviado -->
                    <template v-else-if="solicitud.status === 'contract_sent'">
                      <button 
                        class="btn primary" 
                        @click="viewContract(solicitud)"
                      >
                        📄 Ver Contrato
                      </button>
                    </template>

                    <!-- Rechazada -->
                    <template v-else-if="solicitud.status === 'rejected'">
                      <div class="info-message rejected">
                        ❌ Solicitud rechazada por el dueño
                      </div>
                    </template>

                    <!-- Pendiente -->
                    <template v-else-if="solicitud.status === 'pending'">
                      <div class="info-message pending">
                        ⏳ Esperando respuesta del dueño...
                      </div>
                      <button 
                        class="btn danger-outline" 
                        @click="cancelRequest(solicitud.id)"
                      >
                        Cancelar solicitud
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vacío -->
            <div v-else class="empty">
              <i class="fas fa-clipboard-list"></i>
              <p>No tienes solicitudes de visita</p>
              <button class="btn primary" @click="goToProperties">
                Buscar propiedades
              </button>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";
import { rentalRequestService } from "@/services/rentalRequestService";

const props = defineProps({
  open: Boolean
});

const emit = defineEmits(["close", "view-contract"]);
const router = useRouter();

const solicitudes = ref([]);
const loading = ref(false);

const close = () => emit("close");

// Cargar solicitudes cuando se abre
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await loadRequests();
  }
});

const loadRequests = async () => {
  loading.value = true;
  try {
    solicitudes.value = await rentalRequestService.getMyRequests();
  } catch (error) {
    console.error("Error cargando solicitudes:", error);
  } finally {
    loading.value = false;
  }
};

// Aceptar contra-propuesta
const acceptCounter = async (requestId) => {
  try {
    await rentalRequestService.acceptCounterProposal(requestId);
    await loadRequests();
  } catch (error) {
    console.error("Error aceptando contra-propuesta:", error);
    alert("Error al aceptar la nueva fecha");
  }
};

// Rechazar contra-propuesta
const rejectCounter = async (requestId) => {
  if (!confirm("¿Rechazar la fecha propuesta?")) return;
  
  try {
    await rentalRequestService.rejectCounterProposal(requestId);
    await loadRequests();
  } catch (error) {
    console.error("Error rechazando contra-propuesta:", error);
    alert("Error al rechazar");
  }
};

// Cancelar solicitud
const cancelRequest = async (requestId) => {
  if (!confirm("¿Cancelar esta solicitud de visita?")) return;
  
  try {
    await rentalRequestService.cancelRequest(requestId);
    await loadRequests();
  } catch (error) {
    console.error("Error cancelando solicitud:", error);
    alert("Error al cancelar");
  }
};

// Ver contrato
const viewContract = (request) => {
  close();
  emit("view-contract", request);
  router.push("/contratos");
};

// Ir a propiedades
const goToProperties = () => {
  close();
  router.push("/propiedades");
};

// Utilidades
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getStatusText = (status) => {
  const map = {
    pending: "Pendiente",
    accepted: "Aceptada",
    rejected: "Rechazada",
    counter_proposed: "Nueva fecha propuesta",
    visit_completed: "Visita completada",
    contract_sent: "Contrato enviado"
  };
  return map[status] || status;
};
</script>

<style scoped>
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

.modal {
  width: 650px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

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

.modal-body {
  padding: 18px 22px;
  overflow-y: auto;
  max-height: 70vh;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.request-item {
  background: #fafafa;
  border-radius: 14px;
  border: 1px solid #ececec;
  margin-bottom: 16px;
  overflow: hidden;
  transition: 0.2s ease;
}

.request-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.property-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.request-details {
  padding: 16px;
}

.property-info h4 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.address {
  margin: 0;
  font-size: 14px;
  color: #777;
}

.date-info,
.counter-proposal {
  margin: 12px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.counter-proposal {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.label {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.value {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.value.highlight {
  color: #f39c12;
  font-size: 16px;
}

.status-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  margin: 12px 0;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.accepted {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.counter_proposed {
  background: #fff3cd;
  color: #856404;
}

.status-badge.contract_sent {
  background: #e7f3ff;
  color: #004085;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.success {
  background: #2ecc71;
  color: white;
  flex: 1;
}

.success:hover {
  background: #27ae60;
}

.danger {
  background: #e74c3c;
  color: white;
  flex: 1;
}

.danger:hover {
  background: #c0392b;
}

.primary {
  background: #3498db;
  color: white;
}

.primary:hover {
  background: #2980b9;
}

.danger-outline {
  background: transparent;
  color: #e74c3c;
  border: 2px solid #e74c3c;
  font-size: 13px;
}

.danger-outline:hover {
  background: #e74c3c;
  color: white;
}

.info-message {
  padding: 12px;
  background: #e7f3ff;
  color: #004085;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  width: 100%;
}

.info-message.rejected {
  background: #f8d7da;
  color: #721c24;
}

.info-message.pending {
  background: #fff3cd;
  color: #856404;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty p {
  font-size: 16px;
  margin: 0 0 20px;
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
    width: 95%;
  }

  .actions {
    flex-direction: column;
  }

  .actions .btn {
    width: 100%;
  }
}
</style>