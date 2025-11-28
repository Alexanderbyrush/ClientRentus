<template>
  <NavBarComponent />
  <div class="container">
    <div class="max-w-3xl mx-auto">
      <div class="form-card">
        <h1 class="form-title">Crear Propiedad</h1>

        <form @submit.prevent="submitForm" class="space-y-5">
          <div class="form-grid">

            <div class="form-grid-full">
              <label class="block mb-2">Título</label>
              <input v-model="form.title" type="text" class="input" required />
            </div>

            <div class="form-grid-full">
              <label class="block mb-2">Descripción</label>
              <textarea v-model="form.description" class="input" rows="3" required></textarea>
            </div>


            <div>
              <label class="block mb-2">Ciudad</label>
              <input v-model="form.city" type="text" class="input" required />
            </div>

            <div>
              <label class="block mb-2">Dirección</label>
              <input v-model="form.address" type="text" class="input" required />
            </div>

            <div>
              <label class="block mb-2">Estado</label>
              <select v-model="form.status" class="input">
                <option value="available">Disponible</option>
                <option value="rented">Rentada</option>
                <option value="maintenance">En mantenimiento</option>
              </select>
            </div>

            <div>
              <label class="block mb-2">Precio mensual</label>
              <input v-model="form.monthly_price" type="number" step="0.01" class="input" required />
            </div>

            <div>
              <label class="block mb-2">Área (m2)</label>
              <input v-model="form.area_m2" type="number" class="input" required />
            </div>

            <div>
              <label class="block mb-2">Habitaciones</label>
              <input v-model="form.num_bedrooms" type="number" class="input" />
            </div>

            <div>
              <label class="block mb-2">Baños</label>
              <input v-model="form.num_bathrooms" type="number" class="input" />
            </div>

            <div class="form-grid-full">
              <label class="block mb-2">Servicios incluidos</label>
              <input v-model="servicesText" @blur="parseServices" type="text" placeholder="agua, luz, gas"
                class="input" />
            </div>
            <div>
              <label class="block mb-2">Fecha de publicación</label>
              <input type="date" v-model="form.publication_date" class="input" />
            </div>

            <div>
              <label class="block mb-2">Latitud</label>
              <input v-model="form.lat" type="number" step="0.000001" class="input" />
            </div>

            <div>
              <label class="block mb-2">Longitud</label>
              <input v-model="form.lng" type="number" step="0.000001" class="input" />
            </div>

            <div class="form-grid-full">
              <label class="block mb-2">URL de la imagen</label>
              <input v-model="form.image_url" type="text" placeholder="https://..." class="input" />
            </div>

          </div>

          <button type="submit" class="btn-primary" :disabled="loading">Crear Propiedad</button>
          <button type="button" @click="router.back()" class="btn-secondary">Cancelar</button>
        </form>

        <p v-if="success" class="mt-5 text-success">Propiedad creada exitosamente.</p>
        <p v-if="error" class="mt-5 text-error">{{ error }}</p>
      </div>
    </div>
  </div>
  <FooterComponent />
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api"; // IMPORTANTE: usa api.rentus
import NavBarComponent from "@/components/NavBarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
const router = useRouter();

const form = ref({
  title: "",
  description: "",
  address: "",
  city: "",
  status: "available",
  monthly_price: "",
  area_m2: "",
  num_bedrooms: "",
  num_bathrooms: "",
  included_services: [],
  publication_date: "",
  image_url: "",
  lat: "",
  lng: "",
});

// Campo de entrada para servicios
const servicesText = ref("");

const parseServices = () => {
  form.value.included_services = servicesText.value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
};

const loading = ref(false);
const error = ref(null);
const success = ref(false);

const submitForm = async () => {
  loading.value = true;
  error.value = null;
  success.value = false;

  parseServices();

  try {
    await api.post("/properties", form.value); // **API correcta api.rentus**

    success.value = true;

    setTimeout(() => router.push("/propiedades"), 1200);

  } catch (err) {
    console.log(err);
    error.value = "Hubo un error al guardar la propiedad.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Contenedor principal */
.container {
  font-family: 'Inter', Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 90px;
  min-height: 100vh;
  background: #faf9f7;
}

/* Caja del formulario */
.form-card {
  background: white;
  border-radius: 18px;
  padding: 35px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.07);
  border: 1px solid #f0ebe3;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.form-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 34px rgba(59, 37, 29, 0.12);
}

/* Título */
.form-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(45deg, #3b251d, #2e1d17);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 28px;
  text-align: center;
}

/* Labels */
label {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 600;
}

/* Inputs & selects */
.input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e8e2d8;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  background: #faf9f7;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #bdb5a6;
  background: white;
  box-shadow: 0 0 0 3px rgba(189, 181, 166, 0.15);
}

/* Textarea */
textarea.input {
  resize: vertical;
  min-height: 90px;
}

/* Grid responsive del form */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-grid-full {
  grid-column: span 2;
}

/* Botón primario */
.btn-primary {
  background: linear-gradient(45deg, #3b251d, #2e1d17);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 16px rgba(59, 37, 29, 0.25);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(59, 37, 29, 0.35);
}

/* Botón secundario */
.btn-secondary {
  background: #e8e2d8;
  color: #3b251d;
  border: none;
  padding: 12px 22px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #d6cfc2;
  transform: translateY(-2px);
}

/* Mensajes de estado */
.text-success {
  background: #e6fff2;
  border-left: 4px solid #27ae60;
  padding: 12px;
  border-radius: 6px;
  color: #27ae60;
  font-weight: 600;
}

.text-error {
  background: #fff5f5;
  border-left: 4px solid #e74c3c;
  padding: 12px;
  border-radius: 6px;
  color: #e74c3c;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-grid-full {
    grid-column: span 1;
  }

  .form-title {
    font-size: 1.7rem;
  }
}
</style>
