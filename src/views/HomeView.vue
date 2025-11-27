<template>
  <div class="container">
    <section class="property-hero">
      <NavBarComponent />

      <div class="property-hero-content">
        <section class="hero">
          <div class="hero-text">
            <h1>El hogar ideal existe, y te ayudamos a encontrarlo</h1>
            <p>
              Te acompañamos en cada paso para que encuentres una casa que
              encaje con tu vida y tus planes.
            </p>
          </div>
        </section>

        <!-- Estadísticas -->
        <div class="property-hero-stats">
          <div class="stat-item">
            <span class="stat-number">
              <template v-if="loadingProperties">
                <div class="circle-loader"></div>
              </template>
              <template v-else>{{ propertyCount.toLocaleString() }}</template>
            </span>
            <span class="stat-label">Propiedades</span>
          </div>

          <div class="stat-item">
            <span class="stat-number">
              <template v-if="loadingProperties">
                <div class="circle-loader"></div>
              </template>
              <template v-else>{{ activeClientsCount.toLocaleString() }}</template>
            </span>
            <span class="stat-label">Clientes Activos</span>
          </div>

          <div class="stat-item">
            <span class="stat-number">1</span>
            <span class="stat-label">Años de experiencia</span>
          </div>
        </div>
      </div>

      <div class="hero-gradient-overlay"></div>
    </section>

    <!-- Buscador -->
    <section class="search-section">
      <div class="search-wrapper">
        <p class="search-title">Encuentra tu propiedad ideal</p>
        <div class="search-bar">
          <div class="search-input location-input">
            <input type="text" placeholder="¿Dónde quieres vivir?" v-model="searchFilters.location"
              @focus="searchFilters.location.length > 2 ? showSuggestions = true : null" @blur="hideSuggestions" />
            <span class="search-icon">🏠</span>

            <div v-if="showSuggestions && locationSuggestions.length > 0" class="suggestions-dropdown">
              <div v-for="suggestion in locationSuggestions" :key="suggestion.place_id" class="suggestion-item"
                @mousedown="selectLocationSuggestion(suggestion)">
                <span class="suggestion-icon">📍</span>
                <span class="suggestion-text">{{ suggestion.description }}</span>
              </div>
            </div>

            <div v-if="loadingSuggestions" class="suggestions-loading">
              🔍 Buscando ubicaciones...
            </div>
          </div>

          <div class="search-input">
            <select v-model="searchFilters.type" @change="filterProperties">
              <option value="">Tipo de propiedad</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="local">Local Comercial</option>
              <option value="finca">Finca</option>
            </select>
          </div>

          <div class="search-input">
            <input type="number" placeholder="Presupuesto máximo" v-model="searchFilters.maxPrice"
              @input="filterProperties" />
            <span class="search-icon">💰</span>
          </div>

          <button class="search-btn" @click="filterProperties">
            <span class="btn-text">Buscar Propiedades</span>
            <span class="btn-icon">🔍</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Propiedades -->
    <section class="properties-section">
      <div class="properties-container">
        <div class="section-header">
          <h2 class="section-title">Propiedades Exclusivas</h2>
          <p class="section-subtitle">Descubre nuestras mejores opciones seleccionadas para ti</p>
        </div>

        <!-- Loading -->
        <div v-if="loadingProperties" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando propiedades...</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorProperties" class="error-container">
          <p>¡Ups! Algo salió mal: {{ errorProperties }}</p>
          <button @click="fetchAllData" class="retry-btn">Intentar de nuevo</button>
        </div>

        <!-- Grid de propiedades -->
        <div v-else-if="displayedProperties.length > 0" class="properties-grid">
          <div v-for="property in displayedProperties" :key="property.id" class="property-card"
            :class="{ 'featured-card': property.featured }">
            <!-- Badge destacado -->
            <div v-if="property.featured" class="property-badge">
              ⭐ Propiedad Exclusiva
            </div>

            <!-- Badge de estado CORREGIDO -->
            <div class="property-status-badge" :class="property.status">
              {{ getStatusText(property.status) }}
            </div>

            <!-- Imagen de la propiedad -->
            <div class="property-image-container">
              <img v-if="property.image_url" :src="property.image_url" alt="Imagen propiedad" class="property-image" />
              <div v-else class="image-placeholder">
                <div class="placeholder-icon">🏠</div>
                <div class="placeholder-text">Imagen de la propiedad</div>
                <div class="placeholder-subtext">{{ property.title }}</div>
              </div>
              
              <!-- Overlay de acciones MEJORADO -->
              <div class="property-overlay">
                <div class="property-actions">
                  <button class="action-btn fav-btn" @click.stop="toggleFavorite(property)"
                    :class="{ active: property.is_favorite }"
                    :title="property.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'">
                    ❤️
                  </button>
                  <button class="action-btn compare-btn" @click.stop="addToCompare(property)"
                    title="Comparar propiedad">⚖️</button>
                  <button class="action-btn share-btn" @click.stop="shareProperty(property)"
                    title="Compartir propiedad">📤</button>
                </div>
              </div>
            </div>

            <!-- Contenido de la propiedad -->
            <div class="property-content">
              <div class="property-header">
                <h3 class="property-title">{{ property.title || 'Propiedad exclusiva' }}</h3>
                <div class="property-price">
                  {{ formatPrice(property.monthly_price) }}
                  <span class="price-period">/mes</span>
                </div>
              </div>

              <div class="property-location">
                📍 {{ property.address }}, {{ property.city }}
              </div>

              <div class="property-features">
                <div class="feature-item" v-if="property.num_bedrooms">
                  <span class="feature-icon">🛏</span>
                  <span class="feature-text">{{ property.num_bedrooms }} Habitaciones</span>
                </div>
                <div class="feature-item" v-if="property.num_bathrooms">
                  <span class="feature-icon">🛁</span>
                  <span class="feature-text">{{ property.num_bathrooms }} Baños</span>
                </div>
                <div class="feature-item" v-if="property.area_m2">
                  <span class="feature-icon">📐</span>
                  <span class="feature-text">{{ property.area_m2 }} m²</span>
                </div>
                <div class="feature-item" v-if="property.parking_spaces">
                  <span class="feature-icon">🚗</span>
                  <span class="feature-text">{{ property.parking_spaces }} Parqueaderos</span>
                </div>
              </div>

              <div class="property-description">
                {{ truncateDescription(property.description) }}
              </div>

              <div class="property-tags">
                <span class="property-type-tag">{{ getTypeText(property.type) }}</span>
                <span v-if="property.new_construction" class="property-new-tag">Nueva Construcción</span>
                <span v-if="property.pet_friendly" class="property-pet-tag">🐾 Mascotas</span>
              </div>

              <div class="property-footer">
                <button class="details-btn" @click.stop="openModal(property)">
                  <span class="btn-text">Ver Detalles</span>
                  <span class="btn-arrow">→</span>
                </button>
                <button class="contact-btn" @click.stop="contactAgent(property)">📞 Contactar</button>
              </div>

              <div class="property-meta">
                <span class="meta-item">🕒 Publicado: {{ formatDate(property.created_at) }}</span>
                <span class="meta-item">👁️ {{ property.views || 0 }} visitas</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="empty-state">
          <div class="empty-icon">🏡</div>
          <h3>No encontramos propiedades con esos filtros</h3>
          <p>Intenta ajustar tus criterios de búsqueda o revisa todas nuestras propiedades disponibles</p>
          <button @click="clearFilters" class="clear-filters-btn">🔄 Limpiar filtros de búsqueda</button>
        </div>

        <!-- Ver más propiedades -->
        <div v-if="!loadingProperties && filteredProperties.length > PROPERTIES_LIMIT" class="view-more-section">
          <div class="results-info">
            <p class="properties-count">
              Visualizando <strong>{{ displayedProperties.length }}</strong> de 
              <strong>{{ filteredProperties.length }}</strong> propiedades encontradas
            </p>
            <p class="results-note">¿No encuentras lo que buscas?</p>
          </div>
          <button @click="goToProperties" class="view-more-btn">
            <span class="btn-text">Explorar Todas las Propiedades</span>
            <span class="btn-icon">🔍</span>
          </button>
        </div>
      </div>
    </section>

    <!-- MODAL DE DETALLES MEJORADO -->
    <div v-if="modalOpen" class="modal-backdrop">
      <div class="modal-box">

        <button class="modal-close" @click="closeModal">
          <span class="close-icon">✕</span>
        </button>

        <!-- Encabezado del modal -->
        <div class="modal-header">
          <div class="property-status-badge" :class="selectedProperty.status">
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
              <p class="card-text">{{ formatModalDate(selectedProperty.publication_date) }}</p>
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
          <button v-if="selectedProperty.status === 'available'"
            class="btn-request-visit" @click="contactAgent(selectedProperty)">
            <span class="btn-icon">📅</span>
            <span class="btn-text">Solicitar Cita de Visita</span>
          </button>

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

    <FooterComponent />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import NavBarComponent from "@/components/NavBarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import { useRouter } from "vue-router";
import { mapsService } from "@/services/mapsService";
import api from "@/services/api";

const router = useRouter();

// Estados
const properties = ref([]);
const loadingProperties = ref(false);
const errorProperties = ref(null);
const activeClientsCount = ref(0);
const propertyCount = ref(0);
const PROPERTIES_LIMIT = 4;

// Estados para el modal
const modalOpen = ref(false);
const selectedProperty = ref({});
const fallbackImage = "https://via.placeholder.com/400x300?text=Sin+Imagen";

// Filtros y búsqueda
const searchFilters = ref({ location: "", type: "", maxPrice: null });
const locationSuggestions = ref([]);
const showSuggestions = ref(false);
const loadingSuggestions = ref(false);

// Computed
const filteredProperties = computed(() => {
  let filtered = properties.value;

  if (searchFilters.value.location) {
    filtered = filtered.filter(
      p =>
        p.address?.toLowerCase().includes(searchFilters.value.location.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchFilters.value.location.toLowerCase())
    );
  }
  if (searchFilters.value.type) {
    filtered = filtered.filter(p => p.type?.toLowerCase() === searchFilters.value.type.toLowerCase());
  }
  if (searchFilters.value.maxPrice) {
    filtered = filtered.filter(p => p.monthly_price <= searchFilters.value.maxPrice);
  }
  return filtered;
});

const displayedProperties = computed(() => {
  const featured = filteredProperties.value.filter(p => p.featured);
  const regular = filteredProperties.value.filter(p => !p.featured);
  return [...featured, ...regular].slice(0, PROPERTIES_LIMIT);
});

// Funciones del Modal
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

// MANEJO DE ERROR EN IMAGEN
const onImgError = (event) => {
  event.target.src = fallbackImage;
};

// MAPEAR STATUS A TEXTO
const friendlyStatus = (s) =>
({
  available: "Disponible",
  rented: "Rentada",
  reserved: "Reservada",
  sold: "Vendida",
  maintenance: "En mantenimiento",
}[s] || s);

// Función para formatear fecha para el modal
const formatModalDate = (dateString) => {
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

// Funciones principales
async function fetchAllData() {
  loadingProperties.value = true;
  errorProperties.value = null;

  try {
    const [propRes, usersRes] = await Promise.all([api.get("/properties"), api.get("/users")]);
    properties.value = propRes.data;
    propertyCount.value = properties.value.length;
    activeClientsCount.value = usersRes.data.length;
  } catch (error) {
    console.error(error);
    errorProperties.value = "No pudimos cargar los datos en este momento";
    propertyCount.value = 0;
    activeClientsCount.value = 0;
  } finally {
    loadingProperties.value = false;
  }
}

// Autocompletado
async function fetchLocationSuggestions(input) {
  if (!input.trim()) return;
  loadingSuggestions.value = true;
  try {
    const suggestions = await mapsService.autocompletePlace(input);
    locationSuggestions.value = suggestions;
    showSuggestions.value = suggestions.length > 0;
  } catch (error) {
    console.error(error);
    locationSuggestions.value = [];
  } finally {
    loadingSuggestions.value = false;
  }
}

function selectLocationSuggestion(suggestion) {
  searchFilters.value.location = suggestion.description;
  showSuggestions.value = false;
  locationSuggestions.value = [];
}

function hideSuggestions() {
  setTimeout(() => (showSuggestions.value = false), 200);
}

// Utilidades
function formatPrice(price) {
  if (!price) return "Consultar precio";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
}
function truncateDescription(description, maxLength = 120) {
  if (!description) return "Descripción no disponible";
  return description.length > maxLength ? description.substring(0, maxLength) + "..." : description;
}
function formatDate(dateString) {
  if (!dateString) return "Reciente";
  const options = { day: "numeric", month: "long", year: "numeric" };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}
function getStatusText(status) {
  const map = { 
    available: "Disponible", 
    reserved: "Reservada", 
    sold: "Vendida", 
    rented: "Arrendada",
    maintenance: "En mantenimiento"
  };
  return map[status] || "Disponible";
}
function getTypeText(type) {
  const map = { casa: "Casa", apartamento: "Apartamento", local: "Local Comercial", finca: "Finca" };
  return map[type] || "Propiedad";
}

// Interacciones
function filterProperties() {
  console.log("Filtros aplicados:", searchFilters.value);
}

function clearFilters() { searchFilters.value = { location: "", type: "", maxPrice: null }; }
function goToProperties() { router.push("/propiedades"); }
function toggleFavorite(property) { property.is_favorite = !property.is_favorite; }
function addToCompare(property) { console.log("Comparar", property.title); }
function shareProperty(property) { console.log("Compartir", property.title); }
function contactAgent(property) { 
  console.log("Contactar", property.title);
  closeModal();
}

// Watchers
watch(() => searchFilters.value.location, async (val) => {
  if (val.length > 2) await fetchLocationSuggestions(val);
  else locationSuggestions.value = [];
});

// Lifecycle
onMounted(fetchAllData);
</script>

<style scoped>
/* Fuentes y variables generales */
.container {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #2c3e50;
  line-height: 1.5;
}

/* Loader circular */
.circle-loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6d4c41;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Buscador Mejorado */
.search-section {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f0 100%);
  padding: 50px 20px;
  border-bottom: 1px solid #e0d9cc;
}

.search-wrapper {
  max-width: 1100px;
  margin: 0 auto;
}

.search-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  color: #2c3e50;
}

.search-bar {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr auto;
  gap: 1.2rem;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(59, 37, 29, 0.1);
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input input,
.search-input select {
  width: 100%;
  padding: 15px 45px 15px 20px;
  border: 2px solid #e8e2d8;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #faf9f7;
  font-weight: 500;
}

.search-input input:focus,
.search-input select:focus {
  outline: none;
  border-color: #bdb5a6;
  background: white;
  box-shadow: 0 0 0 3px rgba(189, 181, 166, 0.1);
}

.search-icon {
  position: absolute;
  right: 15px;
  font-size: 1.3rem;
  opacity: 0.7;
}

.search-btn {
  background: linear-gradient(45deg, #3b251d, #2e1d17);
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(59, 37, 29, 0.3);
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 37, 29, 0.4);
}

/* Sección Propiedades */
.properties-section {
  padding: 80px 20px;
  background: linear-gradient(135deg, #faf9f7 0%, #f1ede6 100%);
}

.properties-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(45deg, #3b251d, #2e1d17);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
  font-weight: 500;
}

/* Grid de propiedades actualizado */
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2.5rem;
  margin-bottom: 4rem;
}

/* Card de propiedad actualizada */
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

.featured-card {
  border: 2px solid #e67e22;
}

/* Badge destacado */
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
  z-index: 15;
  box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
}

/* BADGE DE ESTADO MEJORADO - COLORES SEGÚN ESTADO */
.property-status-badge {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 15;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-transform: capitalize;
}

/* Colores específicos para cada estado */
.property-status-badge.available {
  background: rgba(46, 204, 113, 0.95);
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

.property-status-badge.rented {
  background: rgba(231, 76, 60, 0.95);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.property-status-badge.reserved {
  background: rgba(241, 196, 15, 0.95);
  box-shadow: 0 4px 15px rgba(241, 196, 15, 0.3);
}

.property-status-badge.sold {
  background: rgba(52, 73, 94, 0.95);
  box-shadow: 0 4px 15px rgba(52, 73, 94, 0.3);
}

.property-status-badge.maintenance {
  background: rgba(243, 156, 18, 0.95);
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

/* Imagen de propiedad */
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

/* Placeholder */
.image-placeholder {
  text-align: center;
  color: #6c757d;
  padding: 2rem;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.placeholder-text {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
}

.placeholder-subtext {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* BOTONES DE ACCIÓN MEJORADOS - SIN SUPERPOSICIÓN */
.property-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.4));
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
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  z-index: 20;
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  position: relative;
}

/* Asegurar que no haya superposición entre botones */
.action-btn:nth-child(1) { transform: translateX(0); }
.action-btn:nth-child(2) { transform: translateX(-48px); }
.action-btn:nth-child(3) { transform: translateX(-96px); }

.action-btn:hover {
  background: white;
  transform: scale(1.15) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  z-index: 25;
}

.fav-btn.active {
  background: #e74c3c;
  color: white;
}

/* Ajuste para tarjetas destacadas */
.featured-card .property-actions {
  top: 4rem;
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

/* Location y features */
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

/* Descripción y tags */
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

.property-new-tag {
  background: #e74c3c;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.property-pet-tag {
  background: #9b59b6;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Footer de acciones */
.property-footer {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.details-btn {
  flex: 2;
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

.contact-btn {
  flex: 1;
  background: #27ae60;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.contact-btn:hover {
  background: #219653;
  transform: translateY(-2px);
}

/* Meta */
.property-meta {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
  font-size: 0.8rem;
  color: #95a5a6;
}

/* Loaders y estados */
.loading-container,
.error-container,
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  border-radius: 15px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b251d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

.error-container {
  background: #fff5f5;
  border: 1px solid #fed7d7;
}

.error-container p {
  color: #c53030;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.empty-state {
  background: white;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 700;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.retry-btn,
.clear-filters-btn {
  background: linear-gradient(45deg, #3b251d, #2e1d17);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(59, 37, 29, 0.2);
}

.retry-btn:hover,
.clear-filters-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 37, 29, 0.3);
}

/* Sección Ver Más */
.view-more-section {
  text-align: center;
  padding: 3rem 0 1rem;
  border-top: 1px solid #e0d9cc;
}

.results-info {
  margin-bottom: 2rem;
}

.properties-count {
  color: #5d6d7e;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.results-note {
  color: #7f8c8d;
  font-size: 1rem;
  font-style: italic;
}

.view-more-btn {
  background: linear-gradient(45deg, #3b251d, #2e1d17);
  color: white;
  border: none;
  padding: 1.2rem 2.5rem;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 6px 25px rgba(59, 37, 29, 0.25);
}

.view-more-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(59, 37, 29, 0.35);
}

/* Estilos para las sugerencias */
.location-input {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-top: 4px;
}

.suggestion-item {
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-icon {
  font-size: 14px;
}

.suggestion-text {
  font-size: 14px;
  color: #333;
}

.suggestions-loading {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 15px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  color: #666;
  font-style: italic;
  margin-top: 4px;
  z-index: 1000;
}

/* Hero Section de Propiedades */
.property-hero {
  background: linear-gradient(#4d2f24e6, rgba(77, 47, 36, 0.7)),
    url('@/assets/img/casa.png') no-repeat center center;
  background-size: cover;
  color: #EFE8DD;
  padding: 2rem 7% 8rem;
  position: relative;
  -webkit-mask-image: linear-gradient(to bottom, 135deg, #f8f4f0 0%, #e8e2d8 100%);
  mask-image: linear-gradient(to bottom, 135deg, #f8f4f0 0%, #e8e2d8 100%);
  padding-top: 120px;
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
  position: relative;
  z-index: 10;
}

.property-hero-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 3rem;
  position: relative;
  z-index: 1;
}

.hero-text {
  max-width: 600px;
}

.hero-text h1 {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

.hero-text p {
  font-size: 1.2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.property-hero-stats {
  display: flex;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.stat-item {
  text-align: center;
  padding: 0 1.5rem;
}

.stat-item:not(:last-child) {
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #EFE8DD;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.hero-gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(to bottom, transparent, #f5f5f5);
  z-index: 1;
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

.modal-header .property-status-badge {
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
  text-transform: capitalize;
}

/* Colores para el badge en el modal */
.modal-header .property-status-badge.available {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.modal-header .property-status-badge.rented {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.modal-header .property-status-badge.reserved {
  background: rgba(241, 196, 15, 0.2);
  color: #f1c40f;
}

.modal-header .property-status-badge.sold {
  background: rgba(52, 73, 94, 0.2);
  color: #34495e;
}

.modal-header .property-status-badge.maintenance {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.available {
  background: #2ecc71;
  box-shadow: 0 0 8px #2ecc71;
}

.status-dot.rented {
  background: #e74c3c;
  box-shadow: 0 0 8px #e74c3c;
}

.status-dot.reserved {
  background: #f1c40f;
  box-shadow: 0 0 8px #f1c40f;
}

.status-dot.sold {
  background: #34495e;
  box-shadow: 0 0 8px #34495e;
}

.status-dot.maintenance {
  background: #f39c12;
  box-shadow: 0 0 8px #f39c12;
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

/* Responsive adjustments para botones */
@media (max-width: 768px) {
  .property-actions {
    gap: 0.4rem;
    top: 1rem;
    right: 1rem;
  }
  
  .action-btn {
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }
  
  .action-btn:nth-child(2) { transform: translateX(-44px); }
  .action-btn:nth-child(3) { transform: translateX(-88px); }
  
  .featured-card .property-actions {
    top: 3.5rem;
  }
}

/* Responsive general */
@media (max-width: 1024px) {
  .search-bar {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .properties-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }

  .property-hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .property-hero-stats {
    width: 100%;
    justify-content: space-between;
  }

  .hero-text h1 {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2.2rem;
  }
  
  .search-bar {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .properties-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .property-features {
    grid-template-columns: 1fr;
  }
  
  .property-footer {
    flex-direction: column;
  }
  
  .property-header {
    flex-direction: column;
  }
  
  .property-price {
    margin-left: 0;
    margin-top: 0.5rem;
    text-align: left;
  }
  
  .property-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .hero-text h1 {
    font-size: 2rem;
  }
  
  .property-hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .stat-item:not(:last-child) {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 1.5rem;
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
  
  .property-hero {
    padding: 2rem 1rem 6rem;
  }
  
  .hero-text h1 {
    font-size: 1.8rem;
  }
  
  .stat-number {
    font-size: 2rem;
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