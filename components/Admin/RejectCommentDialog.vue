<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 overflow-y-auto">
    <div class="bg-white rounded-lg p-4 w-96 mx-auto my-8 shadow-lg z-60 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <h2 class="text-lg font-bold mb-4">Add Rejection Comment</h2>
      <textarea
        v-model="comment"
        class="bg-[#F5F5F5] rounded-lg w-full h-32 p-2 border border-gray-300 outline-none"
        placeholder="Write Something Here"
      ></textarea>
      <div class="flex justify-end gap-4 mt-4">
        <button
          @click="closeModal"
          class="bg-gray-500 hover:bg-gray-400 text-white py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          @click="submitComment"
          class="bg-blue-900 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: Boolean,
});

const emits = defineEmits(['close', 'submit']);

const comment = ref('');

const closeModal = () => {
  emits('close');
};

const submitComment = () => {
  if (comment.value.trim()) {
    emits('submit', comment.value);
    comment.value = '';
    closeModal();
  } else {
    alert('Please enter a comment');
  }
};
</script>

<style scoped>
.fixed.inset-0 {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  height: 100vh;
}
.z-60 {
  z-index: 60;
}
</style>
