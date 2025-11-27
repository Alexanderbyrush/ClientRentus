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
            <div v-if="property.featured" class="property-badge">⭐ Propiedad Exclusiva</div>

            <div class="property-image-container">
              <img v-if="property.image_url" :src="property.image_url" alt="Imagen propiedad" class="property-image" />
              <div v-else class="image-placeholder">
                <div class="placeholder-icon">🏠</div>
                <div class="placeholder-text">Imagen de la propiedad</div>
                <div class="placeholder-subtext">{{ property.title }}</div>
              </div>
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
                <div class="property-status">
                  <span class="status-badge available">{{ getStatusText(property.status) }}</span>
                </div>
              </div>
            </div>

            <div class="property-content">
              <div class="property-header">
                <h3 class="property-title">{{ property.title || 'Propiedad exclusiva' }}</h3>
                <div class="property-price">{{ formatPrice(property.monthly_price) }}<span
                    class="price-period">/mes</span>
                </div>
              </div>
              
              <div class="property-description">{{ truncateDescription(property.description) }}</div>



              <div class="property-location">📍 {{ property.address }}, {{ property.city }}</div>

              <div class="property-features">
                <div class="feature-item" v-if="property.num_bedrooms"><span class="feature-icon">🛏</span>{{
                  property.num_bedrooms }} Habitaciones</div>
                <div class="feature-item" v-if="property.num_bathrooms"><span class="feature-icon">🛁</span>{{
                  property.num_bathrooms }} Baños</div>
                <div class="feature-item" v-if="property.area_m2"><span class="feature-icon">📐</span>{{
                  property.area_m2 }}
                  m²</div>
                <div class="feature-item" v-if="property.parking_spaces"><span class="feature-icon">🚗</span>{{
                  property.parking_spaces }} Parqueaderos</div>
              </div>



              <div class="property-tags">
                <span class="property-type-tag">{{ getTypeText(property.type) }}</span>
                <span v-if="property.new_construction" class="property-new-tag">Nueva Construcción</span>
                <span v-if="property.pet_friendly" class="property-pet-tag">🐾 Mascotas</span>
              </div>

              <div class="property-footer">
                <button class="details-btn" @click.stop="viewPropertyDetails(property)">
                  <span class="btn-text">Ver Detalles Completos</span><span class="btn-arrow">→</span>
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
import api from "@/services/api";

const router = useRouter();

// Estados
const properties = ref([]);
const loadingProperties = ref(false);
const errorProperties = ref(null);
const activeClientsCount = ref(0);
const propertyCount = ref(0);
const PROPERTIES_LIMIT = 4;

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

// Funciones
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
  const map = { available: "Disponible", reserved: "Reservada", sold: "Vendida", rented: "Arrendada" };
  return map[status] || "Disponible";
}
function getTypeText(type) {
  const map = { casa: "Casa", apartamento: "Apartamento", local: "Local Comercial", finca: "Finca" };
  return map[type] || "Propiedad";
}

// Interacciones
function filterProperties() {
  // No hace falta nada si tu computed ya filtra dinámicamente
  // Pero puedes forzar un console.log para que ESLint no se queje
  console.log("Filtros aplicados:", searchFilters.value);
}

function clearFilters() { searchFilters.value = { location: "", type: "", maxPrice: null }; }
function goToProperties() { router.push("/propiedades"); }
function toggleFavorite(property) { property.is_favorite = !property.is_favorite; }
function addToCompare(property) { console.log("Comparar", property.title); }
function shareProperty(property) { console.log("Compartir", property.title); }
function viewPropertyDetails(property) { router.push(`/propiedad/${property.id}`); }
function contactAgent(property) { console.log("Contactar", property.title); }

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

/* Grid de propiedades */
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
  margin-bottom: 4rem;
}

/* Card de propiedad */
.property-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid #f0ebe3;
  display: flex;
  flex-direction: column;
}

.property-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(59, 37, 29, 0.15);
}

.featured-card {
  border: 2px solid #e67e22;
}

/* Badge */
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

/* Imagen de propiedad adaptativa */
.property-image-container {
  position: relative;
  width: 100%;
  max-height: 200px;
  /* reduce la altura máxima */
  min-height: 150px;
  /* altura mínima para mantener proporción */
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.property-image-container img.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* mantiene proporción y recorta */
  display: block;
  transition: transform 0.3s ease;
}

.property-image-container:hover img.property-image {
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

/* Overlay de acciones */
.property-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.4));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  background: white;
  transform: scale(1.15);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
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

/* Contenido de la propiedad */
.property-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  flex: 1;
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
  margin-bottom: 1rem;
  font-size: 0.95rem;
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
}

/* Descripción y tags */
.property-description {
  color: #5d6d7e;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  padding-top: -400px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 15px rgba(59, 37, 29, 0.2);
  transition: all 0.3s ease;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
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

.property-hero-text {
  max-width: 600px;
}

.property-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.property-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
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
  color: var(--highlight);
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

/* Responsive */
@media (max-width: 992px) {
  .property-hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .property-hero-stats {
    width: 100%;
    justify-content: space-between;
  }

  .property-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .property-header {
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .property-nav {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .property-title {
    font-size: 2rem;
    text-align: center;
  }

  .property-subtitle {
    text-align: center;
  }

  .property-search {
    margin: 2rem auto 0;
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

  .filter-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-options {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-btn {
    align-self: stretch;
  }

  .sort-options {
    justify-content: flex-end;
  }

  .property-grid {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }

  .footer-top {
    flex-direction: column;
  }
}
</style>