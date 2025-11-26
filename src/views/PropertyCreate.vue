<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Crear Propiedad</h1>

    <form @submit.prevent="submitForm" class="space-y-4">

      <!-- Título -->
      <div>
        <label class="block mb-1 font-semibold">Título</label>
        <input v-model="form.title" type="text" class="input" required />
      </div>

      <!-- Descripción -->
      <div>
        <label class="block mb-1 font-semibold">Descripción</label>
        <textarea v-model="form.description" class="input" rows="3" required></textarea>
      </div>

      <!-- Dirección -->
      <div>
        <label class="block mb-1 font-semibold">Dirección</label>
        <input v-model="form.address" type="text" class="input" required />
      </div>

      <!-- Ciudad -->
      <div>
        <label class="block mb-1 font-semibold">Ciudad</label>
        <input v-model="form.city" type="text" class="input" required />
      </div>

      <!-- Estado -->
      <div>
        <label class="block mb-1 font-semibold">Estado</label>
        <select v-model="form.status" class="input">
          <option value="available">Disponible</option>
          <option value="rented">Rentada</option>
          <option value="maintenance">En mantenimiento</option>
        </select>
      </div>

      <!-- Precio mensual -->
      <div>
        <label class="block mb-1 font-semibold">Precio mensual</label>
        <input v-model="form.monthly_price" type="number" step="0.01" class="input" required />
      </div>

      <!-- Área (m2) -->
      <div>
        <label class="block mb-1 font-semibold">Área (m2)</label>
        <input v-model="form.area_m2" type="number" class="input" required />
      </div>

      <!-- Habitaciones -->
      <div>
        <label class="block mb-1 font-semibold">Habitaciones</label>
        <input v-model="form.num_bedrooms" type="number" class="input" />
      </div>

      <!-- Baños -->
      <div>
        <label class="block mb-1 font-semibold">Baños</label>
        <input v-model="form.num_bathrooms" type="number" class="input" />
      </div>

      <!-- Servicios incluidos -->
      <div>
        <label class="block mb-1 font-semibold">Servicios incluidos</label>
        <input
          v-model="servicesText"
          @blur="parseServices"
          type="text"
          placeholder="Ej: agua, luz, gas"
          class="input"
        />
      </div>

      <!-- Fecha de publicación -->
      <div>
        <label class="block mb-1 font-semibold">Fecha de publicación</label>
        <input v-model="form.publication_date" type="date" class="input" required />
      </div>

      <!-- Imagen -->
      <div>
        <label class="block mb-1 font-semibold">URL de la imagen</label>
        <input v-model="form.image_url" type="text" class="input" placeholder="https://..." />
      </div>

      <!-- Latitud -->
      <div>
        <label class="block mb-1 font-semibold">Latitud</label>
        <input v-model="form.lat" type="number" step="0.000001" class="input" />
      </div>

      <!-- Longitud -->
      <div>
        <label class="block mb-1 font-semibold">Longitud</label>
        <input v-model="form.lng" type="number" step="0.000001" class="input" />
      </div>

      <!-- Botón -->
      <button
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        :disabled="loading"
      >
        {{ loading ? "Guardando..." : "Crear Propiedad" }}
      </button>
    </form>

    <p v-if="success" class="mt-4 text-green-600 font-semibold">
      Propiedad creada exitosamente.
    </p>

    <p v-if="error" class="mt-4 text-red-600 font-semibold">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api"; // IMPORTANTE: usa api.rentus
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
.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
</style>
