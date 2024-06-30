<template>
  <div class="w-full flex flex-col justify-between px-4 py-6 h-full">
    <div>
      <div class="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 class="text-xl font-bold text-start">
          Add Faculty contact info in CS Department
        </h1>
        <div class="creator flex items-center gap-2 mt-4 md:mt-0">
          <span class="font-medium">Created by</span>
          <div class="avatar rounded-full w-8 h-8 flex items-center justify-center">
            <img
              src="assets/images/roxy.jpeg"
              alt="avatar"
              class="h-10 w-10 rounded-full object-cover border-2 border-gray-300"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg py-6 flex flex-wrap justify-center gap-4 mb-4">
        <div class="h-[500px] w-full p-2 border border-gray-300 rounded-lg">
          <!-- Placeholder for dynamic content -->
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-5">
      <textarea
        name="Write Something"
        id=""
        cols="30"
        rows="10"
        class="bg-[#F5F5F5] rounded-lg h-[70px] w-full outline outline-gray-300 py-2 px-4"
        placeholder="Write Something Here"
      ></textarea>
      <div class="actions flex justify-end gap-4">
        <button
          class="bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Decline
        </button>
        <button
          class="bg-blue-900 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import any required components or utilities
</script>

<style scoped>
.creator .avatar {
  font-size: 0.75rem; /* Adjust size as needed */
}

textarea {
  border: none;
  resize: none;
}

.actions button {
  width: 100px; /* Fixed width for buttons */
}
</style>
