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

        <div class="property-hero-stats">
          <div class="stat-item">
            <span class="stat-number">{{ propertyCount.toLocaleString() }}</span>
            <span class="stat-label">Propiedades</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ activeClientsCount }}</span>
            <span class="stat-label">Clientes Activos</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">15</span>
            <span class="stat-label">Años de experiencia</span>
          </div>
        </div>
      </div>

      <div class="hero-gradient-overlay"></div>
    </section>

    <!-- Buscador Mejorado con Autocompletado -->
    <section class="search-section">
      <div class="search-wrapper">
        <p class="search-title">Encuentra tu propiedad ideal</p>
        <div class="search-bar">
          <!-- Input de ubicación con autocompletado -->
          <div class="search-input location-input">
            <input
              type="text"
              placeholder="¿Dónde quieres vivir?"
              v-model="searchFilters.location"
              @focus="searchFilters.location.length > 2 ? showSuggestions = true : null"
              @blur="hideSuggestions"
            />
            <span class="search-icon">🏠</span>
            
            <!-- Dropdown de sugerencias -->
            <div v-if="showSuggestions && locationSuggestions.length > 0" class="suggestions-dropdown">
              <div
                v-for="suggestion in locationSuggestions"
                :key="suggestion.place_id"
                class="suggestion-item"
                @mousedown="selectLocationSuggestion(suggestion)"
              >
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
            <input
              type="number"
              placeholder="Presupuesto máximo"
              v-model="searchFilters.maxPrice"
              @input="filterProperties"
            />
            <span class="search-icon">💰</span>
          </div>

          <button class="search-btn" @click="filterProperties">
            <span class="btn-text">Buscar Propiedades</span>
            <span class="btn-icon">🔍</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Sección de Propiedades Destacadas Mejorada -->
    <section class="properties-section">
      <div class="properties-container">
        <div class="section-header">
          <h2 class="section-title">Propiedades Exclusivas</h2>
          <p class="section-subtitle">Descubre nuestras mejores opciones seleccionadas para ti</p>
        </div>

        <!-- Loading state -->
        <div v-if="loadingProperties" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Buscando las mejores propiedades para ti...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="errorProperties" class="error-container">
          <p>¡Ups! Algo salió mal: {{ errorProperties }}</p>
          <button @click="fetchProperties" class="retry-btn">Intentar de nuevo</button>
        </div>

        <!-- Properties grid mejorado -->
        <div v-else-if="displayedProperties.length > 0" class="properties-grid">
          <div
            v-for="property in displayedProperties"
            :key="property.id"
            class="property-card"
            :class="{ 'featured-card': property.featured }"
          >
            <!-- Badge destacado -->
            <div v-if="property.featured" class="property-badge">
              ⭐ Propiedad Exclusiva
            </div>

            <!-- Placeholder de imagen sin imagen real -->
            <div class="property-image-container">
              <div class="image-placeholder">
                <div class="placeholder-icon">🏠</div>
                <div class="placeholder-text">Imagen de la propiedad</div>
                <div class="placeholder-subtext">{{ property.title }}</div>
              </div>
              <div class="property-overlay">
                <div class="property-actions">
                  <button
                    class="action-btn fav-btn"
                    @click.stop="toggleFavorite(property)"
                    :class="{ active: property.is_favorite }"
                    :title="property.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
                  >
                    ❤️
                  </button>
                  <button 
                    class="action-btn compare-btn" 
                    @click.stop="addToCompare(property)"
                    title="Comparar propiedad"
                  >
                    ⚖️
                  </button>
                  <button 
                    class="action-btn share-btn" 
                    @click.stop="shareProperty(property)"
                    title="Compartir propiedad"
                  >
                    📤
                  </button>
                </div>
                <div class="property-status">
                  <span class="status-badge available">
                    {{ getStatusText(property.status) }}
                  </span>
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
                <button class="details-btn" @click.stop="viewPropertyDetails(property)">
                  <span class="btn-text">Ver Detalles Completos</span>
                  <span class="btn-arrow">→</span>
                </button>
                <button class="contact-btn" @click.stop="contactAgent(property)">
                  📞 Contactar
                </button>
              </div>

              <div class="property-meta">
                <span class="meta-item">🕒 Publicado: {{ formatDate(property.created_at) }}</span>
                <span class="meta-item">👁️ {{ property.views || 0 }} visitas</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="empty-state">
          <div class="empty-icon">🏡</div>
          <h3>No encontramos propiedades con esos filtros</h3>
          <p>Intenta ajustar tus criterios de búsqueda o revisa todas nuestras propiedades disponibles</p>
          <button @click="clearFilters" class="clear-filters-btn">
            🔄 Limpiar filtros de búsqueda
          </button>
        </div>

        <!-- Ver más propiedades -->
        <div
          v-if="!loadingProperties && filteredProperties.length > PROPERTIES_LIMIT"
          class="view-more-section"
        >
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

    <FooterComponent />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import NavBarComponent from "@/components/NavBarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import { useRouter } from "vue-router";
import { mapsService } from "@/services/mapsService";

const router = useRouter();

// Estados para propiedades
const properties = ref([]);
const loadingProperties = ref(false);
const errorProperties = ref(null);

// Configuración para limitar propiedades
const PROPERTIES_LIMIT = ref(4);

// Estados para búsqueda y filtros
const searchFilters = ref({
  location: "",
  type: "",
  maxPrice: null,
});

// Estados para estadísticas
const activeClientsCount = ref(0);
const propertyCount = ref(0);

// Estados para autocompletado
const locationSuggestions = ref([]);
const showSuggestions = ref(false);
const loadingSuggestions = ref(false);

// Computed para propiedades filtradas
const filteredProperties = computed(() => {
  let filtered = properties.value;

  if (searchFilters.value.location) {
    filtered = filtered.filter(
      (property) =>
        property.address
          ?.toLowerCase()
          .includes(searchFilters.value.location.toLowerCase()) ||
        property.city
          ?.toLowerCase()
          .includes(searchFilters.value.location.toLowerCase())
    );
  }

  if (searchFilters.value.type) {
    filtered = filtered.filter(
      (property) =>
        property.type?.toLowerCase() === searchFilters.value.type.toLowerCase()
    );
  }

  if (searchFilters.value.maxPrice) {
    filtered = filtered.filter(
      (property) => property.monthly_price <= searchFilters.value.maxPrice
    );
  }

  return filtered;
});

// Computed para propiedades mostradas en el home (limitadas)
const displayedProperties = computed(() => {
  const featured = filteredProperties.value.filter((p) => p.featured);
  const regular = filteredProperties.value.filter((p) => !p.featured);
  const combined = [...featured, ...regular];
  return combined.slice(0, PROPERTIES_LIMIT.value);
});

// Watcher para autocompletado
watch(() => searchFilters.value.location, async (newLocation) => {
  if (newLocation.length > 2) {
    await fetchLocationSuggestions(newLocation);
  } else {
    locationSuggestions.value = [];
    showSuggestions.value = false;
  }
});

// Funciones de API
async function fetchProperties() {
  loadingProperties.value = true;
  errorProperties.value = null;

  try {
    // Simulación de datos de propiedades en español
    properties.value = [
      {
        id: 1,
        title: "Casa Familiar en Zona Residencial",
        description: "Hermosa casa familiar con amplio jardín, perfecta para familias que buscan espacio y comodidad. Cuenta con acabados de lujo y áreas sociales espaciosas.",
        monthly_price: 3200000,
        address: "Carrera 85 #45-120",
        city: "Medellín",
        num_bedrooms: 4,
        num_bathrooms: 3,
        area_m2: 180,
        parking_spaces: 2,
        type: "casa",
        featured: true,
        status: "available",
        new_construction: false,
        pet_friendly: true,
        views: 156,
        created_at: "2024-01-15"
      },
      {
        id: 2,
        title: "Apartamento Moderno con Vista Panorámica",
        description: "Elegante apartamento en torre de lujo con vista a la ciudad. Incluye gimnasio, piscina y zonas sociales exclusivas.",
        monthly_price: 2800000,
        address: "Calle 10 #25-80",
        city: "Bogotá",
        num_bedrooms: 3,
        num_bathrooms: 2,
        area_m2: 95,
        parking_spaces: 1,
        type: "apartamento",
        featured: true,
        status: "available",
        new_construction: true,
        pet_friendly: false,
        views: 203,
        created_at: "2024-02-01"
      },
      {
        id: 3,
        title: "Local Comercial en Zona de Alto Tráfico",
        description: "Excelente local comercial situado en zona comercial estratégica, ideal para negocio propio o inversión.",
        monthly_price: 1500000,
        address: "Avenida Principal #100-50",
        city: "Cali",
        num_bedrooms: 0,
        num_bathrooms: 1,
        area_m2: 65,
        parking_spaces: 0,
        type: "local",
        featured: true,
        status: "available",
        new_construction: false,
        pet_friendly: false,
        views: 89,
        created_at: "2024-01-20"
      },
      {
        id: 4,
        title: "Finca Campestre con Piscina",
        description: "Hermosa finca campestre ideal para descanso familiar, cuenta con piscina, jardín amplio y zona de BBQ.",
        monthly_price: 4200000,
        address: "Kilómetro 12 Vía a la Costa",
        city: "Barranquilla",
        num_bedrooms: 5,
        num_bathrooms: 4,
        area_m2: 300,
        parking_spaces: 4,
        type: "finca",
        featured: true,
        status: "available",
        new_construction: false,
        pet_friendly: true,
        views: 78,
        created_at: "2024-01-10"
      }
    ];

    propertyCount.value = 156;
    activeClientsCount.value = 1247;

  } catch (error) {
    console.error("Error al obtener propiedades:", error);
    errorProperties.value = "No pudimos cargar las propiedades en este momento";
  } finally {
    loadingProperties.value = false;
  }
}

async function fetchActiveClientsCount() {
  try {
    activeClientsCount.value = 1247;
  } catch (error) {
    console.error("Error al obtener clientes activos:", error);
  }
}

// Funciones de autocompletado
async function fetchLocationSuggestions(input) {
  if (!input.trim()) return;
  
  loadingSuggestions.value = true;
  try {
    const suggestions = await mapsService.autocompletePlace(input);
    locationSuggestions.value = suggestions;
    showSuggestions.value = suggestions.length > 0;
  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    locationSuggestions.value = [];
  } finally {
    loadingSuggestions.value = false;
  }
}

function selectLocationSuggestion(suggestion) {
  searchFilters.value.location = suggestion.description;
  showSuggestions.value = false;
  locationSuggestions.value = [];
  console.log('Ubicación seleccionada:', suggestion.description);
}

function hideSuggestions() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}

// Funciones de utilidad mejoradas
function formatPrice(price) {
  if (!price) return "Consultar precio";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}

function truncateDescription(description, maxLength = 120) {
  if (!description) return "Descripción no disponible";
  return description.length > maxLength
    ? description.substring(0, maxLength) + "..."
    : description;
}

function formatDate(dateString) {
  if (!dateString) return "Reciente";
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

function getStatusText(status) {
  const statusMap = {
    'available': 'Disponible',
    'reserved': 'Reservada',
    'sold': 'Vendida',
    'rented': 'Arrendada'
  };
  return statusMap[status] || 'Disponible';
}

function getTypeText(type) {
  const typeMap = {
    'casa': 'Casa',
    'apartamento': 'Apartamento',
    'local': 'Local Comercial',
    'finca': 'Finca'
  };
  return typeMap[type] || 'Propiedad';
}

// Funciones de interacción
function filterProperties() {
  console.log("Aplicando filtros...", searchFilters.value);
}

function clearFilters() {
  searchFilters.value = {
    location: "",
    type: "",
    maxPrice: null,
  };
}

function goToProperties() {
  router.push("/propiedades");
}

function toggleFavorite(property) {
  const isLoggedIn = !!localStorage.getItem("token");
  if (!isLoggedIn) {
    alert("Inicia sesión para guardar propiedades en favoritos");
    return;
  }
  property.is_favorite = !property.is_favorite;
  console.log(property.is_favorite ? "Agregado a favoritos" : "Removido de favoritos", property.title);
}

function addToCompare(property) {
  console.log("Agregando a comparación:", property.title);
}

function shareProperty(property) {
  console.log("Compartiendo propiedad:", property.title);
  if (navigator.share) {
    navigator.share({
      title: property.title,
      text: property.description,
      url: `${window.location.origin}/propiedad/${property.id}`
    });
  } else {
    alert("Enlace copiado al portapapeles");
  }
}

function viewPropertyDetails(property) {
  router.push(`/propiedad/${property.id}`);
}

function contactAgent(property) {
  console.log("Contactando agente para:", property.title);
}

// Lifecycle hooks
onMounted(async () => {
  // Cargar datos iniciales
  await fetchProperties();
  fetchActiveClientsCount();
});
</script>

<style scoped>
/* Estilos generales */
.container {
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(45deg, #3b251d, #2e1d17);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

/* Buscador Mejorado */
.search-section {
  background: linear-gradient(135deg, #f8f4f0 0%, #e8e2d8 100%);
  padding: 50px 20px;
  border-bottom: 1px solid #e0d9cc;
}

.search-wrapper {
  max-width: 1100px;
  margin: 0 auto;
}

.search-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  color: #2c3e50;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-bar {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr auto;
  gap: 1.2rem;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(59, 37, 29, 0.15);
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
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(59, 37, 29, 0.3);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 37, 29, 0.4);
}

/* Sección de Propiedades Mejorada */
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
  color: #2c3e50;
  margin: 0 0 1rem 0;
  background: linear-gradient(45deg, #3b251d, #2e1d17);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
  font-weight: 500;
}

/* Grid de propiedades mejorado */
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2.5rem;
  margin-bottom: 4rem;
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

.featured-card {
  border: 2px solid #e67e22;
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

/* Placeholder de imagen mejorado */
.property-image-container {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  text-align: center;
  color: #6c757d;
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
}

.action-btn:hover {
  background: white;
  transform: scale(1.15);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.fav-btn.active {
  background: #e74c3c;
  color: white;
}

.property-status {
  display: flex;
  justify-content: flex-start;
}

.status-badge {
  background: rgba(46, 204, 113, 0.95);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
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

.property-meta {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.meta-item {
  font-size: 0.8rem;
  color: #95a5a6;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Estados mejorados */
.loading-container {
  text-align: center;
  padding: 4rem 1rem;
  color: #5d6d7e;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 3rem 1rem;
  background: #fff5f5;
  border-radius: 15px;
  border: 1px solid #fed7d7;
}

.error-container p {
  color: #c53030;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
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

/* Sección Ver Más mejorada */
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

/* Responsive */
@media (max-width: 1024px) {
  .search-bar {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .properties-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
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
    gap: 2rem;
    flex-wrap: wrap;
  }
}
</style>