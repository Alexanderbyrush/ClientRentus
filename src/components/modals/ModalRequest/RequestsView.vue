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

          <!-- BODY -->
          <section class="modal-body">
            <!-- LOADING -->
            <div v-if="loading" class="loading">
              <div class="spinner"></div>
              <p>Cargando solicitudes...</p>
            </div>

            <!-- SOLICITUDES -->
            <div v-else-if="solicitudes.length > 0">
              <div class="request-item" v-for="solicitud in solicitudes" :key="solicitud.id">
                <!-- IMAGEN PROPIEDAD -->
                <div class="property-image">
                  <img :src="solicitud.property?.image_url" :alt="solicitud.property?.title" />
                </div>

                <div class="request-details">
                  <!-- INFO PROPIEDAD -->
                  <div class="property-info">
                    <h4>{{ solicitud.property?.title }}</h4>
                    <p class="address">📍 {{ solicitud.property?.address }}</p>
                  </div>

                  <!-- INFO INQUILINO -->
                  <div class="tenant-info">
                    <img :src="solicitud.user?.photo || '/img/default.webp'" class="tenant-avatar"
                      :alt="solicitud.user?.name" />
                    <div class="tenant-details">
                      <p class="tenant-name">{{ solicitud.user?.name }}</p>
                      <div class="rating">
                        ⭐ {{ solicitud.user?.rating || 'Sin calificación' }}
                      </div>
                    </div>
                  </div>

                  <!-- FECHA SOLICITADA -->
                  <div class="date-info">
                    <p class="label">Fecha solicitada:</p>
                    <p class="value">
                      📅 {{ formatDate(solicitud.requested_date) }}
                      🕐 {{ solicitud.requested_time }}
                    </p>
                  </div>

                  <!-- CONTRA-PROPUESTA (si existe) -->
                  <div v-if="solicitud.status === 'counter_proposed' && solicitud.counter_date"
                    class="counter-proposal">
                    <p class="label">🔄 Fecha propuesta (esperando respuesta):</p>
                    <p class="value highlight">
                      📅 {{ formatDate(solicitud.counter_date) }}
                      🕐 {{ solicitud.counter_time }}
                    </p>
                  </div>

                  <!-- ESTADO -->
                  <div class="status-badge" :class="solicitud.status">
                    {{ getStatusText(solicitud.status) }}
                  </div>

                  <!-- ACCIONES SEGÚN ESTADO -->
                  <div class="actions">
                    <!-- PENDIENTE - Mostrar botones de revisión -->
                    <template v-if="solicitud.status === 'pending'">
                      <button class="btn success" @click="openReviewModal(solicitud)">
                        👁️ Revisar
                      </button>
                      <button class="btn danger" @click="rechazarDirecto(solicitud.id)">
                        ✕ Rechazar
                      </button>
                    </template>

                    <!-- ACEPTADA - Verificar si ya pasó la visita -->
                    <template v-else-if="solicitud.status === 'accepted'">
                      <div v-if="isVisitPassed(solicitud)" class="actions">
                        <button class="btn primary" @click="openContractModal(solicitud)">
                          ✅ Seguir proceso
                        </button>
                        <button class="btn danger-outline" @click="finalizarProceso(solicitud.id)">
                          ❌ Finalizar proceso
                        </button>
                      </div>
                      <div v-else class="info-message">
                        ⏳ Visita programada. Esperando fecha: {{ formatDate(solicitud.requested_date) }} {{
                        solicitud.requested_time }}
                      </div>
                    </template>

                    <!-- CONTRA-PROPUESTA ENVIADA -->
                    <template v-else-if="solicitud.status === 'counter_proposed'">
                      <div class="info-message pending">
                        ⏳ Esperando respuesta del inquilino...
                      </div>
                    </template>

                    <!-- RECHAZADA -->
                    <template v-else-if="solicitud.status === 'rejected'">
                      <div class="info-message rejected">
                        ❌ Solicitud rechazada
                      </div>
                    </template>

                    <!-- CONTRATO ENVIADO -->
                    <template v-else-if="solicitud.status === 'contract_sent'">
                      <div class="info-message success">
                        ✅ Contrato enviado - Esperando aceptación del inquilino
                      </div>
                    </template>

                    <!-- VISITA COMPLETADA -->
                    <template v-else-if="solicitud.status === 'visit_completed'">
                      <div class="info-message">
                        ✓ Visita completada
                      </div>
                    </template>
                  </div>
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

      <!-- MODAL DE REVISIÓN -->
      <transition name="fade">
        <div v-if="showReviewModal" class="overlay" @click.self="closeReviewModal">
          <div class="review-modal">
            <header class="modal-header">
              <h3>Revisar Solicitud</h3>
              <button class="btn-close" @click="closeReviewModal">✕</button>
            </header>

            <div class="review-content" v-if="selectedRequest">
              <div class="review-property">
                <img :src="selectedRequest.property?.image_url" />
                <div>
                  <h4>{{ selectedRequest.property?.title }}</h4>
                  <p>{{ selectedRequest.property?.address }}</p>
                </div>
              </div>

              <div class="review-tenant">
                <img :src="selectedRequest.user?.photo || '/img/default.webp'" />
                <div>
                  <p class="name">{{ selectedRequest.user?.name }}</p>
                  <p class="rating">⭐ {{ selectedRequest.user?.rating || 'N/A' }}</p>
                  <p class="contact">📧 {{ selectedRequest.user?.email }}</p>
                  <p class="contact">📱 {{ selectedRequest.user?.phone }}</p>
                </div>
              </div>

              <div class="review-date">
                <p><strong>Fecha solicitada:</strong></p>
                <p>📅 {{ formatDate(selectedRequest.requested_date) }}</p>
                <p>🕐 {{ selectedRequest.requested_time }}</p>
              </div>

              <div class="review-actions">
                <button class="btn success-full" @click="aceptarSolicitud">
                  ✓ Aceptar solicitud
                </button>
                <button class="btn warning-full" @click="showCounterForm = true">
                  🔄 Proponer otra fecha
                </button>
                <button class="btn danger-full" @click="rechazarSolicitud">
                  ✕ Rechazar solicitud
                </button>
              </div>

              <!-- FORMULARIO CONTRA-PROPUESTA -->
              <div v-if="showCounterForm" class="counter-form">
                <h4>Proponer nueva fecha y hora</h4>
                <div class="form-group">
                  <label>Nueva fecha:</label>
                  <input type="date" v-model="counterDate" :min="getTodayDate()" />
                </div>
                <div class="form-group">
                  <label>Nueva hora:</label>
                  <input type="time" v-model="counterTime" />
                </div>
                <div class="form-actions">
                  <button class="btn primary" @click="enviarContraPropuesta">
                    Enviar propuesta
                  </button>
                  <button class="btn secondary" @click="showCounterForm = false">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL DE CONTRATO -->
      <transition name="fade">
        <div v-if="showContractModal" class="overlay" @click.self="closeContractModal">
          <div class="contract-modal">
            <header class="modal-header">
              <h3>Enviar Términos del Contrato</h3>
              <button class="btn-close" @click="closeContractModal">✕</button>
            </header>

            <div class="contract-content" v-if="selectedRequest">
              <div class="form-group">
                <label>Fecha de inicio:</label>
                <input type="date" v-model="contractData.start_date" :min="getTodayDate()" />
              </div>

              <div class="form-group">
                <label>Fecha de finalización:</label>
                <input type="date" v-model="contractData.end_date" :min="contractData.start_date" />
              </div>

              <div class="form-group">
                <label>Precio mensual ($):</label>
                <input type="number" v-model.number="contractData.monthly_price"
                  :placeholder="selectedRequest.property?.monthly_price" />
              </div>

              <div class="form-group">
                <label>Depósito/Garantía ($):</label>
                <input type="number" v-model.number="contractData.deposit" />
              </div>

              <div class="form-group">
                <label>Día de pago (1-31):</label>
                <input type="number" v-model.number="contractData.payment_day" min="1" max="31" />
              </div>

              <div class="form-group">
                <label>Multa por retraso ($):</label>
                <input type="number" v-model.number="contractData.late_fee" />
              </div>

              <div class="form-group">
                <label>Servicios incluidos (separados por coma):</label>
                <input type="text" v-model="utilitiesInput" placeholder="Agua, Luz, Internet, Gas" />
              </div>

              <div class="form-group">
                <label>Cláusulas del contrato:</label>
                <textarea v-model="clausesInput" rows="4"
                  placeholder="Ejemplo: No se permiten mascotas, No fumar dentro del inmueble, etc."></textarea>
              </div>

              <div class="form-group">
                <label>Condiciones especiales (opcional):</label>
                <textarea v-model="contractData.special_conditions" rows="3"
                  placeholder="Condiciones adicionales..."></textarea>
              </div>

              <div class="form-actions">
                <button class="btn success-full" @click="enviarContrato">
                  📄 Enviar contrato
                </button>
                <button class="btn secondary" @click="closeContractModal">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import { rentalRequestService } from "@/services/rentalRequestService";

const props = defineProps({
  open: Boolean,
});

const emit = defineEmits(["close"]);

// STATE
const solicitudes = ref([]);
const loading = ref(false);
const showReviewModal = ref(false);
const showCounterForm = ref(false);
const showContractModal = ref(false);
const selectedRequest = ref(null);

// CONTRA-PROPUESTA
const counterDate = ref("");
const counterTime = ref("");

// CONTRATO
const contractData = ref({
  start_date: "",
  end_date: "",
  monthly_price: 0,
  deposit: 0,
  payment_day: 1,
  late_fee: 0,
  special_conditions: ""
});
const utilitiesInput = ref("");
const clausesInput = ref("");

// MÉTODOS
const close = () => emit("close");

// Cargar solicitudes cuando se abre el modal
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await loadRequests();
  }
});

const loadRequests = async () => {
  loading.value = true;
  try {
    solicitudes.value = await rentalRequestService.getOwnerRequests();
  } catch (error) {
    console.error("Error cargando solicitudes:", error);
    alert("Error al cargar solicitudes");
  } finally {
    loading.value = false;
  }
};

// Verificar si la visita ya pasó
const isVisitPassed = (solicitud) => {
  if (!solicitud.visit_end_time) return false;

  // Convierte visit_end_time (supongamos UTC en DB) a Date local
  const visitEndUTC = new Date(solicitud.visit_end_time + "Z"); // 'Z' = UTC
  const now = new Date(); // hora local
  return now >= visitEndUTC;
};


// MODAL DE REVISIÓN
const openReviewModal = (solicitud) => {
  selectedRequest.value = solicitud;
  showReviewModal.value = true;
  showCounterForm.value = false;
  counterDate.value = "";
  counterTime.value = "";
};

const closeReviewModal = () => {
  showReviewModal.value = false;
  selectedRequest.value = null;
  showCounterForm.value = false;
};

// ACEPTAR SOLICITUD
const aceptarSolicitud = async () => {
  if (!selectedRequest.value) return;

  try {
    await rentalRequestService.acceptRequest(selectedRequest.value.id);
    alert("Solicitud aceptada correctamente");
    closeReviewModal();
    await loadRequests();
  } catch (error) {
    console.error("Error aceptando solicitud:", error);
    alert("Error al aceptar la solicitud");
  }
};

// RECHAZAR SOLICITUD
const rechazarSolicitud = async () => {
  if (!selectedRequest.value) return;
  if (!confirm("¿Estás seguro de rechazar esta solicitud?")) return;

  try {
    await rentalRequestService.rejectRequest(selectedRequest.value.id);
    alert("Solicitud rechazada");
    closeReviewModal();
    await loadRequests();
  } catch (error) {
    console.error("Error rechazando solicitud:", error);
    alert("Error al rechazar la solicitud");
  }
};

// RECHAZAR DIRECTO (sin abrir modal)
const rechazarDirecto = async (requestId) => {
  if (!confirm("¿Rechazar esta solicitud sin revisarla?")) return;

  try {
    await rentalRequestService.rejectRequest(requestId);
    alert("Solicitud rechazada");
    await loadRequests();
  } catch (error) {
    console.error("Error rechazando solicitud:", error);
    alert("Error al rechazar");
  }
};

// ENVIAR CONTRA-PROPUESTA
const enviarContraPropuesta = async () => {
  if (!counterDate.value || !counterTime.value) {
    alert("Por favor selecciona fecha y hora");
    return;
  }

  try {
    await rentalRequestService.counterPropose(selectedRequest.value.id, {
      counter_date: counterDate.value,
      counter_time: counterTime.value
    });
    alert("Contra-propuesta enviada correctamente");
    closeReviewModal();
    await loadRequests();
  } catch (error) {
    console.error("Error enviando contra-propuesta:", error);
    alert("Error al enviar contra-propuesta");
  }
};

// MODAL DE CONTRATO
const openContractModal = (solicitud) => {
  selectedRequest.value = solicitud;

  // Pre-llenar con datos de la propiedad
  contractData.value = {
    start_date: "",
    end_date: "",
    monthly_price: solicitud.property?.monthly_price || 0,
    deposit: (solicitud.property?.monthly_price || 0) * 2, // 2 meses de garantía
    payment_day: 1,
    late_fee: 50,
    special_conditions: ""
  };

  utilitiesInput.value = "";
  clausesInput.value = "";
  showContractModal.value = true;
};

const closeContractModal = () => {
  showContractModal.value = false;
  selectedRequest.value = null;
};

// ENVIAR CONTRATO
const enviarContrato = async () => {
  if (!contractData.value.start_date || !contractData.value.end_date) {
    alert("Por favor completa las fechas del contrato");
    return;
  }

  if (contractData.value.monthly_price <= 0) {
    alert("El precio mensual debe ser mayor a 0");
    return;
  }

  try {
    // Convertir strings a arrays
    const utilities = utilitiesInput.value
      .split(",")
      .map(u => u.trim())
      .filter(u => u.length > 0);

    const clauses = clausesInput.value
      .split("\n")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const payload = {
      rental_request_id: selectedRequest.value.id,
      property_id: selectedRequest.value.property_id,
      tenant_id: selectedRequest.value.user_id,
      landlord_id: selectedRequest.value.owner_id,
      start_date: contractData.value.start_date,
      end_date: contractData.value.end_date,
      monthly_price: parseFloat(contractData.value.monthly_price),
      deposit: parseFloat(contractData.value.deposit),
      clauses: clauses,
      payment_day: parseInt(contractData.value.payment_day),
      late_fee: parseFloat(contractData.value.late_fee),
      utilities_included: utilities,
      special_conditions: contractData.value.special_conditions
    };

    await rentalRequestService.sendContractTerms(payload);
    alert("Contrato enviado correctamente al inquilino");
    closeContractModal();
    await loadRequests();
  } catch (error) {
    console.error("Error enviando contrato:", error);
    alert("Error al enviar el contrato");
  }
};

// FINALIZAR PROCESO (sin contrato)
const finalizarProceso = async (requestId) => {
  if (!confirm("¿Finalizar el proceso sin generar contrato?")) return;

  try {
    await rentalRequestService.rejectRequest(requestId);
    alert("Proceso finalizado");
    await loadRequests();
  } catch (error) {
    console.error("Error finalizando proceso:", error);
    alert("Error al finalizar");
  }
};

// UTILIDADES
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
    counter_proposed: "Contra-propuesta enviada",
    visit_completed: "Visita completada",
    contract_sent: "Contrato enviado"
  };
  return map[status] || status;
};

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};
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

/* =================== MODAL PRINCIPAL =================== */
.modal {
  width: 700px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.title-box h2,
.title-box h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
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
  transition: 0.2s;
}

.btn-close:hover {
  color: #111;
  transform: scale(1.1);
}

/* =================== BODY =================== */
.modal-body {
  padding: 18px 22px;
  overflow-y: auto;
  max-height: 70vh;
}

/* =================== LOADING =================== */
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
  to {
    transform: rotate(360deg);
  }
}

/* =================== REQUEST ITEM =================== */
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

/* =================== IMAGEN PROPIEDAD =================== */
.property-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* =================== DETALLES =================== */
.request-details {
  padding: 16px;
}

.property-info h4 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.property-info .address {
  margin: 0;
  font-size: 14px;
  color: #777;
}

/* =================== INFO INQUILINO =================== */
.tenant-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.tenant-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3498db;
}

.tenant-details {
  flex: 1;
}

.tenant-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.rating {
  font-size: 14px;
  color: #f39c12;
  font-weight: 600;
}

/* =================== FECHA INFO =================== */
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

/* =================== STATUS BADGE =================== */
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

.status-badge.visit_completed {
  background: #d1ecf1;
  color: #0c5460;
}

/* =================== ACTIONS =================== */
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
  flex: 1;
}

.primary:hover {
  background: #2980b9;
}

.danger-outline {
  background: transparent;
  color: #e74c3c;
  border: 2px solid #e74c3c;
  flex: 1;
}

.danger-outline:hover {
  background: #e74c3c;
  color: white;
}

/* =================== INFO MESSAGES =================== */
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

.info-message.success {
  background: #d4edda;
  color: #155724;
}

/* =================== EMPTY =================== */
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty img {
  width: 90px;
  opacity: 0.7;
  margin-bottom: 16px;
}

.empty p {
  font-size: 16px;
  margin: 0 0 20px;
}

/* =================== MODAL DE REVISIÓN =================== */
.review-modal {
  width: 600px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.review-content {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.review-property {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.review-property img {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
}

.review-property h4 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.review-property p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.review-tenant {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.review-tenant img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3498db;
}

.review-tenant .name {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.review-tenant .contact {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.review-date {
  padding: 16px;
  background: #e7f3ff;
  border-radius: 12px;
  margin-bottom: 20px;
}

.review-date p {
  margin: 6px 0;
  font-size: 15px;
}

.review-date strong {
  color: #2c3e50;
}

.review-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.success-full,
.warning-full,
.danger-full {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;
}

.success-full {
  background: #2ecc71;
  color: white;
}

.success-full:hover {
  background: #27ae60;
}

.warning-full {
  background: #f39c12;
  color: white;
}

.warning-full:hover {
  background: #e67e22;
}

.danger-full {
  background: #e74c3c;
  color: white;
}

.danger-full:hover {
  background: #c0392b;
}

/* =================== COUNTER FORM =================== */
.counter-form {
  margin-top: 20px;
  padding: 20px;
  background: #fff8e1;
  border-radius: 12px;
  border: 2px solid #ffc107;
}

.counter-form h4 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.secondary {
  background: #95a5a6;
  color: white;
  flex: 1;
}

.secondary:hover {
  background: #7f8c8d;
}

/* =================== MODAL DE CONTRATO =================== */
.contract-modal {
  width: 650px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.contract-content {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
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

/* =================== RESPONSIVE =================== */
@media (max-width: 768px) {

  .modal,
  .review-modal,
  .contract-modal {
    width: 95%;
    max-width: 95vw;
  }

  .actions {
    flex-direction: column;
  }

  .actions .btn {
    width: 100%;
  }

  .property-image {
    height: 160px;
  }

  .review-property,
  .review-tenant {
    flex-direction: column;
    text-align: center;
  }

  .review-property img {
    width: 100%;
    height: 150px;
  }

  .review-tenant img {
    margin: 0 auto;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
