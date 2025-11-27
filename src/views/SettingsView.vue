<template>
  <div class="settings-page">
    <div class="page-background"></div>

    <NavBarComponent />

    <main class="settings-wrapper">
      <div class="header-section">
        <h2 class="titulo">Ajustes de Cuenta</h2>
        <p class="subtitle">Personaliza tu experiencia en la plataforma</p>
      </div>

      <div class="settings-container">
        <!-- Panel de navegación lateral -->
        <div class="settings-nav">
          <div 
            v-for="(section, index) in sections" 
            :key="index"
            class="nav-item"
            :class="{ active: activeSection === section.id }"
            @click="activeSection = section.id"
          >
            <span class="nav-icon">{{ section.icon }}</span>
            <span class="nav-text">{{ section.title }}</span>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="settings-content">
          <div class="settings-card">
            <!-- SECCIÓN PERFIL -->
            <div v-if="activeSection === 'profile'" class="section-content">
              <h3 class="section-title">
                <span class="section-icon">👤</span>
                Perfil
              </h3>
              <div class="profile-header">
                <div class="avatar-container">
                  <div class="avatar-preview">
                    <img :src="userData.photo || defaultAvatar" alt="Avatar" class="avatar-img" @error="handleImageError" />
                  </div>
                  <div class="avatar-actions">
                    <button class="btn-secondary" @click="triggerFileInput">Cambiar Avatar</button>
                    <input 
                      ref="fileInput"
                      type="file" 
                      accept="image/*" 
                      class="file-input"
                      @change="handlePhotoUpload"
                    />
                    <p class="avatar-hint">JPG, PNG o GIF. Máx. 5MB</p>
                  </div>
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre completo</label>
                  <input 
                    type="text" 
                    placeholder="Tu nombre" 
                    v-model="userData.name"
                  />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="correo@ejemplo.com" 
                    v-model="userData.email"
                    disabled
                    class="disabled-input"
                  />
                  <span class="field-note">El email no se puede modificar</span>
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input 
                    type="tel" 
                    placeholder="+34 123 456 789" 
                    v-model="userData.phone"
                  />
                </div>
                <div class="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    placeholder="tu_usuario" 
                    v-model="userData.username"
                  />
                </div>
                <div class="form-group full-width">
                  <label>Biografía</label>
                  <textarea 
                    placeholder="Cuéntanos algo sobre ti..."
                    v-model="userData.bio"
                    maxlength="200"
                  ></textarea>
                  <span class="char-counter">{{ userData.bio?.length || 0 }}/200</span>
                </div>
                <div class="form-group">
                  <label>Departamento</label>
                  <select v-model="userData.department" @change="updateCities">
                    <option value="">Selecciona un departamento</option>
                    <option v-for="dept in departments" :key="dept.name" :value="dept.name">
                      {{ dept.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Ciudad</label>
                  <select v-model="userData.city" :disabled="!userData.department">
                    <option value="">Selecciona una ciudad</option>
                    <option v-for="city in availableCities" :key="city" :value="city">
                      {{ city }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="actions">
                <button class="btn-secondary" @click="resetProfileChanges">Cancelar</button>
                <button class="btn-primary" @click="saveProfile" :disabled="!hasProfileChanges || savingProfile">
                  {{ savingProfile ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </div>

            <!-- SECCIÓN SEGURIDAD -->
            <div v-if="activeSection === 'security'" class="section-content">
              <h3 class="section-title">
                <span class="section-icon">🔒</span>
                Seguridad
              </h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Contraseña actual</label>
                  <div class="password-input">
                    <input 
                      :type="showCurrentPassword ? 'text' : 'password'" 
                      v-model="passwords.current"
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <button 
                      class="toggle-password"
                      @click="showCurrentPassword = !showCurrentPassword"
                      type="button"
                    >
                      {{ showCurrentPassword ? '🙈' : '👁️' }}
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Nueva contraseña</label>
                  <div class="password-input">
                    <input 
                      :type="showNewPassword ? 'text' : 'password'" 
                      v-model="passwords.new"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button 
                      class="toggle-password"
                      @click="showNewPassword = !showNewPassword"
                      type="button"
                    >
                      {{ showNewPassword ? '🙈' : '👁️' }}
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Confirmar nueva contraseña</label>
                  <div class="password-input">
                    <input 
                      :type="showConfirmPassword ? 'text' : 'password'" 
                      v-model="passwords.confirm"
                      placeholder="Repite la nueva contraseña"
                    />
                    <button 
                      class="toggle-password"
                      @click="showConfirmPassword = !showConfirmPassword"
                      type="button"
                    >
                      {{ showConfirmPassword ? '🙈' : '👁️' }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="password-strength" v-if="passwords.new">
                <div class="strength-bar" :class="passwordStrength.class"></div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
              <div class="password-requirements">
                <h4>Requisitos de contraseña:</h4>
                <ul>
                  <li :class="{ 'met': passwords.new?.length >= 8 }">Mínimo 8 caracteres</li>
                  <li :class="{ 'met': /[A-Z]/.test(passwords.new) && /[a-z]/.test(passwords.new) }">Letras mayúsculas y minúsculas</li>
                  <li :class="{ 'met': /\d/.test(passwords.new) }">Al menos un número</li>
                  <li :class="{ 'met': /[^A-Za-z0-9]/.test(passwords.new) }">Al menos un carácter especial</li>
                </ul>
              </div>
              <div class="actions">
                <button class="btn-secondary" @click="resetPasswordFields">Cancelar</button>
                <button class="btn-primary" @click="updatePassword" :disabled="!canUpdatePassword || updatingPassword">
                  {{ updatingPassword ? 'Actualizando...' : 'Actualizar Contraseña' }}
                </button>
              </div>
            </div>

            <!-- SECCIÓN NOTIFICACIONES -->
            <div v-if="activeSection === 'notifications'" class="section-content">
              <h3 class="section-title">
                <span class="section-icon">🔔</span>
                Notificaciones
              </h3>
              <div class="toggle-section">
                <div class="toggle-item" v-for="(notification, index) in notifications" :key="index">
                  <div class="toggle-info">
                    <span class="toggle-title">{{ notification.title }}</span>
                    <span class="toggle-description">{{ notification.description }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      v-model="notification.enabled"
                    />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              <div class="actions">
                <button class="btn-secondary" @click="resetNotifications">Restablecer</button>
                <button class="btn-primary" @click="saveNotifications" :disabled="savingNotifications">
                  {{ savingNotifications ? 'Guardando...' : 'Guardar Preferencias' }}
                </button>
              </div>
            </div>

            <!-- SECCIÓN PREFERENCIAS -->
            <div v-if="activeSection === 'preferences'" class="section-content">
              <h3 class="section-title">
                <span class="section-icon">🎨</span>
                Preferencias
              </h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Tema</label>
                  <div class="theme-selector">
                    <div 
                      v-for="theme in themes" 
                      :key="theme.id"
                      class="theme-option"
                      :class="{ active: userPreferences.theme === theme.id }"
                      @click="userPreferences.theme = theme.id"
                    >
                      <div class="theme-preview" :class="theme.id"></div>
                      <span class="theme-name">{{ theme.name }}</span>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Idioma</label>
                  <select v-model="userPreferences.language">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Zona horaria</label>
                  <select v-model="userPreferences.timezone">
                    <option value="America/Bogota">Colombia (GMT-5)</option>
                    <option value="Europe/Madrid">España (GMT+1)</option>
                    <option value="Europe/London">Reino Unido (GMT+0)</option>
                    <option value="America/New_York">EE.UU. Este (GMT-5)</option>
                    <option value="America/Los_Angeles">EE.UU. Oeste (GMT-8)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Unidades</label>
                  <div class="radio-group">
                    <label class="radio-option">
                      <input 
                        type="radio" 
                        value="metric" 
                        v-model="userPreferences.units"
                      />
                      <span class="radio-label">Métrico (km, m²)</span>
                    </label>
                    <label class="radio-option">
                      <input 
                        type="radio" 
                        value="imperial" 
                        v-model="userPreferences.units"
                      />
                      <span class="radio-label">Imperial (mi, ft²)</span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="actions">
                <button class="btn-secondary" @click="resetPreferences">Cancelar</button>
                <button class="btn-primary" @click="savePreferences" :disabled="savingPreferences">
                  {{ savingPreferences ? 'Guardando...' : 'Guardar Preferencias' }}
                </button>
              </div>
            </div>

            <!-- CERRAR SESIÓN -->
            <div class="logout-section">
              <div class="logout-btn" @click="confirmLogout">
                <span class="logout-icon">🚪</span>
                Cerrar Sesión
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <FooterComponent />

    <!-- Modal de confirmación -->
    <div v-if="showLogoutModal" class="modal-overlay">
      <div class="modal">
        <h3>¿Estás seguro?</h3>
        <p>Se cerrará tu sesión actual y tendrás que volver a iniciar sesión para acceder a tu cuenta.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showLogoutModal = false">Cancelar</button>
          <button class="btn-danger" @click="logoutUser">Cerrar Sesión</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import NavBarComponent from "@/components/NavBarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import { eventBus, EVENTS } from '@/services/eventBus'

const router = useRouter()

// Datos del usuario (igual que en el perfil)
const userData = ref({
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

// Copia original para detectar cambios
const originalUserData = ref({})

// Estado de carga y guardado
const savingProfile = ref(false)
const updatingPassword = ref(false)
const savingNotifications = ref(false)
const savingPreferences = ref(false)

// Contraseñas
const passwords = ref({
  current: '',
  new: '',
  confirm: ''
})

// Estado de visibilidad de contraseñas
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Notificaciones
const notifications = ref([
  {
    title: 'Correos de novedades',
    description: 'Recibe actualizaciones sobre nuevas funcionalidades',
    enabled: true
  },
  {
    title: 'Alertas de propiedades',
    description: 'Notificaciones sobre propiedades que coinciden con tus criterios',
    enabled: true
  },
  {
    title: 'Recordatorios',
    description: 'Recordatorios sobre tus citas y actividades programadas',
    enabled: false
  },
  {
    title: 'Promociones especiales',
    description: 'Ofertas y descuentos exclusivos',
    enabled: true
  }
])

// Preferencias del usuario
const userPreferences = ref({
  theme: 'light',
  language: 'es',
  timezone: 'America/Bogota',
  units: 'metric'
})

// Secciones
const sections = ref([
  { id: 'profile', title: 'Perfil', icon: '👤' },
  { id: 'security', title: 'Seguridad', icon: '🔒' },
  { id: 'notifications', title: 'Notificaciones', icon: '🔔' },
  { id: 'preferences', title: 'Preferencias', icon: '🎨' }
])

const activeSection = ref('profile')
const showLogoutModal = ref(false)

// Temas disponibles
const themes = ref([
  { id: 'light', name: 'Claro' },
  { id: 'dark', name: 'Oscuro' },
  { id: 'auto', name: 'Automático' }
])

// Avatar por defecto
const defaultAvatar = '/img/default.webp'

// Referencia al input de archivo
const fileInput = ref<HTMLInputElement | null>(null)

// Departamentos y ciudades (igual que en el perfil)
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

// Computed
const availableCities = computed(() => {
  const dept = departments.value.find(d => d.name === userData.value.department)
  return dept ? dept.cities : []
})

// Detectar cambios en el perfil
const hasProfileChanges = computed(() => {
  return JSON.stringify(userData.value) !== JSON.stringify(originalUserData.value)
})

// Validación para cambio de contraseña
const canUpdatePassword = computed(() => {
  return passwords.value.current && 
         passwords.value.new && 
         passwords.value.confirm && 
         passwords.value.new === passwords.value.confirm &&
         passwords.value.new.length >= 8
})

// Fuerza de la contraseña
const passwordStrength = computed(() => {
  const password = passwords.value.new
  if (!password) return { class: '', text: '' }
  
  let strength = 0
  let text = ''
  let className = ''
  
  // Longitud mínima
  if (password.length >= 8) strength++
  
  // Contiene números
  if (/\d/.test(password)) strength++
  
  // Contiene letras minúsculas y mayúsculas
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  
  // Contiene caracteres especiales
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  switch(strength) {
    case 0:
    case 1:
      text = 'Muy débil'
      className = 'very-weak'
      break
    case 2:
      text = 'Débil'
      className = 'weak'
      break
    case 3:
      text = 'Media'
      className = 'medium'
      break
    case 4:
      text = 'Fuerte'
      className = 'strong'
      break
  }
  
  return { class: className, text }
})

// Métodos
const loadUserData = async () => {
  try {
    const userResponse = await api.get('/auth/me')
    const user = userResponse.data
    
    userData.value = {
      id: user.id,
      name: user.name,
      username: user.email.split('@')[0], // Generar username desde email como en el perfil
      email: user.email,
      phone: user.phone || '',
      photo: user.photo || '',
      bio: user.bio || '',
      department: user.department || '',
      city: user.city || '',
      rating: user.rating || 0,
      reviews: user.reviews || 0,
      created_at: user.created_at
    }
    
    // Guardar copia original para detectar cambios
    originalUserData.value = { ...userData.value }
    
  } catch (error) {
    console.error('Error cargando datos del usuario:', error)
    showNotification('Error al cargar los datos del usuario', 'error')
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

// Método para subir foto (igual que en el perfil)
const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Validación de tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showNotification('La imagen es muy grande. Máximo 5MB', 'error');
    return;
  }

  // Validación de tipo
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showNotification('Formato no válido. Usa JPG, PNG, GIF o WEBP', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('photo', file);
  formData.append('_method', 'PUT');

  try {
    // Preview inmediato
    const reader = new FileReader();
    reader.onload = (e) => {
      userData.value.photo = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Enviar al backend
    const response = await api.post(`/users/${userData.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Actualizar con la respuesta del servidor
    if (response.data.user && response.data.user.photo) {
      userData.value.photo = response.data.user.photo;
      // Emitir evento para actualizar la navbar
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
    // Limpiar input file
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultAvatar
}

const updateCities = () => {
  userData.value.city = ''
}

const saveProfile = async () => {
  if (!hasProfileChanges.value) return
  
  savingProfile.value = true
  try {
    const response = await api.put(`/users/${userData.value.id}`, {
      name: userData.value.name,
      phone: userData.value.phone,
      bio: userData.value.bio,
      department: userData.value.department,
      city: userData.value.city
    })

    // Actualizar la copia original
    originalUserData.value = { ...userData.value }
    showNotification('Perfil actualizado correctamente', 'success')
  } catch (error: any) {
    console.error('Error actualizando perfil:', error)
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0]
      showNotification(Array.isArray(firstError) ? firstError[0] : 'Error al actualizar perfil', 'error')
    } else {
      showNotification('Error al actualizar perfil. Intenta nuevamente', 'error')
    }
  } finally {
    savingProfile.value = false
  }
}

const resetProfileChanges = () => {
  userData.value = { ...originalUserData.value }
}

const updatePassword = async () => {
  if (!canUpdatePassword.value) return
  
  updatingPassword.value = true
  try {
    const response = await api.put('/auth/password', {
      current_password: passwords.value.current,
      password: passwords.value.new,
      password_confirmation: passwords.value.confirm
    })

    showNotification('Contraseña actualizada correctamente', 'success')
    resetPasswordFields()
  } catch (error: any) {
    console.error('Error actualizando contraseña:', error)
    if (error.response?.data?.errors) {
      const firstError = Object.values(error.response.data.errors)[0]
      showNotification(Array.isArray(firstError) ? firstError[0] : 'Error al actualizar contraseña', 'error')
    } else {
      showNotification('Error al actualizar contraseña. Verifica tu contraseña actual', 'error')
    }
  } finally {
    updatingPassword.value = false
  }
}

const resetPasswordFields = () => {
  passwords.value = {
    current: '',
    new: '',
    confirm: ''
  }
}

const saveNotifications = async () => {
  savingNotifications.value = true
  try {
    // Aquí iría la llamada a tu API para guardar las preferencias de notificación
    // await api.put('/user/notifications', { notifications: notifications.value })
    
    showNotification('Preferencias de notificación guardadas', 'success')
  } catch (error) {
    console.error('Error guardando notificaciones:', error)
    showNotification('Error al guardar preferencias de notificación', 'error')
  } finally {
    savingNotifications.value = false
  }
}

const resetNotifications = () => {
  notifications.value = [
    {
      title: 'Correos de novedades',
      description: 'Recibe actualizaciones sobre nuevas funcionalidades',
      enabled: true
    },
    {
      title: 'Alertas de propiedades',
      description: 'Notificaciones sobre propiedades que coinciden con tus criterios',
      enabled: true
    },
    {
      title: 'Recordatorios',
      description: 'Recordatorios sobre tus citas y actividades programadas',
      enabled: false
    },
    {
      title: 'Promociones especiales',
      description: 'Ofertas y descuentos exclusivos',
      enabled: true
    }
  ]
}

const savePreferences = async () => {
  savingPreferences.value = true
  try {
    // Aquí iría la llamada a tu API para guardar las preferencias
    // await api.put('/user/preferences', userPreferences.value)
    
    showNotification('Preferencias guardadas', 'success')
  } catch (error) {
    console.error('Error guardando preferencias:', error)
    showNotification('Error al guardar preferencias', 'error')
  } finally {
    savingPreferences.value = false
  }
}

const resetPreferences = () => {
  // Podrías cargar las preferencias desde el servidor aquí
  userPreferences.value = {
    theme: 'light',
    language: 'es',
    timezone: 'America/Bogota',
    units: 'metric'
  }
}

const showNotification = (message: string, type: 'success' | 'error') => {
  // Usa tu sistema de notificaciones preferido
  console.log(`${type}: ${message}`)
  // Ejemplo con alert simple:
  if (type === 'error') {
    alert(`Error: ${message}`)
  } else {
    alert(message)
  }
}

const confirmLogout = () => {
  showLogoutModal.value = true
}

const logoutUser = async () => {
  try {
    await api.post('/auth/logout')
    // Redirigir al login o home
    router.push('/login')
  } catch (error) {
    console.error('Error cerrando sesión:', error)
    // Redirigir de todas formas
    router.push('/login')
  }
}

// Lifecycle
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding-top: 80px;
}

.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("https://i.pinimg.com/1200x/e2/d2/b7/e2d2b7877ffb88a68d6b72e5ea0bd965.jpg")
    center/cover no-repeat;
  filter: blur(4px) brightness(0.7);
  z-index: -1;
}

.settings-wrapper {
  width: 92%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 3rem;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.titulo {
  font-size: 2.5rem;
  color: #f0e5db;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.settings-container {
  display: flex;
  gap: 2rem;
}

/* Navegación lateral */
.settings-nav {
  flex: 0 0 250px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  height: fit-content;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: rgba(218, 156, 95, 0.2);
  color: #da9c5f;
}

.nav-icon {
  margin-right: 0.8rem;
  font-size: 1.2rem;
}

.nav-text {
  font-weight: 500;
}

/* Contenido principal */
.settings-content {
  flex: 1;
}

.settings-card {
  background: rgba(255, 255, 255, 0.10);
  border-radius: 20px;
  padding: 2.5rem;
  backdrop-filter: blur(14px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.35);
}

.section-content {
  margin-bottom: 2rem;
}

.section-title {
  color: #da9c5f;
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 0.5rem;
}

/* Perfil */
.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.avatar-hint {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.file-input {
  display: none;
}

/* Formularios */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, select, textarea {
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: none;
  outline: none;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
}

input:focus, select:focus, textarea:focus {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 2px rgba(218, 156, 95, 0.5);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.disabled-input {
  background-color: rgba(255, 255, 255, 0.6) !important;
  color: #666 !important;
  cursor: not-allowed;
}

.field-note {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.3rem;
}

.char-counter {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
  margin-top: 0.3rem;
}

.password-input {
  position: relative;
  display: flex;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

/* Indicador de fuerza de contraseña */
.password-strength {
  margin-top: 1rem;
}

.strength-bar {
  height: 6px;
  border-radius: 3px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.strength-bar.very-weak {
  width: 25%;
  background: #ff4d4d;
}

.strength-bar.weak {
  width: 50%;
  background: #ffa64d;
}

.strength-bar.medium {
  width: 75%;
  background: #ffcc00;
}

.strength-bar.strong {
  width: 100%;
  background: #4CAF50;
}

.strength-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.password-requirements {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.password-requirements h4 {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
  position: relative;
  padding-left: 1.2rem;
}

.password-requirements li:before {
  content: '✗';
  position: absolute;
  left: 0;
  color: #ff6b6b;
}

.password-requirements li.met {
  color: rgba(255, 255, 255, 0.8);
}

.password-requirements li.met:before {
  content: '✓';
  color: #4CAF50;
}

/* Toggles */
.toggle-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  padding: 1.2rem 1.5rem;
  border-radius: 12px;
}

.toggle-info {
  display: flex;
  flex-direction: column;
}

.toggle-title {
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.2rem;
}

.toggle-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #da9c5f;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* Selector de temas */
.theme-selector {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.theme-option.active {
  background: rgba(218, 156, 95, 0.2);
}

.theme-preview {
  width: 60px;
  height: 40px;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.theme-preview.light {
  background: linear-gradient(135deg, #ffffff 50%, #f0f0f0 50%);
}

.theme-preview.dark {
  background: linear-gradient(135deg, #2d3748 50%, #4a5568 50%);
}

.theme-preview.auto {
  background: linear-gradient(135deg, #ffffff 50%, #2d3748 50%);
}

.theme-name {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

/* Radio buttons */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-option input {
  margin-right: 0.5rem;
}

.radio-label {
  color: rgba(255, 255, 255, 0.9);
}

/* Botones */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #da9c5f;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #c58a4e;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: rgba(218, 156, 95, 0.5);
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-danger {
  background: rgba(220, 53, 69, 0.8);
  color: white;
}

.btn-danger:hover {
  background: rgba(220, 53, 69, 1);
}

/* Cerrar sesión */
.logout-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  margin-top: 2rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  text-align: center;
  border-radius: 12px;
  background: rgba(220, 53, 69, 0.2);
  color: #ffb6b6;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.logout-btn:hover {
  background: rgba(220, 53, 69, 0.35);
}

.logout-icon {
  font-size: 1.2rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: rgba(40, 40, 40, 0.95);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 450px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.modal h3 {
  color: #da9c5f;
  margin-bottom: 1rem;
}

.modal p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
  }
  
  .settings-nav {
    flex: none;
    display: flex;
    overflow-x: auto;
    padding: 1rem;
  }
  
  .nav-item {
    flex: 0 0 auto;
    white-space: nowrap;
  }
  
  .nav-icon {
    margin-right: 0.5rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .theme-selector {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .avatar-container {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>