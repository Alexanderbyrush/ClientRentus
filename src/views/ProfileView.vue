<template>
  <div class="profile-page">
    <!-- Gradient Background -->
    <div class="static-backdrop"></div>
    <div class="animated-bg"></div>

    <!-- Navigation -->
    <NavBarComponent />

    <!-- Main Container -->
    <main class="profile-container">

      <!-- Profile Header Card -->
      <div class="profile-header-card">
        <div class="profile-content">

          <!-- Avatar Section -->
          <div class="avatar-section">
            <div class="avatar-wrapper" @click="triggerFileInput">
              <img :src="profileData.photo || '/img/default.webp'" @error="handleImageError" />

              <div class="avatar-overlay">
                <i class="fas fa-camera"></i>
                <span>Cambiar foto</span>
              </div>
              <input ref="fileInput" type="file" accept="image/*" @change="handlePhotoUpload" style="display: none" />
            </div>

            <div class="status-badge">
              <i class="fas fa-check-circle"></i> Verificado
            </div>
          </div>

          <!-- Profile Info -->
          <div class="profile-info">
            <div class="name-section">
              <h1>{{ profileData.name }}</h1>
              <p class="username">@{{ profileData.username }}</p>
            </div>

            <!-- Location -->
            <div class="location-section" @click="showLocationModal = true">
              <i class="fas fa-map-marker-alt"></i>
              <span v-if="profileData.department && profileData.city">
                {{ profileData.city }}, {{ profileData.department }}
              </span>
              <span v-else class="add-location">Agregar ubicación</span>
            </div>

            <!-- Bio -->
            <div class="bio-section">
              <p v-if="!editingBio && profileData.bio">{{ profileData.bio }}</p>
              <p v-if="!editingBio && !profileData.bio" class="placeholder-bio" @click="editingBio = true">
                Agrega una biografía para que otros sepan más sobre ti...
              </p>
              <textarea v-if="editingBio" v-model="bioText" class="bio-input" placeholder="Cuéntanos sobre ti..."
                maxlength="200" @blur="saveBio" @keydown.enter="saveBio"></textarea>
              <button v-if="!editingBio && profileData.bio" class="edit-bio-btn" @click="startEditBio">
                <i class="fas fa-edit"></i>
              </button>
            </div>

            <!-- Stats -->
            <div class="stats-section">
              <div class="stat-item">
                <span class="stat-value">{{ userProperties.length }}</span>
                <span class="stat-label">Propiedades</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ profileData.rating || '5.0' }}</span>
                <span class="stat-label">Rating</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ profileData.reviews || '0' }}</span>
                <span class="stat-label">Reseñas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Info Card -->
      <div class="info-cards-grid">
        <div class="info-card">
          <div class="info-icon">
            <img src="https://images.freeimages.com/fic/images/icons/734/phuzion/256/mail.png" alt="phone">
          </div>
          <div class="info-content">
            <span class="info-label">Email</span>
            <span class="info-value">{{ profileData.email }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">
            <img src="https://img.icons8.com/ios_filled/512/FFFFFF/apple-phone.png" alt="phone">
          </div>
          <div class="info-content">
            <span class="info-label">Teléfono</span>
            <span class="info-value">{{ profileData.phone || 'No registrado' }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">
            <img src="https://uxwing.com/wp-content/themes/uxwing/download/time-and-date/calendar-white-icon.png"
              alt="calendar">
          </div>
          <div class="info-content">
            <span class="info-label">Miembro desde</span>
            <span class="info-value">{{ formatDate(profileData.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Properties Section - MEJORADA -->
      <div class="properties-section">
        <div class="section-header">
          <h2>Mis Propiedades</h2>
          <button class="add-property-btn" @click="addProperty">
            <i class="fas fa-plus"></i> Nueva Propiedad
          </button>
        </div>

        <div class="properties-grid" v-if="userProperties.length > 0">
          <div v-for="property in userProperties" :key="property.id" class="property-card">
            <!-- Badge de estado -->
            <div class="property-badge">
              {{ friendlyStatus(property.status) }}
            </div>

            <!-- Imagen de la propiedad -->
            <div class="property-image-container">
              <img :src="property.image_url || defaultPropertyImage" :alt="property.title" class="property-image" @error="handlePropertyImageError" />
              <div class="property-overlay">
                <div class="property-actions">
                  <!-- Botones de editar y eliminar -->
                  <router-link 
                    :to="{ name: 'PropertyEdit', params: { id: property.id } }"
                    class="action-btn edit-btn"
                    title="Editar propiedad"
                  >
                    ✏️
                  </router-link>
                  <button 
                    @click.stop="deleteProperty(property.id)" 
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
                <h3 class="property-title">{{ property.title }}</h3>
                <div class="property-price">
                  ${{ property.monthly_price?.toLocaleString() }}
                  <span class="price-period">/mes</span>
                </div>
              </div>

              <div class="property-location">
                📍 {{ property.city || 'Ubicación no especificada' }}
              </div>

              <div class="property-features">
                <div class="feature-item">
                  <span class="feature-icon">📐</span>
                  <span class="feature-text">{{ property.area_m2 || 'N/A' }} m²</span>
                </div>
                <div class="feature-item" v-if="property.num_bedrooms">
                  <span class="feature-icon">🛏</span>
                  <span class="feature-text">{{ property.num_bedrooms }} Habitaciones</span>
                </div>
                <div class="feature-item" v-if="property.num_bathrooms">
                  <span class="feature-icon">🛁</span>
                  <span class="feature-text">{{ property.num_bathrooms }} Baños</span>
                </div>
              </div>

              <div class="property-description">
                {{ truncateDescription(property.description) }}
              </div>

              <div class="property-tags">
                <span class="property-type-tag">{{ detectType(property.title) }}</span>
              </div>

              <div class="property-footer">
                <button class="details-btn" @click.stop="viewPropertyDetails(property.id)">
                  <span class="btn-text">Ver Detalles</span>
                  <span class="btn-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fas fa-home"></i>
          <p>Aún no tienes propiedades</p>
          <button @click="addProperty">Agregar primera propiedad</button>
        </div>
      </div>

      <!-- Social Media Section -->
      <div class="social-section">
        <h3>Conéctate conmigo</h3>
        <div class="social-icons">
          <a href="#" class="social-icon facebook">
            <img src="/img/facebook-logo.png" alt="Facebook">
          </a>
          <a href="#" class="social-icon instagram">
            <img src="/img/instagram-logo.png" alt="Instagram">
          </a>
          <a href="#" class="social-icon twitter">
            <img src="/img/twitter.png" alt="Twitter">
          </a>
          <a href="#" class="social-icon linkedin">
            <img src="/img/linkedin.png" alt="LinkedIn">
          </a>
        </div>
      </div>
    </main>

    <!-- Location Modal -->
    <transition name="modal">
      <div v-if="showLocationModal" class="modal-overlay" @click="showLocationModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Selecciona tu ubicación</h3>
            <button class="close-btn" @click="showLocationModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Departamento</label>
              <select v-model="selectedDepartment" @change="updateCities">
                <option value="">Selecciona un departamento</option>
                <option v-for="dept in departments" :key="dept.name" :value="dept.name">
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="selectedDepartment">
              <label>Ciudad</label>
              <select v-model="selectedCity">
                <option value="">Selecciona una ciudad</option>
                <option v-for="city in availableCities" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="showLocationModal = false">Cancelar</button>
            <button class="btn-save" @click="saveLocation" :disabled="!selectedCity">
              Guardar ubicación
            </button>
          </div>
        </div>
      </div>
    </transition>

    <FooterComponent />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import NavBarComponent from '@/components/NavBarComponent.vue'
import FooterComponent from '@/components/FooterComponent.vue'
import { eventBus, EVENTS } from '@/services/eventBus'

const router = useRouter()

// Refs
const fileInput = ref<HTMLInputElement | null>(null)
const editingBio = ref(false)
const bioText = ref('')
const showLocationModal = ref(false)
const selectedDepartment = ref('')
const selectedCity = ref('')

// Data
const profileData = ref({
  id: 0,
  name: '',
  username: '',
  email: '',
  phone: '',
  photo: '',
  bio: '',
  department: '',
  city: '',
  rating: 0,
  reviews: 0,
  created_at: ''
})

const userProperties = ref<any[]>([])

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=200'
const defaultPropertyImage = 'https://via.placeholder.com/400x300?text=Sin+Imagen'

// Departamentos y ciudades de Colombia
const departments = ref([
  {
    name: 'Cauca',
    cities: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Piendamó', 'Timbío']
  },
  {
    name: 'Valle del Cauca',
    cities: ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Cartago', 'Buga']
  },
  {
    name: 'Antioquia',
    cities: ['Medellín', 'Envigado', 'Itagüí', 'Bello', 'Rionegro', 'Sabaneta']
  },
  {
    name: 'Cundinamarca',
    cities: ['Bogotá', 'Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 'Fusagasugá']
  },
  {
    name: 'Atlántico',
    cities: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia']
  }
])

const availableCities = computed(() => {
  const dept = departments.value.find(d => d.name === selectedDepartment.value)
  return dept ? dept.cities : []
})

// Métodos existentes
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    showNotification('La imagen es muy grande. Máximo 10MB', 'error');
    return;
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showNotification('Formato no válido. Usa JPG, PNG, GIF o WEBP', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('photo', file);
  formData.append('_method', 'PUT');

  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileData.value.photo = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    const response = await api.post(`/users/${profileData.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.user && response.data.user.photo) {
      profileData.value.photo = response.data.user.photo;
      eventBus.emit(EVENTS.PROFILE_PHOTO_UPDATED, response.data.user.photo);
    }

    showNotification('Foto actualizada correctamente', 'success');
  } catch (error: any) {
    console.error('Error al subir la foto:', error);
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0];
      showNotification(Array.isArray(firstError) ? firstError[0] : 'Error al subir la foto', 'error');
    } else {
      showNotification('Error al subir la foto. Intenta nuevamente', 'error');
    }
  } finally {
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const showNotification = (message: string, type: 'success' | 'error') => {
  console.log(`${type}: ${message}`);
};

const saveBio = async () => {
  if (bioText.value.trim() === profileData.value.bio) {
    editingBio.value = false;
    return;
  }

  try {
    const response = await api.put(`/users/${profileData.value.id}`, {
      bio: bioText.value.trim()
    });

    profileData.value.bio = bioText.value.trim();
    editingBio.value = false;
    showNotification('Biografía actualizada', 'success');
  } catch (error) {
    console.error('Error guardando biografía:', error);
    showNotification('Error al guardar biografía', 'error');
  }
};

const saveLocation = async () => {
  try {
    const response = await api.put(`/users/${profileData.value.id}`, {
      department: selectedDepartment.value,
      city: selectedCity.value
    });

    profileData.value.department = selectedDepartment.value;
    profileData.value.city = selectedCity.value;
    showLocationModal.value = false;
    showNotification('Ubicación actualizada', 'success');
  } catch (error) {
    console.error('Error guardando ubicación:', error);
    showNotification('Error al guardar ubicación', 'error');
  }
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultAvatar
}

const startEditBio = () => {
  bioText.value = profileData.value.bio
  editingBio.value = true
}

const updateCities = () => {
  selectedCity.value = ''
}

const formatDate = (date: string) => {
  if (!date) return 'Fecha no disponible'
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long'
  })
}

const viewPropertyDetails = (propertyId: number) => {
  router.push(`/properties/${propertyId}`)
}

const addProperty = () => {
  router.push('/properties/create')
}

// NUEVOS MÉTODOS PARA PROPIEDADES
const handlePropertyImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultPropertyImage
}

const friendlyStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    available: 'Disponible',
    rented: 'Rentada',
    maintenance: 'En mantenimiento',
    sold: 'Vendida'
  }
  return statusMap[status] || status
}

const detectType = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("casa")) return "Casa";
  if (t.includes("apartamento") || t.includes("apto")) return "Apartamento";
  if (t.includes("local")) return "Local";
  if (t.includes("finca")) return "Finca";
  return "Propiedad";
}

// CORREGIDO: Removido el tipo explícito para maxLength
const truncateDescription = (description: string, maxLength = 120) => {
  if (!description) return "Descripción no disponible";
  return description.length > maxLength
    ? description.substring(0, maxLength) + "..."
    : description;
}

const deleteProperty = async (id: number) => {
  if (!confirm("¿Eliminar esta propiedad permanentemente?")) return;

  try {
    await api.delete(`/properties/${id}`);
    userProperties.value = userProperties.value.filter((p) => p.id !== id);
    showNotification('Propiedad eliminada correctamente', 'success');
  } catch (error) {
    console.error("Error eliminando propiedad:", error);
    showNotification("Error al eliminar la propiedad", 'error');
  }
}

// Lifecycle
onMounted(async () => {
  try {
    const userResponse = await api.get('/auth/me')
    const userData = userResponse.data

    profileData.value = {
      id: userData.id,
      name: userData.name,
      username: userData.email.split('@')[0],
      email: userData.email,
      phone: userData.phone || '',
      photo: userData.photo || '',
      bio: userData.bio || '',
      department: userData.department || '',
      city: userData.city || '',
      rating: userData.rating || 0,
      reviews: userData.reviews || 0,
      created_at: userData.created_at
    }

    bioText.value = profileData.value.bio

    // Cargar propiedades del usuario
    const propertiesResponse = await api.get('/properties')
    userProperties.value = propertiesResponse.data.filter(
      (p: any) => p.user_id === userData.id
    )
  } catch (error) {
    console.error('Error cargando perfil:', error)
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.static-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("https://i.pinimg.com/1200x/e2/d2/b7/e2d2b7877ffb88a68d6b72e5ea0bd965.jpg") center center / cover no-repeat;
  filter: blur(8px) brightness(0.7);
  z-index: -1;
}

@keyframes backgroundShift {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(20px, 20px) scale(1.1);
  }
}

.profile-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px 40px;
}

/* Profile Header Card */
.profile-header-card {
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 2px solid #da9c5f;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
  animation: fadeInUp 0.6s ease;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.profile-header-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.18);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-content {
  padding: 40px 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: -10px;
  margin-bottom: 20px;
}

.avatar-wrapper {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 6px solid #da9c5f;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.avatar-wrapper:hover {
  transform: scale(1.05);
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: rgb(0, 0, 0);
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  font-size: 24px;
  margin-bottom: 5px;
}

.avatar-overlay span {
  font-size: 12px;
}

.status-badge {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
}

/* Profile Info */
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.name-section h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 5px;
}

.username {
  color: #718096;
  font-size: 16px;
}

.location-section {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #C8A97E;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 8px;
  justify-content: center;
  margin: 0 auto;
}

.location-section:hover {
  background: #b49a62;
  color: #ccc;
}

.add-location {
  color: #ccc;
  font-style: italic;
}

/* Bio Section */
.bio-section {
  max-width: 650px;
  margin: 0 auto;
  position: relative;
}

.bio-section p {
  color: #ccc;
  line-height: 1.6;
  font-size: 15px;
}

.placeholder-bio {
  color: #000000;
  font-style: italic;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.3s;
}

.placeholder-bio:hover {
  background: #b49a62;
}

.bio-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s;
}

.bio-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.edit-bio-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  transition: all 0.3s;
  opacity: 0.6;
}

.edit-bio-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* Stats Section */
.stats-section {
  display: flex;
  gap: 60px;
  justify-content: center;
  padding: 20px 0;
  border-top: 1px solid #da9c5f;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #da9c5f;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #ccc;
}

/* Info Cards Grid */
.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  animation: fadeInUp 0.6s ease 0.2s backwards;
}

.info-card {
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 2px solid #da9c5f;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.info-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4D2F24 0%, #C8A97E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.info-icon img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #cccccc7e;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  color: #ffffff;
  font-weight: 600;
}

/* NUEVOS ESTILOS PARA PROPIEDADES - MEJORADOS */
.properties-section {
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 2px solid #da9c5f;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.properties-section:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.18);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 28px;
  color: #cccccc7e;
  font-weight: 700;
}

.add-property-btn {
  background: linear-gradient(135deg, #4D2F24 0%, #4D2F24 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.add-property-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgb(255, 254, 254);
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #cccccc7e;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
  color: #667eea;
}

.empty-state button {
  margin-top: 14px;
  background: linear-gradient(135deg, #4D2F24 0%, #4D2F24 100%);
  color: white;
  border: none;
  padding: 12px 26px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.empty-state button:hover {
  transform: translateY(-2px);
}

/* Social Section */
.social-section {
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 2px solid #da9c5f;
  padding: 40px;
  margin-bottom: 30px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.social-section:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.18);
}

.social-section h3 {
  font-size: 22px;
  color: #cccccc7e;
  font-weight: 700;
  margin-bottom: 20px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  transition: all 0.3s ease;
}

.social-icon img {
  width: 24px;
  height: 24px;
}

.social-icon.facebook {
  background: #1877f2;
}

.social-icon.instagram {
  background: #e1306c;
}

.social-icon.twitter {
  background: #000000;
}

.social-icon.linkedin {
  background: #0077b5;
}

.social-icon:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.modal-content {
  background: white;
  width: 95%;
  max-width: 500px;
  border-radius: 18px;
  padding: 25px;
  animation: fadeInUp 0.4s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 20px;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #718096;
  cursor: pointer;
}

.modal-body .form-group {
  margin-bottom: 18px;
}

.modal-body label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
  color: #4a5568;
}

.modal-body select {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.btn-cancel,
.btn-save {
  border: none;
  padding: 10px 22px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: all 0.3s;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .profile-content {
    padding: 30px 20px;
  }
  
  .stats-section {
    gap: 30px;
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
  
  .profile-container {
    padding: 80px 15px 30px;
  }
}
</style>