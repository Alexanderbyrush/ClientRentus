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
            <option value="pintura">Pintura</option>
            <option value="jardineria">Jardinería</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        <div class="form-group">
          <label for="priority">Prioridad:</label>
          <select 
            id="priority" 
            v-model="formData.priority" 
            required
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div class="form-group">
          <label for="description">Descripción del problema:</label>
          <textarea 
            id="description" 
            v-model="formData.description" 
            rows="4" 
            required
            placeholder="Describe detalladamente el problema, ubicación exacta y cualquier información relevante..."
          ></textarea>
          <div class="char-counter">{{ formData.description.length }}/500</div>
        </div>

        <div class="form-group">
          <label for="image" class="file-label">
            <span class="file-icon">📎</span>
            Adjuntar imagen del problema (opcional)
          </label>
          <input 
            type="file" 
            id="image" 
            accept="image/*"
            @change="handleImageUpload"
            class="file-input"
          />
          
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span class="progress-text">Subiendo: {{ uploadProgress }}%</span>
          </div>

          <div v-if="formData.image && !uploading" class="image-preview">
            <img :src="imagePreviewUrl" alt="Vista previa" />
            <div class="image-info">
              <span class="image-name">{{ formData.image.name }}</span>
              <span class="image-size">{{ formatFileSize(formData.image.size) }}</span>
            </div>
            <button type="button" @click="removeImage" class="remove-image-btn">
              ×
            </button>
          </div>

          <div v-if="uploadedImageUrl" class="upload-success">
            <span class="success-icon">✅</span>
            <span>Imagen subida correctamente</span>
            <a :href="uploadedImageUrl" target="_blank" class="view-link">Ver imagen</a>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="loading || uploading">
            <span v-if="loading || uploading" class="loading-spinner"></span>
            {{ getSubmitButtonText }}
          </button>
        </div>
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
      priority: 'media',
      description: '',
      image: null
    })

    // Estados de UI
    const loading = ref(false)
    const uploading = ref(false)
    const uploadProgress = ref(0)
    const uploadedImageUrl = ref('')

    // Computed properties
    const imagePreviewUrl = computed(() => {
      if (formData.image) {
        return URL.createObjectURL(formData.image)
      }
      return ''
    })

    const getSubmitButtonText = computed(() => {
      if (uploading.value) return 'Subiendo imagen...'
      if (loading.value) return 'Enviando solicitud...'
      return 'Enviar Solicitud'
    })

    const IMGBB_API_KEY = '16768ff5cf17e35243555fd8b388abd7' 
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
          alert('Por favor, selecciona solo imágenes (JPEG, PNG, GIF)')
          event.target.value = ''
          return
        }
        
        // Validar tamaño (max 10MB para ImgBB)
        if (file.size > 10 * 1024 * 1024) {
          alert('La imagen no debe superar los 10MB')
          event.target.value = ''
          return
        }
        
        formData.image = file
        uploadedImageUrl.value = '' // Resetear URL anterior
      }
    }

    const uploadImageToImgBB = async (file) => {
      uploading.value = true
      uploadProgress.value = 10

      try {
        const formData = new FormData()
        formData.append('image', file)

        // Simular progreso de subida
        uploadProgress.value = 30
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData
        })

        uploadProgress.value = 80

        if (!response.ok) {
          throw new Error('Error al subir la imagen')
        }

        const data = await response.json()
        uploadProgress.value = 100

        // ImgBB devuelve la URL en data.data.url
        return data.data.url

      } catch (error) {
        console.error('Error subiendo imagen:', error)
        throw new Error('No se pudo subir la imagen. Intenta nuevamente.')
      } finally {
        uploading.value = false
        setTimeout(() => {
          uploadProgress.value = 0
        }, 1000)
      }
    }

    const removeImage = () => {
      formData.image = null
      uploadedImageUrl.value = ''
      const fileInput = document.getElementById('image')
      if (fileInput) {
        fileInput.value = ''
      }
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const resetForm = () => {
      formData.category = ''
      formData.priority = 'media'
      formData.description = ''
      formData.image = null
      loading.value = false
      uploading.value = false
      uploadProgress.value = 0
      uploadedImageUrl.value = ''
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

      if (formData.description.length > 500) {
        alert('La descripción no puede exceder los 500 caracteres')
        return
      }

      loading.value = true
      let imageUrl = ''

      try {
        // Subir imagen si existe
        if (formData.image) {
          imageUrl = await uploadImageToImgBB(formData.image)
          uploadedImageUrl.value = imageUrl
        }

        // Simular envío a la API de mantenimiento
        console.log('Enviando solicitud de mantenimiento:', {
          ...formData,
          imageUrl: imageUrl
        })
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Éxito - Emitir evento con todos los datos
        emit('submitted', {
          category: formData.category,
          priority: formData.priority,
          description: formData.description,
          image: formData.image,
          imageUrl: imageUrl,
          timestamp: new Date().toISOString(),
          status: 'pendiente'
        })
        
        alert('¡Solicitud de mantenimiento enviada correctamente! Te contactaremos pronto.')
        closeModal()
        
      } catch (error) {
        console.error('Error enviando solicitud:', error)
        alert(error.message || 'Error al enviar la solicitud. Por favor intenta nuevamente.')
      } finally {
        loading.value = false
      }
    }

    return {
      formData,
      loading,
      uploading,
      uploadProgress,
      uploadedImageUrl,
      imagePreviewUrl,
      getSubmitButtonText,
      closeModal,
      handleImageUpload,
      removeImage,
      formatFileSize,
      submitMaintenanceRequest
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  display: flex;
  position: fixed;
  z-index: 9999;
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
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  color: #d99227;
  text-align: center;
  font-size: 1.5rem;
}

.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.8rem;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close:hover {
  color: #d99227;
  background: rgba(217, 146, 39, 0.1);
}

.maintenance-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.95rem;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.file-label:hover {
  border-color: #d99227;
  background: #fff9f0;
}

.file-icon {
  font-size: 1.2rem;
}

.file-input {
  display: none;
}

.form-group select,
.form-group textarea {
  padding: 0.8rem;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #d99227;
  box-shadow: 0 0 0 3px rgba(217, 146, 39, 0.1);
}

.char-counter {
  text-align: right;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.upload-progress {
  margin-top: 1rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d99227, #f59e0b);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-text {
  font-size: 0.85rem;
  color: #4b5563;
  font-weight: 500;
}

.image-preview {
  position: relative;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.image-preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #d99227;
}

.image-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.image-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.image-size {
  font-size: 0.8rem;
  color: #6b7280;
}

.remove-image-btn {
  background: #ef4444;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.remove-image-btn:hover {
  background: #dc2626;
}

.upload-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #065f46;
}

.success-icon {
  font-size: 1.1rem;
}

.view-link {
  color: #059669;
  text-decoration: none;
  font-weight: 500;
  margin-left: auto;
}

.view-link:hover {
  text-decoration: underline;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.9rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #6b7280;
  color: white;
}

.btn-cancel:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-submit {
  background: linear-gradient(135deg, #d99227, #b8791f);
  color: white;
  box-shadow: 0 2px 10px rgba(217, 146, 39, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(217, 146, 39, 0.4);
}

.btn-submit:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  
  .form-actions {
    flex-direction: column;
  }
  
  .image-preview {
    flex-direction: column;
    text-align: center;
  }
}
</style>