<template>
  <div class="contracts-page">
    <div class="page-background"></div>

    

    <main class="carousel-container">
      <h2 class="titulo">Gestión de Pagos</h2>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando contratos de pago...</p>
      </div>
      
      <div v-else-if="error" class="error-alert-dark" role="alert">
        <p class="error-title-dark">Error al cargar datos</p>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="contracts.length === 0" class="empty-state-dark">
        <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <h3 class="empty-title">Sin Pagos Pendientes</h3>
        <p class="empty-message">
          No tienes contratos de arrendamiento con pagos pendientes.
        </p>
      </div>

      <div v-else class="carousel">
        <div
          v-for="(contract, index) in contracts"
          :key="contract.id"
          class="card payment-card"
          :class="{
            active: activeIndex === index,
            [getContractStatusClass(contract.payment_status)]: true,
          }"
          @click="setActiveContract(index)"
        >
          <div 
            class="card-badge" 
            :class="getBadgeClass(contract.payment_status)">
            {{ getStatusLabel(contract.payment_status) }}
          </div>

          <svg class="payment-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>

          <h4 class="card-title">{{ contract.property_title }}</h4>
          <p class="property-address">Contrato #{{ contract.id }}</p>

          <p class="payment-detail">
            <span class="detail-label">Monto a pagar:</span>
            <span class="detail-value" :class="getAmountColor(contract.payment_status)">
              {{ formatAmount(contract.amount_due) }}
            </span>
          </p>
          
          <p class="payment-detail">
            <span class="detail-label">Próximo pago:</span>
            <span class="detail-value text-white">
              {{ contract.next_payment_date }}
            </span>
          </p>

          <div class="card-actions">
            <button
              v-if="contract.payment_status === 'pending'"
              class="btn-pay"
              @click.stop="openPaymentModal(contract)"
            >
              <i class="fas fa-money-bill-wave"></i>
              Realizar Pago
            </button>

            <button
              v-else-if="contract.payment_status === 'paid'"
              class="btn-receipt-sm"
              @click.stop="viewReceipt(contract.latest_payment_id)"
            >
              <i class="fas fa-file-invoice"></i>
              Ver Comprobante
            </button>

            <button
              v-else
              class="btn-contact-sm"
              @click.stop="viewReceipt(contract.latest_payment_id)"
            >
              <i class="fas fa-info-circle"></i>
              Ver Detalles
            </button>
          </div>
        </div>
      </div>

      <div v-if="!loading && contracts.length > 0" class="carousel-controls">
        <button @click="prevContract" :disabled="activeIndex === 0">⟨</button>
        <span class="carousel-counter">
          {{ activeIndex + 1 }} / {{ contracts.length }}
        </span>
        <button
          @click="nextContract"
          :disabled="activeIndex === contracts.length - 1"
        >
          ⟩
        </button>
      </div>

      <div v-if="!loading" class="contracts-stats">
        <div class="stat-item">
          <span class="stat-number color-amber">{{ paymentStats.total }}</span>
          <span class="stat-label">Total Contratos</span>
        </div>
        <div class="stat-item">
          <span class="stat-number color-green">{{ paymentStats.paid }}</span>
          <span class="stat-label">Pagados</span>
        </div>
        <div class="stat-item">
          <span class="stat-number color-red">{{ paymentStats.overdue }}</span>
          <span class="stat-label">Vencidos</span>
        </div>
      </div>
    </main>

    <!-- Modal de Pago (Componente de simulación) -->
    <PaymentGateway
      v-if="showPaymentModal"
      :amount="currentContract.amount_due"
      :order-id="currentContract.id"
      :reference="paymentReference"
      @close="showPaymentModal = false"
      @payment-success="handlePaymentSuccess"
    />

    <!-- Modal de Éxito -->
    <div v-if="showSuccessModal" class="success-modal-overlay-dark" @click="showSuccessModal = false">
        <div class="success-modal-content-dark">
            <svg class="success-icon-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 class="success-title-dark">¡Pago Recibido!</h3>
            <p class="success-message-dark">Tu transacción ha sido procesada exitosamente.</p>
            <p class="success-message-dark font-semibold mt-2">Referencia: {{ paymentReference }}</p>
            <button @click="showSuccessModal = false; loadContracts()" class="btn-close-modal-dark">
                Cerrar y Actualizar
            </button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// Usamos ruta relativa porque no hay servicios externos
import PaymentGateway from './PaymentGateway.vue'; 

// Definiciones de Tipos
interface Contract {
  id: number;
  property_title: string;
  landlord_name: string;
  tenant_name: string;
  is_tenant: boolean;
  amount_due: number;
  next_payment_date: string;
  payment_status: 'pending' | 'paid' | 'overdue' | 'future';
  latest_payment_id: number | null;
}

// --- DATOS MOCK SOLICITADOS ---
const MOCK_CONTRACTS: Contract[] = [
  {
    id: 101,
    property_title: 'Apartamento Central - Calle 45',
    landlord_name: 'Inmobiliaria Global',
    tenant_name: 'Juan Pérez',
    is_tenant: true,
    amount_due: 500000, // $500.000 COP
    next_payment_date: '27/11/2025',
    payment_status: 'pending',
    latest_payment_id: 501,
  },
  {
    id: 102,
    property_title: 'Oficina Ejecutiva - Torre Sur',
    landlord_name: 'Inmobiliaria Global',
    tenant_name: 'Ana Gómez',
    is_tenant: true,
    amount_due: 1200000,
    next_payment_date: '15/12/2025',
    payment_status: 'paid',
    latest_payment_id: 502,
  },
  {
    id: 103,
    property_title: 'Local Comercial - Av. Principal',
    landlord_name: 'Inmobiliaria Global',
    tenant_name: 'Carlos Ruiz',
    is_tenant: true,
    amount_due: 750000,
    next_payment_date: '01/11/2025',
    payment_status: 'overdue',
    latest_payment_id: 503,
  }
];
// --- FIN DATOS MOCK ---


// Variables Reactivas
const contracts = ref<Contract[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const activeIndex = ref(0);
const showPaymentModal = ref(false);
const showSuccessModal = ref(false);
const currentContract = ref<Contract>({} as Contract);
const paymentReference = ref('39843024'); // Referencia fija para la confirmación
const paymentStats = ref({
    paid: 0,
    overdue: 0,
    total: 0
});

// Lógica de Carga (Simulada) y Manejo de Estados
const loadContracts = () => {
  loading.value = true;
  error.value = null;
  
  // Simular la carga de 1 segundo
  setTimeout(() => {
    // Usar una copia mutable de los datos mock
    contracts.value = JSON.parse(JSON.stringify(MOCK_CONTRACTS));
    
    // Recalcular estadísticas
    paymentStats.value.total = contracts.value.length;
    paymentStats.value.paid = contracts.value.filter(c => c.payment_status === 'paid').length;
    paymentStats.value.overdue = contracts.value.filter(c => c.payment_status === 'overdue').length;
    
    loading.value = false;
  }, 1000); // 1 segundo para el efecto de carga
};

// Métodos de navegación del carrusel
const setActiveContract = (index: number) => (activeIndex.value = index);
const prevContract = () => activeIndex.value > 0 && activeIndex.value--;
const nextContract = () =>
  activeIndex.value < contracts.value.length - 1 && activeIndex.value++;

// Modal y Formato
const formatAmount = (value: number): string => {
  if (typeof value !== 'number') return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

const openPaymentModal = (contract: Contract) => {
  currentContract.value = contract;
  showPaymentModal.value = true;
};

const handlePaymentSuccess = (data: any) => {
  // 1. Cerrar el modal de pago
  showPaymentModal.value = false;
  
  // 2. Marcar el contrato como 'paid' en la vista (simulación)
  const contractToUpdate = contracts.value.find(c => c.id === currentContract.value.id);
  if (contractToUpdate) {
    contractToUpdate.payment_status = 'paid';
    contractToUpdate.latest_payment_id = Date.now(); // Nuevo ID simulado
  }

  // 3. Mostrar el modal de éxito
  showSuccessModal.value = true;
  
  // Las estadísticas se actualizarán en la siguiente carga, pero las forzamos
  paymentStats.value.paid += 1;
  paymentStats.value.overdue = contracts.value.filter(c => c.payment_status === 'overdue').length;
  paymentStats.value.total = contracts.value.length;
};

// --- Funciones de Estilo y Estado (Mantenidas del original) ---

const getContractStatusClass = (status: Contract['payment_status']): string => {
  switch (status) {
    case 'paid':
      return 'border-green';
    case 'overdue':
      return 'border-red';
    case 'pending':
      return 'border-amber';
    default:
      return 'border-gray';
  }
};

const getBadgeClass = (status: Contract['payment_status']): string => {
  switch (status) {
    case 'paid':
      return 'badge-green';
    case 'overdue':
      return 'badge-red';
    case 'pending':
      return 'badge-amber';
    default:
      return 'badge-gray';
  }
};

const getAmountColor = (status: Contract['payment_status']): string => {
  switch (status) {
    case 'paid':
      return 'color-green';
    case 'overdue':
      return 'color-red';
    case 'pending':
      return 'color-amber';
    default:
      return 'color-dark-gray';
  }
};

const getStatusLabel = (status: Contract['payment_status']): string => {
  switch (status) {
    case 'paid':
      return 'Pagado';
    case 'overdue':
      return 'VENCIDO';
    case 'pending':
      return 'Pendiente';
    case 'future':
      return 'Próximo';
    default:
      return 'Estado desconocido';
  }
};

const viewReceipt = (paymentId: number | null) => {
  if (paymentId) {
    // Alerta reemplazada por un console.log para evitar el uso de alert()
    console.log(`Visualizando comprobante para el Pago ID: ${paymentId}. (Ir a la vista de Comprobante)`);
  } else {
     console.log('No se encontró ID de pago reciente.');
  }
};


// Ciclo de Vida
onMounted(() => {
  loadContracts();
});
</script>

<style scoped>
/* Colores y Variables (Mantenidos y adaptados) */
.color-green { color: #10b981; }
.color-red { color: #ef4444; }
.color-amber { color: #f59e0b; }
.color-dark-gray { color: #ccc; }

.badge-green { background: #059669; }
.badge-red { background: #dc2626; }
.badge-amber { background: #f59e0b; }
.badge-gray { background: #6b7280; }

.border-green { border-color: #059669 !important; }
.border-red { border-color: #dc2626 !important; }
.border-amber { border-color: #f59e0b !important; }
.border-gray { border-color: #6b7280 !important; }


/* ESTILOS DEL USUARIO (BASE) */

.contracts-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Usando tu imagen de fondo y efectos */
  background: url("https://i.pinimg.com/1200x/e2/d2/b7/e2d2b7877ffb88a68d6b72e5ea0bd965.jpg")
    center center / cover no-repeat;
  filter: blur(8px) brightness(0.7);
  z-index: -1;
}

/* Contenedor principal */
.carousel-container {
  position: relative;
  width: 90%;
  max-width: 1000px;
  text-align: center;
  margin: 0 auto;
  padding: 4rem 0 2rem; 
  z-index: 5;
}

.titulo {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #f0e5db;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 600;
}

/* Carrusel y Tarjetas */
.carousel {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  perspective: 1200px;
  min-height: 350px;
}

.card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 1.5rem;
  width: 250px;
  transform: scale(0.85);
  transition: all 0.5s ease;
  opacity: 0.6;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  position: relative; 
}

.card:hover {
  transform: scale(0.9);
  opacity: 0.8;
}

.card.active {
  transform: scale(1.1);
  opacity: 1;
  z-index: 2;
  border: 2px solid; 
  box-shadow: 0 10px 30px rgba(218, 156, 95, 0.3);
}

.payment-icon {
    width: 80px;
    height: 80px;
    color: #da9c5f;
    margin: 1rem auto 1.5rem;
    border: 3px solid rgba(218, 156, 95, 0.3);
    border-radius: 50%;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
}

.card-title {
  margin: 0.5rem 0 0.25rem;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
}

.property-address {
  font-size: 0.8rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.payment-detail {
    margin: 0.5rem 0;
    text-align: left;
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
}

.detail-label {
    color: #ccc;
    font-weight: 300;
}

.detail-value {
    font-weight: 600;
}

.card-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    color: white;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 0.75rem;
    font-weight: 700;
    z-index: 3;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* ACCIONES Y BOTONES DE PAGO */
.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  justify-content: center;
}

.btn-pay, .btn-receipt-sm, .btn-contact-sm {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-pay {
  background: linear-gradient(45deg, #da9c5f, #b8791f);
}
.btn-pay:hover {
  background: linear-gradient(45deg, #b8791f, #9a6419);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(218, 156, 95, 0.4);
}

.btn-receipt-sm {
  background: linear-gradient(45deg, #059669, #047857); /* Verde para pagado */
}
.btn-receipt-sm:hover {
  background: linear-gradient(45deg, #047857, #065f46);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 158, 120, 0.4);
}

.btn-contact-sm {
    background: #6b7280; /* Gris para otros/vencidos */
}
.btn-contact-sm:hover {
    background: #4b5563;
    transform: translateY(-2px);
}

/* Controles carrusel */
.carousel-controls {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.carousel-controls button {
  background: #562c1d;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-controls button:hover:not(:disabled) {
  background: #da9c5f;
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(218, 156, 95, 0.3);
}

.carousel-controls button:disabled {
  background: #3a2318;
  color: #8b735e;
  cursor: not-allowed;
  transform: none;
}

.carousel-counter {
  color: #f0e5db;
  font-weight: 600;
  margin: 0 1rem;
}

/* Estadísticas de Pagos */
.contracts-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
  min-width: 80px;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #da9c5f;
}

.stat-label {
  font-size: 0.8rem;
  color: #ccc;
}


/* ESTADOS (Loading, Error, Empty) */
.loading-container {
  text-align: center;
  padding: 3rem;
  color: #f0e5db;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(218, 156, 95, 0.3);
  border-top: 4px solid #da9c5f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-alert-dark {
  background-color: #3b2416; 
  border-left: 4px solid #ef4444; 
  color: #f0e5db; 
  padding: 16px;
  border-radius: 6px;
  margin: 0 auto;
  max-width: 600px;
}

.error-title-dark {
  font-weight: 700;
  color: #f0e5db;
}

.empty-state-dark {
  text-align: center;
  padding: 80px 0;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin: 0 auto;
  max-width: 600px;
}

.empty-icon {
  margin-left: auto;
  margin-right: auto;
  height: 48px;
  width: 48px;
  color: #da9c5f;
}

.empty-title {
  margin-top: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #f0e5db;
}

.empty-message {
  margin-top: 4px;
  font-size: 0.875rem;
  color: #ccc;
}


/* MODAL DE ÉXITO (ADAPTADO AL ESTILO OSCURO) */
.success-modal-overlay-dark {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(46, 29, 18, 0.95);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 1000;
}

.success-modal-content-dark {
    background: linear-gradient(135deg, #3b2416 0%, #2e1d17 100%);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    padding: 32px;
    max-width: 384px;
    width: 100%;
    text-align: center;
    cursor: default;
    border: 1px solid #10b981;
}

.success-icon-dark {
    margin-left: auto;
    margin-right: auto;
    height: 48px;
    width: 48px;
    color: #10b981; /* text-green-500 */
    margin-bottom: 12px;
}

.success-title-dark {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f0e5db;
    margin-top: 12px;
}

.success-message-dark {
    margin-top: 8px;
    color: #ccc;
}

.btn-close-modal-dark {
    margin-top: 20px;
    padding: 10px 20px;
    background: linear-gradient(45deg, #059669, #047857);
    color: #ffffff;
    border-radius: 10px;
    transition: background-color 0.15s;
    cursor: pointer;
    border: none;
    font-weight: 600;
}

.btn-close-modal-dark:hover {
    background: linear-gradient(45deg, #047857, #065f46);
    transform: translateY(-1px);
}


/* Responsive */
@media (max-width: 768px) {
  .carousel {
    flex-direction: column;
    gap: 1rem;
  }

  .card {
    width: 90%;
    max-width: 300px;
    transform: scale(1) !important;
    opacity: 1 !important;
  }
  
  .card.active {
    transform: scale(1.05) !important;
  }

  .titulo {
    font-size: 2rem;
  }

  .carousel-controls button {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .contracts-stats {
    gap: 1rem;
  }

  .stat-item {
    min-width: 60px;
    padding: 0.8rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .titulo {
    font-size: 1.5rem;
  }
}

</style>