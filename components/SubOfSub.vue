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
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
                </template>
                <v-list>
                  <v-list-item @click="openCreateChangeRequestModal(child.id)">
                    <v-list-item-title>Create Change Request</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openCreatePageModal(true, child.id)">
                    <v-list-item-title>Create Subpage</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-switch v-model="child.is_published" @change="togglePublish(child)"></v-switch>
                  </v-list-item>
                  <v-list-item @click="deletePage(child)">
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
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

    <v-dialog v-model="createChangeRequestModal" max-width="500px">
      <v-card>
        <v-card-title>Create Change Request</v-card-title>
        <v-card-text>
          <v-text-field v-model="newChangeRequestTitle" label="Change Request Title" required></v-text-field>
          <v-checkbox v-model="notifyApprover" label="Notify Approver"></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="createChangeRequestModal = false">Cancel</v-btn>
          <v-btn color="blue darken-1" @click="createChangeRequest(newChangeRequestTitle)">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import draggable from 'vuedraggable';
import { useAuthStore } from '~/stores/auth';
import { useToast } from 'vue-toast-notification';

const toast = useToast();
const props = defineProps({
  children: Array,
  parentIndex: Number,
  parentState: Array,
});

const emit = defineEmits(['update:children', 'drag-end', 'toggle-child-page', 'open-create-modal', 'open-create-change-request']);

const authStore = useAuthStore();

const createChangeRequestModal = ref(false);
const newChangeRequestTitle = ref('');
const notifyApprover = ref(false);
const selectedChildPageId = ref(null);
const editablePageId = ref(null);
const editablePageName = ref('');
const token = authStore.token;

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
        'Authorization': `Bearer ${token}`
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
      toast.error(data.message);
    }
  } catch (error) {
    console.error('Error updating page name:', error);
    editablePageId.value = null; // Ensure to exit editing mode in case of error
  }
};

const openCreatePageModal = (isSubPage, parentId = null) => {
  emit('open-create-modal', isSubPage, parentId);
};

const openCreateChangeRequestModal = (pageId) => {
  selectedChildPageId.value = pageId;
  createChangeRequestModal.value = true;
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
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        page_id: selectedChildPageId.value,
        request_name: title,
        notify_approver: notifyApprover.value
      })
    });
    const data = await response.json();
    if (data.code === 200) {
      console.log('Change request created successfully:', data);
      toast.success('Change request created successfully.');
      createChangeRequestModal.value = false;
      newChangeRequestTitle.value = ''; // Clear the input field
      notifyApprover.value = false; // Reset the checkbox
    } else {
      console.error('Failed to create change request:', data.message);
      toast.error('Failed to create change request.');
    }
  } catch (error) {
    console.error('Error creating change request:', error);
    toast.error('Error creating change request.');
  }
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
        'Authorization': `Bearer ${token}`
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
    props.children[childIndex].children = newChildren;
    emit('update:children', [...props.children]);
  }
};

const deletePage = async (page) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delete-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ page_id: page.id })
    });
    const data = await response.json();
    if (data.code === 200) {
      toast.success('Page deleted successfully.');
      // Remove the deleted page from the local state
      props.children = props.children.filter(p => p.id !== page.id);
      emit('update:children', [...props.children]); // Emit updated children
    } else {
      console.error('Failed to delete page:', data.message);
      toast.error('Failed to delete page.');
    }
  } catch (error) {
    console.error('Error deleting page:', error);
    toast.error('Error deleting page.');
  }
};

const togglePublish = async (page) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/toggle-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ page_id: page.id })
    });
    const data = await response.json();
    if (data.code === 200) {
      toast.success(`Page ${data.message.includes("On") ? "published" : "unpublished"} successfully.`);
      page.is_published = data.message.includes("On");
    } else {
      console.error('Failed to toggle publish state:', data.message);
      toast.error('Failed to toggle publish state.');
    }
  } catch (error) {
    console.error('Error toggling publish state:', error);
    toast.error('Error toggling publish state.');
  }
};
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
