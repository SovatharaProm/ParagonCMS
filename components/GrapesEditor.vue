<template>
  <div ref="grapesjsEditor" class="grapesjs-editor border-[1px] border-[solid] border-[#ddd] rounded-[3px]"></div>

  <div class="sticky-footer">
    <NuxtLink :to="discardRoute" class="mr-5">
      <v-btn class="text-none button-same-size" color="blue-darken-4" variant="outlined">Discard</v-btn>
    </NuxtLink>
    <v-btn class="text-none text-white px-8 mr-5 button-same-size" color="blue-darken-4" variant="flat" @click="saveContent">Save</v-btn>
  </div>
</template>


<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import plugin from 'grapesjs-tailwind';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const grapesjsEditor = ref(null);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
let editor = null;

const discardRoute = computed(() => {
  if (authStore.userRole === 'admin' || authStore.userRole === 'super_admin') {
    return '/admin/website';
  }
  return '/';
});

const saveContent = async () => {
  if (!editor) {
    console.error('Editor is not initialized');
    return;
  }

  const html = editor.getHtml();
  const css = editor.getCss();
  const pageId = route.query.id;

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
      toast.success('Content saved successfully!');
      if (authStore.userRole === 'admin' || authStore.userRole === 'super_admin') {
        router.push('/admin/website');
      } else {
        router.push('/');
      }
    } else {
      toast.error('Error: ' + result.message);
    }
  } catch (error) {
    toast.error('Error: ' + error.message);
  }
};

const fetchPageContent = async (pageId) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/edit-page-content?page_id=${pageId}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 403 || response.status === 400) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch page content');
    }
    const data = await response.json();
    if (data.code === 200) {
      return data.data['Page Content'];
    } else {
      console.error('Error fetching page content:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching page content:', error);
    if (error.message === 'Unauthorized') {
      toast.error('User does not have permission');
      router.push('/');
    } else {
      toast.error('Error fetching page content: ' + error.message);
    }
    return null;
  }
};

const customElementsPlugin = editor => {
  // Add custom blocks
  editor.BlockManager.add('1-column', {
    label: '1 Column',
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Layout',
    attributes: { class: 'fa fa-columns' }
  });

  editor.BlockManager.add('2-columns', {
    label: '2 Columns',
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Layout',
    attributes: { class: 'fa fa-columns' }
  });

  editor.BlockManager.add('3-columns', {
    label: '3 Columns',
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Layout',
    attributes: { class: 'fa fa-columns' }
  });

  editor.BlockManager.add('text-block', {
    label: 'Text',
    content: '<div data-gjs-type="text">Insert your text here</div>',
    category: 'Basic',
    attributes: { class: 'fa fa-font' }
  });

  editor.BlockManager.add('image-block', {
    label: 'Image',
    content: '<img data-gjs-type="image" src="/path-to-default-image.jpg" alt="Placeholder image"/>',
    category: 'Basic',
    attributes: { class: 'fa fa-image' }
  });

  editor.BlockManager.add('video-block', {
    label: 'Video',
    content: '<video controls><source src="/path-to-video.mp4" type="video/mp4">Your browser does not support the video tag.</video>',
    category: 'Basic',
    attributes: { class: 'fa fa-video-camera' }
  });

  editor.BlockManager.add('form-block', {
    label: 'Form',
    content: `<form class="custom-form" style="max-width: 400px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <input type="text" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" name="name" placeholder="Your Name"/>
                <input type="text" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" name="phonenumber" placeholder="Phone Number"/>
                <input type="text" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" name="email" placeholder="Email"/>
                <textarea style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; resize: vertical; height: 100px;" name="message" placeholder="Your Message"></textarea>
                <div>
                  <label><input type="checkbox" name="subscribe"/> Subscribe to newsletter</label>
                </div>
                <div>
                  <label><input type="radio" name="gender" value="male"/> Male</label>
                  <label><input type="radio" name="gender" value="female"/> Female</label>
                </div>
                <button type="submit" style="width: 100%; padding: 10px; background: #007bff; border: none; border-radius: 4px; color: #fff; font-size: 16px; cursor: pointer;">Submit</button>
              </form>`,
    category: 'Forms',
    attributes: { class: 'fa fa-wpforms' }
  });

  editor.BlockManager.add('button-block', {
    label: 'Button',
    content: '<button class="btn-primary" style="font-size: .92em !important; padding: 15px 35px !important; background: #ffae00 !important; color: #ffffff !important; letter-spacing: 1px; font-weight: bold !important; text-transform: uppercase; border: none !important; border-radius: 3px !important; height: auto !important;">Click Me</button>',
    category: 'Forms',
    attributes: { class: 'fa fa-minus-square-o' }
  });

  // Add advanced style properties
  editor.StyleManager.addSector('advanced', {
    name: 'Advanced',
    open: false,
    buildProps: [
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'float',
      'display',
      'position',
      'top',
      'right',
      'left',
      'bottom',
      'overflow',
      'overflow-x',
      'overflow-y',
      'z-index',
      'flex',
      'flex-grow',
      'flex-shrink',
      'flex-basis',
      'flex-direction',
      'flex-wrap',
      'justify-content',
      'align-items',
      'align-content',
      'order',
      'gap',
      'row-gap',
      'column-gap',
      'object-fit',
      'object-position',
      'opacity',
      'cursor',
      'pointer-events',
      'transition',
      'transition-property',
      'transition-duration',
      'transition-timing-function',
      'transition-delay',
      'transform',
      'transform-origin',
      'backface-visibility',
      'filter',
      'box-shadow',
      'background-attachment',
      'background-blend-mode',
      'background-clip',
      'background-origin',
      'background-position-x',
      'background-position-y',
      'background-repeat',
      'background-size',
      'border-collapse',
      'border-spacing',
      'caption-side',
      'empty-cells',
      'table-layout',
      'animation',
      'animation-name',
      'animation-duration',
      'animation-timing-function',
      'animation-delay',
      'animation-iteration-count',
      'animation-direction',
      'animation-fill-mode',
      'animation-play-state',
      'backdrop-filter',
    ],
    properties: [
      { name: 'Flex', property: 'display', type: 'select', defaults: 'flex', list: [{ value: 'flex' }, { value: 'inline-flex' }] },
      { name: 'Direction', property: 'flex-direction', type: 'select', defaults: 'row', list: [{ value: 'row' }, { value: 'row-reverse' }, { value: 'column' }, { value: 'column-reverse' }] },
      { name: 'Wrap', property: 'flex-wrap', type: 'select', defaults: 'nowrap', list: [{ value: 'nowrap' }, { value: 'wrap' }, { value: 'wrap-reverse' }] },
      { name: 'Justify Content', property: 'justify-content', type: 'select', defaults: 'flex-start', list: [{ value: 'flex-start' }, { value: 'flex-end' }, { value: 'center' }, { value: 'space-between' }, { value: 'space-around' }, { value: 'space-evenly' }] },
      { name: 'Align Items', property: 'align-items', type: 'select', defaults: 'stretch', list: [{ value: 'stretch' }, { value: 'flex-start' }, { value: 'flex-end' }, { value: 'center' }, { value: 'baseline' }] },
      { name: 'Align Content', property: 'align-content', type: 'select', defaults: 'stretch', list: [{ value: 'stretch' }, { value: 'flex-start' }, { value: 'flex-end' }, { value: 'center' }, { value: 'space-between' }, { value: 'space-around' }] },
      { name: 'Gap', property: 'gap', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
      { name: 'Row Gap', property: 'row-gap', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
      { name: 'Column Gap', property: 'column-gap', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
    ]
  });

  editor.DomComponents.addType('fixed-content', {
    model: {
      defaults: {
        name: 'Fixed Content',
        draggable: false,
        copyable: false,
        removable: false,
        content: `<div class="fixed-content">
                    <h1>Welcome to My Website</h1>
                    <p>This content is fixed and cannot be edited or removed.</p>
                  </div>`
      }
    }
  });

  editor.BlockManager.add('fixed-content-block', {
    label: 'NavBar',
    content: `<header style="background-color: rgb(23 37 84); padding: 0.5rem;">
      <div class="container mx-auto" style="display: flex; align-items: flex-end;">
        <nav style="display: flex; margin-left: 500px; justify-content: flex-end;">
          <a href="#" style="color: #ffffff; margin-top: 10px; margin-bottom: 10px;">Rector's Scholarship</a>
          <a href="#" style="color: #ffffff; margin-left: 1.25rem; margin-top: 10px; margin-bottom: 10px;">Covid-19 Info</a>
          <a href="#" style="color: #ffffff; margin-left: 1.25rem; margin-top: 10px; margin-bottom: 10px;">Alumni</a>
          <a href="#" style="color: #ffffff; margin-left: 1.25rem; margin-top: 10px; margin-bottom: 10px;">Calendar</a>
          <a href="#" style="color: #ffffff; margin-left: 1.25rem; margin-top: 10px; margin-bottom: 10px;">FAQ</a>
          <a href="#" style="color: #ffffff; margin-left: 1.25rem; margin-top: 10px; margin-bottom: 10px;">Jobs@Paragon.U</a>
          <a href="#" style="margin-left: 1.25rem; padding: 0.5rem; color: #ffffff; background-color: #F59E0B;">My.Paragon.U</a>
        </nav>
      </div>
    </header>
    <main style="margin-left: 5rem; margin-right: 5rem; border-bottom-width: 2px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <img src="/assets/images/Logo.png" alt="Paragon University Logo" style="height: 5rem;">
        <div style="display: flex; margin-left: 2rem; font-weight: 600;">
          <div style="position: relative;">
            <a href="#" style="font-weight: 500; font-size: 1rem; color: #1F2937; margin-left: 36px;">About</a>
            <div style="display: none; position: absolute; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Our History</a>
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Mission & Vision</a>
            </div>
          </div>
          <div style="position: relative;">
            <a href="#" style="font-weight: 500; font-size: 1rem; color: #1F2937; margin-left: 36px;">Paragon Students</a>
            <div style="display: none; position: absolute; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Current Students</a>
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Student Life</a>
            </div>
          </div>
          <div style="position: relative;">
            <a href="#" style="font-weight: 500; font-size: 1rem; color: #1F2937; margin-left: 36px;">Prospective Students</a>
            <div style="display: none; position: absolute; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Admissions</a>
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Programs</a>
            </div>
          </div>
          <div style="position: relative;">
            <a href="#" style="font-weight: 500; font-size: 1rem; color: #1F2937; margin-left: 36px;">Academics</a>
            <div style="display: none; position: absolute; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Departments</a>
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Research</a>
            </div>
          </div>
          <div style="position: relative;">
            <a href="#" style="font-weight: 500; font-size: 1rem; color: #1F2937; margin-left: 36px;">Admissions</a>
            <div style="display: none; position: absolute; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Apply Now</a>
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Financial Aid</a>
            </div>
          </div>
          <div style="position: relative;">
            <a href="#" style="font-weight: 500; font-size: 1rem; color: #1F2937; margin-left: 36px;">Partnerships</a>
            <div style="display: none; position: absolute; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Collaborations</a>
              <a href="#" style="display: block; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; color: #1F2937;">Corporate Partners</a>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" style="width: 1.5rem; height: 1.5rem; margin-left: 36px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </main>`,
    category: 'Layout',
    attributes: { class: 'fa fa-lock' }
  });

  // Add custom blocks
  editor.BlockManager.add('accordion-block', {
    label: 'Accordion',
    content: `<div class="accordion">
                <div class="accordion-item">
                  <button class="accordion-header">Section 1</button>
                  <div class="accordion-body">Lorem ipsum...</div>
                </div>
                <div class="accordion-item">
                  <button class="accordion-header">Section 2</button>
                  <div class="accordion-body">Lorem ipsum...</div>
                </div>
                <div class="accordion-item">
                  <button class="accordion-header">Section 3</button>
                  <div class="accordion-body">Lorem ipsum...</div>
                </div>
              </div>`,
    category: 'Components',
    attributes: { class: 'fa fa-list-ul' }
  });

  editor.BlockManager.add('carousel-block', {
    label: 'Carousel',
    content: `<div class="carousel">
                <div class="carousel-item active">
                  <img src="http://placehold.it/350x150/78c5d6/fff/image1.jpg">
                </div>
                <div class="carousel-item">
                  <img src="http://placehold.it/350x150/459ba8/fff/image2.jpg">
                </div>
                <div class="carousel-item">
                  <img src="http://placehold.it/350x150/79c267/fff/image3.jpg">
                </div>
                <div class="carousel-item">
                  <img src="http://placehold.it/350x150/c5d647/fff/image4.jpg">
                </div>
                <div class="carousel-item">
                  <img src="http://placehold.it/350x150/f28c33/fff/image5.jpg">
                </div>
                <div class="carousel-item">
                  <img src="http://placehold.it/350x150/e868a2/fff/image6.jpg">
                </div>
              </div>`,
    category: 'Components',
    attributes: { class: 'fa fa-picture-o' }
  });
};

const uploadFileToSpace = async (file) => {
  const response = await fetch(`https://mypress.paragoniu.app/image/generate-url?filename=${file.name}`);
  if (!response.ok) {
    throw new Error('Failed to generate pre-signed URL');
  }
  const data = await response.json();

  if (!data.success) {
    throw new Error('Failed to generate pre-signed URL');
  }

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
      upload: false,
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
    styleManager: {
      sectors: [
        {
          name: 'General',
          buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
          properties: [
            {
              name: 'Display',
              property: 'display',
              type: 'select',
              defaults: 'block',
              list: [
                { value: 'block', name: 'Block' },
                { value: 'inline', name: 'Inline' },
                { value: 'inline-block', name: 'Inline Block' },
                { value: 'flex', name: 'Flex' },
                { value: 'inline-flex', name: 'Inline Flex' },
                { value: 'grid', name: 'Grid' },
                { value: 'inline-grid', name: 'Inline Grid' },
              ]
            },
            {
              name: 'Position',
              property: 'position',
              type: 'select',
              defaults: 'static',
              list: [
                { value: 'static', name: 'Static' },
                { value: 'relative', name: 'Relative' },
                { value: 'absolute', name: 'Absolute' },
                { value: 'fixed', name: 'Fixed' },
                { value: 'sticky', name: 'Sticky' }
              ]
            }
          ]
        },
        {
          name: 'Dimension',
          open: false,
          buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
          properties: [
            {
              name: 'Margin',
              property: 'margin',
              type: 'composite',
              properties: [
                { name: 'Top', property: 'margin-top', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
                { name: 'Right', property: 'margin-right', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
                { name: 'Bottom', property: 'margin-bottom', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
                { name: 'Left', property: 'margin-left', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
              ]
            },
            {
              name: 'Padding',
              property: 'padding',
              type: 'composite',
              properties: [
                { name: 'Top', property: 'padding-top', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
                { name: 'Right', property: 'padding-right', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
                { name: 'Bottom', property: 'padding-bottom', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
                { name: 'Left', property: 'padding-left', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
              ]
            },
          ]
        },
        {
          name: 'Typography',
          open: false,
          buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align'],
          properties: [
            { name: 'Font', property: 'font-family', type: 'select', defaults: 'Arial', list: [{ value: 'Arial' }, { value: 'Georgia' }, { value: 'Times New Roman' }] },
            { name: 'Size', property: 'font-size', type: 'integer', units: ['px', 'em', '%'], defaults: '14px' },
            { name: 'Weight', property: 'font-weight', type: 'select', defaults: 'normal', list: [{ value: 'normal' }, { value: 'bold' }, { value: 'bolder' }, { value: 'lighter' }] },
            { name: 'Letter Spacing', property: 'letter-spacing', type: 'integer', units: ['px', 'em', '%'], defaults: 0 },
            { name: 'Color', property: 'color', type: 'color', defaults: 'black' },
            { name: 'Line Height', property: 'line-height', type: 'integer', units: ['px', 'em', '%'], defaults: 'normal' },
            { name: 'Align', property: 'text-align', type: 'radio', defaults: 'left', list: [{ value: 'left' }, { value: 'center' }, { value: 'right' }, { value: 'justify' }] }
          ]
        },
        {
          name: 'Decorations',
          open: false,
          buildProps: ['border-radius', 'border', 'box-shadow', 'background'],
          properties: [
            { name: 'Border Radius', property: 'border-radius', type: 'composite', properties: [{ name: 'Top', property: 'border-top-left-radius', type: 'integer', units: ['px', 'em', '%'], defaults: 0 }, { name: 'Right', property: 'border-top-right-radius', type: 'integer', units: ['px', 'em', '%'], defaults: 0 }, { name: 'Bottom', property: 'border-bottom-left-radius', type: 'integer', units: ['px', 'em', '%'], defaults: 0 }, { name: 'Left', property: 'border-bottom-right-radius', type: 'integer', units: ['px', 'em', '%'], defaults: 0 }] },
            { name: 'Border', property: 'border', type: 'composite', properties: [{ name: 'Width', property: 'border-width', type: 'integer', units: ['px', 'em', '%'], defaults: 0 }, { name: 'Style', property: 'border-style', type: 'select', defaults: 'solid', list: [{ value: 'solid' }, { value: 'dotted' }, { value: 'dashed' }, { value: 'double' }] }, { name: 'Color', property: 'border-color', type: 'color', defaults: 'black' }] },
            { name: 'Box Shadow', property: 'box-shadow', type: 'composite', properties: [{ name: 'Horizontal', property: 'box-shadow-h', type: 'integer', units: ['px', 'em', '%'], defaults: 0 }, { name: 'Vertical', property: 'box-shadow-v', type: 'integer', units: ['px', 'em', '%'], defaults: 0 }, { name: 'Blur', property: 'box-shadow-blur', type: 'integer', units: ['px', 'em', '%'], defaults: 0 }, { name: 'Spread', property: 'box-shadow-spread', type: 'integer', units: ['px', 'em', '%'], defaults: 0 }, { name: 'Color', property: 'box-shadow-color', type: 'color', defaults: 'black' }] },
            { name: 'Background', property: 'background', type: 'composite', properties: [{ name: 'Color', property: 'background-color', type: 'color', defaults: 'transparent' }, { name: 'Image', property: 'background-image', type: 'file' }, { name: 'Position', property: 'background-position', type: 'select', defaults: 'left top', list: [{ value: 'left top' }, { value: 'left center' }, { value: 'left bottom' }, { value: 'right top' }, { value: 'right center' }, { value: 'right bottom' }, { value: 'center top' }, { value: 'center center' }, { value: 'center bottom' }] }, { name: 'Repeat', property: 'background-repeat', type: 'select', defaults: 'no-repeat', list: [{ value: 'no-repeat' }, { value: 'repeat' }, { value: 'repeat-x' }, { value: 'repeat-y' }] }, { name: 'Size', property: 'background-size', type: 'select', defaults: 'auto', list: [{ value: 'auto' }, { value: 'cover' }, { value: 'contain' }] }] }
          ]
        },
        {
          name: 'Extra',
          open: false,
          buildProps: ['opacity', 'visibility', 'cursor', 'z-index'],
          properties: [
            { name: 'Opacity', property: 'opacity', type: 'integer', units: ['%'], defaults: 100, min: 0, max: 100 },
            { name: 'Visibility', property: 'visibility', type: 'radio', defaults: 'visible', list: [{ value: 'visible', name: 'Visible' }, { value: 'hidden', name: 'Hidden' }] },
            { name: 'Cursor', property: 'cursor', type: 'select', defaults: 'auto', list: [{ value: 'auto', name: 'Auto' }, { value: 'pointer', name: 'Pointer' }, { value: 'move', name: 'Move' }, { value: 'text', name: 'Text' }, { value: 'wait', name: 'Wait' }, { value: 'help', name: 'Help' }, { value: 'not-allowed', name: 'Not Allowed' }] },
            { name: 'Z-index', property: 'z-index', type: 'integer', defaults: 1 }
          ]
        }
      ]
    }
  });

  const pageContent = await fetchPageContent(pageId);
  if (pageContent && pageContent.html && pageContent.css) {
    editor.setComponents(pageContent.html);
    editor.setStyle(pageContent.css);
  } else {
    editor.BlockManager.get('fixed-content-block').set({ active: true });
    editor.runCommand('core:canvas-clear');
  }

  customElementsPlugin(editor);
});
</script>


<style scoped>
@import "assets/css/style.css";

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

