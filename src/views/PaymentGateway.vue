<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="header-title">
          {{ modalTitle }}
        </h2>
        <div class="step-indicator">Paso {{ currentStep }} de 3</div>
      </div>

      <!-- Paso 1: Selección del Método de Pago -->
      <div v-if="currentStep === 1" class="step-body">
        <div class="amount-display">
          <span class="label">Monto a Pagar:</span>
          <span class="value">{{ formatAmount(amount) }} COP</span>
        </div>
        
        <h3 class="method-title">Selecciona el Método de Pago</h3>
        
        <div class="method-list">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id"
            :class="{ 'method-card-selected': selectedMethod?.id === method.id }"
            class="method-card"
            @click="selectedMethod = method"
          >
            <!-- Asegúrate de tener Font Awesome o iconos disponibles en tu proyecto -->
            <i :class="method.iconClass" class="method-icon"></i>
            <span class="method-name">{{ method.name }}</span>
            <span v-if="selectedMethod?.id === method.id" class="checkmark">✓</span>
          </div>
        </div>

        <button 
          @click="currentStep = 2" 
          :disabled="!selectedMethod"
          class="btn-continue"
        >
          Continuar
        </button>
      </div>

      <!-- Paso 2: Confirmación del Pago -->
      <div v-else-if="currentStep === 2" class="step-body confirm-step">
        <i class="fas fa-exclamation-triangle confirm-icon"></i>
        <h3 class="confirm-title">Confirmación Final</h3>
        
        <div class="confirm-details">
            <p><strong>Referencia:</strong> {{ reference }}</p>
            <p><strong>Método:</strong> {{ selectedMethod?.name }}</p>
            <p><strong>Valor:</strong> <span class="confirm-amount">{{ formatAmount(amount) }} COP</span></p>
        </div>

        <p class="confirm-text">
          ¿Estás seguro que deseas realizar el pago con 
          referencia **{{ reference }}** por valor de 
          **{{ formatAmount(amount) }}**?
        </p>

        <div class="confirm-actions">
          <button @click="currentStep = 1" class="btn-back">Atrás</button>
          <button @click="processPayment" class="btn-confirm">
            Sí, Confirmar Pago
          </button>
        </div>
      </div>
      
      <!-- Paso 3: Procesamiento/Carga -->
      <div v-else-if="currentStep === 3" class="step-body processing-step">
        <div class="processing-spinner"></div>
        <h3 class="processing-title">Procesando Transacción...</h3>
        <p class="processing-text">No cierres esta ventana. Esto puede tardar unos segundos.</p>
      </div>

      <!-- Paso 4: Éxito (Transición) -->
      <div v-else-if="currentStep === 4" class="step-body success-step">
        <i class="fas fa-check-circle success-icon"></i>
        <h3 class="success-title">¡Transacción Exitosa!</h3>
        <p class="success-text">El pago ha sido recibido y se ha aplicado a tu contrato.</p>
        <button @click="emitSuccess" class="btn-success-close">
          Ver Contratos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

/* eslint-disable no-undef */ 
// Definición de Props
const props = defineProps<{
  amount: number;
  orderId: number;
  reference: string;
}>();

// Definición de Emits
const emit = defineEmits(['close', 'payment-success']);
/* eslint-enable no-undef */

// --- Datos y Estados ---
const currentStep = ref(1);
const selectedMethod = ref<{ id: number; name: string; iconClass: string } | null>(null);

const paymentMethods = [
  { id: 1, name: 'Tarjeta de Crédito / Débito', iconClass: 'fas fa-credit-card' },
  { id: 2, name: 'PSE (Débito Bancario)', iconClass: 'fas fa-university' },
  { id: 3, name: 'Billetera Digital (Nequi/Daviplata)', iconClass: 'fas fa-mobile-alt' },
];

// --- Computed Properties ---
const modalTitle = computed(() => {
  switch (currentStep.value) {
    case 1: return 'Selección de Pago';
    case 2: return 'Verificación de Pago';
    case 3: return 'Realizando Pago';
    case 4: return 'Pago Completado';
    default: return 'Proceso de Pago';
  }
});

// --- Métodos ---

/**
 * Formatea el monto a COP.
 */
const formatAmount = (value: number): string => {
  if (typeof value !== 'number') return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

/**
 * Inicia la simulación de procesamiento.
 */
const processPayment = () => {
  currentStep.value = 3;
  // Simulación de carga de 2 segundos
  setTimeout(() => {
    currentStep.value = 4; // Mueve al paso de éxito
  }, 2000); 
};

/**
 * Emite el evento de éxito para que el componente padre actualice el estado.
 */
const emitSuccess = () => {
    emit('payment-success', {
        amount: props.amount,
        reference: props.reference,
        method: selectedMethod.value?.name,
        timestamp: Date.now()
    });
};

/**
 * Cierra el modal (solo si no está procesando)
 */
const closeModal = () => {
    if (currentStep.value !== 3) {
        // Reiniciar el estado si no fue un éxito
        if (currentStep.value !== 4) {
             currentStep.value = 1;
             selectedMethod.value = null;
        }
        emit('close');
    }
}
</script>

<style scoped>
/* Estilos Base para el Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Fondo oscuro y borroso para complementar el estilo de fondo del padre */
  background-color: rgba(0, 0, 0, 0.85); 
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50; 
}

.modal-content {
  background: linear-gradient(145deg, #1f1b1a 0%, #2e2624 100%);
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8);
  max-width: 450px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  color: #f0e5db;
  transition: all 0.3s ease;
}

.modal-header {
  background: linear-gradient(90deg, #da9c5f, #b8791f);
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
}

.step-indicator {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
}

/* Cuerpo del Paso */
.step-body {
  padding: 24px;
  text-align: center;
}

/* -------------------------------------- */
/* Paso 1: Selección de Método */
/* -------------------------------------- */
.amount-display {
    background: rgba(255, 255, 255, 0.08);
    border: 1px dashed #da9c5f;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.label {
    font-weight: 500;
    color: #ccc;
}
.value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #da9c5f;
}

.method-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #f0e5db;
    margin-bottom: 15px;
    text-align: left;
}

.method-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.method-card {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: all 0.2s ease;
}

.method-card:hover {
    background: rgba(0, 0, 0, 0.3);
}

.method-card-selected {
    border-color: #10b981 !important; /* Verde de selección */
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    background: rgba(16, 185, 129, 0.1) !important;
}

.method-icon {
    font-size: 1.2rem;
    width: 30px;
    color: #da9c5f;
}

.method-name {
    flex-grow: 1;
    text-align: left;
    font-weight: 500;
}

.checkmark {
    font-size: 1.2rem;
    color: #10b981;
}

.btn-continue {
    width: 100%;
    padding: 12px;
    background: linear-gradient(45deg, #10b981, #059669); /* Verde para continuar */
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.3s, transform 0.1s;
}

.btn-continue:disabled {
    background: #6b7280;
    cursor: not-allowed;
}

.btn-continue:hover:not(:disabled) {
    background: linear-gradient(45deg, #059669, #047857);
    transform: translateY(-1px);
}

/* -------------------------------------- */
/* Paso 2: Confirmación */
/* -------------------------------------- */
.confirm-step {
    text-align: center;
}

.confirm-icon {
    font-size: 3rem;
    color: #f59e0b; /* Amarillo/Ámbar */
    margin-bottom: 10px;
}

.confirm-title {
    font-size: 1.3rem;
    color: #f0e5db;
    margin-bottom: 20px;
}

.confirm-details {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #da9c5f;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
    text-align: left;
    font-size: 0.95rem;
}

.confirm-details p {
    margin: 5px 0;
    color: #ccc;
}

.confirm-amount {
    color: #da9c5f;
    font-weight: 700;
    font-size: 1.1rem;
}

.confirm-text {
    font-size: 1rem;
    color: #ccc;
    line-height: 1.4;
    font-weight: 300;
    margin-bottom: 25px;
}

.confirm-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.btn-back {
    flex: 1;
    padding: 12px;
    background: #4b5563;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-confirm {
    flex: 2;
    padding: 12px;
    background: linear-gradient(45deg, #ef4444, #dc2626); /* Rojo para confirmar acción crítica */
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.3s, transform 0.1s;
}

.btn-confirm:hover {
    background: linear-gradient(45deg, #dc2626, #b91c1c);
    transform: translateY(-1px);
}

/* -------------------------------------- */
/* Paso 3: Procesamiento */
/* -------------------------------------- */
.processing-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 200px;
    justify-content: center;
}

.processing-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(218, 156, 95, 0.3);
    border-top: 5px solid #da9c5f;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.processing-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #da9c5f;
    margin-bottom: 8px;
}

.processing-text {
    color: #ccc;
    font-size: 0.9rem;
}

/* -------------------------------------- */
/* Paso 4: Éxito */
/* -------------------------------------- */
.success-step {
    min-height: 200px;
    justify-content: center;
}

.success-icon {
    font-size: 3rem;
    color: #10b981; /* Verde */
    margin-bottom: 15px;
}

.success-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #10b981;
    margin-bottom: 10px;
}

.success-text {
    color: #ccc;
    margin-bottom: 20px;
}

.btn-success-close {
    width: 100%;
    padding: 12px;
    background: linear-gradient(45deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
}

.btn-success-close:hover {
    background: linear-gradient(45deg, #059669, #047857);
}

/* Responsive */
@media (max-width: 500px) {
  .modal-content {
    margin: 0 10px;
  }
}
</style>