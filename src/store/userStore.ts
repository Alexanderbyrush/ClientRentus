// src/stores/userStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const fullName = ref('Usuario')
  const firstName = ref('Usuario')
  const profilePhoto = ref('')
  const userData = ref<any>(null)

  // Cargar datos del usuario
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        isLoggedIn.value = false
        return
      }
      
      isLoggedIn.value = true

      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const user = response.data
      updateUserData(user)
      
      localStorage.setItem('user', JSON.stringify(user))
    } catch (error) {
      console.error('Error obteniendo usuario:', error)
      logout()
    }
  }

  // Actualizar datos del usuario (sin hacer petición)
  const updateUserData = (user: any) => {
    userData.value = user
    fullName.value = user.name || 'Usuario'
    firstName.value = fullName.value.split(' ')[0]
    
    if (firstName.value.length > 10) {
      firstName.value = firstName.value.slice(0, 10) + '...'
    }
    
    // IMPORTANTE: Actualizar la foto de perfil
    profilePhoto.value = user.photo || ''
  }

  // Actualizar solo la foto (llamar desde ProfileView)
  const updateProfilePhoto = (newPhoto: string) => {
    profilePhoto.value = newPhoto
    if (userData.value) {
      userData.value.photo = newPhoto
      localStorage.setItem('user', JSON.stringify(userData.value))
    }
  }

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    isLoggedIn.value = false
    fullName.value = 'Usuario'
    firstName.value = 'Usuario'
    profilePhoto.value = ''
    userData.value = null
  }

  return {
    isLoggedIn,
    fullName,
    firstName,
    profilePhoto,
    userData,
    fetchUserData,
    updateUserData,
    updateProfilePhoto,
    logout
  }
})