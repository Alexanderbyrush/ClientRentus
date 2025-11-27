<template>
  <div class="container">
    <!-- Navbar -->
    <section class="property-hero">
      <NavBarComponent />
    </section>

    <h1 class="title-page">Propiedades Disponibles</h1>

    <!-- FILTROS -->
    <div class="filters-box">
      <div class="filters-grid">

        <div class="filter-group">
          <label>Buscar</label>
          <input v-model="filters.search" type="text" placeholder="Título, descripción, ciudad..." />
        </div>

        <div class="filter-group">
          <label>Ciudad</label>
          <input v-model="filters.city" type="text" placeholder="Ej: Medellín" />
        </div>

        <div class="filter-group">
          <label>Tipo</label>
          <select v-model="filters.type">
            <option value="">Todos</option>
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="local">Local Comercial</option>
            <option value="finca">Finca</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Presupuesto Máximo</label>
          <input v-model.number="filters.maxPrice" type="number" min="0" placeholder="$" />
        </div>
      </div>

      <div class="filters-actions">
        <button class="btn-primary" @click="applyFilters">
          Aplicar filtros
        </button>
      </div>
    </div>
    <div class="section-header">
      <h2 class="section-title">Propiedades Publicadas</h2>

      <router-link to="/properties/create" class="btn-create">
        Crear propiedad
      </router-link>
    </div>

    <div class="contenedor-propiedades section-block">
      <!-- LISTADO -->
      <div v-if="filteredProperties.length" class="properties-grid">

        <div v-for="p in filteredProperties" :key="p.id" class="property-card">
          <!-- Badge destacado -->
          <div class="property-badge">
            {{ friendlyStatus(p.status) }}
          </div>

          <!-- Imagen de la propiedad -->
          <div class="property-image-container">
            <PropertyImage :src="p.image_url" :alt="p.title" class="property-image" />
            <div class="property-overlay">
              <div class="property-actions">
                <!-- SOLO EL DUEÑO VE ESTOS BOTONES -->
                <router-link 
                  v-if="authUser?.id === p.user_id" 
                  :to="{ name: 'PropertyEdit', params: { id: p.id } }"
                  class="action-btn edit-btn"
                  title="Editar propiedad"
                >
                  ✏️
                </router-link>
                <button 
                  v-if="authUser?.id === p.user_id" 
                  @click.stop="deleteProperty(p.id)" 
                  class="action-btn delete-btn"
                  title="Eliminar propiedad"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido de la propiedad -->
          <div class="property-content">
            <div class="property-header">
              <h3 class="property-title">{{ p.title }}</h3>
              <div class="property-price">
                ${{ p.monthly_price?.toLocaleString() }}
                <span class="price-period">/mes</span>
              </div>
            </div>

            <div class="property-location">
              📍 {{ p.city }}
            </div>

            <div class="property-features">
              <div class="feature-item">
                <span class="feature-icon">📐</span>
                <span class="feature-text">{{ p.area_m2 }} m²</span>
              </div>
              <div class="feature-item" v-if="p.num_bedrooms">
                <span class="feature-icon">🛏</span>
                <span class="feature-text">{{ p.num_bedrooms }} Habitaciones</span>
              </div>
              <div class="feature-item" v-if="p.num_bathrooms">
                <span class="feature-icon">🛁</span>
                <span class="feature-text">{{ p.num_bathrooms }} Baños</span>
              </div>
            </div>

            <div class="property-description">
              {{ truncateDescription(p.description) }}
            </div>

            <div class="property-tags">
              <span class="property-type-tag">{{ detectType(p.title) }}</span>
            </div>

            <div class="property-footer">
              <button class="details-btn" @click.stop="openModal(p)">
                <span class="btn-text">Ver Detalles</span>
                <span class="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="empty-text">
        No se encontraron propiedades con los filtros aplicados.
      </p>
    </div>

  </div>
  <!-- MODAL DE DETALLES MEJORADO -->
  <div v-if="modalOpen" class="modal-backdrop">
    <div class="modal-box">

      <button class="modal-close" @click="closeModal">
        <span class="close-icon">✕</span>
      </button>

      <!-- Encabezado del modal -->
      <div class="modal-header">
        <div class="property-status-badge">
          <span class="status-dot" :class="selectedProperty.status"></span>
          {{ friendlyStatus(selectedProperty.status) }}
        </div>
        <h2 class="modal-title">{{ selectedProperty.title }}</h2>
        <div class="property-price-highlight">
          <span class="price-amount">${{ selectedProperty.monthly_price?.toLocaleString() }}</span>
          <span class="price-period">/mes</span>
        </div>
      </div>

      <!-- Galería de imágenes -->
      <div class="modal-gallery">
        <img :src="selectedProperty.image_url || fallbackImage" class="modal-main-image" @error="onImgError" />
        <div class="image-badge">
          <span class="badge-icon">📸</span>
          <span class="badge-text">Galería</span>
        </div>
      </div>

      <!-- Información principal en tarjetas -->
      <div class="modal-details-grid">
        <!-- Tarjeta de ubicación -->
        <div class="detail-card location-card">
          <div class="card-icon">📍</div>
          <div class="card-content">
            <h3 class="card-title">Ubicación</h3>
            <p class="card-text">{{ selectedProperty.address }}</p>
            <p class="card-subtext">{{ selectedProperty.city }}</p>
          </div>
        </div>

        <!-- Tarjeta de características -->
        <div class="detail-card features-card">
          <div class="card-icon">📐</div>
          <div class="card-content">
            <h3 class="card-title">Características</h3>
            <div class="features-list">
              <div class="feature">
                <span class="feature-label">Área:</span>
                <span class="feature-value">{{ selectedProperty.area_m2 }} m²</span>
              </div>
              <div class="feature" v-if="selectedProperty.num_bedrooms">
                <span class="feature-label">Habitaciones:</span>
                <span class="feature-value">{{ selectedProperty.num_bedrooms }}</span>
              </div>
              <div class="feature" v-if="selectedProperty.num_bathrooms">
                <span class="feature-label">Baños:</span>
                <span class="feature-value">{{ selectedProperty.num_bathrooms }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta de servicios -->
        <div class="detail-card services-card">
          <div class="card-icon">🛠️</div>
          <div class="card-content">
            <h3 class="card-title">Servicios Incluidos</h3>
            <div class="services-tags" v-if="selectedProperty.included_services?.length">
              <span v-for="service in selectedProperty.included_services" :key="service" class="service-tag">
                {{ service }}
              </span>
            </div>
            <p v-else class="no-services">No hay servicios incluidos</p>
          </div>
        </div>

        <!-- Tarjeta de publicación -->
        <div class="detail-card publication-card">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <h3 class="card-title">Publicación</h3>
            <p class="card-text">{{ formatDate(selectedProperty.publication_date) }}</p>
            <p class="card-subtext">Publicado hace {{ timeAgo(selectedProperty.publication_date) }}</p>
          </div>
        </div>
      </div>

      <!-- Descripción expandida -->
      <div class="description-section">
        <h3 class="section-title">Descripción</h3>
        <p class="description-text">{{ selectedProperty.description }}</p>
      </div>

      <!-- Ubicación en mapa -->
      <div v-if="selectedProperty.lat && selectedProperty.lng" class="location-section">
        <div class="section-header">
          <h3 class="section-title">📍 Ubicación Exacta</h3>
          <router-link 
            :to="{ name: 'MapView', params: { id: selectedProperty.id } }" 
            class="btn-map-preview"
            @click="closeModal">
            <span class="btn-icon">🗺️</span>
            <span class="btn-text">Ver en Mapa Completo</span>
          </router-link>
        </div>
        <div class="coordinates-display">
          <div class="coordinate">
            <span class="coordinate-label">Latitud:</span>
            <span class="coordinate-value">{{ Number(selectedProperty.lat).toFixed(6) }}</span>
          </div>
          <div class="coordinate">
            <span class="coordinate-label">Longitud:</span>
            <span class="coordinate-value">{{ Number(selectedProperty.lng).toFixed(6) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="no-location-section">
        <div class="no-location-icon">🗺️</div>
        <p class="no-location-text">Esta propiedad aún no tiene ubicación registrada</p>
      </div>

      <!-- Acciones del modal -->
      <div class="modal-actions">
        <!-- Solo mostrar si NO es el dueño y la propiedad está disponible -->
        <button v-if="authUser?.id !== selectedProperty.user_id && selectedProperty.status === 'available'"
          class="btn-request-visit" @click="openRequestVisitModal(selectedProperty)">
          <span class="btn-icon">📅</span>
          <span class="btn-text">Solicitar Cita de Visita</span>
        </button>

        <!-- Si es el dueño -->
        <div v-else-if="authUser?.id === selectedProperty.user_id" class="owner-notice">
          <div class="notice-icon">👑</div>
          <div class="notice-content">
            <h4>Esta es tu propiedad</h4>
            <p>Puedes editar la información desde tu panel de control</p>
          </div>
        </div>

        <!-- Si no está disponible -->
        <div v-else-if="selectedProperty.status !== 'available'" class="unavailable-notice">
          <div class="notice-icon">⏸️</div>
          <div class="notice-content">
            <h4>Propiedad No Disponible</h4>
            <p>Actualmente esta propiedad no está disponible para visitas</p>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- MODAL DE SOLICITUD DE CITA -->
  <RequestVisitModal :open="showRequestModal" :property="propertyForRequest" @close="showRequestModal = false"
    @success="handleRequestSuccess" />

  <FooterComponent />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/services/api";
import NavBarComponent from "@/components/NavBarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import RequestVisitModal from "@/components/RequestVisitModal.vue";
import PropertyImage from "@/components/PropertyImage.vue";

const authUser = ref(null);
const properties = ref([]);
const fallbackImage = "https://via.placeholder.com/400x300?text=Sin+Imagen";

const filters = ref({
  search: "",
  city: "",
  type: "",
  maxPrice: null,
});

const modalOpen = ref(false);
const selectedProperty = ref({});

// Estado para el modal de solicitud de cita
const showRequestModal = ref(false);
const propertyForRequest = ref(null);

const openModal = (property) => {
  selectedProperty.value = { ...property };
  modalOpen.value = true;
  document.body.classList.add("modal-open");
};

const closeModal = () => {
  modalOpen.value = false;
  selectedProperty.value = {};
  document.body.classList.remove("modal-open");
};

// Abrir modal de solicitud de cita
const openRequestVisitModal = (property) => {
  propertyForRequest.value = property;
  showRequestModal.value = true;
  closeModal(); // Cierra el modal de detalles
};

// Manejar éxito de solicitud
const handleRequestSuccess = () => {
  showRequestModal.value = false;
  propertyForRequest.value = null;
  alert("¡Solicitud enviada exitosamente! El dueño recibirá tu petición.");
};

// CARGAR USUARIO AUTENTICADO
const loadAuthUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const { data } = await api.get("/auth/me");
      authUser.value = data;
    }
  } catch (err) {
    console.error("Error cargando usuario:", err);
  }
};

// CARGAR PROPIEDADES
const loadProperties = async () => {
  try {
    const { data } = await api.get("/properties");
    properties.value = data;
  } catch (err) {
    console.error("Error cargando propiedades", err);
  }
};

onMounted(async () => {
  await loadAuthUser();
  await loadProperties();
});

// MANEJO DE ERROR EN IMAGEN
const onImgError = (event) => {
  event.target.src = fallbackImage;
};

// MAPEAR STATUS A TEXTO
const friendlyStatus = (s) =>
({
  available: "Disponible",
  rented: "Rentada",
  maintenance: "En mantenimiento",
}[s] || s);

// DEDUCIR TIPO DE PROPIEDAD DESDE EL TÍTULO
const detectType = (title) => {
  const t = title.toLowerCase();
  if (t.includes("casa")) return "Casa";
  if (t.includes("apartamento") || t.includes("apto")) return "Apartamento";
  if (t.includes("local")) return "Local";
  if (t.includes("finca")) return "Finca";
  return "Propiedad";
};

// FILTRO LOCAL
const filteredProperties = computed(() => {
  return properties.value.filter((p) => {
    const typeFromTitle = detectType(p.title).toLowerCase();

    const matchSearch =
      !filters.value.search ||
      p.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      p.description.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      p.city.toLowerCase().includes(filters.value.search.toLowerCase());

    const matchCity =
      !filters.value.city ||
      p.city.toLowerCase().includes(filters.value.city.toLowerCase());

    const matchType =
      !filters.value.type || filters.value.type === typeFromTitle;

    const rawMax = filters.value.maxPrice;
    const matchPrice = !rawMax || Number(p.monthly_price) <= rawMax;

    return matchSearch && matchCity && matchType && matchPrice;
  });
});

// BOTÓN FILTROS
const applyFilters = () => {
  // Solo reactiva el computed
};

// ELIMINAR PROPIEDAD
const deleteProperty = async (id) => {
  if (!confirm("¿Eliminar esta propiedad permanentemente?")) return;

  try {
    await api.delete(`/properties/${id}`);
    properties.value = properties.value.filter((p) => p.id !== id);
    alert("Propiedad eliminada correctamente");
  } catch (error) {
    console.error("Error eliminando propiedad:", error);
    alert("Error al eliminar la propiedad");
  }
};

// Función para truncar descripción
const truncateDescription = (description, maxLength = 120) => {
  if (!description) return "Descripción no disponible";
  return description.length > maxLength
    ? description.substring(0, maxLength) + "..."
    : description;
};

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'No disponible';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para calcular tiempo transcurrido
const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'hoy';
  if (diffInDays === 1) return 'ayer';
  if (diffInDays < 7) return `hace ${diffInDays} días`;
  if (diffInDays < 30) return `hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `hace ${Math.floor(diffInDays / 30)} meses`;
  return `hace ${Math.floor(diffInDays / 365)} años`;
};
</script>

<style scoped>
/* --- Bloqueo de scroll cuando el modal está abierto --- */
:global(body.modal-open) {
  overflow: hidden;
  height: 100vh;
}

/* --- Base y Jerarquía tipográfica profesional --- */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
  padding-top: 100px;
  font-family: Inter, system-ui, sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
}

h1.title-page {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-title);
  border-bottom: 3px solid var(--color-border-accent);
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}

/* --- Secciones con mejor separación y limpieza visual --- */
.section-block {
  border-left: 6px solid var(--color-border-accent);
  border-radius: 14px;
  padding: 2rem;
  margin-bottom: 3rem;
  background: var(--color-card);
  box-shadow: var(--shadow-soft);
}

/* --- Filtros más profesionales (compactos, alineados, exactos) --- */
.filters-box {
  background: var(--color-card);
  padding: 1.8rem;
  border-radius: 14px;
  border: 1px solid rgba(109, 76, 65, 0.18);
  box-shadow: var(--shadow-soft);
  margin-bottom: 2.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.2rem;
}

.filter-group label {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-title);
  margin-bottom: 5px;
  display: block;
}

/* Inputs más corporativos */
.filter-group input,
.filter-group select {
  background: #f4e8e1;
  border: 1.5px solid rgba(93, 64, 55, 0.35);
  border-radius: 10px;
  padding: 0.65rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  width: 100%;
  transition: 0.18s ease-in-out;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(109, 76, 65, 0.18);
}

/* Botón aplicar filtros */
.btn-primary {
  background: var(--color-primary);
  color: #a42222;
  padding: 0.7rem 1.6rem;
  border-radius: 10px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

/* --- Header de secciones mejor alineado --- */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Botón crear propiedad con look más enterprise */
.btn-create,
.btn-create.router-link-active {
  background: var(--color-success);
  background-color: rgb(79, 32, 0);
  color: rgb(255, 255, 255);
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.btn-create:hover {
  background: var(--color-success-hover);
  transform: translateY(-2px);
}

/* --- Grid de cards limpio y profesional --- */
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2.5rem;
}

.property-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid #f0ebe3;
}

.property-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(59, 37, 29, 0.15);
}

.property-badge {
  position: absolute;
  top: 1.2rem;
  left: 1.2rem;
  background: linear-gradient(45deg, #e67e22, #f39c12);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 700;
  z-index: 10;
  box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
}

/* Imagen de la propiedad */
.property-image-container {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.property-card:hover .property-image {
  transform: scale(1.05);
}

.property-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.property-card:hover .property-overlay {
  opacity: 1;
}

.property-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-decoration: none;
  color: inherit;
}

.action-btn:hover {
  background: white;
  transform: scale(1.15);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.edit-btn:hover {
  background: #3498db;
  color: white;
}

.delete-btn:hover {
  background: #e74c3c;
  color: white;
}

/* Contenido de la propiedad mejorado */
.property-content {
  padding: 2rem;
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.property-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.property-price {
  font-size: 1.6rem;
  font-weight: 800;
  color: #27ae60;
  margin-left: 1rem;
  text-align: right;
}

.price-period {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.property-location {
  color: #5d6d7e;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.property-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.feature-item:hover {
  background: #e9ecef;
}

.feature-icon {
  font-size: 1.1rem;
}

.feature-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.property-description {
  color: #5d6d7e;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.property-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
}

.property-type-tag {
  background: #3498db;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.property-footer {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.details-btn {
  flex: 1;
  background: linear-gradient(45deg, #3b251d, #2e1d17);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 15px rgba(59, 37, 29, 0.2);
}

.details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 37, 29, 0.3);
}

.empty-text {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* --- Modal mejorado con diseño profesional y atractivo --- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-box {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  padding: 0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.modal-close:hover {
  background: #fff;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.close-icon {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
}

/* Encabezado del modal */
.modal-header {
  padding: 2.5rem 2.5rem 1.5rem;
  background: linear-gradient(135deg, #3b251d 0%, #2e1d17 100%);
  color: white;
  border-radius: 24px 24px 0 0;
  position: relative;
}

.property-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.available {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.status-dot.rented {
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

.status-dot.maintenance {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}

.modal-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 1rem;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.property-price-highlight {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.price-amount {
  font-size: 2.5rem;
  font-weight: 800;
}

.price-period {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Galería de imágenes */
.modal-gallery {
  position: relative;
  margin: 0 2.5rem;
  margin-top: -2rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-main-image {
  width: 100%;
  height: 350px;
  object-fit: cover;
  display: block;
}

.image-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Grid de detalles */
.modal-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 2.5rem;
}

.detail-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.detail-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.card-text {
  margin: 0;
  font-weight: 600;
  color: #374151;
}

.card-subtext {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.feature-label {
  color: #6b7280;
  font-weight: 500;
}

.feature-value {
  font-weight: 700;
  color: #3b251d;
}

.services-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.service-tag {
  background: #e3f2fd;
  color: #1565c0;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.no-services {
  color: #6b7280;
  font-style: italic;
  margin: 0;
}

/* Sección de descripción */
.description-section {
  padding: 0 2.5rem 2rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.description-text {
  line-height: 1.7;
  color: #4b5563;
  font-size: 1.05rem;
  margin: 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #3b251d;
}

/* Sección de ubicación */
.location-section {
  padding: 0 2.5rem 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-map-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
}

.btn-map-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.coordinates-display {
  display: flex;
  gap: 1.5rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1.5rem;
  border-radius: 16px;
}

.coordinate {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.coordinate-label {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.coordinate-value {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
}

/* Sección sin ubicación */
.no-location-section {
  padding: 2rem 2.5rem;
  text-align: center;
  background: #fef3c7;
  margin: 0 2.5rem 2rem;
  border-radius: 16px;
  border: 1px solid #fcd34d;
}

.no-location-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-location-text {
  font-size: 1.1rem;
  color: #92400e;
  font-weight: 600;
  margin: 0;
}

/* Acciones del modal */
.modal-actions {
  padding: 0 2.5rem 2.5rem;
}

.btn-request-visit {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.btn-request-visit:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
}

.owner-notice,
.unavailable-notice {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 16px;
  margin: 0;
}

.owner-notice {
  background: #e3f2fd;
  color: #1565c0;
  border-left: 4px solid #2196f3;
}

.unavailable-notice {
  background: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.notice-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.notice-content h4 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.notice-content p {
  margin: 0;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 1024px) {
  .properties-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .properties-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .property-features {
    grid-template-columns: 1fr;
  }
  
  .property-header {
    flex-direction: column;
  }
  
  .property-price {
    margin-left: 0;
    margin-top: 0.5rem;
    text-align: left;
  }
  
  .modal-box {
    max-height: 95vh;
    margin: 1rem;
  }
  
  .modal-header {
    padding: 2rem 1.5rem 1rem;
  }
  
  .modal-title {
    font-size: 1.6rem;
  }
  
  .price-amount {
    font-size: 2rem;
  }
  
  .modal-gallery {
    margin: 0 1.5rem;
    margin-top: -1.5rem;
  }
  
  .modal-main-image {
    height: 250px;
  }
  
  .modal-details-grid {
    grid-template-columns: 1fr;
    padding: 1.5rem;
    gap: 1rem;
  }
  
  .description-section,
  .location-section,
  .modal-actions {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  
  .coordinates-display {
    flex-direction: column;
    gap: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .btn-map-preview {
    align-self: stretch;
    justify-content: center;
  }
  
  .no-location-section {
    margin-left: 1.5rem;
    margin-right: 1.5rem;
  }
}

@media (max-width: 480px) {
  .properties-grid {
    grid-template-columns: 1fr;
  }
  
  .property-card {
    margin: 0 0.5rem;
  }
  
  .property-content {
    padding: 1.5rem;
  }
  
  .modal-box {
    margin: 0.5rem;
  }
  
  .modal-header {
    padding: 1.5rem 1rem 1rem;
  }
  
  .modal-title {
    font-size: 1.4rem;
  }
  
  .modal-gallery {
    margin: 0 1rem;
    margin-top: -1rem;
  }
  
  .modal-main-image {
    height: 200px;
  }
}
</style>