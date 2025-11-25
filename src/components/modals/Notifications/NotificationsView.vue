<template>
  <div v-show="open" class="overlay" @click.self="close">
    <div class="modal">

      <header class="header">
        <h2>Notificaciones</h2>
        <button class="close-btn" @click="close">&times;</button>
      </header>

      <div class="content">
        
        <div 
          v-for="(group, index) in formattedNotifications" 
          :key="index"
          class="date-group"
        >
          <div class="date-label">{{ group.date }}</div>

          <div 
            v-for="(notif, i) in group.items" 
            :key="i"
            class="notif-item"
            :class="{ unread: notif.unread }"
          >
            <div class="icon" :class="notif.type">
              <i :class="notif.icon"></i>
            </div>

            <div class="info">
              <p class="text" v-html="notif.text"></p>
              <span class="time">{{ notif.time }}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  open: Boolean,
});

const emit = defineEmits(["close"]);
const close = () => emit("close");

// NOTIFICACIONES SIMULADAS (puedes traerlas desde API)
const notifications = [
  {
    date: "Hoy",
    text: "<strong>Miguel Ruiz</strong> comentó en <a href='#'>tu propiedad</a><br><small>“¿Sigue disponible todavía?”</small>",
    time: "14:22",
    type: "primary",
    icon: "fas fa-comment-alt",
    unread: true,
  },
  {
    date: "Hoy",
    text: "<strong>Ana Torres</strong> marcó como favorita <a href='#'>tu anuncio</a>",
    time: "13:55",
    type: "success",
    icon: "fas fa-heart",
    unread: false,
  },
  {
    date: "Ayer",
    text: "<strong>Sistema</strong> reportó una <a href='#'>actualización automática</a>",
    time: "21:15",
    type: "warning",
    icon: "fas fa-wrench",
    unread: false,
  },
];

// AGRUPAR POR FECHAS
const formattedNotifications = computed(() => {
  const groups = {};
  notifications.forEach((notif) => {
    if (!groups[notif.date]) groups[notif.date] = [];
    groups[notif.date].push(notif);
  });

  return Object.keys(groups).map((date) => ({
    date,
    items: groups[date],
  }));
});
</script>

<style scoped>
/* ------------------------------
   OVERLAY
------------------------------*/
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fade 0.2s;
  z-index: 9999;
}
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ------------------------------
   MODAL
------------------------------*/
.modal {
  width: 440px;
  max-height: 85vh;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.25s ease-out;
  box-shadow: 0 12px 30px rgba(0,0,0,0.2);
}
@keyframes slideIn {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* ------------------------------
   HEADER
------------------------------*/
.header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-bottom: 1px solid #ececec;
}
.close-btn {
  font-size: 26px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
}

/* ------------------------------
   CONTENT
------------------------------*/
.content {
  padding: 20px 24px;
  overflow-y: auto;
}

/* FECHAS */
.date-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #777;
}

/* ------------------------------
   NOTIFICATION ITEM
------------------------------*/
.notif-item {
  display: flex;
  gap: 14px;
  background: #f8f8f8;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 14px;
  transition: 0.2s;
  border-left: 4px solid transparent;
  animation: fadeUp 0.2s ease;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.notif-item.unread {
  background: #eef6ff;
  border-left-color: #1e90ff;
}

/* ICONS */
.icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.primary { background: #1e90ff; }
.success { background: #28a745; }
.warning { background: #f1c40f; }
.danger { background: #e74c3c; }

/* TEXTOS */
.text a {
  color: #1e90ff;
  font-weight: 600;
}
.time {
  font-size: 12px;
  color: #888;
  margin-top: 6px;
  display: block;
}
</style>
