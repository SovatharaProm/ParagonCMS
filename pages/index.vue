<template>
  <h1 class="text-3xl font-bold text-blue-900 text-center pt-4 pb-6 h-fit">
    Pages
  </h1>
  <div class="my-5 flex justify-end">
    <button
      @click="openCreatePageModal(false)"
      class="my-auto px-5 py-2 bg-blue-900 text-white rounded-md font-medium"
    >
      Create main page
    </button>
  </div>

  <div class="flex flex-col gap-5">
    <draggable v-model="requests" group="pages" itemKey="id" @end="onDragEnd">
      <template #item="{ element: request, index }">
        <div
          :key="request.id"
          class="bg-white p-5 rounded-lg drop-shadow flex flex-col gap-4"
        >
          <div class="flex justify-between">
            <div class="my-4">
              <h2 class="font-bold">{{ request.page_name }}</h2>
            </div>
            <div class="flex gap-5 my-auto">
              <v-switch
                v-model="switchStates[index]"
                @change="togglePage(request, index)"
                :label="switchStates[index] ? 'On' : 'Off'"
                false-value="Off"
                true-value="On"
                color="indigo-darken-4"
                hide-details
                inset
              ></v-switch>

              <!-- Update page name -->
              <button @click="openUpdateModal(request)">
                <Icon name="tabler:edit" class="text-xl" />
              </button>

              <!-- Route to page builder -->
              <NuxtLink
                :to="`/builder?id=${request.id}`"
                class="my-auto px-5 py-2 bg-blue-900 text-white rounded-md font-medium"
              >
                Edit
              </NuxtLink>

              <!-- Add subpage -->
              <button @click="openCreatePageModal(true)">
                <Icon name="ph:plus-bold"></Icon>
              </button>

              <!-- Create Change Request -->
              <button @click="openCreateChangeRequestDialog(request)">
                <Icon name="ph:git-pull-request-bold" class="text-xl" />
              </button>
            </div>
          </div>

          <!-- Create children page -->
          <div
            v-if="request.children && request.children.length > 0"
            class="pl-8 p-5 grid gap-2"
          >
            <NestedChildren
              :children="request.children"
              :parent-index="index"
              :parent-state="childSwitchStates[index]"
              @update:children="updateChildren"
              @toggle-child-page="togglePage"
            ></NestedChildren>
          </div>
        </div>
      </template>
    </draggable>
  </div>

  <!-- Dialogs for creating and updating pages -->
  <div
    v-if="createPageModal"
    class="fixed inset-0 flex justify-center items-start"
  >
    <div class="absolute inset-0 bg-opacity-25 backdrop-blur-sm"></div>
    <div
      class="relative bg-white p-8 rounded-lg shadow-lg max-w-md w-full z-10"
    >
      <h2 class="text-2xl font-bold mb-6">Create New Page</h2>
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
      <div class="mb-6">
        <label for="page-child" class="block text-sm font-medium text-gray-700"
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

  <div
    v-if="updatePageModal"
    class="fixed mx-auto inset-0 flex justify-center items-center"
  >
    <div class="absolute inset-0 bg-opacity-25 backdrop-blur-sm"></div>
    <div
      class="relative bg-white p-8 rounded-lg shadow-lg max-w-md w-full z-10"
    >
      <h2 class="text-2xl font-bold mb-6">Update Page Name</h2>
      <div class="mb-4">
        <label
          for="update-page-title"
          class="block text-sm font-medium text-gray-700"
          >New Page Title</label
        >
        <input
          v-model="newPageName"
          id="update-page-title"
          placeholder="Enter new page title"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div class="flex items-center justify-end">
        <button
          @click="updatePageModal = false"
          class="bg-gray-200 text-black rounded-md px-4 py-2 mr-2 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          @click="updatePageName(selectedPage)"
          class="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600"
        >
          Update
        </button>
      </div>
    </div>
  </div>

  <v-dialog v-model="isChangeRequestDialogOpen" max-width="600px">
    <template #activator="{ on, attrs }"></template>
    <v-card>
      <v-card-title class="text-2xl text-blue-900 font-bold"
        >Create Change Request</v-card-title
      >
      <v-card-text>
        <form @submit.prevent="createChangeRequest">
          <div class="mb-4">
            <label
              for="changeRequestName"
              class="block text-gray-700 font-bold mb-2"
              >Change Request Name</label
            >
            <input
              type="text"
              v-model="newChangeRequestName"
              id="changeRequestName"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div class="mb-4">
            <label
              for="notifyApprover"
              class="flex items-center cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="notifyApprover"
                id="notifyApprover"
                class="m-10px mr-2 leading-tight"
              />
              <span class="text-blue-900 font-bold ">Notify Approver</span>
            </label>
          </div>
        </form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-4 text-md font-bold"
          text
          @click="closeChangeRequestDialog"
          >Cancel</v-btn
        >
        <v-btn
          color="blue-darken-4 text-md font-bold"
          text
          @click="createChangeRequest"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "vue-toast-notification";
import NestedChildren from "/components/NestedChildren.vue";
import draggable from "vuedraggable";

const toast = useToast();
const requests = ref([]);
const childPages = ref([]);
const switchStates = ref([]);
const childSwitchStates = ref([]);
const createPageModal = ref(false);
const creatingSubPage = ref(false);
const newPageTitle = ref("");
const selectedChildPage = ref(null);
const updatePageModal = ref(false);
const newPageName = ref("");
const selectedPage = ref(null);
const token = "1094|UKAYk5Noen0Xy3IZ8Jr48ehZHHDtpm18pBHRHv4af74b8b7b:::admin";

const isChangeRequestDialogOpen = ref(false);
const currentRequest = ref({});
const newChangeRequestName = ref("");
const notifyApprover = ref(false);

definePageMeta({
  layout: "usersidebar",
  middleware: "auth",
});
onMounted(async () => {
  await fetchPages();
  await fetchChildPages();
});

const fetchPages = async () => {
  try {
    const response = await fetch("http://157.230.37.48/api/list-page", {
      headers: {
        Authorization: `Bearer ${token}`,
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
    const response = await fetch("http://157.230.37.48/api/list-page", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
    const response = await fetch("http://157.230.37.48/api/create-page", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        page_name: pageName,
        parent_id: creatingSubPage.value ? selectedChildPage.value : null,
      }),
    });

    const data = await response.json();
    if (data.code === 200) {
      console.log("Page created successfully:", data);
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

  console.log("Request payload:", payload);

  try {
    const response = await fetch("http://157.230.37.48/api/toggle-page", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(data); // Log the response data to debug

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (data.code === 200 || data.code === 201) {
      console.log("Toggle success:", data.message);
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

function openUpdateModal(page) {
  console.log("Opening modal for page:", page); // Add this line to debug
  updatePageModal.value = true;
  selectedPage.value = page;
  newPageName.value = page.page_name; // Pre-fill current page name
}

async function updatePageName() {
  if (!newPageName.value) {
    alert("Page name is required.");
    return;
  }
  if (!selectedPage.value) {
    console.error("No page selected"); // Add error handling
    return;
  }
  try {
    const response = await fetch("http://157.230.37.48/api/update-page-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        page_id: selectedPage.value.id, // Use selectedPage.value here
        page_name: newPageName.value,
      }),
    });

    const data = await response.json();
    if (data.code === 200) {
      console.log("Page name updated successfully:", data);
      updatePageModal.value = false; // Close the modal
      await fetchPages(); // Refresh the list of pages
    } else {
      console.error("Failed to update page name:", data.message);
    }
  } catch (error) {
    console.error("Error updating page name:", error);
  }
}

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
    const response = await fetch("http://157.230.37.48/api/change-page-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
  // Handle the reordering or moving logic here
};

const openCreateChangeRequestDialog = (page) => {
  currentRequest.value = page;
  isChangeRequestDialogOpen.value = true;
};

const closeChangeRequestDialog = () => {
  isChangeRequestDialogOpen.value = false;
  currentRequest.value = {};
  newChangeRequestName.value = "";
  notifyApprover.value = false;
};

const createChangeRequest = async () => {
  try {
    const response = await fetch(
      "http://157.230.37.48/api/create-change-request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          page_id: currentRequest.value.id,
          request_name: newChangeRequestName.value,
          notify_approver: notifyApprover.value,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create change request");
    }

    const result = await response.json();
    console.log("Change request created:", result);

    toast.success("Change request created successfully");
    closeChangeRequestDialog();
  } catch (error) {
    console.error("Error creating change request:", error);
    toast.error("Failed to create change request");
  }
};
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
