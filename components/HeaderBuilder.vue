<template>
  <div
    ref="grapesjsEditor"
    class="grapesjs-editor border-[1px] border-[solid] border-[#ddd] rounded-[3px]"
  ></div>

  <div class="sticky-footer flex justify-end my-5 ml-[300px] flex-grow">
    <NuxtLink to="/admin/website" class="mr-5">
      <v-btn
        class="text-none button-same-size"
        color="blue-darken-4"
        variant="outlined"
        >Discard</v-btn
      >
    </NuxtLink>
    <v-btn
      class="text-none text-white px-8 mr-5 button-same-size"
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
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

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
  const headerId = route.query.id; // Get the header ID from the route query

  const data = {
    header_id: headerId,
    html: html,
    css: css,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/update-header`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.code === 200) {
      console.log("Saved content for header:", headerId); // Debug log
      toast.success("Content saved successfully!");
      router.push("/admin/website");
    } else {
      toast.error("Error: " + result.message);
    }
  } catch (error) {
    toast.error("Error: " + error.message);
  }
};

const fetchPageContent = async (headerId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/edit-header?header_id=${headerId}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    const data = await response.json();
    if (data.code === 200) {
      console.log(
        "Fetched content for header:",
        headerId,
        data.data["page_Content"]
      ); // Debug log
      return data.data["page_Content"];
    } else {
      console.error("Error fetching page content:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching page content:", error);
    return null;
  }
};

const customElementsPlugin = (editor) => {
  editor.Blocks.add("1-column", {
    label: "1 Column",
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: "Column",
    attributes: { class: "fa fa-columns" },
  });

  editor.Blocks.add("2-columns", {
    label: "2 Columns",
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: "Column",
    attributes: { class: "fa fa-columns" },
  });

  editor.Blocks.add("2-columns-2-3", {
    label: "2 Columns 2/3",
    content: `<div style="display:flex;">
                  <div style="flex: 2; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                  <div style="flex: 3; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                </div>`,
    category: "Column",
    attributes: { class: "fa fa-columns" },
  });

  editor.Blocks.add("2-columns-3-7", {
    label: "2 Columns 3/7",
    content: `<div style="display:flex;">
                <div style="flex: 3; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex: 7; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: "Column",
    attributes: { class: "fa fa-columns" },
  });

  editor.Blocks.add("2-columns-7-3", {
    label: "2 Columns 7/3",
    content: `<div style="display:flex;">
                <div style="flex: 7; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex: 3; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: "Column",
    attributes: { class: "fa fa-columns" },
  });

  editor.Blocks.add("3-columns", {
    label: "3 Columns",
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: "Column",
    attributes: { class: "fa fa-columns" },
  });

  editor.Blocks.add("3-columns", {
    label: "3 Columns",
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: "Column",
    attributes: { class: "fa fa-columns" },
  });

  editor.Blocks.add("4-columns", {
    label: "4 Columns",
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: "Column",
    attributes: { class: "fa fa-columns" },
  });

  editor.Blocks.add("text-block", {
    label: "Text",
    content: '<div data-gjs-type="text">Insert your text here</div>',
    category: "Basic",
    attributes: { class: "fa fa-text-height" },
  });

  editor.Blocks.add("image-block", {
    label: "Image",
    content:
      '<img data-gjs-type="image" src="path-to-default-image.jpg" alt="Placeholder image"/>',
    category: "Basic",
    attributes: { class: "fa fa-image" },
  });

  editor.Blocks.add("video-block", {
    label: "Video",
    content:
      '<video controls><source src="path-to-video.mp4" type="video/mp4">Your browser does not support the video tag.</video>',
    category: "Basic",
    attributes: { class: "fa fa-video-camera" },
  });

  editor.Blocks.add("link-block", {
    label: "Link",
    content: '<a href="#" class="custom-link">Click here</a>',
    category: "Basic",
    attributes: { class: "fa fa-link" },
  });

  editor.BlockManager.add("nav-bar-block", {
    label: "NavBar",
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
    </main>`,
    category: "Layout",
    attributes: { class: "fa fa-bars" },
  });

  // Add Header 1 block to the canvas
  editor.BlockManager.add("header-1-block", {
    label: "Header 1",
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
    category: "Layout",
    attributes: { class: "fa fa-minus" },
  });

  // Add Header 2 block to the canvas
  editor.BlockManager.add("header-2-block", {
    label: "Header 2",
    content: `<main class="mx-20 my-auto border-b-2">
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
    </main>`,
    category: "Layout",
    attributes: { class: "fa fa-window-restore" },
  });
};

const uploadFileToSpace = async (file) => {
  // Fetch the pre-signed URL from the backend
  const response = await fetch(
    `https://mypress.paragoniu.app/image/generate-url?filename=${file.name}`
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
  const headerId = route.query.id;
  if (!headerId) {
    console.error("Header ID is missing");
    return;
  }
  console.log("Editing header with ID:", headerId); // Debug log

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

  const pageContent = await fetchPageContent(headerId);
  if (pageContent && pageContent.html && pageContent.css) {
    editor.setComponents(pageContent.html);
    editor.setStyle(pageContent.css);
  } else {
    console.warn("No content found for header ID:", headerId); // Debug log
  }
});
</script>

<style scoped>
@import "/assets/css/style.css";

.sticky-footer {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: white;
  padding: 10px 20px;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.button-same-size {
  min-width: 100px;
}
</style>
