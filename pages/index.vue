<template>
  <h1 class="text-3xl font-bold text-blue-900 text-center pt-4 pb-6 h-fit">
    Pages
  </h1>
  <div class="mb-5 flex justify-end">
    <button
      v-if="isAdmin"
      @click="openCreatePageModal(false)"
      class="my-auto px-5 p-2 bg-blue-900 text-white rounded-md font-medium"
    >
      Create main page
    </button>
  </div>

  <div class="flex flex-col">
    <draggable v-model="requests" group="pages" itemKey="id" @end="onDragEnd">
      <template #item="{ element: request, index }">
        <div
          :key="request.id"
          class="bg-white p-5 rounded-lg drop-shadow flex flex-col gap-4"
        >
          <div class="flex justify-between">
            <div class="my-4">
              <h2 class="font-bold" @dblclick="enableEditing(request)">
                <input
                  v-if="editablePageId === request.id"
                  v-model="editablePageName"
                  @keyup.enter="updatePageName(request, index)"
                  @blur="updatePageName(request, index)"
                  class="w-full font-bold italic"
                />
                <span v-else>{{ request.page_name }}</span>
              </h2>
            </div>
            <div class="flex gap-5 my-auto">
              <NuxtLink :to="`/builder?id=${request.id}`" class="my-auto">
                <Icon name="ph:note-pencil-bold"></Icon>
              </NuxtLink>
              <button @click="openCreatePageModal(true, request.id)">
                <Icon name="ph:plus-bold"></Icon>
              </button>
            </div>
          </div>

          <div
            v-if="request.children && request.children.length > 0"
            class="pl-8 grid gap-2"
          >
            <NestedChildren
              :children="request.children"
              :parent-index="index"
              :parent-state="childSwitchStates[index]"
              @update:children="updateChildren"
              @toggle-child-page="togglePage"
              @open-create-modal="openCreatePageModal"
            ></NestedChildren>
          </div>
        </div>
      </template>
    </draggable>
  </div>

  <div
    v-if="createPageModal"
    class="fixed inset-0 flex justify-center items-start"
  >
    <div class="absolute inset-0 bg-opacity-25 backdrop-blur-sm"></div>
    <div
      class="relative bg-white p-8 rounded-lg shadow-lg max-w-md w-full z-10"
    >
      <h2 class="text-2xl font-bold mb-6">
        {{ creatingSubPage ? "Create Subpage" : "Create New Page" }}
      </h2>
      <div class="mb-4">
        <label for="page-title" class="block text-sm font-medium text-gray-700"
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
</template>

<script setup>
definePageMeta({
  layout: "usersidebar",
  middleware: "auth",
});
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import NestedChildren from "/components/NestedChildren.vue";
import draggable from "vuedraggable";

const authStore = useAuthStore();

const requests = ref([]);
const childPages = ref([]);
const switchStates = ref([]);
const childSwitchStates = ref([]);
const createPageModal = ref(false);
const creatingSubPage = ref(false);
const newPageTitle = ref("");
const editablePageId = ref(null);
const editablePageName = ref("");
let parentPageId = null;

const isAdmin = computed(() => authStore.userRole === 'admin' || authStore.userRole === 'super_admin');

onMounted(async () => {
  await authStore.initializeStore();
  await fetchPages();
  await fetchChildPages();
});

const enableEditing = (page) => {
  editablePageId.value = page.id;
  editablePageName.value = page.page_name;
};

const fetchPages = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/list-page`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/list-page`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    const data = await response.json();
    if (data.code === 200) {
      childPages.value = collectAllPages(data.data.Pages);
    } else {
      console.error("Error fetching child pages:", data.message);
    }
  } catch (error) {
    console.error("Error fetching child pages:", error);
  }
};

function openCreatePageModal(isSubPage, parentId = null) {
  creatingSubPage.value = isSubPage;
  createPageModal.value = true;
  parentPageId = parentId;
}

async function createPages(pageName) {
  if (!pageName) {
    alert("Title is required.");
    return;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create-page`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        page_name: pageName,
        is_under_page: creatingSubPage.value ? parentPageId : null,
      }),
    });

    const data = await response.json();
    if (data.code === 200) {
      console.log("Page created successfully:", data);
      createPageModal.value = false;
      newPageTitle.value = "";
      parentPageId = null;
      await fetchPages();
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/toggle-page`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
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
      if (childIndex !== null) {
        childSwitchStates.value[parentIndex][childIndex].is_active =
          originalState;
      } else {
        switchStates.value[parentIndex] = originalState;
      }
    }
  } catch (error) {
    if (childIndex !== null) {
      childSwitchStates.value[parentIndex][childIndex].is_active =
        originalState;
    } else {
      switchStates.value[parentIndex] = originalState;
    }
    console.error("Error toggling page:", error);
  }
}

const updatePageName = async (page, index) => {
  if (!editablePageName.value) {
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
        page_id: page.id,
        page_name: editablePageName.value,
      }),
    });

    const data = await response.json();
    if (data.code === 200) {
      requests.value[index].page_name = editablePageName.value;
      console.log("Page name updated successfully:", data);
    } else {
      console.error("Failed to update page name:", data.message);
    }
  } catch (error) {
    console.error("Error updating page name:", error);
  } finally {
    editablePageId.value = null;
  }
};

const buildNestedPayload = (pages, parentId = null, level = 1) => {
  return pages.map((page, index) => ({
    id: page.id,
    page_name: page.page_name,
    page_order: index + 1,
    page_level: level,
    parent_id: parentId,
    children: page.children
      ? buildNestedPayload(page.children, page.id, level + 1)
      : [],
  }));
};

const onDragEnd = async (event) => {
  console.log("Drag end event:", event);

  const payload = {
    Pages: buildNestedPayload(requests.value),
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

const updateChildren = (newChildren, index) => {
  requests.value[index].children = newChildren;
};

const handleUpdateChildren = (newChildren) => {
  children.value = newChildren;
};

const handleDragEndFromChildren = (event) => {
  console.log("Drag ended in parent from child:", event);
};
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
