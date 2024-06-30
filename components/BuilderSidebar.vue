<template>
  <aside class="w-[250px] bg-[#172947] h-auto pb-5">
    <div class="flex justify-between items-center p-4 text-white">
      <h2 class="text-lg font-semibold">Pages</h2>
      <div @click="addPage" class="cursor-pointer">
        <Icon name="ph:plus-bold" color="white" />
      </div>
    </div>

    <div 
      v-for="(page, index) in pages" 
      :key="page.id" 
      class="group">
      <div
        draggable="true"
        @dragstart="dragStart(index)"
        @dragover.prevent="allowDrop"
        @drop="drop(index)"
        class="p-2 m-3 bg-white rounded flex text-sm justify-between align-center shadow-md cursor-move">
        <Icon name="ph:list-bold" color="gray" />
        <span>{{ page.page_name }}</span>
        <div class="">
          <Icon name="ph:pencil-simple-duotone" color="gray" @click.stop="editPage"/>
        </div>
      </div>
      
      <!-- Dropdown -->
      <div v-if="page.showDropdown" class="p-2 m-4 font-italic bg-[#F0F7FF] rounded flex text-sm justify-between align-center shadow-md cursor-move">
        <Icon name="ph:list-bold" color="gray" />
        <span>More info about {{ page.page_name }}</span>
        <Icon name="ph:pencil-simple-duotone" color="gray" @click.stop="editPage"/>
      </div>
    </div>
  </aside>
</template>
  
<script setup>
import { ref } from 'vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const pages = ref([
  { id: 1, page_name: "Home", showDropdown: true },
  { id: 2, page_name: "About", showDropdown: true },
  { id: 3, page_name: "Paragon Student", showDropdown: true },
  { id: 4, page_name: "Prospective Student", showDropdown: true },
  { id: 5, page_name: "Academics", showDropdown: true },
  { id: 6, page_name: "Admission", showDropdown: true },
  { id: 7, page_name: "Partnership", showDropdown: true },
]);

let nextId = 8; // Initialize a variable to keep track of the next ID

const addPage = async () => {
  console.log('addPage function called'); // Debugging log
  const newPageName = `New Page ${nextId}`;
  try {
    const response = await fetch(`${API_BASE_URL}/create-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_name: newPageName,
        endpoint: newPageName.toLowerCase().replace(/ /g, '-'),
        is_under_page: null,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create page');
    }

    const result = await response.json();
    pages.value.push({
      id: result.data.page_detail.id,
      page_name: result.data.page_detail.page_name,
      showDropdown: false,
    });
    nextId++; // Increment the next ID
  } catch (error) {
    console.error('Error creating page:', error);
  }
};

const editPage = () => {
  // Implement your edit page logic here
};

const toggleDropdown = (index) => {
  pages.value[index].showDropdown = !pages.value[index].showDropdown;
};

let draggedIndex = ref(null);

const dragStart = (index) => {
  draggedIndex.value = index;
};

const drop = (index) => {
  const itemToMove = pages.value.splice(draggedIndex.value, 1)[0];
  pages.value.splice(index, 0, itemToMove);
  draggedIndex.value = null; // Reset the dragged index after dropping
};

const allowDrop = (event) => {
  event.preventDefault();
};
</script>
