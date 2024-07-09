<template>
  <div class="otp-inputs flex justify-center space-x-2">
    <input
      v-for="index in length"
      :key="index"
      class="w-12 h-12 text-center form-input border rounded-md focus:border-blue-500"
      type="text"
      maxlength="1"
      @input="onInput(index, $event)"
      @keydown.backspace="onDelete(index, $event)"
    />
  </div>
</template>

<script>
export default {
  props: {
    length: {
      type: Number,
      default: 6
    }
  },
  methods: {
    onInput(index, event) {
      const value = event.target.value;
      this.$emit('update:modelValue', {index, value: value});
      if (value) {
        this.focusNext(index);
      }
    },
    onDelete(index, event) {
      if (!event.target.value && index > 1) {
        this.focusPrevious(index);
      }
    },
    focusNext(index) {
      if (index < this.length) {
        this.$el.children[index].focus();
      }
    },
    focusPrevious(index) {
      if (index > 1) {
        this.$el.children[index - 2].focus();
      }
    }
  }
}
</script>

<style scoped>
.otp-inputs input {
  font-size: 1.5rem; /* Large text size */
  padding: 1rem;  /* Padding around the text */
}
</style>
