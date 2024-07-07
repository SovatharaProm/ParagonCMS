<template>
  <div>
    <draggable :list="children" group="pages" @end="onDragEnd" itemKey="id">
      <template #item="{ element: child, index: childIndex }">
        <div :key="child.id" class="flex flex-col">
          <div class="flex justify-between m-1 p-2 px-5 shadow items-center rounded bg-red-50">
            <div class="my-2">
              <h3 class="font-medium" @dblclick="enableEditing(child)">
                <input
                  v-if="editablePageId === child.id"
                  v-model="editablePageName"
                  @keyup.enter="updatePageName(child, childIndex)"
                  @blur="updatePageName(child, childIndex)"
                  class="w-full font-bold italic"
                />
                <span v-else>{{ child.page_name }}</span>
              </h3>
            </div>
            <div class="flex gap-5 my-auto">
              <NuxtLink :to="`/builder?id=${child.id}`" class="my-auto">
                <Icon name="ph:note-pencil-bold"></Icon>
              </NuxtLink>
              <button @click="openCreatePageModal(true, child.id)">
                <Icon name="ph:plus-bold"></Icon>
              </button>
              <button @click="openCreateChangeRequestModal(child.id)">
                <Icon name="ph:file-plus-bold"></Icon>
              </button>
            </div>
          </div>
          <div v-if="child.children && child.children.length > 0" class="pl-8">
            <SubOfSub
              :children="child.children"
              :parent-index="childIndex"
              :parent-state="parentState[childIndex]?.children || []"
              @update:children="updateChildren(childIndex, $event)"
              @toggle-child-page="toggleChildPage"
              @open-create-modal="openCreatePageModal"
              @open-create-change-request="openCreateChangeRequestModal"
            ></SubOfSub>
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
        <input
          v-model="newSubpageTitle"
          id="subpage-title"
          placeholder="Enter subpage title"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div class="flex items-center justify-end">
        <button @click="createPageModal = false" class="bg-gray-200 text-black rounded-md px-4 py-2 mr-2 hover:bg-gray-300">Cancel</button>
        <button @click="createSubpage(newSubpageTitle)" class="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600">Create</button>
      </div>
    </div>
  </div>

  <!-- Dialog for creating a change request -->
  <div v-if="createChangeRequestModal" class="fixed inset-0 flex justify-center items-start">
    <div class="absolute inset-0 bg-opacity-25 backdrop-blur-sm"></div>
    <div class="relative bg-white p-8 rounded-lg shadow-lg max-w-md w-full z-10">
      <h2 class="text-2xl font-bold mb-6">Create Change Request</h2>
      <div class="mb-4">
        <label for="change-request-title" class="block text-sm font-medium text-gray-700">Change Request Title</label>
        <input
          v-model="newChangeRequestTitle"
          id="change-request-title"
          placeholder="Enter change request title"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div class="flex items-center justify-end">
        <button @click="createChangeRequestModal = false" class="bg-gray-200 text-black rounded-md px-4 py-2 mr-2 hover:bg-gray-300">Cancel</button>
        <button @click="createChangeRequest(newChangeRequestTitle)" class="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import draggable from 'vuedraggable';
import SubOfSub from './SubOfSub.vue';
import { useAuthStore } from '~/stores/auth';

const props = defineProps({
  children: Array,
  parentIndex: Number,
  parentState: Array,
});

const emit = defineEmits(['update:children', 'drag-end', 'toggle-child-page', 'open-create-modal', 'open-create-change-request']);

const authStore = useAuthStore();

const createPageModal = ref(false);
const createChangeRequestModal = ref(false);
const childPages = ref([]);
const newSubpageTitle = ref('');
const newChangeRequestTitle = ref('');
const selectedChildPageId = ref(null);
const editablePageId = ref(null);
const editablePageName = ref('');
const creatingSubPage = ref(false);
const parentPageId = ref(null);

onMounted(async () => {
  await fetchChildPages();
});

const enableEditing = (child) => {
  editablePageId.value = child.id;
  editablePageName.value = child.page_name;
};

const updatePageName = async (child, childIndex) => {
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
        page_id: child.id,
        page_name: editablePageName.value
      })
    });

    const data = await response.json();
    if (data.code === 200) {
      props.children[childIndex].page_name = editablePageName.value; // Correctly update local state
      emit('update:children', [...props.children]); // Emit updated children
      console.log('Page name updated successfully:', data);
      editablePageId.value = null; // Exit editing mode
    } else {
      console.error('Failed to update page name:', data.message);
    }
  } catch (error) {
    console.error('Error updating page name:', error);
    editablePageId.value = null; // Ensure to exit editing mode in case of error
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
      console.error('Error fetching child pages:', data.message);
    }
  } catch (error) {
    console.error('Error fetching child pages:', error);
  }
};

const openCreatePageModal = (isSubPage, parentId = null) => {
  creatingSubPage.value = isSubPage;
  createPageModal.value = true;
  parentPageId.value = parentId;
};

const openCreateChangeRequestModal = (pageId) => {
  selectedChildPageId.value = pageId;
  createChangeRequestModal.value = true;
};

const createSubpage = async (title) => {
  if (!title.trim()) {
    alert('Subpage title is required.');
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
        is_under_page: creatingSubPage.value ? parentPageId.value : null,
      })
    });
    const data = await response.json();
    if (data.code === 200) {
      console.log('Subpage created successfully:', data);
      // Update the local state to show the newly created subpage
      const parent = findPageById(parentPageId.value, props.children);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(data.data);
        emit('update:children', [...props.children]); // Emit updated children
      } else {
        console.error('Parent page not found');
      }
      createPageModal.value = false; // Close the modal after creation
      newSubpageTitle.value = ''; // Clear the input field
    } else {
      console.error('Failed to create subpage:', data.message);
    }
  } catch (error) {
    console.error('Error creating subpage:', error);
  }
};

const createChangeRequest = async (title) => {
  if (!title.trim()) {
    alert('Change request title is required.');
    return;
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create-change-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        page_id: selectedChildPageId.value,
        request_name: title,
      })
    });
    const data = await response.json();
    if (data.code === 200) {
      console.log('Change request created successfully:', data);
      createChangeRequestModal.value = false;
      newChangeRequestTitle.value = ''; // Clear the input field
    } else {
      console.error('Failed to create change request:', data.message);
    }
  } catch (error) {
    console.error('Error creating change request:', error);
  }
};

const findPageById = (id, pages) => {
  for (let page of pages) {
    if (page.id === id) return page;
    if (page.children) {
      const found = findPageById(id, page.children);
      if (found) return found;
    }
  }
  return null;
};

const buildNestedPayload = (pages, parentId = null, level = 1) => {
  return pages.map((page, index) => ({
    id: page.id,
    page_name: page.page_name,
    page_order: index + 1,
    page_level: level,
    parent_id: parentId,
    children: page.children ? buildNestedPayload(page.children, page.id, level + 1) : []
  }));
};

const onDragEnd = async (event) => {
  console.log('Drag end event:', event);

  const payload = {
    Pages: buildNestedPayload(props.children)
  };

  console.log('Payload being sent:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/change-page-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.code === 200) {
      console.log('Page order updated successfully:', data);
      emit('update:children', [...props.children]); // Emit updated children
    } else {
      console.error('Failed to update page order:', data.message);
    }
  } catch (error) {
    console.error('Error updating page order:', error);
  }
};

const updateChildren = (childIndex, newChildren) => {
  if (props.children[childIndex]) {
    if (props.children[childIndex].children) {
      props.children[childIndex].children = newChildren;
    } else {
      props.children[childIndex] = { ...props.children[childIndex], children: newChildren };
    }
    emit('update:children', [...props.children]);
  } else {
    console.error(`Child at index ${childIndex} not found`);
  }
};
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
