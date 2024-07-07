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
        <NestedChildren
            level=1
            :children="requests"
            :parent-index="null"
            :parent-state="switchStates"
            @update:children="handleUpdateChildren"
            @toggle-child-page="togglePublish"
            @open-create-modal="openCreatePageModal"
            @open-create-change-request="openCreateChangeRequestModal"
        >
        </NestedChildren>
    </div>

    <v-dialog v-model="createPageModal" max-width="500px">
        <v-card>
            <v-card-title>{{
                creatingSubPage ? "Create Subpage" : "Create New Page"
            }}</v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="newPageTitle"
                    label="Page Title"
                    required
                ></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="createPageModal = false">Cancel</v-btn>
                <v-btn color="blue darken-1" @click="createPages(newPageTitle)"
                    >Create</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="createChangeRequestModal" max-width="500px">
        <v-card>
            <v-card-title>Create Change Request</v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="newChangeRequestTitle"
                    label="Change Request Title"
                    required
                ></v-text-field>
                <v-checkbox
                    v-model="notifyApprover"
                    label="Notify Approver"
                ></v-checkbox>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="createChangeRequestModal = false">Cancel</v-btn>
                <v-btn
                    color="blue darken-1"
                    @click="createChangeRequest(newChangeRequestTitle)"
                    >Create</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
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
import { useToast } from "vue-toast-notification";

const toast = useToast();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authStore = useAuthStore();

const requests = ref([]);
const childPages = ref([]);
const switchStates = ref([]);
const childSwitchStates = ref([]);
const createPageModal = ref(false);
const creatingSubPage = ref(false);
const newPageTitle = ref("");
const newChangeRequestTitle = ref("");
const notifyApprover = ref(false);
const editablePageId = ref(null);
const editablePageName = ref("");
const createChangeRequestModal = ref(false);
const selectedChildPageId = ref(null);
let parentPageId = null;

const isAdmin = computed(
    () => authStore.userRole === "admin" || authStore.userRole === "super_admin"
);

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
        const response = await fetch(`${API_BASE_URL}/list-page`, {
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
        const response = await fetch(`${API_BASE_URL}/list-page`, {
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

function openCreateChangeRequestModal(pageId) {
    selectedChildPageId.value = pageId;
    createChangeRequestModal.value = true;
}

async function createPages(pageName) {
    if (!pageName) {
        alert("Title is required.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/create-page`, {
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

async function createChangeRequest(title) {
    if (!title.trim()) {
        alert("Change request title is required.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/create-change-request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({
                page_id: selectedChildPageId.value,
                request_name: title,
                notify_approver: notifyApprover.value,
            }),
        });
        const data = await response.json();
        if (data.code === 200) {
            console.log("Change request created successfully:", data);
            toast.success("Change request created successfully.");
            createChangeRequestModal.value = false;
            newChangeRequestTitle.value = ""; // Clear the input field
            notifyApprover.value = false; // Reset the checkbox
        } else {
            console.error("Failed to create change request:", data.message);
            toast.error("Failed to create change request.");
        }
    } catch (error) {
        console.error("Error creating change request:", error);
        toast.error("Error creating change request.");
    }
}

async function togglePage(page, parentIndex, childIndex = null) {
    let originalState;
    let newState;

    if (childIndex !== null) {
        originalState =
            childSwitchStates.value[parentIndex][childIndex].is_active;
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
        const response = await fetch(`${API_BASE_URL}/toggle-page`, {
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
        const response = await fetch(`${API_BASE_URL}/update-page-name`, {
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
        const response = await fetch(`${API_BASE_URL}/change-page-order`, {
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

const deletePage = async (page) => {
    try {
        const response = await fetch(`${API_BASE_URL}/delete-page`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ page_id: page.id }),
        });
        const data = await response.json();
        if (data.code === 200) {
            toast.success("Page deleted successfully.");
            // Remove the deleted page from the local state
            requests.value = requests.value.filter((p) => p.id !== page.id);
        } else {
            console.error("Failed to delete page:", data.message);
            toast.error("Failed to delete page.");
        }
    } catch (error) {
        console.error("Error deleting page:", error);
        toast.error("Error deleting page.");
    }
};

const togglePublish = async (page, parentState, childIndex) => {
    if (parentState && !parentState[childIndex]?.is_published) {
        toast.error("Parent Page must be published first");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/toggle-page`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ page_id: page.id }),
        });
        const data = await response.json();
        if (data.code === 200 || data.code === 201) {
            toast.success(
                `Page ${
                    data.data.status === "On" ? "published" : "unpublished"
                } successfully.`
            );
            page.is_published = data.data.status === "On";
            requests.value = [...requests.value];
        } else {
            console.error("Failed to toggle publish state:", data.message);
            toast.error("Failed to toggle publish state.");
        }
    } catch (error) {
        console.error("Error toggling publish state:", error);
        toast.error("Error toggling publish state.");
    }
};
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
