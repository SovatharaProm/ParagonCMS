<template>
  <div>
    <draggable :list="children" group="{ name: 'subchildren', pull: false, put: false }" @end="onDragEnd" item-key="id">
      <template #item="{ element, index }">
        <div class="flex flex-col">
          <div class="flex justify-between p-2 m-1 px-5 shadow rounded bg-sky-50">
            <div class="my-2">
              <h3 class="font-medium" @dblclick="enableEditing(element, index)">
                <input
                  v-if="editablePageId === element.id"
                  v-model="editablePageName"
                  @keyup.enter="updatePageName(element, index)"
                  @blur="updatePageName(element, index)"
                  class="w-full font-bold italic"
                />
                <span v-else>{{ element.page_name }}</span>
              </h3>
            </div>
            <div class="flex gap-5 my-auto">
              <NuxtLink :to="`/builder?id=${element.id}`" class="my-auto">
                <Icon name="ph:note-pencil-bold"></Icon>
              </NuxtLink>
            </div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import draggable from "vuedraggable";

const props = defineProps({
  children: Array,
  parentIndex: Number,
  parentState: Array,
});

const emit = defineEmits(["update:children", "drag-end", "toggle-child-page"]);
const editablePageId = ref(null);
const editablePageName = ref("");
const authStore = useAuthStore();

const enableEditing = (element, index) => {
  editablePageId.value = element.id;
  editablePageName.value = element.page_name;
};

const updatePageName = async (element, index) => {
  if (!editablePageName.value.trim()) {
    alert("Page name is required.");
    return;
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update-page-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        page_id: element.id,
        page_name: editablePageName.value,
      }),
    });

    const data = await response.json();
    if (data.code === 200) {
      props.children[index].page_name = editablePageName.value; // Update local state
      console.log("Page name updated successfully:", data);
      editablePageId.value = null; // Exit editing mode
    } else {
      console.error("Failed to update page name:", data.message);
    }
  } catch (error) {
    console.error("Error updating page name:", error);
    editablePageId.value = null; // Ensure to exit editing mode in case of error
  }
};

const buildNestedPayload = (pages, level = 1) => {
  return pages.map((page, index) => ({
    id: page.id,
    page_name: page.page_name,
    page_order: index + 1,
    page_level: level,
    children: page.children ? buildNestedPayload(page.children, page.id, level + 1) : [],
  }));
};

const onDragEnd = async (event) => {
  console.log("Drag end event:", event);

  const payload = {
    Pages: buildNestedPayload(props.children),
  };

  console.log("Payload being sent:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/change-page-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.code === 200) {
      console.log("Page order updated successfully:", data);
    } else {
      console.error("Failed to update page order:", data.message);
    }
  } catch (error) {
    console.error("Error updating page order:", error);
  }
};
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
