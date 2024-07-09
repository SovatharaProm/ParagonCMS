<template>
  <div ref="grapesjsEditor" class="grapesjs-editor border-[1px] border-[solid] border-[#ddd] rounded-[3px]"></div>

  <div class="flex justify-end my-5 ml-[300px] flex-grow">
    <NuxtLink :to="discardRoute" class="mr-5">
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
      router.push('/'); // Redirect the user to a different page
    } else {
      toast.error('Error fetching page content: ' + error.message);
    }
    return null;
  }
};

const customElementsPlugin = (editor) => {
  editor.Blocks.add('1-column', {
    label: '1 Column',
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color:#fffff"></div>
              </div>`,
    category: 'Column',
    attributes: { class: 'fa fa-columns' },
  });

  editor.Blocks.add('2-columns', {
    label: '2 Columns',
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Column',
    attributes: { class: 'fa fa-columns' },
  });

  editor.Blocks.add('2-columns-2-3', {
    label: '2 Columns 2/3',
    content: `<div style="display:flex;">
                <div style="flex: 2; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex: 3; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Column',
    attributes: { class: 'fa fa-columns' },
  });

  editor.Blocks.add('2-columns-3-7', {
    label: '2 Columns 3/7',
    content: `<div style="display:flex;">
                <div style="flex: 3; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex: 7; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Column',
    attributes: { class: 'fa fa-columns' },
  });

  editor.Blocks.add('2-columns-7-3', {
    label: '2 Columns 7/3',
    content: `<div style="display:flex;">
                <div style="flex: 7; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex: 3; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Column',
    attributes: { class: 'fa fa-columns' },
  });

  editor.Blocks.add('3-columns', {
    label: '3 Columns',
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Column',
    attributes: { class: 'fa fa-columns' },
  });

  editor.Blocks.add('4-columns', {
    label: '4 Columns',
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Column',
    attributes: { class: 'fa fa-columns' },
  });

  editor.Blocks.add('text-block', {
    label: 'Text',
    content: '<div data-gjs-type="text">Insert your text here</div>',
    category: 'Basic',
    attributes: { class: 'fa fa-text-height' },
  });

  editor.Blocks.add('image-block', {
    label: 'Image',
    content: '<img data-gjs-type="image" src="" alt="Placeholder image"/>',
    category: 'Basic',
    attributes: { class: 'fa fa-image' },
  });

  editor.Blocks.add('image-slideshow-block', {
    label: 'Image Slideshow',
    content: `
        <div class="image-slideshow">
            <div class="slides">
                <div class="slide"><img src="" alt="Image 1"></div>
                <div class="slide"><img src="" alt="Image 2"></div>
                <div class="slide"><img src="" alt="Image 3"></div>
            </div>
            <a class="prev">&#10094;</a>
            <a class="next">&#10095;</a>
        </div>
    `,
    category: 'Advanced',
    attributes: { class: 'fa fa-images' },
  });

  editor.Blocks.add('video-block', {
    label: 'Video',
    content: '<video controls></video>',
    category: 'Basic',
    attributes: { class: 'fa fa-video-camera' },
  });

  editor.Blocks.add('link-block', {
    label: 'Link',
    content: '<a href="#" class="custom-link">Click here</a>',
    category: 'Basic',
    attributes: { class: 'fa fa-link' },
  });

  editor.Blocks.add('map-block', {
    label: 'Map',
    content: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019879094116!2d144.96305831531678!3d-37.81410797975133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf5777529bb4d3bd5!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1614114372457!5m2!1sen!2sau" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`,
    category: 'Basic',
    attributes: { class: 'fa fa-map' },
  });

  editor.Blocks.add('text-section-block', {
    label: 'Text Section',
    content: `<div class="text-section">
                <h2>Title</h2>
                <p>This is a text section. Add your content here.</p>
              </div>`,
    category: 'Basic',
    attributes: { class: 'fa fa-font' },
  });

  editor.Blocks.add('link-block', {
    label: 'Link',
    content: '<a href="#" class="custom-link">Click here</a>',
    category: 'Basic',
    attributes: { class: 'fa fa-link' },
  });

  editor.Blocks.add('testimonial-block', {
    label: 'Testimonial',
    content: `<div class="testimonial">
                <p>"This is a fantastic product! Highly recommend it to everyone."</p>
                <cite>- Jane Doe</cite>
              </div>`,
    category: 'Basic',
    attributes: { class: 'fa fa-quote-right' },
  });

  editor.Blocks.add('form-block', {
    label: 'Form',
    content: `<form class="custom-form">
                <input type="text" name="name" placeholder="Your Name"/>
                <textarea name="message" placeholder="Your Message"></textarea>
                <select name="options">
                  <option value="option1">Option 1</option>
                  <option value="option2"></option>
                </select>
                <div>
                  <label><input type="checkbox" name="subscribe"/> Subscribe to newsletter</label>
                </div>
                <div>
                  <label><input type="radio" name="gender" value="male"/> Male</label>
                  <label><input type="radio" name="gender" value="female"/> Female</label>
                </div>
                <button type="submit">Submit</button>
              </form>`,
    category: 'Forms',
    attributes: { class: 'fa fa-wpforms' },
  });

  editor.Blocks.add('contact-form-block', {
    label: 'Contact Form',
    content: `<form class="contact-form">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email">
                <label for="message">Message:</label>
                <textarea id="message" name="message"></textarea>
                <button type="submit">Send</button>
              </form>`,
    category: 'Forms',
    attributes: { class: 'fa fa-envelope' },
  });

  editor.Blocks.add('input-block', {
    label: 'Input',
    content: '<input type="text" name="name" placeholder="Your Name" class="custom-input"/>',
    category: 'Forms',
    attributes: { class: 'fa fa-pencil' },
  });

  editor.Blocks.add('textarea-block', {
    label: 'Textarea',
    content: '<textarea name="message" placeholder="Your Message" class="custom-textarea"></textarea>',
    category: 'Forms',
    attributes: { class: 'fa fa-align-left' },
  });

  editor.Blocks.add('select-block', {
    label: 'Select',
    content: `<select name="options" class="custom-select">
                <option value="option1">Option 1</option>
                <option value="option2"></option>
              </select>`,
    category: 'Forms',
    attributes: { class: 'fa fa-caret-down' },
  });

  editor.Blocks.add('checkbox-block', {
    label: 'Checkbox',
    content: '<label><input type="checkbox" name="subscribe" class="custom-checkbox"/> Subscribe to newsletter</label>',
    category: 'Forms',
    attributes: { class: 'fa fa-check-square' },
  });

  editor.Blocks.add('radio-block', {
    label: 'Radio',
    content: `<div>
                <label><input type="radio" name="gender" value="male" class="custom-radio"/> Male</label>
                <label><input type="radio" name="gender" value="female" class="custom-radio"/> Female</label>
              </div>`,
    category: 'Forms',
    attributes: { class: 'fa fa-dot-circle-o' },
  });

  editor.Blocks.add('button-block', {
    label: 'Button',
    content: `<button class="btn-primary" style="
    font-size: .92em !important;
    padding: 15px 35px !important;
    background: #2a3037 !important;
    color: #ffffff !important;
    letter-spacing: 1px;
    font-weight: bold !important;
    text-transform: uppercase;
    border: none !important;
    border-radius: 3px !important;
    height: auto !important;">Click Me</button>`,
    category: 'Forms',
    attributes: { class: 'fa fa-minus-square-o' },
  });

  editor.Blocks.add('navbar-block', {
    label: 'Navigation Bar',
    content: `<nav class="navbar" 
    style="background-color: #fff;
    color: white;
    padding: 10px 0;">
                <a href="#home">Home</a>
                <a href="#services">Services</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
              </nav>`,
    category: 'Extra',
    attributes: { class: 'fa fa-bars' },
  });

  editor.Blocks.add('feature-list-block', {
    label: 'Feature List',
    content: `<ul class="features">
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
              </ul>`,
    category: 'Extra',
    attributes: { class: 'fa fa-list' },
  });

  editor.Blocks.add('footer-block', {
    label: 'Footer',
    content: `<footer>
                <p>Contact Us: email@example.com</p>
                <p>&copy; 2023 Company Name</p>
              </footer>`,
    category: 'Extra',
    attributes: { class: 'fa fa-file-text-o' },
  });

  editor.Blocks.add('faq-block', {
    label: 'FAQ',
    content: `<div class="faq">
                <h2>Frequently Asked Questions</h2>
                <div class="faq-item">
                  <h3>Question 1</h3>
                  <p>Answer to question 1.</p>
                </div>
                <div class="faq-item">
                  <h3>Question 2</h3>
                  <p>Answer to question 2.</p>
                </div>
              </div>`,
    category: 'Extra',
    attributes: { class: 'fa fa-question-circle' },
  });

  editor.Blocks.add('team-section-block', {
    label: 'Team Section',
    content: `<div class="team-section">
                <h2>Our Team</h2>
                <div class="team-member">
                  <img src="" alt="Team Member">
                  <h3>Member Name</h3>
                  <p>Position</p>
                </div>
                <div class="team-member">
                  <img src="" alt="Team Member">
                  <h3>Member Name</h3>
                  <p>Position</p>
                </div>
              </div>`,
    category: 'Extra',
    attributes: { class: 'fa fa-users' },
  });

  editor.Blocks.add('cta-block', {
    label: 'Call to Action',
    content: `<div class="cta">
                <h2>Call to Action</h2>
                <p>This is an important call to action message.</p>
                <button class="btn-cta">Take Action</button>
              </div>`,
    category: 'Extra',
    attributes: { class: 'fa fa-bullhorn' },
  });

  editor.Blocks.add('curriculum-table', {
    label: 'Curriculum Table',
    content: `<div style="display: flex; justify-content: space-around; padding: 20px;">
                <div style="background-color: #f9f9f9; border: 2px solid #ccc; padding: 20px; width: 48%;">
                    <h3 style="color: #333; margin-bottom: 15px;">Semester I</h3>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">ENGL 101 - Academic English I</div>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">ECON 100 - Introductory Economics</div>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">KHM 101 - Khmer Studies I</div>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">MATH 131 - Calculus I</div>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">CS 125 - Principles of Programming I</div>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">MIS 120 - Computers, the Internet, and the Networked Society</div>
                </div>
                <div style="background-color: #f9f9f9; border: 2px solid #ccc; padding: 20px; width: 48%;">
                    <h3 style="color: #333; margin-bottom: 15px;">Semester II</h3>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">ENGL 102 - Academic English II</div>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">KHM 102 - Khmer Studies II</div>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">ECON 201 - Microeconomics</div>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">CS 126 - Principles of Programming II</div>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">MATH 241 - Linear Algebra</div>
                    <div style="background-color: #fff; border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 5px;">CS 260 - Web Design & Development</div>
                </div>
            </div>`,
    category: 'Extra',
    attributes: { class: 'fa fa-table' },
  });

  editor.DomComponents.addType('fixed-content', {
     model: {
       defaults: {
         name: 'Fixed Content',
         draggable: false, // Disables dragging
         copyable: false, // Disables copying
         removable: false, // Disables removing
         content: `<div class="fixed-content">
                     <h1>Welcome to My Website</h1>
                     <p>This content is fixed and cannot be edited or removed.</p>
                   </div>`
       }
     }
   });
  
   // Now, add this new fixed content block to the canvas
   editor.BlockManager.add('fixed-content-block', {
     label: 'NavBar',
     content: `<header class="bg-blue-950 py-2 my-auto">
        <div class="container mx-auto flex items-center justify-between">
            <nav class="flex space-x-8">
                <a href="#" class="text-white hover:text-gray-300 my-auto">Rector's Scholarship</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto">Covid-19 Info</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto">Alumni</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto">Calendar</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto">FAQ</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto">Jobs@Paragon.U</a>
                <a href="#" class="text-white hover:text-gray-300 my-auto bg-yellow-300 p-2">My.Paragon.U</a>
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
    });
};

const uploadFileToSpace = async (file) => {
  const response = await fetch(`http://localhost:3001/generate-url?filename=${file.name}`);
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
  await authStore.initializeStore(); // Ensure the store is initialized and token is available

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
  });
  
  document.documentElement.style.setProperty('--gjs-primary-color', '#172947');
  document.documentElement.style.setProperty('--gjs-secondary-color', '#fff');

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
</style>
