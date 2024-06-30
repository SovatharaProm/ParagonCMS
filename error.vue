<script setup>
const error = useError();

const handleError = () => {
    navigateTo("/");
};
</script>

<template>
    <div class="flex h-screen justify-center items-center flex-col">
        <h1 class="text-9xl">{{ error.statusCode }}</h1>
        <p class="mt-7 text-4xl">{{ error.message }}</p>
        <button @click="handleError" class="mt-7 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded">Go back</button>
    </div>
</template>