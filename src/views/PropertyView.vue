<template>
  <div class="container">
    <section class="property-hero">
      <NavBarComponent />

      <div class="property-hero-content">
        <section class="hero">
          <div class="hero-text">
            <h1>Encuentra tu propiedad ideal</h1>
            <p>Explora nuestro exclusivo catálogo de viviendas seleccionadas</p>
          </div>
        </section>

        <div class="property-hero-stats">
          <div class="stat-item">
            <span class="stat-number">{{
              propertyCount.toLocaleString()
            }}</span>
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

    <section class="search-section">
      <div class="search-wrapper">
        <p class="search-title">Buscador de propiedades disponibles</p>
        <div class="search-bar">
          <div class="search-input">
            <input
              type="text"
              placeholder="Ubicación"
              v-model="searchFilters.location"
              @input="filterProperties"
            />
            <img
              src="https://img.icons8.com/ios-filled/20/marker.png"
              alt="Ubicación"
            />
          </div>

          <div class="search-input">
            <select v-model="searchFilters.type" @change="filterProperties">
              <option value="">Tipo de propiedad</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="local">Local</option>
            </select>
          </div>

          <div class="search-input">
            <input
              type="number"
              placeholder="Precio máximo"
              v-model="searchFilters.maxPrice"
              @input="filterProperties"
            />
            <img
              src="https://img.icons8.com/ios-filled/20/money.png"
              alt="Precio"
            />
          </div>

          <button class="search-btn" @click="filterProperties">Buscar</button>
        </div>
      </div>
    </section>

    <!-- Sección de Propiedades -->
    <section class="properties-section">
      <div class="properties-container">
        <div class="section-header">
          <h2 class="section-title">Propiedades Destacadas</h2>
        </div>

        <!-- Loading state -->
        <div v-if="loadingProperties" class="loading-container">
          <p>Cargando propiedades...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="errorProperties" class="error-container">
          <p>Error al cargar las propiedades: {{ errorProperties }}</p>
          <button @click="fetchProperties" class="retry-btn">Reintentar</button>
        </div>

        <!-- Properties grid -->
        <div v-else-if="displayedProperties.length > 0" class="properties-grid">
          <div
            v-for="property in displayedProperties"
            :key="property.id"
            class="property-card"
            :class="{ featured: property.featured }"
            @click="openPropertyModal(property)"
          >
            <div v-if="property.featured" class="property-badge">
              ⭐ Destacada
            </div>

            <div class="property-media">
              <img
                :src="getPropertyImage(property)"
                :alt="property.title"
                :data-original-src="property.image_url"
                @error="handleImageError($event)"
                loading="lazy"
              />
              <div class="property-actions">
                <button
                  class="fav-btn"
                  @click.stop="toggleFavorite(property)"
                  :class="{ active: property.is_favorite }"
                >
                  <i class="fas fa-heart"></i>
                </button>
                <button
                  class="compare-btn"
                  @click.stop="addToCompare(property)"
                >
                  <i class="fas fa-exchange-alt"></i>
                </button>
              </div>
              <button v-if="property.has_tour" class="tour-btn">
                <i class="fas fa-vr-cardboard"></i> Tour 360°
              </button>
            </div>

            <div class="property-details">
              <div class="price-agent">
                <span class="property-price">{{
                  formatPrice(property.monthly_price)
                }}</span>
                <div v-if="property.agent" class="agent-mini">
                  <img
                    :src="property.agent.photo || '/img/default-agent.jpg'"
                    :alt="property.agent.name"
                  />
                </div>
              </div>

              <h3 class="property-title">{{ property.title }}</h3>

              <div class="property-location">
                <i class="fas fa-map-marker-alt"></i>
                {{ property.address }}, {{ property.city }}
              </div>

              <div class="property-features">
                <span v-if="property.num_bedrooms">
                  <i class="fas fa-bed"></i> {{ property.num_bedrooms }}
                </span>
                <span v-if="property.num_bathrooms">
                  <i class="fas fa-bath"></i> {{ property.num_bathrooms }}
                </span>
                <span v-if="property.area_m2">
                  <i class="fas fa-ruler-combined"></i> {{ property.area_m2 }}m²
                </span>
              </div>

              <div class="property-description">
                {{ truncateDescription(property.description) }}
              </div>

              <div class="property-footer">
                <div v-if="property.rating" class="property-rating">
                  <i class="fas fa-star"></i> {{ property.rating }}
                </div>
                <button
                  class="details-btn"
                  @click.stop="openPropertyModal(property)"
                >
                  Ver detalles <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <p>No se encontraron propiedades que coincidan con tu búsqueda.</p>
          <button @click="clearFilters" class="clear-filters-btn">
            Limpiar filtros
          </button>
        </div>
      </div>
    </section>

    <!-- Modal detalle de propiedad -->
    <div
      id="property-detail-modal"
      class="property-detail-modal"
      v-if="showPropertyModal && selectedProperty"
      @click.self="closePropertyModal"
    >
      <button
        v-if="filteredProperties.length > 1"
        id="prev-btn"
        class="carousel-prev"
        @click="showPreviousProperty"
        :disabled="currentPropertyIndex === 0"
      >
        &#10094;
      </button>

      <button
        v-if="filteredProperties.length > 1"
        id="next-btn"
        class="carousel-next"
        @click="showNextProperty"
        :disabled="currentPropertyIndex === filteredProperties.length - 1"
      >
        &#10095;
      </button>

      <div class="property-detail-content">
        <span class="property-detail-close-btn" @click="closePropertyModal"
          >&times;</span
        >

        <div class="property-detail-left">
          <div class="image-container">
            <img
              :src="selectedPropertyImages[currentImageIndex]"
              :alt="selectedProperty.title"
              @error="handleImageError($event)"
            />
          </div>
          <div
            class="image-thumbnails"
            v-if="selectedPropertyImages.length > 1"
          >
            <img
              v-for="(image, index) in selectedPropertyImages"
              :key="index"
              :src="image"
              :class="{ active: index === currentImageIndex }"
              @click="currentImageIndex = index"
              @error="handleImageError($event)"
            />
          </div>
        </div>

        <div class="property-detail-right">
          <h2>{{ selectedProperty.title }}</h2>

          <ul class="property-detail-features">
            <li>{{ selectedProperty.description }}</li>
            <li v-if="selectedProperty.num_bedrooms">
              🛏️ {{ selectedProperty.num_bedrooms }} Habitaciones
            </li>
            <li v-if="selectedProperty.num_bathrooms">
              🛁 {{ selectedProperty.num_bathrooms }} Baños
            </li>
            <li v-if="selectedProperty.area_m2">
              📐 {{ selectedProperty.area_m2 }}m²
            </li>
          </ul>

          <p class="property-detail-location">
            📍 {{ selectedProperty.address }}, {{ selectedProperty.city }}
          </p>

          <p class="property-detail-price">
            {{ formatPrice(selectedProperty.monthly_price) }}
          </p>

          <button
            class="property-detail-rent-btn"
            @click="openRequestModal"
            :disabled="submittingRequest"
          >
            {{ submittingRequest ? "Procesando..." : "Solicitar alquiler" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal solicitud de arriendo -->
    <div
      id="rental-request-modal"
      class="modal"
      v-if="showRequestModal"
      @click.self="closeRequestModal"
    >
      <div class="modal-content">
        <span class="close-btn" @click="closeRequestModal">&times;</span>
        <h2>Formulario de Solicitud de Arriendo</h2>

        <form @submit.prevent="submitRentalRequest">
          <label for="name">Nombre completo</label>
          <input
            type="text"
            id="name"
            v-model="rentalRequest.name"
            placeholder="Tu nombre completo"
            required
          />

          <label for="phone">Teléfono</label>
          <input
            type="tel"
            id="phone"
            v-model="rentalRequest.phone"
            placeholder="Tu número de contacto"
            required
          />

          <label for="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            v-model="rentalRequest.email"
            placeholder="ejemplo@email.com"
            required
          />

          <label for="start-date">Fecha de inicio</label>
          <input
            type="date"
            id="start-date"
            v-model="rentalRequest.startDate"
            required
          />

          <label for="duration">Duración del contrato (meses)</label>
          <input
            type="number"
            id="duration"
            v-model="rentalRequest.duration"
            min="1"
            required
          />

          <label for="message">Comentarios adicionales</label>
          <textarea
            id="message"
            v-model="rentalRequest.message"
            placeholder="Escribe aquí cualquier información adicional..."
            rows="3"
          ></textarea>

          <button
            type="submit"
            class="submit-btn"
            :disabled="submittingRequest"
          >
            {{ submittingRequest ? "Enviando..." : "Enviar solicitud" }}
          </button>
        </form>
      </div>
    </div>

    <!-- Modal confirmación -->
    <div
      id="confirmation-modal"
      class="modal"
      v-if="showConfirmationModal"
      @click.self="closeConfirmationModal"
    >
      <div class="modal-content confirmation">
        <span class="close-btn" @click="closeConfirmationModal">&times;</span>
        <div class="check-icon">✅</div>
        <h2>¡Solicitud enviada!</h2>
        <p>
          Tu solicitud ha sido enviada correctamente. El arrendador se pondrá en
          contacto contigo pronto.
        </p>
        <button class="submit-btn" @click="closeConfirmationModal">
          Volver a propiedades
        </button>
      </div>
    </div>
    <FooterComponent />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import NavBarComponent from "@/components/NavBarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

let styleLinks = [];

// Estados existentes
const activeClientsCount = ref(0);
let intervalIdClients = null;
const propertyCount = ref(0);
const targetCount = ref(0);
let intervalId = null;

const router = useRouter();
const isLoggedIn = ref(false);
const showDropdown = ref(false);
const fullName = ref("Usuario");
const firstName = ref("Usuario");
const profilePhoto = ref("");

// Estados para propiedades
const properties = ref([]);
const loadingProperties = ref(false);
const errorProperties = ref(null);
const selectedProperty = ref(null);
const currentPropertyIndex = ref(0);
const currentImageIndex = ref(0);

// Estados para modales
const showPropertyModal = ref(false);
const showRequestModal = ref(false);
const showConfirmationModal = ref(false);

// Estados para formulario de solicitud
const submittingRequest = ref(false);
const rentalRequest = ref({
  name: "",
  phone: "",
  email: "",
  startDate: "",
  duration: 1,
  message: "",
  propertyId: null,
});

// Estados para búsqueda y filtros
const searchFilters = ref({
  location: "",
  type: "",
  maxPrice: null,
});

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
  // Priorizar propiedades destacadas primero
  const featured = filteredProperties.value.filter((p) => p.featured);
  const regular = filteredProperties.value.filter((p) => !p.featured);

  return [...featured, ...regular];
});

// Computed para imágenes de la propiedad seleccionada
const selectedPropertyImages = computed(() => {
  if (!selectedProperty.value) return [];

  // Usar image_url como imagen principal
  if (selectedProperty.value.image_url) {
    return [selectedProperty.value.image_url];
  }

  // Fallback para múltiples imágenes si las hay
  if (
    selectedProperty.value.images &&
    selectedProperty.value.images.length > 0
  ) {
    return selectedProperty.value.images.map((img) =>
      typeof img === "string" ? img : img.url
    );
  }

  return ["/img/property-placeholder.jpg"];
});

// Funciones de API
async function fetchUserData() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      isLoggedIn.value = false;
      return;
    }
    isLoggedIn.value = true;

    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = response.data;
    fullName.value = user.name || "Usuario";
    firstName.value = fullName.value.split(" ")[0];

    if (firstName.value.length > 10) {
      firstName.value = firstName.value.slice(0, 10) + "...";
    }

    profilePhoto.value = user.profile_photo || "";
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    logout();
  }
}

async function fetchProperties() {
  loadingProperties.value = true;
  errorProperties.value = null;

  try {
    const response = await api.get("/properties", {
      params: {
        limit: 1000,
        status: "available",
      },
    });

    properties.value = response.data.data || response.data;

    // Precargar imágenes para evitar errores 404 durante el renderizado
    await preloadPropertyImages();

    if (response.data.meta) {
      targetCount.value = response.data.meta.total;
      animateCount(
        propertyCount.value,
        response.data.meta.total,
        propertyCount
      );
    }
  } catch (error) {
    console.error("Error al obtener propiedades:", error);
    errorProperties.value =
      error.response?.data?.message || "Error al cargar las propiedades";
  } finally {
    loadingProperties.value = false;
  }
}

async function fetchPropertyCount() {
  try {
    const res = await api.get("/properties/count");
    const count = res.data.count || res.data;
    animateCount(propertyCount.value, count, propertyCount);
    targetCount.value = count;
  } catch (error) {
    console.error("Error al obtener conteo:", error);
  }
}

async function fetchActiveClientsCount() {
  try {
    const res = await api.get("/users/active/count");
    const count = res.data.count || res.data;
    animateCount(activeClientsCount.value, count, activeClientsCount);
  } catch (error) {
    console.error("Error al obtener clientes activos:", error);
  }
}

// Funciones de utilidad
function animateCount(start, end, refVar) {
  if (!refVar || typeof refVar.value === "undefined") return;
  const step = end > start ? 1 : -1;
  refVar.value = start;
  const timer = setInterval(() => {
    if (refVar.value === end) {
      clearInterval(timer);
    } else {
      refVar.value += step;
    }
  }, 30);
}

function formatPrice(price) {
  if (!price) return "Precio a consultar";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}

function getPropertyImage(property) {
  // Verificar si ya sabemos que esta propiedad no tiene imagen válida
  if (property._imageError) {
    return DEFAULT_PROPERTY_IMAGE;
  }

  // Validar que la URL de imagen sea válida antes de devolverla
  const validateImageUrl = (url) => {
    if (!url || typeof url !== "string") return null;

    // Lista de URLs conocidas que fallan (placeholder URLs que no existen)
    const knownBadUrls = [
      "via.placeholder.com",
      "placeholder.com",
      "example.com",
      "picsum.photos",
      "lorem",
      "test",
    ];

    // Verificar si es una URL problemática conocida
    if (knownBadUrls.some((badUrl) => url.toLowerCase().includes(badUrl))) {
      // Marcar silenciosamente como error sin logs
      property._imageError = true;
      return null;
    }

    // Verificar que sea una URL válida
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  };

  // Usar el campo image_url de la migración
  if (property.image_url) {
    const validUrl = validateImageUrl(property.image_url);
    if (validUrl) return validUrl;
  }

  // Fallbacks por si acaso usan otros nombres
  if (property.images && property.images.length > 0) {
    const firstImage = property.images[0];
    const imageUrl =
      typeof firstImage === "string" ? firstImage : firstImage.url;
    const validUrl = validateImageUrl(imageUrl);
    if (validUrl) return validUrl;
  }

  if (property.image) {
    const validUrl = validateImageUrl(property.image);
    if (validUrl) return validUrl;
  }

  return DEFAULT_PROPERTY_IMAGE;
}

async function preloadPropertyImages() {
  const imagePromises = properties.value.map(async (property) => {
    const imageUrl = getPropertyImage(property);

    if (imageUrl === "/img/property-placeholder.jpg") {
      return; // Ya sabemos que no tiene imagen válida
    }

    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;

        // Timeout para evitar carga indefinida
        setTimeout(() => reject(new Error("Timeout de carga")), 3000);
      });
    } catch (error) {
      // Marcar esta propiedad como que tiene error de imagen (silenciosamente)
      property._imageError = true;

      // NO hacer console.log/warn aquí para evitar spam en consola
      // La validación ya se hizo en getPropertyImage()
    }
  });

  await Promise.allSettled(imagePromises);

  // Solo un log resumen en desarrollo
  if (process.env.NODE_ENV === "development") {
    const errorCount = properties.value.filter((p) => p._imageError).length;
    if (errorCount > 0) {
      console.info(
        `📊 ${errorCount} de ${properties.value.length} propiedades usan imagen placeholder`
      );
    }
  }
}

function handleImageError(event) {
  // Evitar bucles infinitos
  if (event.target.src.includes("data:image/svg+xml")) {
    return; // Ya está usando fallback SVG, no hacer nada más
  }

  // Marcar que esta imagen falló para evitar logs repetidos
  if (!event.target.dataset.errorLogged) {
    event.target.dataset.errorLogged = "true";

    // Solo log en desarrollo para debugging
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `🖼️ Fallback de imagen aplicado para: ${
          event.target.alt || "imagen sin nombre"
        }`
      );
    }
  }

  // Usar la imagen SVG base64 personalizada
  event.target.src = DEFAULT_PROPERTY_IMAGE;
}

const DEFAULT_PROPERTY_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+";

function truncateDescription(description, maxLength = 100) {
  if (!description) return "";
  return description.length > maxLength
    ? description.substring(0, maxLength) + "..."
    : description;
}

// Funciones de filtrado
function filterProperties() {
  // Los filtros se aplican automáticamente a través del computed filteredProperties
}

function clearFilters() {
  searchFilters.value = {
    location: "",
    type: "",
    maxPrice: null,
  };
}

// Funciones de modal de propiedades
function openPropertyModal(property) {
  selectedProperty.value = property;
  currentPropertyIndex.value = displayedProperties.value.findIndex(
    (p) => p.id === property.id
  );
  currentImageIndex.value = 0;
  showPropertyModal.value = true;
  document.body.classList.add("modal-open");
}

function closePropertyModal() {
  showPropertyModal.value = false;
  selectedProperty.value = null;
  document.body.classList.remove("modal-open");
}

function showNextProperty() {
  if (currentPropertyIndex.value < displayedProperties.value.length - 1) {
    currentPropertyIndex.value++;
    selectedProperty.value =
      displayedProperties.value[currentPropertyIndex.value];
    currentImageIndex.value = 0;
  }
}

function showPreviousProperty() {
  if (currentPropertyIndex.value > 0) {
    currentPropertyIndex.value--;
    selectedProperty.value =
      displayedProperties.value[currentPropertyIndex.value];
    currentImageIndex.value = 0;
  }
}

// Funciones de solicitud de arriendo
function openRequestModal() {
  rentalRequest.value.propertyId = selectedProperty.value.id;

  // Pre-llenar datos del usuario si está logueado
  if (isLoggedIn.value) {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    rentalRequest.value.name = userData.name || "";
    rentalRequest.value.email = userData.email || "";
    rentalRequest.value.phone = userData.phone || "";
  }

  showPropertyModal.value = false;
  showRequestModal.value = true;
}

function closeRequestModal() {
  showRequestModal.value = false;
  resetRentalForm();
}

function resetRentalForm() {
  rentalRequest.value = {
    name: "",
    phone: "",
    email: "",
    startDate: "",
    duration: 1,
    message: "",
    propertyId: null,
  };
}

async function submitRentalRequest() {
  submittingRequest.value = true;

  try {
    const requestData = {
      property_id: rentalRequest.value.propertyId,
      name: rentalRequest.value.name,
      phone: rentalRequest.value.phone,
      email: rentalRequest.value.email,
      start_date: rentalRequest.value.startDate,
      duration: rentalRequest.value.duration,
      message: rentalRequest.value.message,
    };

    const headers = {};
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    await api.post("/rental-requests", requestData, { headers });

    showRequestModal.value = false;
    showConfirmationModal.value = true;
    resetRentalForm();
  } catch (error) {
    console.error("Error al enviar solicitud:", error);
    alert("Error al enviar la solicitud. Por favor intenta nuevamente.");
  } finally {
    submittingRequest.value = false;
  }
}

function closeConfirmationModal() {
  showConfirmationModal.value = false;
}

// Funciones de favoritos y comparación
async function toggleFavorite(property) {
  if (!isLoggedIn.value) {
    alert("Debes iniciar sesión para agregar a favoritos");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    if (property.is_favorite) {
      await api.delete(`/properties/${property.id}/favorite`, { headers });
      property.is_favorite = false;
    } else {
      await api.post(`/properties/${property.id}/favorite`, {}, { headers });
      property.is_favorite = true;
    }
  } catch (error) {
    console.error("Error al actualizar favorito:", error);
    alert("Error al actualizar favorito");
  }
}

function addToCompare(property) {
  // Implementar lógica de comparación
  console.log("Agregar a comparar:", property.title);
}

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  isLoggedIn.value = false;
  showDropdown.value = false;
  router.push("/login");
};

// Event handlers
function handleClickOutsideDropdown(event) {
  const userMenu = document.getElementById("userToggle");
  const dropdown = document.getElementById("userDropdown");

  if (!userMenu || !dropdown) return;

  if (
    !userMenu.contains(event.target) &&
    !dropdown.contains(event.target) &&
    showDropdown.value
  ) {
    showDropdown.value = false;
  }
}

// Lifecycle hooks
onMounted(async () => {
  await fetchUserData();

  const cssFiles = [
    "/css/home/home.css",
    "/css/home/propiedades.css",
    "/css/home/modals.css",
  ];

  styleLinks = cssFiles.map((href) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
    return link;
  });

  // Cargar datos iniciales
  await fetchProperties();
  fetchPropertyCount();
  fetchActiveClientsCount();

  // Configurar intervalos para actualización en tiempo real
  intervalId = setInterval(fetchPropertyCount, 60000); // Cada minuto
  intervalIdClients = setInterval(fetchActiveClientsCount, 60000);

  // Event listeners
  document.addEventListener("click", handleClickOutsideDropdown);
});

onBeforeUnmount(() => {
  styleLinks.forEach((link) => link.parentNode?.removeChild(link));

  if (intervalId) clearInterval(intervalId);
  if (intervalIdClients) clearInterval(intervalIdClients);

  document.removeEventListener("click", handleClickOutsideDropdown);
});
</script>

<style scoped>
.stat-number {
  font-size: 2rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

/* Estilos para la sección de propiedades */
.properties-section {
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.properties-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.section-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.limit-selector {
  padding: 0.5rem 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.limit-selector:focus {
  outline: none;
  border-color: #3498db;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.property-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
}

.property-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.property-card.featured {
  border: 2px solid #f39c12;
}

.property-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 10;
}

.view-more-section {
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid #ddd;
}

.properties-count {
  color: #666;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.view-more-btn {
  background: linear-gradient(45deg, #ded5c4, #bdb5a6);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.view-more-btn:hover {
  background: linear-gradient(45deg, #3b251d, #2e1d17);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.loading-container,
.error-container,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-container p {
  font-size: 1.2rem;
  color: #666;
}

.error-container p {
  color: #e74c3c;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.retry-btn,
.clear-filters-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.retry-btn:hover,
.clear-filters-btn:hover {
  background: #2980b9;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-title {
    font-size: 2rem;
    text-align: center;
  }

  .section-controls {
    justify-content: center;
  }

  .properties-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
