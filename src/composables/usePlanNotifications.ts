import { onUnmounted, ref } from "vue";

export function usePlanNotifications() {
  const notice = ref("");
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const showNotice = (message: string) => {
    notice.value = message;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      notice.value = "";
      timeout = undefined;
    }, 4000);
  };

  onUnmounted(() => {
    if (timeout) clearTimeout(timeout);
  });

  return { notice, showNotice };
}
