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

  
  const grapesjsEditor = ref(null);
  const route = useRoute();
  const router = useRouter();
  const token = '1200|TolZIAcRozO2CRZrBkwd9opFbQvasbgIMTUcFxhO98baeb68:::admin'; // Replace this with your actual token
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
      const response = await fetch('http://157.230.37.48/api/update-page-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      const response = await fetch(`http://157.230.37.48/api/edit-page-content?page_id=${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
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
    editor.BlockManager.add('footer-block', {
    label: 'Footer',
    content: `<footer class="bg-stone-900 text-gray-300 py-10">
      <div class="container mx-auto grid grid-cols-4 gap-8">
        <div>
          <h3 class="text-white text-lg font-semibold mb-4">Quick Links</h3>
          <ul class="my-10">
            <li><a href="#" class="hover:text-gray-100">Home</a></li>
            <li><a href="#" class="hover:text-gray-100">Library</a></li>
            <li><a href="#" class="hover:text-gray-100">Undergraduate Majors</a></li>
            <li><a href="#" class="hover:text-gray-100">Postgraduate Programs</a></li>
            <li><a href="#" class="hover:text-gray-100">Jobs@Paragon</a></li>
            <li><a href="#" class="hover:text-gray-100">My.Paragon.U</a></li>
            <li><a href="#" class="hover:text-gray-100">Tuition and Fees</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-white text-lg font-semibold mb-4">Recent Posts</h3>
          <ul class="my-10">
            <li><a href="#" class="hover:text-gray-100">USDP Cohort 5 Grand Finale and Awards Ceremony</a></li>
            <li><a href="#" class="hover:text-gray-100">National Exam Grade-Based Scholarship</a></li>
            <li><a href="#" class="hover:text-gray-100">Scholarship Exam 2023 Awards</a></li>
            <li><a href="#" class="hover:text-gray-100">Hengsopheavan Sam, MIS Alumnus, and his Startups "Kong Vong"</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-white text-lg font-semibold mb-4">Find Us</h3>
          <div class="my-10">
            <p>Paragon International University</p>
            <p>No. 8, St. 315, Boeng Kak 1, Tuol Kork, Phnom Penh, Cambodia, 12151</p>
            <p>+855 23 996 111</p>
            <p>+855 17 996 111</p>
            <p>+855 15 996 111</p>
            <p>info@paragoniu.edu.kh</p>
            </div>
        </div>
        <div>
          <h3 class="text-white text-lg font-semibold mb-4">Paragon International University</h3>

          <div class="h-96">
            <iframe
              width="100%"
              height="100%"
              frameborder="0"
              style="border:0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019879094116!2d144.96305831531678!3d-37.81410797975133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf5777529bb4d3bd5!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1614114372457!5m2!1sen!2sau"
              allowfullscreen>
            </iframe>
          </div>
        </div>
      </div>
      <div class="mt-8 border-t border-gray-800 pt-4 text-center text-sm">
        <p>Copyright © All Rights Reserved. 2022, PARAGON International University</p>
      </div>
    </footer>`,
    category: 'Layout',
    attributes: { class: 'fa fa-window-maximize' }
  });
};
  
  const uploadFileToSpace = async (file) => {
    // Fetch the pre-signed URL from the backend
    const response = await fetch(`http://157.230.37.48/generate-url?filename=${file.name}`);
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