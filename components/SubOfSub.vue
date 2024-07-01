<template>
    <draggable :list="children" @end="onDragEnd" item-key="id">
        <template #item="{ element, index }">
        <div class="flex flex-col gap-2">
            <div class="flex justify-between p-2 px-5 shadow-md items-center rounded bg-sky-50">
            <div class="my-4">
                <h3 class="font-medium">{{ element.page_name }}</h3>
            </div>
            <div class="flex gap-5 my-auto">
                <v-switch
                :value="parentState[index].is_active"
                @change="() => toggleChildPage(element, parentIndex, index)"
                :label="parentState[index].is_active ? 'On' : 'Off'"
                false-value="Off"
                true-value="On"
                color="indigo-darken-4"
                hide-details
                inset
                ></v-switch>

                <!-- Update page name -->
                <button @click="openUpdateModal(element)">
                <Icon name="tabler:edit" class="text-xl" />
                </button>

                <!-- Route to page builder -->
                <NuxtLink :to="`/builder?id=${element.id}`" class="my-auto px-5 py-2 bg-blue-900 text-white rounded-md font-medium">
                Edit
                </NuxtLink>

            </div>
            </div>
            <div v-if="element.children && element.children.length > 0" class="pl-8 p-3 grid gap-2">
            <SubOfSub
                :children="element.children"
                :parent-index="index"
                :parent-state="parentState[index].children"
                @toggle-child-page="toggleChildPage"
            ></SubOfSub>
            </div>
        </div>
        </template>
    </draggable>



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
import { ref, defineProps, defineEmits } from 'vue';
import draggable from 'vuedraggable';

const props = defineProps({
children: Array,
parentIndex: Number,
parentState: Array
});

const emit = defineEmits(['update:children', 'drag-end', 'toggle-child-page']);

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

const onDragEnd = (event) => {
  emit('drag-end', event);
};

</script>
