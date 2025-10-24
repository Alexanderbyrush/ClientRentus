<template>
  <div class="profile-page">
    <div class="fondo"></div>
    
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
        </span>
      </nav>
    </header>

    <!-- Contenido Principal -->
    <main class="contenedor-perfil">
      <!-- Sección Superior del Perfil -->
      <div class="perfil-superior">
        <div class="foto-perfil">
          <img 
            :src="user.profilePhoto || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS35wCCiFuqxEbTOv-J2jh2yARYUpmuEaKyUw&s'" 
            alt="Perfil"
            @error="handleImageError"
          />
        </div>
        <div class="info-principal">
          <div>
            <h2>{{ user.username }}<i class="fas fa-check-circle verificado"></i></h2>
            <p>{{ user.location }}</p>
            <p class="bio">{{ user.bio }}</p>
          </div>
        </div>
      </div>

      <!-- Información Extra -->
      <div class="info-extra">
        <div class="item-info"><strong>Nombre:</strong> {{ user.fullName }}</div>
        <div class="item-info"><strong>Correo:</strong> {{ user.email }}</div>
        <div class="item-info"><strong>Teléfono:</strong> {{ user.phone }}</div>
        <div class="item-info"><strong>Interesado en:</strong> {{ user.interests }}</div>
      </div>

      <!-- Propiedades del Usuario -->
      <h3 class="propiedades-usuario">Propiedades de {{ user.username }}:</h3>

      <div class="cards">
        <div 
          v-for="property in userProperties" 
          :key="property.id"
          class="property-card"
          @click="viewPropertyDetails(property.id)"
        >
          <div class="property-img">
            <img :src="property.image" :alt="property.title">
            <div class="tour-icon"><i class="fas fa-vr-cardboard"></i> Tour 360°</div>
          </div>
          <div class="property-info">
            <h4>{{ formatPrice(property.price) }}</h4>
            <h3>{{ property.title }}</h3>
            <p class="ubicacion"><i class="fas fa-map-marker-alt"></i> {{ property.location }}</p>
            <div class="property-icons">
              <span><i class="fas fa-bed"></i> {{ property.bedrooms }}</span>
              <span><i class="fas fa-bath"></i> {{ property.bathrooms }}</span>
              <span><i class="fas fa-ruler-combined"></i> {{ property.area }}m²</span>
            </div>
            <div class="bottom-card">
              <span class="rating"><i class="fas fa-star"></i> {{ property.rating }}</span>
              <a href="#" class="btn-ver" @click.prevent="viewPropertyDetails(property.id)">
                Ver detalles <i class="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Redes Sociales -->
      <div class="redes-sociales">
        <p>Mis redes</p>
        <div class="iconos">
          <a href="#"><img src="@/assets/img/facebook.png" alt="Facebook" class="icono-red"></a>
          <a href="#"><img src="@/assets/img/instagram.png" alt="Instagram" class="icono-red"></a>
          <a href="#"><img src="@/assets/img/tik-tok.png" alt="TikTok" class="icono-red"></a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Datos reactivos del usuario
const user = ref({
  username: 'Alexander_Camilo',
  fullName: 'Alexander Camilo',
  email: 'alexandrecamilor@gmail.com',
  phone: '+57 300 123 4567',
  location: 'Popayán, Colombia',
  bio: 'Amante de los espacios modernos y bien ubicados.',
  interests: 'Apartamentos centrales',
  profilePhoto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS35wCCiFuqxEbTOv-J2jh2yARYUpmuEaKyUw&s'
})

// Propiedades del usuario
const userProperties = ref([
  {
    id: 1,
    title: 'Casa campestre',
    price: 1200000,
    location: 'Vereda Luz Torres, Popayán',
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    rating: 4.5,
    image: 'https://i.pinimg.com/1200x/03/ad/0a/03ad0a7aeef96fc5b06903b529a17f8d.jpg'
  }
  // Puedes agregar más propiedades aquí
])

// Métodos
const goHome = () => {
  router.push('/')
}

const openNotifications = () => {
  // Aquí puedes abrir el modal de notificaciones
  console.log('Abrir notificaciones')
}

const handleImageError = (event) => {
  event.target.src = '@/assets/img/default.webp'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price)
}

const viewPropertyDetails = (propertyId) => {
  router.push(`/propiedad/${propertyId}`)
}

// Cargar datos del usuario real cuando el componente se monte
onMounted(async () => {
  try {
    // Aquí cargarías los datos reales del usuario desde tu API
    // const userData = await authStore.fetchUserProfile()
    // user.value = { ...user.value, ...userData }
    
    // Y las propiedades del usuario
    // userProperties.value = await authStore.fetchUserProperties()
  } catch (error) {
    console.error('Error cargando perfil:', error)
  }
})
</script>

<style scoped>
/* Copia TODO el CSS de perfil.css aquí */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.profile-page {
  font-family: 'Segoe UI', sans-serif;
  background: url('https://i.pinimg.com/1200x/e2/d2/b7/e2d2b7877ffb88a68d6b72e5ea0bd965.jpg') no-repeat center center fixed;
  background-size: cover;
  color: #2e1d12;
  min-height: 100vh;
}

.fondo {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  backdrop-filter: blur(5px);
  z-index: -1;
}

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

.contenedor-perfil {
  width: 90%;
  max-width: 1000px;
  margin: 30px auto;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 25px rgba(0,0,0,0.25);
}

.perfil-superior {
  display: flex;
  align-items: center;
  gap: 25px;
}

.foto-perfil {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #da9c5f;
}

.foto-perfil img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-principal h2 {
  margin: 0;
  font-size: 1.8em;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-principal p {
  margin-top: 5px;
  color: #f0e5db;
}

.bio {
  font-style: italic;
  font-size: 0.9em;
}

.verificado {
  color: lightgreen;
}

.info-extra {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.item-info {
  background-color: rgba(86, 44, 29, 0.7);
  backdrop-filter: blur(8px);
  padding: 15px 20px;
  border-radius: 15px;
  flex: 1 1 45%;
  color: #f0e5db;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

.redes-sociales {
  margin-top: 40px;
  text-align: center;
}

.redes-sociales p {
  font-weight: bold;
  font-size: 1.2em;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.iconos {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.icono-red {
  width: 28px;
  height: 28px;
  transition: transform 0.3s ease;
}

.icono-red:hover {
  transform: scale(1.2);
}

.property-card {
  margin-top: 25px;
  width: 300px;
  background-color: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  flex: 0 0 auto;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.property-card:hover {
  transform: scale(1.03);
}

.property-img {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.property-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tour-icon {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(86, 44, 29, 0.85);
  color: #fff;
  padding: 5px 10px;
  font-size: 0.85em;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.property-info {
  padding: 15px;
  color: #2e1d12;
}

.property-info h4 {
  font-size: 1.3em;
  margin-bottom: 5px;
  color: #562c1d;
}

.property-info h3 {
  font-size: 1.1em;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2e1d12;
}

.ubicacion {
  font-size: 0.9em;
  color: #777;
  margin-bottom: 10px;
}

.property-icons {
  display: flex;
  gap: 10px;
  font-size: 0.9em;
  margin-bottom: 10px;
  color: #444;
}

.bottom-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating {
  font-weight: bold;
  color: #da9c5f;
}

.btn-ver {
  background-color: #fff;
  border: 1px solid #da9c5f;
  color: #da9c5f;
  padding: 6px 12px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9em;
  transition: background 0.3s, color 0.3s;
}

.btn-ver:hover {
  background-color: #da9c5f;
  color: #fff;
}

.cards {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
}

.propiedades-usuario {
  margin-top: 40px;
  color: #f0e5db;
}
</style>