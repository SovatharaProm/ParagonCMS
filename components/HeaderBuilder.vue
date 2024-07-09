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
import { ref, onMounted, computed} from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRoute, useRouter } from 'vue-router';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import plugin from 'grapesjs-tailwind';
import 'tailwindcss/tailwind.css';

const isAdmin = computed(() => authStore.userRole === "admin" || authStore.userRole === "super_admin");
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const authStore = useAuthStore();
const grapesjsEditor = ref(null);
const route = useRoute();
const router = useRouter();
let editor;

const saveContent = async () => {
if (!editor) {
  console.error('Editor is not initialized');
  return;
}

const html = editor.getHtml();
const css = editor.getCss();
const headerId = route.query.id; // Get the header ID from the route query

const data = {
  header_id: headerId,
  html: html,
  css: css,
};

try {
  const response = await fetch(`${API_BASE_URL}/update-header`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authStore.token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (result.code === 200) {
    console.log('Saved content for header:', headerId); // Debug log
    alert('Content saved successfully!');
    router.push('/admin/website');
  } else {
    alert('Error: ' + result.message);
  }
} catch (error) {
  alert('Error: ' + error.message);
}
};


const fetchPageContent = async (headerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/edit-header?header_id=${headerId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    
    const data = await response.json();
    if (data.code === 200) {
      console.log('Fetched content for header:', headerId, data.data['page_Content']); // Debug log
      return data.data['page_Content'];
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
      category: 'Layout Headers',
      attributes: { class: 'fa fa-window-restore' }
  });

  // Add Header 2 block to the canvas
  editor.BlockManager.add('header-2-block', {
      label: 'Header 2',
      content: `<header class="mx-20 my-auto py-3 border-b-2">
    <div class="flex items-center justify-between">
      <img src="/assets/images/Logo.png" alt="Paragon University Logo" class="h-20">
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
  </header>`,
  category: 'Layout Headers',
  attributes: { class: 'fa fa-window-restore' }
  });

  editor.BlockManager.add('header-3-block', {
      label: 'Header 3',
      content: `<header class="text-gray-600 body-font"><div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center"><a class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg><span class="ml-3 text-xl">Tailblocks</span></a><nav class="md:ml-auto flex flex-wrap items-center text-base justify-center"><a class="mr-5 hover:text-gray-900">First Link</a><a class="mr-5 hover:text-gray-900">Second Link</a><a class="mr-5 hover:text-gray-900">Third Link</a><a class="mr-5 hover:text-gray-900">Fourth Link</a></nav><button class="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">Button<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-1" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></button></div></header>`,
      category: 'Layout Headers',
      attributes: { class: 'fa fa-window-restore' }
  });

  editor.BlockManager.add('header-4-block', {
      label: 'Header 4',
      content: `<header class="text-gray-600 body-font"><div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center"><a class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg><span class="ml-3 text-xl">Tailblocks</span></a><nav class="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400	flex flex-wrap items-center text-base justify-center"><a class="mr-5 hover:text-gray-900">First Link</a><a class="mr-5 hover:text-gray-900">Second Link</a><a class="mr-5 hover:text-gray-900">Third Link</a><a class="mr-5 hover:text-gray-900">Fourth Link</a></nav><button class="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">Button<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-1" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></button></div></header>`,
      category: 'Layout Headers',
      attributes: { class: 'fa fa-window-restore' }
  });

  editor.BlockManager.add('header-5-block', {
      label: 'Header 5',
      content: `<header class="text-gray-600 body-font"><div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center"><nav class="flex lg:w-2/5 flex-wrap items-center text-base md:ml-auto"><a class="mr-5 hover:text-gray-900">First Link</a><a class="mr-5 hover:text-gray-900">Second Link</a><a class="mr-5 hover:text-gray-900">Third Link</a><a class="hover:text-gray-900">Fourth Link</a></nav><a class="flex order-first lg:order-none lg:w-1/5 title-font font-medium items-center text-gray-900 lg:items-center lg:justify-center mb-4 md:mb-0"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg><span class="ml-3 text-xl">Tailblocks</span></a><div class="lg:w-2/5 inline-flex lg:justify-end ml-5 lg:ml-0"><button class="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">Button<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-1" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></button></div></div></header>`,
      category: 'Layout Headers',
      attributes: { class: 'fa fa-window-restore' }
  });

  editor.BlockManager.add('header-6-block', {
      label: 'Header 6',
      content: `<header class="text-gray-600 body-font"><div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center"><a class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg><span class="ml-3 text-xl">Tailblocks</span></a><nav class="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center"><a class="mr-5 hover:text-gray-900">First Link</a><a class="mr-5 hover:text-gray-900">Second Link</a><a class="mr-5 hover:text-gray-900">Third Link</a><a class="mr-5 hover:text-gray-900">Fourth Link</a></nav><button class="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">Button<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-1" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></button></div></header>`,
      category: 'Layout Headers',
      attributes: { class: 'fa fa-window-restore' }
  });

};

const uploadFileToSpace = async (file) => {
  // Fetch the pre-signed URL from the backend
  const response = await fetch(`http://localhost:3001/generate-url?filename=${file.name}`);
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
const headerId = route.query.id;
if (!headerId) {
  console.error('Header ID is missing');
  return;
}
console.log('Editing header with ID:', headerId); // Debug log


  editor = grapesjs.init({
    container: grapesjsEditor.value,
    plugins: [customElementsPlugin,
    plugin
    ],
    
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

  const pageContent = await fetchPageContent(headerId);
  if (pageContent && pageContent.html && pageContent.css) {
    editor.setComponents(pageContent.html);
    editor.setStyle(pageContent.css);
  } else {
    console.warn('No content found for header ID:', headerId); // Debug log
  }
});
</script>

<style scoped>
@import "/assets/css/style.css";
</style>