<template>
  <aside class="w-[250px] bg-[#172947] h-auto pb-5">
    <div class="flex justify-between items-center p-4 text-white">
      <h2 class="text-lg font-bold">Pages</h2>
      <Icon
        name="ph:plus-bold"
        color="white"
        @click="openCreatePageModal(false)"
      />
    </div>

    <!-- Draggable main pages -->
    <draggable v-model="requests" item-key="id" @end="onDragEnd">
      <template #item="{ element, index }">
        <div
          :key="element.id"
          class="p-2 m-3 rounded text-sm justify-between shadow-md cursor-move font-normal"
          :class="getItemClass(element.page_level)"
        >
          <div class="flex justify-between">
            <div class="my-4">
              <h2 class="font-bold" @dblclick="enableEditing(element, index)">
                <input
                  v-if="editablePageId === element.id"
                  v-model="editablePageName"
                  @keyup.enter="updatePageName(element, index)"
                  @blur="updatePageName(element, index)"
                  class="w-full font-bold"
                />
                <span v-else>{{ element.page_name }}</span>
              </h2>
            </div>
            <div class="flex gap-5 my-auto">
              <!-- Add subpage -->
              <button @click="openCreatePageModal(true)">
                <Icon name="ph:plus-bold"></Icon>
              </button>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <!-- Dialogs for creating and updating pages -->
    <div
      v-if="createPageModal"
      class="fixed inset-0 flex justify-center items-center z-10"
    >
      <div class="absolute inset-0 bg-opacity-25 backdrop-blur-sm"></div>
      <div
        class="relative bg-white p-8 rounded-lg shadow-lg max-w-md w-full z-10"
      >
        <h2 class="text-2xl font-bold mb-6">Create New Page</h2>
        <div class="mb-4">
          <label
            for="page-title"
            class="block text-sm font-medium text-gray-700"
            >Page Title</label
          >
          <input
            v-model="newPageTitle"
            id="page-title"
            placeholder="Enter page title"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="page-child"
            class="block text-sm font-medium text-gray-700"
            >Child Page</label
          >
          <select
            v-model="selectedChildPage"
            id="page-child"
            class="block w-full mt-1 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option disabled value="">Please select one</option>
            <option value="">None</option>
            <option v-for="page in childPages" :key="page.id" :value="page.id">
              {{ page.page_name }}
            </option>
          </select>
        </div>
        <div class="flex items-center justify-end">
          <button
            @click="createPageModal = false"
            class="bg-gray-200 text-black rounded-md px-4 py-2 mr-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            @click="createPages(newPageTitle)"
            class="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from "vue";

import draggable from "vuedraggable";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: "usersidebar",
});

const authStore = useAuthStore();

const requests = ref([]);
const childPages = ref([]);
const switchStates = ref([]);
const childSwitchStates = ref([]);
const createPageModal = ref(false);
const newPageTitle = ref("");
const selectedChildPage = ref(null);
const editablePageId = ref(null);
const editablePageName = ref("");
const creatingSubPage = ref(false);

onMounted(async () => {
  await authStore.initializeStore();
  await fetchPages();
  await fetchChildPages();
});

const fetchPages = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/list-page`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    const data = await response.json();
    if (data.code === 200) {
      requests.value = data.data.Pages;
      switchStates.value = data.data.Pages.map((page) => page.is_active);
      childSwitchStates.value = data.data.Pages.map((page) =>
        initializeChildStates(page.children)
      );
    } else {
      console.error("Error fetching data:", data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const initializeChildStates = (children) => {
  if (!children || children.length === 0) return [];
  return children.map((child) => ({
    is_active: child.is_active,
    children: initializeChildStates(child.children),
  }));
};

const collectAllPages = (pages) => {
  const allPages = [];

  const traverse = (pages) => {
    for (const page of pages) {
      allPages.push(page);
      if (page.children && page.children.length > 0) {
        traverse(page.children);
      }
    }
  };

  traverse(pages);
  return allPages;
};

const fetchChildPages = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/list-page`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    const data = await response.json();
    if (data.code === 200) {
      childPages.value = collectAllPages(data.data.Pages); // Collect all pages for the dropdown
    } else {
      console.error("Error fetching child pages:", data.message);
    }
  } catch (error) {
    console.error("Error fetching child pages:", error);
  }
};

function openCreatePageModal(isSubPage) {
  creatingSubPage.value = isSubPage;
  createPageModal.value = true;
  if (isSubPage) {
    // Filter for sub pages (level 2)
    childPages.value = collectPagesByLevel(2);
  } else {
    // Filter for main pages (level 1)
    childPages.value = collectPagesByLevel(1);
  }
}

function collectPagesByLevel(level) {
  const allPages = [];

  const traverse = (pages) => {
    for (const page of pages) {
      if (page.page_level === level) {
        allPages.push(page);
      }
      if (page.children && page.children.length > 0) {
        traverse(page.children);
      }
    }
  };

  traverse(requests.value);
  return allPages;
}

async function createPages(pageName) {
  if (!pageName) {
    alert("Title is required.");
    return;
  }
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/create-page`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          page_name: pageName,
          parent_id: creatingSubPage.value ? selectedChildPage.value : null,
        }),
      }
    );

    const data = await response.json();
    if (data.code === 200) {
      createPageModal.value = false; // Close the modal
      newPageTitle.value = ""; // Reset the form fields
      selectedChildPage.value = null; // Reset the selected child page
      await fetchPages(); // Fetch updated pages
    } else {
      console.error("Failed to create page:", data.message);
    }
  } catch (error) {
    console.error("Error creating page:", error);
  }
}

async function togglePage(page, parentIndex, childIndex = null) {
  let originalState;
  let newState;

  if (childIndex !== null) {
    originalState = childSwitchStates.value[parentIndex][childIndex].is_active;
    newState = !originalState;
    childSwitchStates.value[parentIndex][childIndex].is_active = newState;
  } else {
    originalState = switchStates.value[parentIndex];
    newState = !originalState;
    switchStates.value[parentIndex] = newState;
  }

  const payload = {
    page_id: page.id,
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/toggle-page`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    // Log the response data to debug

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (data.code === 200 || data.code === 201) {
      if (childIndex !== null) {
        childSwitchStates.value[parentIndex][childIndex].is_active =
          data.new_state;
      } else {
        switchStates.value[parentIndex] = data.new_state;
      }
    } else {
      console.error("Failed to toggle page:", data.message);
      if (childIndex !== null) {
        childSwitchStates.value[parentIndex][childIndex].is_active =
          originalState;
      } else {
        switchStates.value[parentIndex] = originalState;
      }
    }
  } catch (error) {
    console.error("Error toggling page:", error.message);
    if (childIndex !== null) {
      childSwitchStates.value[parentIndex][childIndex].is_active =
        originalState;
    } else {
      switchStates.value[parentIndex] = originalState;
    }
  }
}

const enableEditing = (element, index) => {
  editablePageId.value = element.id;
  editablePageName.value = element.page_name;
};

const updatePageName = async (element, index) => {
  if (!editablePageName.value) {
    alert("Page name is required.");
    return;
  }
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/update-page-name`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          page_id: element.id,
          page_name: editablePageName.value,
        }),
      }
    );

    const data = await response.json();
    if (data.code === 200) {
      requests.value[index].page_name = editablePageName.value; // Update local state

      editablePageId.value = null; // Close editing mode
    } else {
      console.error("Failed to update page name:", data.message);
      toast.error(data.message);
    }
  } catch (error) {
    console.error("Error updating page name:", error);
  }
};

const onDragEnd = async (evt) => {
  // Prepare the payload for the API call
  const pagesOrder = requests.value.map((page, index) => ({
    id: page.id,
    page_order: index + 1, // assuming your page order starts at 1
    children: page.children.map((child, idx) => ({
      id: child.id,
      page_order: idx + 1, // similarly for children
    })),
  }));

  const payload = {
    Pages: pagesOrder,
  };

  // Call the API to update the page order on the backend
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/change-page-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`, // ensure you replace 'token' with your actual token
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (data.code === 200) {
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
      return "bg-white";
    case 2:
      return "bg-red-100";
    case 3:
      return "bg-blue-100";
    default:
      return "bg-white";
  }
};
</script>

<style scoped>
@import "@/assets/css/style.css";
.text-green-500 {
  color: green;
}
.text-orange-500 {
  color: orange;
}
.text-red-500 {
  color: red;
}
</style>
