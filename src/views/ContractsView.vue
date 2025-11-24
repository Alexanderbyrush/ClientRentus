<template>
  <div class="contracts-page">
    <!-- Fondo con blur -->
    <div class="page-background"></div>
    
    <!-- Header -->
    <header class="barra">
      <div class="logo" @click="goHome">
        <img src="@/assets/img/logo.png" alt="Rentus Logo">
      </div>
      <nav class="acciones-barra">
        <router-link to="/" class="volver" title="Volver">
          <i class="fas fa-arrow-left"></i>
        </router-link>
        <span class="notificaciones" title="Notificaciones" @click="openNotifications">
          <i class="fas fa-bell"></i>
          <span class="notification-count" v-if="pendingContracts > 0">{{ pendingContracts }}</span>
        </span>
      </nav>
    </header>

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
            'highlight-new': contract.isNew 
          }"
          @click="setActiveContract(index)"
        >
          <div class="card-badge" v-if="contract.isNew">Nuevo</div>
          <img :src="getPropertyImage(contract.propertyImage)" :alt="contract.title">
          <h4>{{ contract.title }}</h4>
          <p class="property-address">{{ contract.propertyAddress }}</p>
          <p>Estado: 
            <span class="status" :class="contract.status">
              {{ getStatusText(contract.status) }} ●
            </span>
          </p>
          <div class="contract-price">
            {{ formatPrice(contract.monthlyPrice) }}/mes
          </div>
          <div class="card-actions">
            <button class="vista-previa" @click.stop="openContractModal(contract)">
              <i class="fas fa-eye"></i>
              Vista previa
            </button>
            <button class="download-btn-sm" @click.stop="downloadContract(contract)">
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Controles del Carrusel -->
      <div v-if="!loading" class="carousel-controls">
        <button @click="prevContract" :disabled="activeIndex === 0">
          ⟨
        </button>
        <span class="carousel-counter">{{ activeIndex + 1 }} / {{ contracts.length }}</span>
        <button @click="nextContract" :disabled="activeIndex === contracts.length - 1">
          ⟩
        </button>
      </div>

      <!-- Estadísticas -->
      <div v-if="!loading" class="contracts-stats">
        <div class="stat-item">
          <span class="stat-number">{{ activeContracts }}</span>
          <span class="stat-label">Activos</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ totalContracts }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ pendingContracts }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
      </div>
    </main>

    <!-- Modal de Vista Previa -->
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
          <button class="btn-secondary" @click="closeModal">
            <i class="fas fa-times"></i>
            Cerrar
          </button>
          <button class="download-btn" @click="downloadContract(selectedContract!)" :disabled="!contractPdfUrl">
            <i class="fas fa-download"></i>
            Descargar PDF
          </button>
          <button class="btn-primary" @click="shareContract(selectedContract!)">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pdfService } from '@/services/pdfService'

const router = useRouter()

// Interfaces TypeScript
interface Contract {
  id: number
  title: string
  status: 'active' | 'inactive' | 'expired' | 'pending'
  propertyImage: string
  propertyAddress: string
  startDate: string
  endDate: string
  monthlyPrice: number
  deposit: number
  tenantName: string
  landlordName: string
  propertyType: string
  area: number
  bedrooms: number
  bathrooms: number
  clauses: string[]
  isNew?: boolean
}

// Estados reactivos
const contracts = ref<Contract[]>([])
const activeIndex = ref(0)
const showModal = ref(false)
const selectedContract = ref<Contract | null>(null)
const contractPdfUrl = ref<string>('')
const previewLoading = ref(false)
const loading = ref(true)

// Computed properties
const activeContracts = computed(() => 
  contracts.value.filter(c => c.status === 'active').length
)

const totalContracts = computed(() => contracts.value.length)

const pendingContracts = computed(() => 
  contracts.value.filter(c => c.status === 'pending').length
)

// Métodos
const goHome = () => {
  router.push('/')
}

const openNotifications = () => {
  console.log('Abrir notificaciones')
}

const setActiveContract = (index: number) => {
  activeIndex.value = index
}

const prevContract = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--
  }
}

const nextContract = () => {
  if (activeIndex.value < contracts.value.length - 1) {
    activeIndex.value++
  }
}

const openContractModal = async (contract: Contract) => {
  selectedContract.value = contract
  showModal.value = true
  previewLoading.value = true
  contractPdfUrl.value = ''

  try {
    // Generar PDF profesional del contrato
    const pdfUrl = await pdfService.generateContract(contract)
    contractPdfUrl.value = pdfUrl
  } catch (error) {
    console.error('Error generando preview:', error)
  } finally {
    previewLoading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  selectedContract.value = null
  contractPdfUrl.value = ''
}

const downloadContract = async (contract: Contract) => {
  try {
    const pdfUrl = await pdfService.generateContract(contract)
    
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `contrato_${contract.id}.pdf`
    link.click()
    
    console.log('Contrato descargado:', contract.title)
  } catch (error) {
    console.error('Error descargando contrato:', error)
    alert('Error al descargar el contrato. Intenta nuevamente.')
  }
}

const shareContract = async (contract: Contract) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: contract.title,
        text: `Contrato de arrendamiento - ${contract.propertyAddress}`,
        url: window.location.href
      })
    } catch (error) {
      console.log('Compartir cancelado')
    }
  } else {
    // Fallback: copiar al portapapeles
    navigator.clipboard.writeText(`Contrato: ${contract.title}\nDirección: ${contract.propertyAddress}`)
    alert('Información del contrato copiada al portapapeles')
  }
}

const getPropertyImage = (imagePath: string) => {
  return imagePath.startsWith('/') ? imagePath : `/img/${imagePath}`
}

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'active': 'Activo',
    'inactive': 'Inactivo',
    'expired': 'Expirado',
    'pending': 'Pendiente'
  }
  return statusMap[status] || 'Desconocido'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES')
}

const formatPrice = (price?: number) => {
  if (!price) return 'Consultar'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price)
}

const getContractDuration = (contract: Contract) => {
  const start = new Date(contract.startDate)
  const end = new Date(contract.endDate)
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  return `${months} meses`
}

// Lifecycle
onMounted(async () => {
  try {
    contracts.value = await pdfService.getContracts()
  } catch (error) {
    console.error('Error cargando contratos:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Mantén todos los estilos anteriores y agrega estos nuevos */


.contracts-page {
  min-height: 100vh;
  position: relative;
  font-family: 'Segoe UI', sans-serif;
}

.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://i.pinimg.com/1200x/e2/d2/b7/e2d2b7877ffb88a68d6b72e5ea0bd965.jpg') center center / cover no-repeat;
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
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  position: relative;
  z-index: 10;
}

.logo {
  cursor: pointer;
}

.logo img {
  height: 40px;
}

.acciones-barra a, .acciones-barra span {
  color: #f0e5db;
  font-size: 20px;
  margin-left: 20px;
  transition: all 0.3s;
  cursor: pointer;
  text-decoration: none;
}

.acciones-barra a:hover, .acciones-barra span:hover {
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
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
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
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 1.5rem;
  width: 250px;
  transform: scale(0.85);
  transition: all 0.5s ease;
  opacity: 0.6;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0,0,0,0.3);
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
  border: 2px solid rgba(255,255,255,0.1);
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
  from { opacity: 0; }
  to { opacity: 1; }
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
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
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

.close:hover {
  color: #da9c5f;
  background: rgba(218, 156, 95, 0.1);
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

.download-btn:hover {
  background: linear-gradient(45deg, #b8791f, #9a6419);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(218, 156, 95, 0.4);
}

.contract-details {
  text-align: left;
  background: rgba(255,255,255,0.05);
  padding: 1.5rem;
  border-radius: 15px;
  margin-top: 1rem;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  background: rgba(255,255,255,0.1);
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

.btn-secondary, .btn-primary {
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
  background: rgba(255,255,255,0.05);
  padding: 1.5rem;
  border-radius: 12px;
}

.contract-details h4 {
  color: #da9c5f;
  margin-bottom: 1rem;
  border-bottom: 1px solid #da9c5f;
  padding-bottom: 0.5rem;
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