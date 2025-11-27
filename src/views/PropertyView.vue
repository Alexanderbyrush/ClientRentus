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
      <h2 class="section-title">Propiedades Destacadas</h2>

      <router-link to="/properties/create" class="btn-create">
        Crear propiedad
      </router-link>
    </div>

    <div class="contenedor-propiedades section-block">
      <h2 class="section-title">Propiedades publicadas</h2>
      <!-- LISTADO -->
      <div v-if="filteredProperties.length" class="properties-grid">

        <div v-for="p in filteredProperties" :key="p.id" class="property-card">

          <PropertyImage :src="p.image_url" :alt="p.title" />

          <div class="property-body">

            <h2 class="property-title">{{ p.title }}</h2>

            <p class="property-description">{{ p.description }}</p>

            <ul class="property-details">
              <li><strong>Ciudad:</strong> {{ p.city }}</li>
              <li><strong>Precio:</strong> ${{ p.monthly_price }}</li>
              <li><strong>Área:</strong> {{ p.area_m2 }} m²</li>
              <li><strong>Habitaciones:</strong> {{ p.num_bedrooms }}</li>
              <li><strong>Baños:</strong> {{ p.num_bathrooms }}</li>
              <li><strong>Estado:</strong> {{ friendlyStatus(p.status) }}</li>
            </ul>

            <div class="property-actions">

              <!-- SOLO EL DUEÑO VE ESTOS BOTONES -->
              <router-link v-if="authUser?.id === p.user_id" :to="{ name: 'PropertyEdit', params: { id: p.id } }"
                class="btn-edit">
                Editar
              </router-link>

              <button v-if="authUser?.id === p.user_id" @click="deleteProperty(p.id)" class="btn-delete">
                Eliminar
              </button>


              <!-- TODOS VEN ESTE -->
              <button @click="openModal(p)" class="btn-secondary">
                Ver más
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
  <!-- MODAL -->
  <!-- MODAL DE DETALLES -->
  <div v-if="modalOpen" class="modal-backdrop">
    <div class="modal-box">

      <button class="modal-close" @click="closeModal">×</button>

      <h2 class="modal-title">{{ selectedProperty.title }}</h2>

      <img :src="selectedProperty.image_url || fallbackImage" class="modal-image" @error="onImgError" />

      <div class="modal-details">
        <p><strong>Descripción:</strong> {{ selectedProperty.description }}</p>
        <p><strong>Dirección:</strong> {{ selectedProperty.address }}</p>
        <p><strong>Ciudad:</strong> {{ selectedProperty.city }}</p>
        <p><strong>Estado:</strong> {{ friendlyStatus(selectedProperty.status) }}</p>
        <p><strong>Precio mensual:</strong> ${{ selectedProperty.monthly_price }}</p>
        <p><strong>Área:</strong> {{ selectedProperty.area_m2 }} m²</p>
        <p><strong>Habitaciones:</strong> {{ selectedProperty.num_bedrooms }}</p>
        <p><strong>Baños:</strong> {{ selectedProperty.num_bathrooms }}</p>

        <p>
          <strong>Servicios incluidos:</strong>
          <span v-if="selectedProperty.included_services?.length">
            {{ selectedProperty.included_services.join(", ") }}
          </span>
          <span v-else>Ninguno</span>
        </p>

        <p><strong>Fecha publicación:</strong> {{ selectedProperty.publication_date }}</p>

        <p><strong>Latitud:</strong> {{ selectedProperty.lat }}</p>
        <p><strong>Longitud:</strong> {{ selectedProperty.lng }}</p>
      </div>

      <!-- NUEVO: Botón de Solicitar Cita -->
      <div class="modal-actions">
        <!-- Solo mostrar si NO es el dueño y la propiedad está disponible -->
        <button v-if="authUser?.id !== selectedProperty.user_id && selectedProperty.status === 'available'"
          class="btn-request-visit" @click="openRequestVisitModal(selectedProperty)">
          📅 Solicitar Cita de Visita
        </button>

        <!-- Si es el dueño -->
        <p v-else-if="authUser?.id === selectedProperty.user_id" class="owner-notice">
          Esta es tu propiedad
        </p>

        <!-- Si no está disponible -->
        <p v-else-if="selectedProperty.status !== 'available'" class="unavailable-notice">
          Esta propiedad no está disponible actualmente
        </p>
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

// NUEVO: Estado para el modal de solicitud de cita
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

// NUEVO: Abrir modal de solicitud de cita
const openRequestVisitModal = (property) => {
  propertyForRequest.value = property;
  showRequestModal.value = true;
  closeModal(); // Cierra el modal de detalles
};

// NUEVO: Manejar éxito de solicitud
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
  if (t.includes("casa")) return "casa";
  if (t.includes("apartamento") || t.includes("apto")) return "apartamento";
  if (t.includes("local")) return "local";
  if (t.includes("finca")) return "finca";
  return "";
};

// FILTRO LOCAL
const filteredProperties = computed(() => {
  return properties.value.filter((p) => {
    const typeFromTitle = detectType(p.title);

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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.property-card {
  background: var(--color-card);
  border: 1px solid rgba(93, 64, 55, 0.22);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(93, 64, 55, 0.1);
  transition: 0.25s;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(93, 64, 55, 0.18);
}

/* --- Imagen con banda inferior tipo portal inmobiliario premium --- */
.property-image {
  width: 100%;
  height: 190px;
  object-fit: cover;
  border-bottom: 4px solid var(--color-border-accent);
}

/* --- Contenido de card con mayor legibilidad --- */
.property-body {
  padding: 1.4rem;
}

.property-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--color-title);
  margin-bottom: 0.3rem;
}

.property-description {
  font-size: 1rem;
  line-height: 1.4;
  opacity: 0.85;
  margin-bottom: 1rem;
}

.property-details {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.95rem;
}

.property-details li {
  margin-bottom: 4px;
  opacity: 0.9;
}

/* --- Botones de actions organizados y empresariales --- */
.property-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1.2rem;
}

.btn-edit,
.btn-delete,
.btn-secondary {
  padding: 0.55rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
  border: none;
}

.btn-edit {
  background: var(--color-primary);
  background-color: rgba(210, 227, 57, 0.484);
  color: rgb(0, 0, 0);
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-block;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Modal Actions */
.modal-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e0e0e0;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-request-visit {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-request-visit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
  background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
}

.btn-request-visit:active {
  transform: translateY(0);
}

.owner-notice {
  background: #e3f2fd;
  color: #1565c0;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  border-left: 4px solid #2196f3;
}

.unavailable-notice {
  background: #fff3cd;
  color: #856404;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  border-left: 4px solid #ffc107;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-actions {
    flex-direction: column;
  }

  .btn-request-visit {
    width: 100%;
    justify-content: center;
  }
}


.btn-edit:hover {
  background: var(--color-primary-hover);
}

.btn-delete {
  background: var(--color-danger);
  background-color: rgba(242, 17, 17, 0.811);
  color: rgb(6, 6, 6);
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-delete:hover {
  background: var(--color-danger-hover);
}

.btn-secondary {
  background: var(--color-secondary);
  background-color: rgba(11, 122, 165, 0.484);
  color: rgb(0, 0, 0);
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-secondary:hover {
  background: var(--color-secondary-hover);
}

/* --- Modal enterprise (centrado, jerarquía clara, scroll bloqueado, UI premium) --- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.52);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1.5rem;
}

.modal-box {
  background: #eedadac2;
  /* Se mantiene consistente con cards */
  border: 3px solid var(--color-border-accent);
  border-radius: 14px;
  max-width: 680px;
  width: 100%;
  max-height: 86vh;
  padding: 2rem;
  box-shadow: var(--shadow-strong);
  position: relative;
  animation: modalFade 0.28s ease;
  overflow-y: auto;
  /* Scroll interno controlado */
}

@keyframes modalFade {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 18px;
  background: none;
  border: none;
  font-size: 1.8rem;
  font-weight: 800;
  color: rgb(255, 0, 0);
  opacity: 0.7;
  cursor: pointer;
}

.modal-close:hover {
  opacity: 1;
}

.modal-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-title);
  border-bottom: 3px solid rgba(212, 44, 44, 0.28);
  padding-bottom: 0.4rem;
  margin-bottom: 1.2rem;
}

.modal-image {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 8px;
  border-bottom: 4px solid var(--color-border-accent);
  margin-bottom: 1.2rem;
}

.modal-details p {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  opacity: 0.92;
}
</style>
