<template>
  <div>
    <draggable :list="children" group="pages" @end="onDragEnd" itemKey="id" >
      <template #item="{ element: child, index: childIndex }">
        <div :key="child.id" class="flex flex-col">
          <div class="flex justify-between p-1 px-5 m-1 shadow items-center rounded bg-red-50">
            <div class="my-4">
              <h3 class="font-medium" @dblclick="enableEditing(child)">
              <input v-if="editablePageId === child.id" v-model="editablePageName" @keyup.enter="updatePageName(child, childIndex)" @blur="updatePageName(child, childIndex)" class="w-full font-bold">
              <span v-else>{{ child.page_name }}</span>
            </h3>
            </div>
            <div class="flex gap-5 my-auto">
              <!-- Add sub of subpage -->
              <button @click="openCreatePageModal(true)">
                <Icon name="ph:plus-bold"></Icon>
              </button>
            </div>
          </div>
          <div v-if="child.children && child.children.length > 0" class="pl-4 grid">
            <MiniSubOfSub
              :children="child.children"
              :parent-index="childIndex"
              :parent-state="parentState[childIndex].children"
              @update:children="updateChildren"
              @toggle-child-page="toggleChildPage"
            ></MiniSubOfSub>
          </div>
        </div>
      </template>
    </draggable>
  </div>

  <!-- Dialog for creating a subpage -->
  <div v-if="createPageModal" class="fixed inset-0 flex justify-center items-start z-10">
    <div class="absolute inset-0 bg-opacity-25 backdrop-blur-sm"></div>
    <div class="relative bg-white p-8 rounded-lg shadow-lg max-w-md w-full z-10">
      <h2 class="text-2xl font-bold mb-6">Create Subpage</h2>
      <div class="mb-4">
        <label for="subpage-title" class="block text-sm font-medium text-gray-700">Subpage Title</label>
        <input v-model="newSubpageTitle" id="subpage-title" placeholder="Enter subpage title" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
      </div>
      <div class="mb-6">
        <label for="page-child" class="block text-sm font-medium text-gray-700">Child Page</label>
        <select v-model="selectedChildPageId" id="page-child" class="block w-full mt-1 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          <option disabled value="">Please select one</option>
          <option value="">None</option>
          <option v-for="page in childPages" :key="page.id" :value="page.id">
            {{ page.page_name }}
          </option>
        </select>
      </div>
      <div class="flex items-center justify-end">
        <button @click="createPageModal = false" class="bg-gray-200 text-black rounded-md px-4 py-2 mr-2 hover:bg-gray-300">Cancel</button>
        <button @click="createSubpage(newSubpageTitle, selectedChildPageId)" class="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import draggable from 'vuedraggable';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toast-notification';

const props = defineProps({
  children: Array,
  parentIndex: Number,
  parentState: Array
});

const emit = defineEmits(['update:children', 'drag-end', 'toggle-child-page']);  

const createPageModal = ref(false); 
const childPages = ref([]);
const newSubpageTitle = ref('');
const selectedChildPageId = ref(null);
const editablePageId = ref(null);
const editablePageName = ref('');
const toast = useToast();
const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initializeStore();
  await fetchChildPages();
});

const toggleChildPage = (child, parentIndex, childIndex) => {
  emit('toggle-child-page', child, parentIndex, childIndex);
};

const openCreatePageModal = (childId) => {
  createPageModal.value = true;
  selectedChildPageId.value = childId; // Set the parent page ID
};

const createSubpage = async (title, parentId) => {
  if (!title.trim()) {
    toast.error('Subpage title is required.');
    return;
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        page_name: title,
        parent_id: parentId
      })
    });
    const data = await response.json();
    if (data.code === 200) {
      toast.success('Subpage created successfully');
      createPageModal.value = false;
      await fetchChildPages();
    } else {
      toast.error('Failed to create subpage: ' + data.message);
    }
  } catch (error) {
    toast.error('Error creating subpage: ' + error.message);
  }
};

const enableEditing = (child) => {
  editablePageId.value = child.id;
  editablePageName.value = child.page_name;
};

const updatePageName = async (child, childIndex) => {
  if (!editablePageName.value.trim()) {
    toast.error('Page name is required.');
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
        page_id: child.id,
        page_name: editablePageName.value
      })
    });

    const data = await response.json();
    if (data.code === 200) {
      props.children[childIndex].page_name = editablePageName.value;
      toast.success('Page name updated successfully');
      editablePageId.value = null;
    } else {
      toast.error('Failed to update page name: ' + data.message);
    }
  } catch (error) {
    toast.error('Error updating page name: ' + error.message);
    editablePageId.value = null;
  }
};

const fetchChildPages = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/list-page`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    const data = await response.json();
    if (data.code === 200) {
      childPages.value = data.data.Pages;
    } else {
      toast.error('Error fetching child pages: ' + data.message);
    }
  } catch (error) {
    toast.error('Error fetching child pages: ' + error.message);
  }
};

const onDragEnd = (event) => {
  emit('drag-end', event);
};
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
