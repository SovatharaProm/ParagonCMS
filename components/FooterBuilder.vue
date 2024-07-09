<template>
  <div
    ref="grapesjsEditor"
    class="grapesjs-editor border-[1px] border-[solid] border-[#ddd] rounded-[3px]"
  ></div>

  <div class="flex justify-end my-5 ml-[300px] flex-grow">
    <NuxtLink to="/admin/website" class="mr-5">
      <v-btn class="text-none" color="blue-darken-4" variant="outlined"
        >Discard</v-btn
      >
    </NuxtLink>
    <v-btn
      class="text-none text-white px-8 mr-5"
      color="blue-darken-4"
      variant="flat"
      @click="saveContent"
      >Save</v-btn
    >
    <div v-html="outputHtml"></div>
    <pre>{{ outputCss }}</pre>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRoute, useRouter } from "vue-router";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import plugin from "grapesjs-tailwind";
import "tailwindcss/tailwind.css";
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const toast = useToast();
const isAdmin = computed(
  () => authStore.userRole === "admin" || authStore.userRole === "super_admin"
);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const authStore = useAuthStore();
const grapesjsEditor = ref(null);
const route = useRoute();
const router = useRouter();
let editor;

const saveContent = async () => {
  if (!editor) {
    console.error("Editor is not initialized");
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.code === 200) {
      toast.success("Content saved successfully!");
      router.push("/admin/website");
    } else {
      toast.error("Error: " + result.message);
    }
  } catch (error) {
    toast.error("Error: " + error.message);
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
      console.log("Fetched footer content", data); // Debug log
      return data;
    } else {
      console.error("Error fetching footer content:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching footer content:", error);
    return null;
  }
};

const customElementsPlugin = (editor) => {
  editor.BlockManager.add("footer-block", {
    label: "Footer",
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
    category: "Layout",
    attributes: { class: "fa fa-window-maximize" },
  });
};

const uploadFileToSpace = async (file) => {
  // Fetch the pre-signed URL from the backend
  const response = await fetch(
    `http://localhost:3001/generate-url?filename=${file.name}`
  );
  if (!response.ok) {
    throw new Error("Failed to generate pre-signed URL");
  }
  const data = await response.json();

  if (!data.success) {
    throw new Error("Failed to generate pre-signed URL");
  }

  // Upload the file to DigitalOcean Spaces using the pre-signed URL
  const uploadResponse = await fetch(data.uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
      "x-amz-acl": "public-read",
    },
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to DigitalOcean Space");
  }

  return data.fileUrl;
};

onMounted(async () => {
  await authStore.initializeStore();

  editor = grapesjs.init({
    container: grapesjsEditor.value,
    plugins: [customElementsPlugin, plugin],
    fromElement: true,
    height: "100vh",
    width: "100%",
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
            console.error("Error uploading file:", error);
          }
        }

        editor.AssetManager.add(images);
      },
    },
  });

  document.documentElement.style.setProperty("--gjs-primary-color", "#172947");
  document.documentElement.style.setProperty("--gjs-secondary-color", "#fff");

  const pageContent = await fetchFooterContent();
  if (pageContent && pageContent.html && pageContent.css) {
    editor.setComponents(pageContent.html);
    editor.setStyle(pageContent.css);
  } else {
    console.warn("No footer content found"); // Debug log
  }
});
</script>

<style scoped>
@import "/assets/css/style.css";
</style>
