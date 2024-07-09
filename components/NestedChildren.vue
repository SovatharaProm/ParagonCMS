<template>
  <div>
    <draggable :list="children" @end="onDragEnd" itemKey="id">
      <template #item="{ element: child, index: childIndex }">
        <div :key="child.id" class="flex flex-col">
          <div :class="getItemClass(level)" class="flex justify-between m-1 p-2 px-5 shadow items-center rounded">
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
            <div class="flex gap-5 my-auto items-center">
              <button @click="navigateToBuilder(child.id)" class="my-auto text-blue-900 text-lg flex items-center">
                <Icon name="ph:note-pencil-bold"></Icon>
              </button>
              <Icon name="carbon:link" @click="copyUrl(child.page_link)" class="cursor-pointer text-blue-900 text-lg flex items-center"></Icon>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <button icon v-bind="props" class="text-blue-900 text-lg flex items-center">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </button>
                </template>
                <v-list>
                  <v-list-item @click="openCreateChangeRequestModal(child.id)">
                    <v-list-item-title>Create Change Request</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openCreatePageModal(true, child.id)">
                    <v-list-item-title>Create Subpage</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deletePage(child)">
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="togglePublish(child, parentState, childIndex)">
                    <v-list-item-title>{{ child.is_published ? 'Unpublish' : 'Publish' }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="togglePageInNav(child, parentState, childIndex)">
                    <v-list-item-title>{{ child.is_in_nav ? 'Remove from Nav' : 'Add to Nav' }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
          <div v-if="child.children && child.children.length > 0" class="pl-8">
            <NestedChildren
              :level="Number(level) + 1"
              :parentId="child.id"
              :children="child.children"
              :parent-index="childIndex"
              :parent-state="parentState[childIndex]?.children || []"
              @update:children="updateChildren(childIndex, $event)"
              @toggle-child-page="togglePublish"
              @open-create-modal="openCreatePageModal"
              @open-create-change-request="openCreateChangeRequestModal"
              @toggle-page-in-nav="togglePageInNav"
              @copy-url="copyUrl"
            ></NestedChildren>
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
import { ref, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import draggable from 'vuedraggable';
import { useAuthStore } from '~/stores/auth';
import { useToast } from 'vue-toast-notification';

const toast = useToast();
const props = defineProps({
  children: Array,
  parentId: Number,
  level: Number,
  parentIndex: Number,
  parentState: Array,
});

const emit = defineEmits(['update:children', 'drag-end', 'toggle-child-page', 'open-create-modal', 'open-create-change-request', 'toggle-page-in-nav', 'copy-url']);

const authStore = useAuthStore();
const router = useRouter();

const createChangeRequestModal = ref(false);
const newChangeRequestTitle = ref('');
const notifyApprover = ref(false);
const selectedChildPageId = ref(null);
const editablePageId = ref(null);
const editablePageName = ref('');

const enableEditing = (child) => {
  editablePageId.value = child.id;
  editablePageName.value = child.page_name;
};

const updatePageName = async (child, childIndex) => {
  if (!editablePageName.value.trim()) {
    alert("Page name is required.");
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

const navigateToBuilder = (pageId) => {
  router.push(`/builder?id=${pageId}`);
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
        'Authorization': `Bearer ${authStore.token}`
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
    } else if (data.code === 403) {  // Assuming 403 is the status code for forbidden access
      console.error('User doesn\'t have edit permission for this page:', data.message);
      toast.error('User doesn\'t have edit permission for this page.');
    } else {
      console.error('Failed to create change request:', data.message);
      toast.error(data.message || 'Failed to create change request.');
    }
  } catch (error) {
    console.error('Error creating change request:', error);
    toast.error('Error creating change request.');
  }
};

const buildNestedPayload = (pages, parentId = null, level = props.level) => {
  return pages.map((page, index) => ({
    id: page.id,
    page_name: page.page_name,
    page_order: index + 1,
    page_level: level,
    is_under_page: parentId,
    children: page.children ? buildNestedPayload(page.children, page.id, level + 1) : []
  }));
};

const onDragEnd = async (event) => {
  console.log('Drag end event:', event);
  
  const payload = {
    Pages: buildNestedPayload(props.children, props.parentId)
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
        'Authorization': `Bearer ${authStore.token}`
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
      toast.error(data.message  || 'Failed to delete page.');
    }
  } catch (error) {
    console.error('Error deleting page:', error);
    toast.error('Error deleting page.');
  }
};

const togglePublish = async (page, parentState, childIndex) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/toggle-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ page_id: page.id })
    });
    const data = await response.json();
    if (data.code === 400) {
      toast.error(data.message);
    } else if (data.code === 200 || data.code === 201) {
      toast.success(`Page ${data.data.status === 'On' ? 'published' : 'unpublished'} successfully.`);
      page.is_published = data.data.status === 'On';
      emit('update:children', [...props.children]);
    } else {
      console.error('Failed to toggle publish state:', data.message);
      toast.error('Failed to toggle publish state.');
    }
  } catch (error) {
    console.error('Error toggling publish state:', error);
  }
};

const togglePageInNav = async (page, parentState, childIndex) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/toggle-page-in-nav`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ page_id: page.id }),
    });

    const data = await response.json();
    if (data.code === 200 || data.code === 201) {
      toast.success(data.message);
      page.is_in_nav = data.code === 200;
      emit('update:children', [...props.children]);
    } else {
      console.error("Failed to toggle page navigation visibility:", data.message);
      toast.error("Failed to toggle page navigation visibility.");
    }
  } catch (error) {
    console.error("Error toggling page navigation visibility:", error);
    toast.error("Error toggling page navigation visibility.");
  }
};

const copyUrl = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    toast.success('URL copied to clipboard.');
  }).catch(err => {
    console.error('Could not copy text: ', err);
    toast.error('Failed to copy URL.');
  });
};

const getItemClass = (level) => {
  switch (level) {
    case 1:
      return "bg-white";
    case 2:
      return "bg-red-50";
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
