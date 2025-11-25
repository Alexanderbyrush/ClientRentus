<template>
  <div class="pagos-container">

    <!-- Header -->
    <header class="barra">
      <div class="logo">
        <img src="@/assets/img/logo.png" alt="RentUs Logo" />
      </div>

      <nav class="acciones-barra">
        <button class="icon-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>

        <button class="icon-btn" @click="openNotif">
          <i class="fas fa-bell"></i>
        </button>
      </nav>
    </header>

    <!-- Buscador -->
    <input
      type="text"
      v-model="search"
      class="busqueda"
      placeholder="🔍 Busca tu recibo o pago"
    />

    <!-- Tabla -->
    <div class="tabla-wrapper glass">
      <table class="historial">
        <thead>
          <tr>
            <th></th>
            <th>#Factura</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="factura in filteredFacturas"
            :key="factura.id"
            :class="{ selected: selectedRow === factura.id }"
            @click="selectRow(factura.id)"
          >
            <td>
              <input
                type="checkbox"
                :checked="selectedRow === factura.id"
              />
            </td>

            <td>{{ factura.numero }}</td>
            <td>{{ factura.cliente }}</td>
            <td>{{ factura.fecha }}</td>

            <td>
              <span
                class="estado"
                :class="factura.estado"
              >
                {{ factura.estado }}
              </span>
            </td>

            <td>{{ factura.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Botones -->
    <div class="botones">
      <button @click="verDetalles" :disabled="!selectedRow">
        Ver detalles
      </button>

      <button @click="showModal = true" :disabled="!selectedRow">
        Realizar pago
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content glass animate">

        <button class="close" @click="closeModal">✕</button>

        <!-- Paso 1 -->
        <section v-if="step === 1" class="modal-step">
          <img src="@/assets/img/logo.png" class="logo-modal" />

          <h2 class="modal-title">Métodos de Pago</h2>

          <p class="modal-desc">
            Agrega una forma de pago ahora para que tu próximo pago sea más rápido y sencillo.
          </p>

          <button class="btn-principal" @click="step = 2">
            Agregar método de pago
          </button>
        </section>

        <!-- Paso 2 -->
        <section v-if="step === 2" class="modal-step">
          <h3 class="modal-subtitle">Elige tu método de pago favorito</h3>

          <div class="metodos">
            <button class="metodo">
              <img src="@/assets/img/tarjeta-de-credito.png" /> Tarjetas
            </button>

            <button class="metodo">
              <img src="@/assets/img/bancolombia.png" /> Bancolombia
            </button>

            <button class="metodo">
              <img src="@/assets/img/nequi.png" /> Nequi
            </button>

            <button class="metodo">
              <img src="@/assets/img/pse.png" /> PSE
            </button>

            <button class="metodo">
              <img src="@/assets/img/daviplata.png" /> Daviplata
            </button>

            <button class="metodo emoji">💵 Pago físico</button>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const search = ref("");
const selectedRow = ref(null);
const showModal = ref(false);
const step = ref(1);

// FACTURAS FAKE
const facturas = ref([
  {
    id: 1,
    numero: "12768",
    cliente: "Jose Manzano C",
    fecha: "10-05-2025",
    estado: "pendiente",
    total: "$2'000.000",
  },
  {
    id: 2,
    numero: "00039",
    cliente: "Jose Manzano C",
    fecha: "10-04-2025",
    estado: "realizado",
    total: "$2'000.000",
  },
]);

const filteredFacturas = computed(() =>
  facturas.value.filter((f) =>
    f.numero.includes(search.value) ||
    f.cliente.toLowerCase().includes(search.value.toLowerCase())
  )
);

const selectRow = (id) => {
  selectedRow.value = id;
};

const verDetalles = () => {
  alert("Aquí enviarás a detalles de factura");
};

const closeModal = () => {
  showModal.value = false;
  step.value = 1;
};

const goBack = () => {
  window.history.back();
};

const openNotif = () => {
  console.log("Abrir notificaciones");
};
</script>

<style scoped>
/* ————————————————————— */
/* ESTILO DEL CONTAINER */
/* ————————————————————— */
.pagos-container {
  width: 100%;
  max-width: 900px;
  margin: 50px auto;
  padding: 0 25px;
  color: #fff;
  font-family: "Segoe UI", sans-serif;
}

/* HEADER */
.barra {
  background: rgba(86, 44, 29, 0.85);
  backdrop-filter: blur(10px);
  padding: 15px 25px;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-btn {
  background: none;
  border: none;
  color: #f0e5db;
  font-size: 20px;
  cursor: pointer;
  margin-left: 15px;
  transition: 0.2s;
}
.icon-btn:hover {
  color: #da9c5f;
  transform: scale(1.1);
}

.logo img {
  height: 38px;
}

/* Buscador */
.busqueda {
  width: 100%;
  margin-top: 30px;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 28px;
  color: #f2f2f2;
  font-size: 15px;
  outline: none;
}

/* ————————————————————— */
/* TABLA */
/* ————————————————————— */

.tabla-wrapper {
  margin-top: 30px;
}

.historial {
  width: 100%;
  border-collapse: collapse;
  color: #eee;
}
.historial th {
  padding: 12px;
  font-weight: 600;
  color: #f7d6bf;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.historial td {
  padding: 14px;
  text-align: center;
  font-size: 14px;
}

.historial tr {
  cursor: pointer;
  transition: 0.2s;
}
.historial tr:hover {
  background: rgba(255, 255, 255, 0.07);
}

.selected {
  background: rgba(255, 255, 255, 0.18) !important;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3);
}

/* ESTADOS */
.estado {
  padding: 5px 12px;
  border-radius: 10px;
  font-size: 12px;
  text-transform: capitalize;
}

.estado.pendiente {
  background: orange;
  color: #000;
}
.estado.realizado {
  background: limegreen;
  color: #000;
}

/* BOTONES */
.botones {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.botones button {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: #5c3d2e;
  color: white;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
}

.botones button:hover {
  background: #41291f;
}
.botones button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ————————————————————— */
/* MODAL */
/* ————————————————————— */

.modal-overlay {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 420px;
  padding: 30px 25px;
  border-radius: 20px;
  position: relative;
}

.animate {
  animation: fadeIn 0.3s ease forwards;
}

.close {
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: 22px;
  cursor: pointer;
  background: none;
  border: none;
  color: #fff;
}

.modal-step {
  text-align: center;
}

.logo-modal {
  width: 80px;
  margin-bottom: 10px;
}

.modal-title {
  margin-top: 10px;
  font-size: 26px;
  font-weight: 600;
}

.modal-desc {
  margin: 10px auto 20px;
  opacity: 0.9;
}

.btn-principal {
  background: #6a4a3b;
  border: none;
  padding: 12px 18px;
  color: #fff;
  border-radius: 14px;
  cursor: pointer;
  font-size: 16px;
}

.modal-subtitle {
  margin-bottom: 15px;
  font-size: 20px;
}

.metodos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metodo {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  padding: 12px 15px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: white;
  font-size: 15px;
}
.metodo img {
  width: 24px;
}
.emoji {
  font-size: 18px;
}

/* Animación */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
