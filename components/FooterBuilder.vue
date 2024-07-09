<template>
  <div ref="grapesjsEditor" class="grapesjs-editor border-[1px] border-[solid] border-[#ddd] rounded-[3px]"></div>

  <div class="flex justify-end my-5 ml-[300px] flex-grow">
    <NuxtLink to="/admin/website" class="mr-5">
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

  const data = {
    html: html,
    css: css,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/update-footer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log('Saved footer content'); // Debug log
      alert('Content saved successfully!');
      router.push('/admin/website');
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};


const fetchFooterContent = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/edit-footer`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    const data = await response.json();
    if (data.code === 200) {
      console.log('Fetched footer content', data); // Debug log
      return data;
    } else {
      console.error('Error fetching footer content:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching footer content:', error);
    return null;
  }
};



const customElementsPlugin = editor => {
    editor.BlockManager.add('footer-block', {
    label: 'Footer',
    content: `<footer style="display: flex; justify-content: space-around; background-color: #222; color: #fff; padding: 20px 0;">
        <div class="footer-section" style="flex: 1; padding: 0 20px;">
            <h3 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 10px; margin-bottom: 20px;">Quick Links</h3>
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Library</a></li>
                <li><a href="#">Undergraduate Majors</a></li>
                <li><a href="#">Postgraduate Programs</a></li>
                <li><a href="#">Jobs@Paragon</a></li>
                <li><a href="#">My.Paragon.U</a></li>
                <li><a href="#">Tuition and Fees</a></li>
            </ul>
        </div>
        <div class="footer-section" style="flex: 1; padding: 0 20px;>
            <h3 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 10px; margin-bottom: 20px;">Recent Posts</h3>
            <ul>
                <li><a href="#">USDP Cohort 5 Grand Finale and Awards Ceremony</a></li>
                <li><a href="#">National Exam Grade-Based Scholarship</a></li>
                <li><a href="#">Scholarship Exam 2023 Awards</a></li>
                <li><a href="#">Hengsopheavan Sam, MIS Alumnus, and his Startups “Kong Vong”</a></li>
            </ul>
        </div>
        <div class="footer-section" style="flex: 1; padding: 0 20px;>
            <h3 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 10px; margin-bottom: 20px;">Find Us</h3>
            <address>
                <p style="  font-size: 14px; margin-top: 10px; text-align: center; color: #666;">No. 8, St. 315,<br>
                Boeng Kak 1, Tuol Kork,<br>
                Phnom Penh, Cambodia, 12151</p>
                <p style="  font-size: 14px; margin-top: 10px; text-align: center; color: #666;">+855 23 996 111<br>
                +855 17 996 111<br>
                +855 15 996 111</p>
                <p style="  font-size: 14px; margin-top: 10px; text-align: center; color: #666;"><a href="mailto:info@paragoniu.edu.kh">info@paragoniu.edu.kh</a></p>
            </address>
        </div>
        <div class="footer-section" style="flex: 1; padding: 0 20px;>
            <h3 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 10px; margin-bottom: 20px;">Paragon International University</h3>
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.8283195657286!2d104.89043111533703!3d11.56573524734942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109513c6c5c1b9b%3A0x4294c8e5e0d4e707!2sParagon%20International%20University!5e0!3m2!1sen!2skh!4v1598351224831!5m2!1sen!2skh" 
                width="300" 
                height="200" 
                frameborder="0" 
                style="border:0;" 
                allowfullscreen="" 
                aria-hidden="false" 
                tabindex="0">
            </iframe>
        </div>
    </footer>`,
    category: 'Layout',
    attributes: { class: 'fa fa-window-maximize' }
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

  const pageContent = await fetchFooterContent();
  if (pageContent && pageContent.html && pageContent.css) {
    editor.setComponents(pageContent.html);
    editor.setStyle(pageContent.css);
  } else {
    console.warn('No footer content found'); // Debug log
  }
});
</script>

<style scoped>
@import "/assets/css/style.css";
</style>