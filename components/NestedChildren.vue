<template>
  <div>
    <draggable :list="children" group="pages" @end="onDragEnd" itemKey="id">
      <template #item="{ element: child, index: childIndex }">
        <div :key="child.id" class="flex flex-col gap-2">
          <div class="flex justify-between p-2 px-5 shadow-md items-center rounded bg-red-50">
            <div class="my-2">
              <h3 class="font-medium">{{ child.page_name }}</h3>
            </div>
            <div class="flex gap-5 my-auto">
              <v-switch
                v-model="parentState[childIndex].is_active"
                @change="() => toggleChildPage(child, parentIndex, childIndex)"
                :label="parentState[childIndex].is_active ? 'On' : 'Off'"
                false-value="Off"
                true-value="On"
                color="indigo-darken-4"
                hide-details
                inset
              ></v-switch>

              <!-- Update page name -->
              <button @click="openUpdateModal(child)">
                <Icon name="tabler:edit" class="text-xl" />
              </button>

              <!-- Route to page builder -->
              <NuxtLink :to="`/builder?id=${child.id}`" class="my-auto px-5 py-2 bg-blue-900 text-white rounded-md font-medium">
                Edit
              </NuxtLink>

              <!-- Add sub of subpage if level is less than 3 -->
              <button v-if="child.page_level < 3" @click="openCreatePageModal(true, child.id)">
                <Icon name="ph:plus-bold"></Icon>
              </button>
            </div>
          </div>
          <div v-if="child.children && child.children.length > 0" class="pl-8 p-5 grid gap-2">
            <NestedChildren
              :children="child.children"
              :parent-index="childIndex"
              :parent-state="parentState[childIndex].children"
              @update:children="updateChildren"
              @toggle-child-page="toggleChildPage"
              @open-create-modal="openCreatePageModal"
            ></NestedChildren>
          </div>
        </div>
      </template>
    </draggable>
  </div>

  <!-- Dialog for creating a subpage -->
  <div v-if="createPageModal" class="fixed inset-0 flex justify-center items-start">
    <div class="absolute inset-0 bg-opacity-25 backdrop-blur-sm"></div>
    <div class="relative bg-white p-8 rounded-lg shadow-lg max-w-md w-full z-10">
      <h2 class="text-2xl font-bold mb-6">Create Subpage</h2>
      <div class="mb-4">
        <label for="subpage-title" class="block text-sm font-medium text-gray-700">Subpage Title</label>
        <input v-model="newSubpageTitle" id="subpage-title" placeholder="Enter subpage title" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
      </div>
      <div class="flex items-center justify-end">
        <button @click="createPageModal = false" class="bg-gray-200 text-black rounded-md px-4 py-2 mr-2 hover:bg-gray-300">Cancel</button>
        <button @click="createSubpage(newSubpageTitle, selectedChildPageId)" class="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600">Create</button>
      </div>
    </div>
  </div>

  <!-- Dialog for updating page name -->
  <div v-if="updatePageModal" class="fixed inset-0 flex justify-center items-center">
    <div class="absolute inset-0 bg-opacity-25 backdrop-blur-sm"></div>
    <div class="relative bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto z-10">
      <h2 class="text-2xl font-bold mb-6">Update Page Name</h2>
      <div class="mb-4">
        <label for="update-page-title" class="block text-sm font-medium text-gray-700">New Page Title</label>
        <input v-model="newPageName" id="update-page-title" placeholder="Enter new page title" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
      </div>
      <div class="flex items-center justify-end">
        <button @click="updatePageModal = false" class="bg-gray-200 text-black rounded-md px-4 py-2 mr-2 hover:bg-gray-300">Cancel</button>
        <button @click="updatePageName" class="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600">Update</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import draggable from 'vuedraggable';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const authStore = useAuthStore();

const props = defineProps({
  children: Array,
  parentIndex: Number,
  parentState: Array
});

const emit = defineEmits(['update:children', 'drag-end']);

const updatePageModal = ref(false);
const createPageModal = ref(false); 
const newPageName = ref('');
const childPages = ref([]);
const selectedChild = ref(null);
const newSubpageTitle = ref('');
const selectedChildPageId = ref(null);

const toggleChildPage = (child, parentIndex, childIndex) => {
  emit('toggle-child-page', child, parentIndex, childIndex);
};

const openCreatePageModal = (isSubPage, parentId) => {
  createPageModal.value = true;
  selectedChildPageId.value = parentId; // Set the parent page ID
};

const createSubpage = async (title, parentId) => {
  if (!title.trim()) {
    alert('Subpage title is required.');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/create-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        page_name: title,
        is_under_page: parentId
      })
    });
    const data = await response.json();
    if (data.code === 200) {
      console.log('Subpage created successfully:', data);
      createPageModal.value = false;
      await fetchChildPages(); // Optionally refresh the page list or update local state here
    } else {
      console.error('Failed to create subpage:', data.message);
    }
  } catch (error) {
    console.error('Error creating subpage:', error);
  }
};

const openUpdateModal = (child) => {
  updatePageModal.value = true;
  selectedChild.value = child;
  newPageName.value = child.page_name;
};

const updatePageName = async () => {
  if (!newPageName.value) {
    alert('Page name is required.');
    return;
  }
  if (!selectedChild.value) {
    console.error('No child selected');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/update-page-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        page_id: selectedChild.value.id,
        page_name: newPageName.value
      })
    });

    const data = await response.json();
    if (data.code === 200) {
      console.log('Page name updated successfully:', data);
      const childIndex = props.children.findIndex(child => child.id === selectedChild.value.id);
      if (childIndex !== -1) {
        props.children[childIndex].page_name = newPageName.value;
      }
      updatePageModal.value = false;
    } else {
      console.error('Failed to update page name:', data.message);
    }
  } catch (error) {
    console.error('Error updating page name:', error);
  }
};

const fetchChildPages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/list-page`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    const data = await response.json();
    if (data.code === 200) {
      childPages.value = data.data.Pages;
    } else {
      console.error('Error fetching child pages:', data.message);
    }
  } catch (error) {
    console.error('Error fetching child pages:', error);
  }
};

const onDragEnd = (event) => {
  emit('drag-end', event);
};

onMounted(async () => {
  await authStore.initializeStore();
  await fetchChildPages();
});
</script>

<style scoped>
/* Ensure there's no syntax error or unknown word in your CSS */
</style>
