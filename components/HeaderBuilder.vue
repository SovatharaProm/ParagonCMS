<template>
  <div ref="grapesjsEditor" class="grapesjs-editor border-[1px] border-[solid] border-[#ddd] rounded-[3px]"></div>

  <div class="flex justify-end my-5 ml-[300px] flex-grow">
    <NuxtLink to="/" class="mr-5">
      <v-btn class="text-none" color="blue-darken-4" variant="outlined">Discard</v-btn>
    </NuxtLink>
    <v-btn class="text-none text-white px-8 mr-5" color="blue-darken-4" variant="flat" @click="saveContent">Save</v-btn>
    <div v-html="outputHtml"></div>
    <pre>{{ outputCss }}</pre>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import plugin from 'grapesjs-tailwind';
import { useAuthStore } from '@/stores/auth';

const grapesjsEditor = ref(null);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
let editor;

const saveContent = async () => {
  if (!editor) {
    console.error('Editor is not initialized');
    return;
  }

  const html = editor.getHtml();
  const css = editor.getCss();
  const pageId = route.query.id; // Get the page ID from the route query

  const data = {
    page_id: pageId,
    html: html,
    css: css,
  };

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update-page-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.code === 200) {
      alert('Content saved successfully!');
      router.push('/');
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

const fetchPageContent = async (pageId) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/edit-page-content?page_id=${pageId}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    const data = await response.json();
    if (data.code === 200) {
      return data.data['Page Content'];
    } else {
      console.error('Error fetching page content:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching page content:', error);
    return null;
  }
};

const customElementsPlugin = editor => {
  editor.BlockManager.add('nav-bar-block', {
    label: 'NavBar',
    content: `<header class="bg-blue-950 p-2 my-auto">
            <div class="container mx-auto flex items-end justify-end">
                <nav class="flex space-x-5">
                    <a href="#" class="text-white hover:text-gray-300 my-auto">Rector's Scholarship</a>
                    <a href="#" class="text-white hover:text-gray-300 my-auto">Covid-19 Info</a>
                    <a href="#" class="text-white hover:text-gray-300 my-auto">Alumni</a>
                    <a href="#" class="text-white hover:text-gray-300 my-auto">Calendar</a>
                    <a href="#" class="text-white hover:text-gray-300 my-auto">FAQ</a>
                    <a href="#" class="text-white hover:text-gray-300 my-auto">Jobs@Paragon.U</a>
                    <a href="#" class="text-white hover:text-gray-300 bg-yellow-500 p-2 py-full">My.Paragon.U</a>
                </nav>
            </div>
        </header>
    <main class="mx-20 my-auto border-b-2">
      <div class="flex items-center justify-between">

        <div class="flex space-x-8 text-blue-950 font-semibold font-sans">
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">About</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Our History</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Mission & Vision</a>
            </div>
          </div>
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Paragon Students</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Current Students</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Student Life</a>
            </div>
          </div>
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Prospective Students</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Admissions</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Programs</a>
            </div>
          </div>
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Academics</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Departments</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Research</a>
            </div>
          </div>
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Admissions</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Apply Now</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Financial Aid</a>
            </div>
          </div>
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Partnerships</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Collaborations</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Corporate Partners</a>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </main>`,
    category: 'Layout',
    attributes: { class: 'fa fa-bars' }
  });

    // Add Header 1 block to the canvas
    editor.BlockManager.add('header-1-block', {
        label: 'Header 1',
        content: `<header class="bg-blue-950 p-2 my-auto">
            <div class="container mx-auto flex items-end justify-end">
                <nav class="flex space-x-5">
                    <a href="#" class="text-white hover:text-gray-300 my-auto">Rector's Scholarship</a>
                    <a href="#" class="text-white hover:text-gray-300 my-auto">Covid-19 Info</a>
                    <a href="#" class="text-white hover:text-gray-300 my-auto">Alumni</a>
                    <a href="#" class="text-white hover:text-gray-300 my-auto">Calendar</a>
                    <a href="#" class="text-white hover:text-gray-300 my-auto">FAQ</a>
                    <a href="#" class="text-white hover:text-gray-300 my-auto">Jobs@Paragon.U</a>
                    <a href="#" class="text-white hover:text-gray-300 bg-yellow-500 p-2 py-full">My.Paragon.U</a>
                </nav>
            </div>
        </header>`,
        category: 'Layout',
        attributes: { class: 'fa fa-minus' }
    });

    // Add Header 2 block to the canvas
    editor.BlockManager.add('header-2-block', {
        label: 'Header 2',
        content: `<main class="mx-20 my-auto py-3 border-b-2">
      <div class="flex items-center justify-between">

        <div class="flex space-x-8 text-blue-950 font-semibold font-sans">
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">About</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Our History</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Mission & Vision</a>
            </div>
          </div>
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Paragon Students</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Current Students</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Student Life</a>
            </div>
          </div>
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Prospective Students</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Admissions</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Programs</a>
            </div>
          </div>
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Academics</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Departments</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Research</a>
            </div>
          </div>
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Admissions</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Apply Now</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Financial Aid</a>
            </div>
          </div>
          <div class="relative group">
            <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Partnerships</a>
            <div class="absolute hidden group-hover:block bg-white shadow-lg">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Collaborations</a>
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Corporate Partners</a>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </main>`,
        category: 'Layout',
        attributes: { class: 'fa fa-window-restore' }
    });
};
  
const uploadFileToSpace = async (file) => {
  // Fetch the pre-signed URL from the backend
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/generate-url?filename=${file.name}`);
  if (!response.ok) {
    throw new Error('Failed to generate pre-signed URL');
  }
  const data = await response.json();

  if (!data.success) {
    throw new Error('Failed to generate pre-signed URL');
  }

  // Upload the file to DigitalOcean Spaces using the pre-signed URL
  const uploadResponse = await fetch(data.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
      'x-amz-acl': 'public-read',
    }
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to DigitalOcean Space');
  }

  return data.fileUrl;
};

onMounted(async () => {
  await authStore.initializeStore();
  
  const pageId = route.query.id;
  if (!pageId) {
    console.error('Page ID is missing');
    return;
  }

  editor = grapesjs.init({
    container: grapesjsEditor.value,
    plugins: [customElementsPlugin, plugin],
    fromElement: true,
    height: '100vh',
    width: '100%',
    assetManager: {
      upload: false, // Disable default upload
      uploadFile: async (e) => {
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        const images = [];

        for (const file of files) {
          try {
            const fileUrl = await uploadFileToSpace(file);
            images.push({ src: fileUrl });
          } catch (error) {
            console.error('Error uploading file:', error);
          }
        }

        editor.AssetManager.add(images);
      },
    },
  });
  
  document.documentElement.style.setProperty('--gjs-primary-color', '#172947');
  document.documentElement.style.setProperty('--gjs-secondary-color', '#fff');

  const pageContent = await fetchPageContent(pageId);
  if (pageContent && pageContent.html && pageContent.css) {
    editor.setComponents(pageContent.html);
    editor.setStyle(pageContent.css);
  } else {
    // Immediately load the fixed content into the editor on mount if no existing content
    editor.BlockManager.get('fixed-content-block').set({ active: true });
    editor.runCommand('core:canvas-clear');
    editor.addComponents(
      `<header class="bg-blue-950 py-2 my-auto">
        <div class="container mx-auto flex items-center justify-between">
            <nav class="flex space-x-8">
                <a href="#" class="text-white hover:text-gray-300 my-auto">Rector's Scholarship</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto">Covid-19 Info</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto">Alumni</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto">Calendar</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto">FAQ</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto">Jobs@Paragon.U</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto bg-[#FFC107] p-2">My.Paragon.U</a>
            </nav>
        </div>
    </header>

    <main class="mx-20 my-auto py-3 border-b-2 ">
        <div class="flex items-center justify-between">

            <div class="flex space-x-8 text-blue-950 font-semibold font-sans">
                <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">About</a>
                <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Paragon Students</a>
                <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Prospective Students</a>
                <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Academics</a>
                <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Admissions</a>
                <a href="#" class="text-gray-800 hover:text-gray-500 font-medium">Partnerships</a>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
    </main>`
    );
  }
});
</script>
<style scoped>
@import "/assets/css/style.css";
</style>
