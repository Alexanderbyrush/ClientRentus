<template>
    <!-- Navbar fuera de la card para mantener jerarquía visual consistente -->
    <NavBarComponent />

    <div class="container">
        <div class="max-w-3xl mx-auto">
            <!-- Card contenedora del formulario -->
            <div class="form-card">

                <!-- Título con gradiente (tomado del diseño 1) -->
                <h1 class="form-title">Editar Propiedad</h1>

                <!-- Estado de carga -->
                <div v-if="loading" class="text-gray-600">Cargando propiedad...</div>

                <form v-else @submit.prevent="updateProperty">
                    <!-- Grilla 2 columnas en desktop, 1 en mobile -->
                    <div class="form-grid">

                        <!-- Campo: Título -->
                        <div class="form-grid-full">
                            <label class="block mb-2">Título</label>
                            <input v-model="form.title" type="text" class="input" required />
                        </div>

                        <!-- Campo: Descripción -->
                        <div class="form-grid-full">
                            <label class="block mb-2">Descripción</label>
                            <textarea v-model="form.description" class="input" rows="3" required></textarea>
                        </div>

                        <!-- Campo: Ciudad -->
                        <div>
                            <label class="block mb-2">Ciudad</label>
                            <input v-model="form.city" type="text" class="input" required />
                        </div>

                        <!-- Campo: Dirección -->
                        <div>
                            <label class="block mb-2">Dirección</label>
                            <input v-model="form.address" type="text" class="input" required />
                        </div>

                        <!-- Campo: Estado -->
                        <div>
                            <label class="block mb-2">Estado</label>
                            <select v-model="form.status" class="input">
                                <option value="available">Disponible</option>
                                <option value="rented">Rentada</option>
                                <option value="maintenance">En mantenimiento</option>
                            </select>
                        </div>

                        <!-- Campo: Precio mensual -->
                        <div>
                            <label class="block mb-2">Precio mensual</label>
                            <input v-model="form.monthly_price" type="number" step="0.01" class="input" required />
                        </div>

                        <!-- Campo: Área -->
                        <div>
                            <label class="block mb-2">Área (m2)</label>
                            <input v-model="form.area_m2" type="number" class="input" required />
                        </div>

                        <!-- Campo: Habitaciones -->
                        <div>
                            <label class="block mb-2">Habitaciones</label>
                            <input v-model="form.num_bedrooms" type="number" class="input" />
                        </div>

                        <!-- Campo: Baños -->
                        <div>
                            <label class="block mb-2">Baños</label>
                            <input v-model="form.num_bathrooms" type="number" class="input" />
                        </div>

                        <!-- Campo: Servicios incluidos (sin botones) -->
                        <div class="form-grid-full">
                            <label class="block mb-2">Servicios incluidos</label>
                            <input v-model="form.included_services" type="text" class="input"
                                placeholder="ej: agua, luz, internet" required />
                        </div>


                        <!-- Campos: Coordenadas -->
                        <div>
                            <label class="block mb-2">Latitud</label>
                            <input v-model="form.lat" type="number" step="0.000001" class="input" />
                        </div>

                        <div>
                            <label class="block mb-2">Longitud</label>
                            <input v-model="form.lng" type="number" step="0.000001" class="input" />
                        </div>

                        <!-- Campo: URL imagen -->
                        <div class="form-grid-full">
                            <label class="block mb-2">URL de la imagen</label>
                            <input v-model="form.image_url" type="text" placeholder="https://..." class="input" />
                        </div>

                        <!-- Botones finales -->
                        <div class="form-grid-full form-actions">
                            <button type="button" @click="router.back()" class="btn-secondary">Cancelar</button>
                            <button type="submit" class="btn-primary ml-3" :disabled="loading">Guardar cambios</button>
                        </div>

                    </div>
                </form>

                <!-- Mensaje de error -->
                <p v-if="error" class="mt-5 text-error">{{ error }}</p>
            </div>
        </div>
    </div>

    <FooterComponent />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";
import NavBarComponent from "@/components/NavBarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null); // declarado correctamente

const form = ref({
  title: "",
  description: "",
  address: "",
  city: "",
  status: "available",
  monthly_price: 0,
  area_m2: 0,
  num_bedrooms: 0,
  num_bathrooms: 0,
  included_services: "", // ahora es string para edición como texto
  publication_date: "",
  image_url: "",
  lat: "",
  lng: ""
});

async function loadProperty() {
  loading.value = true;
  error.value = null;

  try {
    const { id } = route.params;
    if (!id) throw new Error("ID no provisto en la ruta");

    const res = await api.get(`/properties/${id}`);

    const data = res?.data ?? {};

    form.value = {
      ...form.value,
      ...data,
      // si el backend envía array, lo convertimos a string para editarlo en el input
      included_services: Array.isArray(data.included_services)
        ? data.included_services.join(", ")
        : data.included_services ?? ""
    };
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || String(err);
    error.value = "No fue posible cargar la propiedad: " + msg;
    console.error("loadProperty error:", err);
  } finally {
    loading.value = false;
  }
}

async function updateProperty() {
  loading.value = true;
  error.value = null;

  try {
    const { id } = route.params;
    if (!id) throw new Error("ID no provisto en la ruta");

    // Antes de enviar, convertimos a array si el backend lo espera como array
    const payload = {
      ...form.value,
      included_services: form.value.included_services
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    };

    await api.put(`/properties/${id}`, payload);
    router.push("/propiedades");
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || String(err);
    error.value = "Error al guardar los cambios: " + msg;
    console.error("updateProperty error:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadProperty();
});
</script>


<style scoped>
.container {
    font-family: 'Inter', Arial, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 90px;
    min-height: 100vh;
    background: #faf9f7;
}

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

.form-title {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(45deg, #3b251d, #2e1d17);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 28px;
    text-align: center;
}

label {
    color: #2c3e50;
    font-size: 0.95rem;
    font-weight: 600;
}

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

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.form-grid-full {
    grid-column: 1 / -1;
    /* ocupa toda la fila */
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

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
    box-shadow: 0 4px 16px rgba(59, 37, 29, 0.22);
    transition: all 0.3s ease;
}

.btn-secondary {
    background: #e8e2d8;
    color: #3b251d;
    border: none;
    padding: 14px 28px;
    border-radius: 12px;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
}

@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
    }
}
</style>
