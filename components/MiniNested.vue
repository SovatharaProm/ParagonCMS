<template>
    <div>
      <draggable :list="children" group="pages" @end="onDragEnd" itemKey="id" >
        <template #item="{ element: child, index: childIndex }">
          <div :key="child.id" class="flex flex-col gap-2">
            <div class="flex justify-between p-2 px-5 shadow-md items-center rounded bg-red-50">
              <div class="my-4">
                <h3 class="font-medium">{{ child.page_name }}</h3>
              </div>
              <div class="flex gap-5 my-auto">
  
                <!-- Update page name -->
                <button @click="openUpdateModal(child)">
                  <Icon name="tabler:edit" class="text-xl" />
                </button>
  
                <!-- Add sub of subpage -->
                <button @click="openCreatePageModal(true)">
                  <Icon name="ph:plus-bold"></Icon>
                </button>
              </div>
            </div>
            <div v-if="child.children && child.children.length > 0" class="pl-8 p-5 grid gap-2">
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
    <div v-if="createPageModal" class="fixed inset-0 flex justify-center items-start">
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
  
  onMounted(async () => {
    await fetchChildPages();
  });
  
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
  const token = '1094|UKAYk5Noen0Xy3IZ8Jr48ehZHHDtpm18pBHRHv4af74b8b7b:::admin';
  
  
  const toggleChildPage = (child, parentIndex, childIndex) => {
    emit('toggle-child-page', child, parentIndex, childIndex);
  };
  
  const openCreatePageModal = (childId) => {
    createPageModal.value = true;
    selectedChildPageId.value = childId; // Set the parent page ID
  };
  
  const createSubpage = async (title, parentId) => {
    if (!title.trim()) {
      alert('Subpage title is required.');
      return;
    }
    try {
      const response = await fetch('http://157.230.37.48/api/create-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          page_name: title, // Changed from title to page_name to match likely API expectations
          parent_id: parentId
        })
      });
      const data = await response.json();
      if (data.code === 200) { // Check the actual successful response code or property
        console.log('Subpage created successfully:', data);
        createPageModal.value = false;
        // Optionally refresh the page list or update local state here
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
    newPageName.value = child.page_name; // Pre-fill current page name
  };
  
  const updatePageName = async () => {
    if (!newPageName.value) {
      alert('Page name is required.');
      return;
    }
    if (!selectedChild.value) {
      console.error('No child selected'); // Correct error handling
      return;
    }
    try {
      const response = await fetch('http://157.230.37.48/api/update-page-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          page_id: selectedChild.value.id, // Corrected to selectedChild
          page_name: newPageName.value
        })
      });
  
      const data = await response.json();
      if (data.code === 200) {
        console.log('Page name updated successfully:', data);
        // Update local state to reflect the new page name
        const childIndex = props.children.findIndex(child => child.id === selectedChild.value.id);
        if (childIndex !== -1) {
          props.children[childIndex].page_name = newPageName.value;
        }
        updatePageModal.value = false; // Close the modal
      } else {
        console.error('Failed to update page name:', data.message);
      }
    } catch (error) {
      console.error('Error updating page name:', error);
    }
  };
  
  const fetchChildPages = async () => {
    try {
      const response = await fetch('http://157.230.37.48/api/list-page', {
        headers: {
          'Authorization': `Bearer ${token}`
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
  
  </script>
  
  <style scoped>
  /* Ensure there's no syntax error or unknown word in your CSS */
  </style>