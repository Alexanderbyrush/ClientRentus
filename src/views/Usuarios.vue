<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Lista de Usuarios</h2>
    <ul class="space-y-2">
      <li
        v-for="user in users"
        :key="user.id"
        class="p-2 bg-gray-100 rounded shadow-sm"
      >
        <strong>{{ user.name }}</strong> - {{ user.email }} <br />
        Tel: {{ user.phone }} - Documento: {{ user.id_documento }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import api from "../services/api";
import type { User } from "../types/User";

const users = ref<User[]>([]);

onMounted(async () => {
  try {
    const res = await api.get<User[]>("/users");
    users.value = res.data;
  } catch (err) {
    console.error("Error al obtener usuarios", err);
  }
});
</script>

<script lang="ts">
export default {
  name: "UsuariosView", // ✅ multi-word component name
};
</script>


