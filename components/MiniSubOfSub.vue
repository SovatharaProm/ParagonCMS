<template>
  <draggable :list="children" group="pages" @end="onDragEnd" item-key="id">
    <template #item="{ element, index }">
      <div class="flex flex-col">
        <div class="flex justify-between m-1 px-5 shadow rounded" :class="getItemClass(element.page_level)">
          <div class="my-4">
            <h3 class="font-medium" @dblclick="enableEditing(element, index)">
              <input
                v-if="editablePageId === element.id"
                v-model="editablePageName"
                @keyup.enter="updatePageName(element, index)"
                @blur="updatePageName(element, index)"
                class="w-full font-bold"
              />
              <span v-else>{{ element.page_name }}</span>
            </h3>
          </div>
          <div class="flex gap-5 my-auto">
            <button @click="openCreatePageModal(true, element.id)">
              <Icon name="ph:plus-bold"></Icon>
            </button>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
              </template>
              <v-list>
                <v-list-item @click="openCreateChangeRequestModal(element.id)">
                  <v-list-item-title>Create Change Request</v-list-item-title>
                </v-list-item>
                <v-list-item @click="togglePageInNav(element)">
                  <v-list-item-title>{{ element.is_in_nav ? 'Remove from Navigation' : 'Add to Navigation' }}</v-list-item-title>
                </v-list-item>
                <v-list-item @click="deletePage(element)">
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
        <div v-if="element.children && element.children.length > 0" class="pl-8">
          <MiniNested
            :children="element.children"
            :parent-index="index"
            :parent-state="parentState[index]?.children || []"
            @update:children="updateChildren(index, $event)"
            @toggle-child-page="togglePage"
          ></MiniNested>
        </div>
      </div>
    </template>
  </draggable>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import draggable from 'vuedraggable';

const authStore = useAuthStore();

const props = defineProps({
  children: Array,
  parentIndex: Number,
  parentState: Array
});

const emit = defineEmits(['update:children', 'drag-end', 'toggle-child-page']);

const editablePageId = ref(null);
const editablePageName = ref('');

const enableEditing = (element, index) => {
  editablePageId.value = element.id;
  editablePageName.value = element.page_name;
};

const updatePageName = async (element, index) => {
  if (!editablePageName.value.trim()) {
    alert('Page name is required.');
    return;
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update-page-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        page_id: element.id,
        page_name: editablePageName.value
      })
    });

    const data = await response.json();
    if (data.code === 200) {
      props.children[index].page_name = editablePageName.value; // Update local state
      console.log('Page name updated successfully:', data);
      editablePageId.value = null; // Exit editing mode
    } else {
      console.error('Failed to update page name:', data.message);
      toast.error(data.message);
    }
  } catch (error) {
    console.error('Error updating page name:', error);
    editablePageId.value = null; // Ensure to exit editing mode in case of error
  }
};

const buildNestedPayload = (pages, level = 1) => {
  return pages.map((page, index) => ({
    id: page.id,
    page_name: page.page_name,
    page_order: index + 1,
    page_level: level,
    children: page.children ? buildNestedPayload(page.children, level + 1) : [],
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

const getItemClass = (level) => {
  switch (level) {
    case 1:
      return 'bg-white';
    case 2:
      return 'bg-sky-50';
    case 3:
      return 'bg-blue-50';
    default:
      return '';
  }
};
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
