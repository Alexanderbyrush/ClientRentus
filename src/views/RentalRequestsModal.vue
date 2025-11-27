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
            <!-- Loading -->
            <div v-if="loading" class="loading">
              <div class="spinner"></div>
              <p>Cargando solicitudes...</p>
            </div>

            <!-- Solicitudes -->
            <div v-else-if="solicitudes.length > 0">
              <div
                class="request-item"
                v-for="(solicitud, index) in solicitudes"
                :key="index"
              >
                <!-- INFO DEL USUARIO -->
                <div class="request-info">
                  <div class="avatar">
                    <img v-if="solicitud.user?.photo" :src="solicitud.user.photo" />
                    <span v-else>{{ solicitud.user?.name?.charAt(0) || '?' }}</span>
                  </div>

                  <div class="text">
                    <p class="name">{{ solicitud.user?.name || 'Usuario' }}</p>
                    <p class="property">🏠 {{ solicitud.property?.title }}</p>
                    <p class="date">
                      📅 {{ formatDate(solicitud.requested_date) }} 
                      🕐 {{ solicitud.requested_time }}
                    </p>
                    <p class="status-badge" :class="solicitud.status">
                      {{ getStatusText(solicitud.status) }}
                    </p>
                  </div>
                </div>

                <!-- ACCIONES SEGÚN ESTADO -->
                <div class="actions">
                  <!-- Estado: Pendiente -->
                  <template v-if="solicitud.status === 'pending'">
                    <button class="btn success" @click="acceptRequest(solicitud.id)">
                      ✓ Aceptar
                    </button>
                    <button class="btn warning" @click="openCounterModal(solicitud)">
                      🔄 Proponer otra fecha
                    </button>
                    <button class="btn danger" @click="rejectRequest(solicitud.id)">
                      ✕ Rechazar
                    </button>
                  </template>

                  <!-- Estado: Aceptada - Esperando visita -->
                  <template v-else-if="solicitud.status === 'accepted'">
                    <button 
                      class="btn primary" 
                      @click="checkVisitAndContinue(solicitud)"
                      :disabled="!canContinue(solicitud)"
                    >
                      {{ canContinue(solicitud) ? '📋 Continuar Proceso' : '⏳ Esperando visita...' }}
                    </button>
                  </template>

                  <!-- Estado: Visita completada -->
                  <template v-else-if="solicitud.status === 'visit_completed'">
                    <button class="btn primary" @click="openContractModal(solicitud)">
                      📄 Enviar Contrato
                    </button>
                    <button class="btn danger-outline" @click="finalizeProcess(solicitud.id)">
                      🚫 Finalizar sin contrato
                    </button>
                  </template>

                  <!-- Estado: Contrato enviado -->
                  <template v-else-if="solicitud.status === 'contract_sent'">
                    <div class="status-info">
                      ✅ Contrato enviado. Esperando respuesta del inquilino.
                    </div>
                  </template>

                  <!-- Estado: Rechazada -->
                  <template v-else-if="solicitud.status === 'rejected'">
                    <div class="status-info rejected">
                      ❌ Solicitud rechazada
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- VACÍO -->
            <div v-else class="empty">
              <img src="https://cdn-icons-png.flaticon.com/512/4076/4076500.png" />
              <p>No hay solicitudes por ahora</p>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </transition>

  <!-- MODAL: Proponer otra fecha -->
  <CounterProposeModal
    :open="showCounterModal"
    :request="selectedRequest"
    @close="showCounterModal = false"
    @success="handleCounterSuccess"
  />

  <!-- MODAL: Términos del contrato -->
  <ContractTermsModal
    :open="showContractModal"
    :request="selectedRequest"
    @close="showContractModal = false"
    @success="handleContractSuccess"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineProps, defineEmits } from "vue";
import { rentalRequestService } from "@/services/rentalRequestService";
import type { RentalRequestItem } from "@/services/rentalRequestService";
import CounterProposeModal from "@/components/CounterProposeModal.vue";
import ContractTermsModal from "@/components/ContractTermsModal.vue";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits(["close"]);

const solicitudes = ref<RentalRequestItem[]>([]);
const loading = ref(false);
const selectedRequest = ref<RentalRequestItem | null>(null);
const showCounterModal = ref(false);
const showContractModal = ref(false);

const close = () => emit("close");

// Cargar solicitudes
const loadRequests = async () => {
  loading.value = true;
  try {
    solicitudes.value = await rentalRequestService.getOwnerRequests();
  } catch (error) {
    console.error("Error cargando solicitudes:", error);
  } finally {
    loading.value = false;
  }
};

// Aceptar solicitud
const acceptRequest = async (requestId: number) => {
  try {
    await rentalRequestService.acceptRequest(requestId);
    await loadRequests();
  } catch (error) {
    console.error("Error aceptando solicitud:", error);
    alert("Error al aceptar la solicitud");
  }
};

// Rechazar solicitud
const rejectRequest = async (requestId: number) => {
  if (!confirm("¿Estás seguro de rechazar esta solicitud?")) return;
  
  try {
    await rentalRequestService.rejectRequest(requestId);
    await loadRequests();
  } catch (error) {
    console.error("Error rechazando solicitud:", error);
    alert("Error al rechazar la solicitud");
  }
};

// Abrir modal de contra-propuesta
const openCounterModal = (request: RentalRequestItem) => {
  selectedRequest.value = request;
  showCounterModal.value = true;
};

// Verificar si puede continuar (después de la visita)
const canContinue = (request: RentalRequestItem): boolean => {
  if (!request.visit_end_time) return false;
  
  const visitEnd = new Date(request.visit_end_time);
  const now = new Date();
  
  return now >= visitEnd;
};

// Verificar y continuar proceso
const checkVisitAndContinue = async (request: RentalRequestItem) => {
  try {
    const status = await rentalRequestService.checkVisitStatus(request.id);
    
    if (status.can_continue) {
      selectedRequest.value = request;
      showContractModal.value = true;
    } else {
      alert(`Debes esperar hasta que finalice la visita. Tiempo restante: ${status.time_remaining}`);
    }
  } catch (error) {
    console.error("Error verificando estado de visita:", error);
  }
};

// Abrir modal de contrato
const openContractModal = (request: RentalRequestItem) => {
  selectedRequest.value = request;
  showContractModal.value = true;
};

// Finalizar sin contrato
const finalizeProcess = async (requestId: number) => {
  if (!confirm("¿Finalizar proceso sin enviar contrato?")) return;
  
  try {
    await rentalRequestService.rejectRequest(requestId);
    await loadRequests();
  } catch (error) {
    console.error("Error finalizando proceso:", error);
  }
};

// Handlers de éxito
const handleCounterSuccess = () => {
  showCounterModal.value = false;
  loadRequests();
};

const handleContractSuccess = () => {
  showContractModal.value = false;
  loadRequests();
};

// Utilidades
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: "Pendiente",
    accepted: "Aceptada",
    rejected: "Rechazada",
    counter_proposed: "Contra-propuesta enviada",
    visit_completed: "Visita completada",
    contract_sent: "Contrato enviado"
  };
  return map[status] || status;
};

// Cargar al abrir
onMounted(() => {
  if (props.open) {
    loadRequests();
  }
});
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fafafa;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid #ececec;
  margin-bottom: 16px;
  transition: 0.2s ease;
  gap: 16px;
}

.request-item:hover {
  background: #f3f3f3;
  transform: translateX(3px);
}

.avatar {
  width: 50px;
  height: 50px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.request-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.text {
  flex: 1;
}

.text .name {
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 4px;
  color: #2c3e50;
}

.property {
  margin: 2px 0;
  color: #5a5a5a;
  font-size: 14px;
}

.date {
  font-size: 13px;
  color: #777;
  margin: 4px 0;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 6px;
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
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.visit_completed {
  background: #e7f3ff;
  color: #004085;
}

.status-badge.contract_sent {
  background: #d4edda;
  color: #155724;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
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

.warning {
  background: #f39c12;
  color: white;
}

.warning:hover {
  background: #e67e22;
}

.primary {
  background: #3498db;
  color: white;
}

.primary:hover:not(:disabled) {
  background: #2980b9;
}

.primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.danger-outline {
  background: transparent;
  color: #e74c3c;
  border: 2px solid #e74c3c;
}

.danger-outline:hover {
  background: #e74c3c;
  color: white;
}

.status-info {
  padding: 10px;
  background: #e7f3ff;
  color: #004085;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}

.status-info.rejected {
  background: #f8d7da;
  color: #721c24;
}

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

  .request-item {
    flex-direction: column;
  }

  .actions {
    width: 100%;
  }
}
</style>