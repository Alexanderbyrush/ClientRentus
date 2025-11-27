<template>
  <div v-show="open" class="overlay" @click.self="close">
    <div class="modal">

      <header class="header">
        <h2>Notificaciones</h2>
        <div class="header-actions">
          <button 
            v-if="unreadCount > 0" 
            class="mark-all-btn" 
            @click="markAllAsRead"
            title="Marcar todas como leídas"
          >
            ✓ Marcar todas
          </button>
          <button class="close-btn" @click="close">&times;</button>
        </div>
      </header>

      <div class="content">
        <!-- Loading -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Cargando notificaciones...</p>
        </div>

        <!-- Notificaciones -->
        <div v-else-if="formattedNotifications.length > 0">
          <div 
            v-for="(group, index) in formattedNotifications" 
            :key="index"
            class="date-group"
          >
            <div class="date-label">{{ group.date }}</div>

            <div 
              v-for="notif in group.items" 
              :key="notif.id"
              class="notif-item"
              :class="{ unread: !notif.read }"
              @click="handleNotificationClick(notif)"
            >
              <div class="icon" :class="getNotificationType(notif.type)">
                <i :class="getNotificationIcon(notif.type)"></i>
              </div>

              <div class="info">
                <p class="text" v-html="notif.message"></p>
                <span class="time">{{ formatTime(notif.created_at) }}</span>
              </div>

              <button 
                class="delete-btn" 
                @click.stop="deleteNotification(notif.id)"
                title="Eliminar"
              >
                ✕
              </button>
            </div>

          </div>
        </div>

        <!-- Vacío -->
        <div v-else class="empty">
          <i class="fas fa-bell-slash"></i>
          <p>No tienes notificaciones</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { notificationService } from "@/services/notificationService";
import type { NotificationItem } from "@/services/notificationService";
import { useRouter } from "vue-router";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits(["close", "update"]);
const router = useRouter();

const notifications = ref<NotificationItem[]>([]);
const loading = ref(false);

const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
);

// Agrupar por fechas
const formattedNotifications = computed(() => {
  const groups: Record<string, NotificationItem[]> = {};
  
  notifications.value.forEach((notif) => {
    const date = getDateLabel(notif.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(notif);
  });

  return Object.keys(groups).map((date) => ({
    date,
    items: groups[date],
  }));
});

// Cargar notificaciones cuando se abre el modal
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    await loadNotifications();
  }
});

const loadNotifications = async () => {
  loading.value = true;
  try {
    notifications.value = await notificationService.getNotifications();
  } catch (error) {
    console.error("Error cargando notificaciones:", error);
  } finally {
    loading.value = false;
  }
};

const handleNotificationClick = async (notif: NotificationItem) => {
  // Marcar como leída si no lo está
  if (!notif.read) {
    await markAsRead(notif.id);
  }

  // Navegar según el tipo de notificación
  const data = notif.data ? JSON.parse(notif.data) : {};

  switch (notif.type) {
    case "rental_request":
      // Abrir modal de solicitudes
      close();
      emit("update", { action: "open_requests" });
      break;
    
    case "counter_proposal":
      // Abrir modal de mis solicitudes
      close();
      emit("update", { action: "open_my_requests" });
      break;
    
    case "contract_sent":
      // Ir a la página de contratos
      close();
      router.push("/contratos");
      break;
    
    case "visit_reminder":
      // Abrir detalles de la propiedad
      if (data.property_id) {
        close();
        router.push(`/propiedades/${data.property_id}`);
      }
      break;

    default:
      break;
  }
};

const markAsRead = async (notificationId: number) => {
  try {
    await notificationService.markAsRead(notificationId);
    const notif = notifications.value.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
    emit("update", { action: "refresh_count" });
  } catch (error) {
    console.error("Error marcando como leída:", error);
  }
};

const markAllAsRead = async () => {
  try {
    await notificationService.markAllAsRead();
    notifications.value.forEach(n => n.read = true);
    emit("update", { action: "refresh_count" });
  } catch (error) {
    console.error("Error marcando todas como leídas:", error);
  }
};

const deleteNotification = async (notificationId: number) => {
  try {
    await notificationService.deleteNotification(notificationId);
    notifications.value = notifications.value.filter(n => n.id !== notificationId);
    emit("update", { action: "refresh_count" });
  } catch (error) {
    console.error("Error eliminando notificación:", error);
  }
};

const getDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Hoy";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Ayer";
  } else {
    return date.toLocaleDateString("es-ES", { 
      day: "numeric", 
      month: "long" 
    });
  }
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-ES", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
};

const getNotificationType = (type: string) => {
  const typeMap: Record<string, string> = {
    rental_request: "primary",
    counter_proposal: "warning",
    contract_sent: "success",
    contract_accepted: "success",
    visit_reminder: "info",
    payment_reminder: "warning",
    system: "info",
  };
  return typeMap[type] || "info";
};

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    rental_request: "fas fa-home",
    counter_proposal: "fas fa-calendar-alt",
    contract_sent: "fas fa-file-contract",
    contract_accepted: "fas fa-check-circle",
    visit_reminder: "fas fa-clock",
    payment_reminder: "fas fa-dollar-sign",
    system: "fas fa-info-circle",
  };
  return iconMap[type] || "fas fa-bell";
};

const close = () => {
  emit("close");
};
</script>

<style scoped>
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

.modal {
  width: 480px;
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

.header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-bottom: 1px solid #ececec;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.mark-all-btn {
  font-size: 13px;
  padding: 6px 12px;
  border: none;
  background: #3498db;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.mark-all-btn:hover {
  background: #2980b9;
}

.close-btn {
  font-size: 26px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #111;
}

.content {
  padding: 20px 24px;
  overflow-y: auto;
  max-height: calc(85vh - 80px);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.date-label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notif-item {
  display: flex;
  gap: 14px;
  background: #f8f8f8;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: 0.2s;
  border-left: 4px solid transparent;
  cursor: pointer;
  position: relative;
}

.notif-item:hover {
  background: #f0f0f0;
  transform: translateX(3px);
}

.notif-item.unread {
  background: #eef6ff;
  border-left-color: #1e90ff;
}

.notif-item.unread::before {
  content: "";
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #1e90ff;
  border-radius: 50%;
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.primary { background: #1e90ff; }
.success { background: #28a745; }
.warning { background: #f1c40f; }
.danger { background: #e74c3c; }


.info {
  flex: 1;
}

.text {
  margin: 0;
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.5;
}

.text strong {
  font-weight: 600;
  color: #1e90ff;
}

.text a {
  color: #1e90ff;
  font-weight: 600;
  text-decoration: none;
}

.text a:hover {
  text-decoration: underline;
}

.time {
  font-size: 12px;
  color: #888;
  margin-top: 6px;
  display: block;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: none;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.notif-item:hover .delete-btn {
  display: flex;
}

.delete-btn:hover {
  background: #f0f0f0;
  color: #e74c3c;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty p {
  font-size: 16px;
  margin: 0;
}

@media (max-width: 768px) {
  .modal {
    width: 95%;
    max-width: 480px;
  }

  .header {
    padding: 16px 20px;
  }

  .content {
    padding: 16px 20px;
  }
}
</style>