<template>
  <div class="contracts-page">
    <!-- Fondo con blur -->
    <div class="page-background"></div>

    <!-- Header -->
    <NavBarComponent />

    <!-- Contenido Principal -->
    <main class="carousel-container">
      <h2 class="titulo">Mis Contratos</h2>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando contratos...</p>
      </div>

      <!-- Carrusel de Contratos -->
      <div v-else class="carousel">
        <div
          v-for="(contract, index) in contracts"
          :key="contract.id"
          class="card"
          :class="{
            active: activeIndex === index,
            'highlight-new': contract.isNew,
            'highlight-pending': contract.status === 'pending' && isUserTenant(contract),
          }"
          @click="setActiveContract(index)"
        >
          <div class="card-badge" v-if="contract.isNew">Nuevo</div>
          <div class="card-badge pending-badge" v-if="contract.status === 'pending' && isUserTenant(contract)">
            Acción requerida
          </div>
          
          <img
            :src="getPropertyImage(contract.propertyImage)"
            :alt="contract.title"
          />
          <h4>{{ contract.title }}</h4>
          <p class="property-address">{{ contract.propertyAddress }}</p>
          <p>
            Estado:
            <span :style="{ color: getStatusInfo(contract.status).color }">
              {{ getStatusInfo(contract.status).text }}
            </span>
          </p>
          <div class="contract-price">
            {{ formatPrice(contract.monthlyPrice) }}/mes
          </div>
          
          <!-- ACCIONES SEGÚN ESTADO -->
          <div class="card-actions">
            <!-- Si es PENDIENTE y soy el INQUILINO -->
            <template v-if="contract.status === 'pending' && isUserTenant(contract)">
              <button
                class="btn-accept"
                @click.stop="openAcceptModal(contract)"
              >
                <i class="fas fa-check"></i>
                Revisar
              </button>
            </template>
            
            <!-- Si NO es pendiente o NO soy el inquilino -->
            <template v-else>
              <button
                class="vista-previa"
                @click.stop="openContractModal(contract)"
              >
                <i class="fas fa-eye"></i>
                Vista previa
              </button>
              <button
                class="download-btn-sm"
                @click.stop="downloadContract(contract)"
              >
                <i class="fas fa-download"></i>
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Controles del Carrusel -->
      <div v-if="!loading && contracts.length > 0" class="carousel-controls">
        <button @click="prevContract" :disabled="activeIndex === 0">⟨</button>
        <span class="carousel-counter"
          >{{ activeIndex + 1 }} / {{ contracts.length }}</span
        >
        <button
          @click="nextContract"
          :disabled="activeIndex === contracts.length - 1"
        >
          ⟩
        </button>
      </div>

      <!-- Estadísticas -->
      <div v-if="!loading && contracts.length > 0" class="contracts-stats">
        <div class="stat-item">
          <span class="stat-number">{{ contractStats.active }}</span>
          <span class="stat-label">Activos</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ contractStats.total }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ contractStats.pending }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
      </div>

      <!-- Mensaje si no hay contratos -->
      <div v-if="!loading && contracts.length === 0" class="empty-state">
        <i class="fas fa-file-contract"></i>
        <p>No tienes contratos aún</p>
      </div>
    </main>

    <!-- Modal de Vista Previa (existente) -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedContract?.title }}</h3>
          <span class="close" @click="closeModal">&times;</span>
        </div>

        <div v-if="previewLoading" class="preview-loading">
          <div class="loading-spinner"></div>
          <p>Generando vista previa del contrato...</p>
        </div>

        <div v-else class="contract-preview">
          <iframe
            v-if="contractPdfUrl"
            :src="contractPdfUrl"
            class="pdf-preview"
            frameborder="0"
          ></iframe>
          <div v-else class="preview-fallback">
            <i class="fas fa-file-contract"></i>
            <p>Vista previa no disponible</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
            Cerrar
          </button>
          <button
            class="download-btn"
            @click="downloadContract(selectedContract!)"
            :disabled="!contractPdfUrl"
          >
            <i class="fas fa-download"></i>
            Descargar PDF
          </button>
          <button class="share-btn" @click="shareContract(selectedContract!)">
            <i class="fas fa-share"></i>
            Compartir
          </button>
        </div>

        <div class="contract-details">
          <h4>Detalles del Contrato</h4>
          <div class="details-grid">
            <div class="detail-item">
              <label>Propiedad:</label>
              <span>{{ selectedContract?.propertyAddress }}</span>
            </div>
            <div class="detail-item">
              <label>Inquilino:</label>
              <span>{{ selectedContract?.tenantName }}</span>
            </div>
            <div class="detail-item">
              <label>Valor Mensual:</label>
              <span>{{ formatPrice(selectedContract?.monthlyPrice) }}</span>
            </div>
            <div class="detail-item">
              <label>Duración:</label>
              <span>{{ getContractDuration(selectedContract!) }}</span>
            </div>
            <div class="detail-item">
              <label>Fecha Inicio:</label>
              <span>{{ formatDate(selectedContract?.startDate) }}</span>
            </div>
            <div class="detail-item">
              <label>Fecha Fin:</label>
              <span>{{ formatDate(selectedContract?.endDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NUEVO: Modal de Aceptar/Rechazar Contrato -->
    <div v-if="showAcceptModal" class="modal-overlay" @click="closeAcceptModal">
      <div class="accept-modal-content" @click.stop>
        <div class="modal-header">
          <h3>📄 Revisar Contrato</h3>
          <span class="close" @click="closeAcceptModal">&times;</span>
        </div>

        <div class="accept-modal-body">
          <!-- Vista previa del PDF -->
          <div v-if="previewLoading" class="preview-loading">
            <div class="loading-spinner"></div>
            <p>Cargando contrato...</p>
          </div>

          <div v-else class="contract-preview">
            <iframe
              v-if="contractPdfUrl"
              :src="contractPdfUrl"
              class="pdf-preview"
              frameborder="0"
            ></iframe>
            <div v-else class="preview-fallback">
              <i class="fas fa-file-contract"></i>
              <p>Vista previa no disponible</p>
            </div>
          </div>

          <!-- Detalles del contrato -->
          <div class="contract-summary">
            <h4>Resumen del Contrato</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Propiedad:</span>
                <span class="summary-value">{{ selectedContract?.propertyAddress }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Arrendador:</span>
                <span class="summary-value">{{ selectedContract?.landlordName }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Valor mensual:</span>
                <span class="summary-value highlight">{{ formatPrice(selectedContract?.monthlyPrice) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Depósito:</span>
                <span class="summary-value">{{ formatPrice(selectedContract?.deposit) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Duración:</span>
                <span class="summary-value">{{ getContractDuration(selectedContract!) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Inicio:</span>
                <span class="summary-value">{{ formatDate(selectedContract?.startDate) }}</span>
              </div>
            </div>

            <!-- Cláusulas -->
            <div v-if="selectedContract?.clauses && selectedContract.clauses.length > 0" class="clauses-section">
              <h5>Cláusulas importantes:</h5>
              <ul class="clauses-list">
                <li v-for="(clause, idx) in selectedContract.clauses" :key="idx">
                  {{ clause }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Confirmación checkbox -->
          <div class="confirmation-box">
            <label class="checkbox-label">
              <input type="checkbox" v-model="contractAccepted" />
              <span>He leído y acepto los términos del contrato</span>
            </label>
          </div>

          <!-- Acciones -->
          <div class="accept-modal-actions">
            <button 
              class="btn-accept-full" 
              @click="acceptContract"
              :disabled="!contractAccepted || acceptLoading"
            >
              <i class="fas fa-check-circle"></i>
              {{ acceptLoading ? 'Aceptando...' : 'Aceptar Contrato' }}
            </button>
            <button 
              class="btn-reject-full" 
              @click="rejectContract"
              :disabled="acceptLoading"
            >
              <i class="fas fa-times-circle"></i>
              Rechazar Contrato
            </button>
          </div>
        </div>
      </div>
    </div>

    <FooterComponent />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { contractService } from "@/services/contractService";
import { pdfService } from "@/services/pdfService";
import NavBarComponent from "@/components/NavBarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";

const router = useRouter();

// Interfaz de contrato
interface ContractCardUI {
  id: number;
  title: string;
  status: string;
  propertyImage?: string;
  propertyAddress?: string;
  startDate?: string;
  endDate?: string;
  monthlyPrice?: number;
  deposit?: number;
  tenantName: string;
  tenantCC?: string;
  tenantEmail?: string;
  landlordName: string;
  landlordCC?: string;
  landlordEmail?: string;
  propertyType?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  clauses?: string[];
  isNew?: boolean;
  tenantId?: number;
  landlordId?: number;
}

// Estados
const contracts = ref<ContractCardUI[]>([]);
const activeIndex = ref(0);
const showModal = ref(false);
const showAcceptModal = ref(false);
const selectedContract = ref<ContractCardUI | null>(null);
const contractPdfUrl = ref<string>("");
const previewLoading = ref(false);
const loading = ref(true);
const contractAccepted = ref(false);
const acceptLoading = ref(false);

// Usuario actual
const currentUserId = ref<number | null>(null);

// Estadísticas
const contractStats = ref({
  active: 0,
  pending: 0,
  total: 0,
});

// Cargar usuario actual
const loadCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  currentUserId.value = user.id || null;
};

// Verificar si el usuario actual es el inquilino
const isUserTenant = (contract: ContractCardUI) => {
  return contract.tenantId === currentUserId.value;
};

// Bloquear scroll
watch(showModal, (val) => {
  document.body.style.overflow = val ? "hidden" : "";
});

watch(showAcceptModal, (val) => {
  document.body.style.overflow = val ? "hidden" : "";
});

// Cargar estadísticas
const loadContractStats = async () => {
  try {
    const response = await contractService.getContractStats();
    contractStats.value = response;
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
  }
};

// Navegación
const setActiveContract = (index: number) => (activeIndex.value = index);
const prevContract = () => activeIndex.value > 0 && activeIndex.value--;
const nextContract = () =>
  activeIndex.value < contracts.value.length - 1 && activeIndex.value++;

// Modal de vista previa (existente)
const openContractModal = async (contract: ContractCardUI) => {
  selectedContract.value = contract;
  showModal.value = true;
  previewLoading.value = true;
  contractPdfUrl.value = "";

  try {
    const pdfUrl = await pdfService.generateContract(contract);
    contractPdfUrl.value = pdfUrl;
  } finally {
    previewLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedContract.value = null;
  contractPdfUrl.value = "";
};

// NUEVO: Modal de aceptar/rechazar
const openAcceptModal = async (contract: ContractCardUI) => {
  selectedContract.value = contract;
  showAcceptModal.value = true;
  contractAccepted.value = false;
  previewLoading.value = true;
  contractPdfUrl.value = "";

  try {
    const pdfUrl = await pdfService.generateContract(contract);
    contractPdfUrl.value = pdfUrl;
  } finally {
    previewLoading.value = false;
  }
};

const closeAcceptModal = () => {
  showAcceptModal.value = false;
  selectedContract.value = null;
  contractAccepted.value = false;
  contractPdfUrl.value = "";
};

// NUEVO: Aceptar contrato
const acceptContract = async () => {
  if (!selectedContract.value || !contractAccepted.value) return;

  if (!confirm("¿Estás seguro de aceptar este contrato? Esta acción es definitiva.")) {
    return;
  }

  acceptLoading.value = true;

  try {
    await contractService.acceptContract(selectedContract.value.id);
    alert("✅ Contrato aceptado exitosamente. Ahora está activo.");
    closeAcceptModal();
    await loadContracts();
    await loadContractStats();
  } catch (error: any) {
    console.error("Error aceptando contrato:", error);
    alert(error.response?.data?.message || "Error al aceptar el contrato");
  } finally {
    acceptLoading.value = false;
  }
};

// NUEVO: Rechazar contrato
const rejectContract = async () => {
  if (!selectedContract.value) return;

  if (!confirm("¿Estás seguro de rechazar este contrato? Esta acción NO se puede deshacer.")) {
    return;
  }

  acceptLoading.value = true;

  try {
    await contractService.rejectContract(selectedContract.value.id);
    alert("❌ Contrato rechazado.");
    closeAcceptModal();
    await loadContracts();
    await loadContractStats();
  } catch (error: any) {
    console.error("Error rechazando contrato:", error);
    alert(error.response?.data?.message || "Error al rechazar el contrato");
  } finally {
    acceptLoading.value = false;
  }
};

// Descargar y compartir
const downloadContract = async (contract: ContractCardUI) => {
  try {
    const pdfUrl = await pdfService.generateContract(contract);
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `contrato_${contract.id}.pdf`;
    link.click();
  } catch {
    alert("Error al descargar el contrato.");
  }
};

const shareContract = async (contract: ContractCardUI) => {
  if (navigator.share) {
    await navigator.share({
      title: contract.title,
      text: `Contrato - ${contract.propertyAddress}`,
      url: window.location.href,
    });
  } else {
    navigator.clipboard.writeText(
      `Contrato: ${contract.title}\nDirección: ${contract.propertyAddress}`
    );
    alert("Información copiada al portapapeles");
  }
};

// Utilidades
const getPropertyImage = (img?: string) => {
  if (!img) return "/img/default-property.jpg";
  if (img.startsWith("data:image")) return img;
  if (img.startsWith("/")) return img;
  return `/img/${img}`;
};

const getStatusInfo = (status: string) => {
  const map: Record<string, { text: string; color: string }> = {
    active: { text: "Activo", color: "green" },
    inactive: { text: "Inactivo", color: "gray" },
    expired: { text: "Expirado", color: "red" },
    pending: { text: "Pendiente", color: "orange" },
    rejected: { text: "Rechazado", color: "red" },
  };
  return map[status] ?? { text: "Desconocido", color: "black" };
};

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("es-ES") : "N/A";

const formatPrice = (price?: number) =>
  price
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(price)
    : "Consultar";

const getContractDuration = (contract: ContractCardUI) => {
  if (!contract.startDate || !contract.endDate) return "N/A";
  const start = new Date(contract.startDate);
  const end = new Date(contract.endDate);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return `${months} meses`;
};

// Cargar contratos
const loadContracts = async () => {
  try {
    loading.value = true;
    const response = await contractService.getContracts();

    contracts.value = response.map((c: any) => {
      // Parsear document_path si es JSON string
      let parsedTerms: any = {};
      if (c.document_path) {
        try {
          parsedTerms = typeof c.document_path === 'string' 
            ? JSON.parse(c.document_path) 
            : c.document_path;
        } catch (e) {
          console.error("Error parseando document_path:", e);
        }
      }

      return {
        id: c.id,
        title: `Contrato ${c.id}`,
        status: c.status,
        propertyImage: c.property?.image_url,
        propertyAddress: c.property?.address,
        startDate: c.start_date,
        endDate: c.end_date,
        monthlyPrice: parsedTerms.monthly_price || c.property?.monthly_price,
        deposit: c.deposit || parsedTerms.deposit,
        tenantName: c.tenant?.name ?? "N/A",
        tenantCC: c.tenant?.id_documento ?? "N/A",
        tenantEmail: c.tenant?.email ?? "N/A",
        tenantId: c.tenant_id,
        landlordName: c.landlord?.name ?? "N/A",
        landlordCC: c.landlord?.id_documento ?? "N/A",
        landlordEmail: c.landlord?.email ?? "N/A",
        landlordId: c.landlord_id,
        propertyType: c.property?.title,
        area: c.property?.area_m2,
        bedrooms: c.property?.num_bedrooms,
        bathrooms: c.property?.num_bathrooms,
        clauses: parsedTerms.clauses ?? [],
        isNew: c.status === 'pending',
      };
    });
  } catch (error) {
    console.error("Error cargando contratos:", error);
  } finally {
    loading.value = false;
  }
};

// Montaje
onMounted(async () => {
  loadCurrentUser();
  await Promise.all([loadContracts(), loadContractStats()]);
});
</script>

<style scoped>
/* Botón de aceptar en la card */
.btn-accept {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #2ecc71, #27ae60);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-accept:hover {
  background: linear-gradient(45deg, #27ae60, #229954);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

/* Badge de acción requerida */
.pending-badge {
  background: #ff9800 !important;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Highlight para contratos pendientes */
.highlight-pending {
  border: 2px solid #ff9800 !important;
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.3) !important;
}

/* Modal de aceptar contrato */
.accept-modal-content {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.accept-modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
}

.contract-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.summary-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
}

.summary-value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
}

.summary-value.highlight {
  color: #2ecc71;
  font-size: 1.2rem;
  font-weight: 700;
}

.clauses-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
}

.clauses-section h5 {
  margin: 0 0 15px;
  color: #2c3e50;
  font-size: 1rem;
}

.clauses-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.clauses-list li {
  padding: 10px;
  margin-bottom: 8px;
  background: white;
  border-left: 4px solid #3498db;
  border-radius: 4px;
  font-size: 0.9rem;
}

.confirmation-box {
  background: #fff3cd;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
  margin: 20px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #856404;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.accept-modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-accept-full,
.btn-reject-full {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-accept-full {
  background: linear-gradient(45deg, #2ecc71, #27ae60);
  color: white;
}

.btn-accept-full:hover:not(:disabled) {
  background: linear-gradient(45deg, #27ae60, #229954);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}

.btn-accept-full:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reject-full {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
}

.btn-reject-full:hover:not(:disabled) {
  background: linear-gradient(45deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  opacity: 0.3;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .accept-modal-actions {
    flex-direction: column;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
/* Mantén todos los estilos anteriores y agrega estos nuevos */

.contracts-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* altura mínima igual a la pantalla */
  padding-top: 80px; /* para compensar el navbar */
}

.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("https://i.pinimg.com/1200x/e2/d2/b7/e2d2b7877ffb88a68d6b72e5ea0bd965.jpg")
    center center / cover no-repeat;
  filter: blur(8px) brightness(0.7);
  z-index: -1;
}

/* Header */
.barra {
  width: 90%;
  max-width: 1000px;
  margin: 20px auto;
  background-color: rgba(86, 44, 29, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 10;
}

.logo {
  cursor: pointer;
}

.logo img {
  height: 40px;
}

.acciones-barra a,
.acciones-barra span {
  color: #f0e5db;
  font-size: 20px;
  margin-left: 20px;
  transition: all 0.3s;
  cursor: pointer;
  text-decoration: none;
}

.acciones-barra a:hover,
.acciones-barra span:hover {
  transform: scale(1.1);
  color: #da9c5f;
}

/* Contenedor principal */
.carousel-container {
  position: relative;
  width: 90%;
  max-width: 1000px;
  text-align: center;
  margin: 0 auto;
  padding: 2rem 0;
  z-index: 5;
}

.titulo {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #f0e5db;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 600;
}

/* Carrusel */
.carousel {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  perspective: 1200px;
  min-height: 350px;
}

/* Tarjetas */
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
}

.card:hover {
  transform: scale(0.9);
  opacity: 0.8;
}

.card.active {
  transform: scale(1.1);
  opacity: 1;
  z-index: 2;
  border: 2px solid #da9c5f;
  box-shadow: 0 10px 30px rgba(218, 156, 95, 0.3);
}

.card img {
  width: 100%;
  height: 160px;
  border-radius: 15px;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.card h4 {
  margin: 1rem 0 0.5rem;
  font-size: 1.2rem;
  color: #fff;
  font-weight: 600;
}

/* Estados */
.status {
  font-weight: bold;
}

.status.active {
  color: #4caf50;
}

.status.inactive {
  color: #f44336;
}

.status.expired {
  color: #ff9800;
}

.status.pending {
  color: #2196f3;
}

/* Botón dentro de la tarjeta */
.vista-previa {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #da9c5f, #b8791f);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.vista-previa:hover {
  background: linear-gradient(45deg, #b8791f, #9a6419);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(218, 156, 95, 0.4);
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

/* Modal */
.modal-overlay {
  display: flex;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(46, 29, 18, 0.95);
  backdrop-filter: blur(5px);
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  position: relative;
  background: linear-gradient(135deg, #3b2416 0%, #2e1d17 100%);
  margin: 2rem;
  padding: 2rem;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 20px;
  text-align: center;
  color: #f0e5db;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
  border: 1px solid #da9c5f;
}

.modal-content img {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 15px;
  margin-bottom: 1.5rem;
  border: 2px solid rgba(218, 156, 95, 0.3);
}

.close {
  color: #fff;
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.3s;
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* Botón de descarga */
.download-btn {
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #da9c5f, #b8791f);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.share-btn {
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #0077ffff, #106dd8ff);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.close-btn {
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #d31414ff, #d41717ff);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.download-btn:hover {
  background: linear-gradient(45deg, #b8791f, #9a6419);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(218, 156, 95, 0.4);
}

.share-btn:hover {
  background: linear-gradient(45deg, #0077ffff, #1100ffff);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(218, 156, 95, 0.4);
}

.close-btn:hover {
  background: linear-gradient(45deg, #ff0000ff, #ce1414ff);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(218, 156, 95, 0.4);
}

.contract-details {
  text-align: left;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  border-radius: 15px;

}

.contract-details h3 {
  color: #da9c5f;
  margin-bottom: 1rem;
  border-bottom: 2px solid #da9c5f;
  padding-bottom: 0.5rem;
}

.contract-details p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
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
  }

  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }

  .titulo {
    font-size: 2rem;
  }

  .carousel-controls button {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .barra {
    padding: 1rem;
  }

  .logo img {
    height: 32px;
  }

  .titulo {
    font-size: 1.5rem;
  }

  .card {
    padding: 1rem;
  }
}

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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.card-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  z-index: 3;
}

.highlight-new {
  border: 2px solid #e74c3c !important;
  box-shadow: 0 0 20px rgba(231, 76, 60, 0.3) !important;
}

.property-address {
  font-size: 0.8rem;
  color: #ccc;
  margin: 0.25rem 0;
  height: 2rem;
  overflow: hidden;
}

.contract-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #da9c5f;
  margin: 0.5rem 0;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.download-btn-sm {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 0 0 auto;
}

.download-btn-sm:hover {
  background: #2980b9;
  transform: scale(1.1);
}

.carousel-counter {
  color: #f0e5db;
  font-weight: 600;
  margin: 0 1rem;
}

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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #da9c5f;
  padding-bottom: 1rem;
}

.modal-header h3 {
  color: #da9c5f;
  margin: 0;
}

.preview-loading {
  text-align: center;
  padding: 3rem;
  color: #f0e5db;
}

.contract-preview {
  height: 400px;
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.pdf-preview {
  width: 100%;
  height: 100%;
}

.preview-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 3rem;
}

.preview-fallback p {
  margin-top: 1rem;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 120px;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.contract-details {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
}

.contract-details h4 {
  color: #da9c5f;
  border-bottom: 1px solid #da9c5f;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item label {
  font-weight: 600;
  color: #ccc;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.detail-item span {
  color: #f0e5db;
  font-size: 0.9rem;
}

.notification-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.notificaciones {
  position: relative;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-actions {
    flex-direction: column;
  }

  .details-grid {
    grid-template-columns: 1fr;
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
</style>
