<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Solicitud de Mantenimiento</h2>
      
      <form @submit.prevent="submitMaintenanceRequest" class="maintenance-form">
        <div class="form-group">
          <label for="category">Categoría:</label>
          <select 
            id="category" 
            v-model="formData.category" 
            required
          >
            <option value="">Seleccione una opción</option>
            <option value="electricidad">Electricidad</option>
            <option value="plomeria">Plomería</option>
            <option value="estructural">Estructural</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Descripción del problema:</label>
          <textarea 
            id="description" 
            v-model="formData.description" 
            rows="4" 
            required
            placeholder="Describe el daño o arreglo necesario..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="image">Adjuntar imagen (opcional)</label>
          <input 
            type="file" 
            id="image" 
            accept="image/*"
            @change="handleImageUpload"
          />
          <div v-if="formData.image" class="image-preview">
            <img :src="imagePreviewUrl" alt="Vista previa" />
            <button type="button" @click="removeImage" class="remove-image-btn">
              ×
            </button>
          </div>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar Solicitud' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'MaintenanceModal',
  
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'submitted'],

  setup(props, { emit }) {
    // Estado del formulario
    const formData = reactive({
      category: '',
      description: '',
      image: null
    })

    // Estados de UI
    const loading = ref(false)

    // Computed para la vista previa de la imagen
    const imagePreviewUrl = computed(() => {
      if (formData.image) {
        return URL.createObjectURL(formData.image)
      }
      return ''
    })

    // Métodos
    const closeModal = () => {
      emit('close')
      resetForm()
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecciona solo imágenes')
          event.target.value = ''
          return
        }
        
        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('La imagen no debe superar los 5MB')
          event.target.value = ''
          return
        }
        
        formData.image = file
      }
    }

    const removeImage = () => {
      formData.image = null
      // Resetear el input file
      const fileInput = document.getElementById('image')
      if (fileInput) {
        fileInput.value = ''
      }
    }

    const resetForm = () => {
      formData.category = ''
      formData.description = ''
      formData.image = null
      loading.value = false
    }

    const submitMaintenanceRequest = async () => {
      // Validaciones básicas
      if (!formData.category) {
        alert('Por favor selecciona una categoría')
        return
      }

      if (!formData.description.trim()) {
        alert('Por favor describe el problema')
        return
      }

      loading.value = true

      try {
        // Aquí iría la llamada a tu API Laravel
        console.log('Enviando solicitud de mantenimiento:', formData)
        
        // Simulamos envío a la API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Éxito
        alert('¡Solicitud de mantenimiento enviada correctamente!')
        
        // Emitir evento de éxito
        emit('submitted', {
          category: formData.category,
          description: formData.description,
          image: formData.image
        })
        
        // Cerrar modal y resetear formulario
        closeModal()
        
      } catch (error) {
        console.error('Error enviando solicitud:', error)
        alert('Error al enviar la solicitud. Por favor intenta nuevamente.')
      } finally {
        loading.value = false
      }
    }

    return {
      formData,
      loading,
      imagePreviewUrl,
      closeModal,
      handleImageUpload,
      removeImage,
      submitMaintenanceRequest
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  display: flex;
  position: fixed;
  z-index: 999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(20, 20, 20, 0.85), rgba(20, 20, 20, 0.85));
  backdrop-filter: blur(6px);
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #ffffff;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-bottom: 1rem;
  color: #d99227;
  text-align: center;
}

.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.close:hover {
  color: #d99227;
}

.maintenance-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group select,
.form-group textarea {
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #d99227;
  box-shadow: 0 0 0 2px rgba(217, 146, 39, 0.1);
}

.form-group input[type="file"] {
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: border-color 0.3s ease;
}

.form-group input[type="file"]:hover {
  border-color: #a67c52;
  cursor: pointer;
}

.image-preview {
  position: relative;
  margin-top: 0.5rem;
  display: inline-block;
}

.image-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #d99227;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-image-btn:hover {
  background: #cc0000;
}

.btn-submit {
  background-color: #d99227;
  color: #fff;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 1rem;
  font-weight: 600;
}

.btn-submit:hover:not(:disabled) {
  background-color: #b8791f;
}

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .modal-content h2 {
    font-size: 1.3rem;
  }
}
</style>