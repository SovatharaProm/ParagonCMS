<template>
  <div
    ref="grapesjsEditor"
    class="grapesjs-editor border-[1px] border-[solid] border-[#ddd] rounded-[3px]"
  ></div>

  <div class="sticky-footer">
    <NuxtLink :to="discardRoute" class="mr-5">
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
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import plugin from "grapesjs-tailwind";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

const grapesjsEditor = ref(null);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
let editor = null;

const discardRoute = computed(() => {
  if (authStore.userRole === "admin" || authStore.userRole === "super_admin") {
    return "/admin/website";
  }
  return "/";
});

const saveContent = async () => {
  if (!editor) {
    console.error("Editor is not initialized");
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
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/update-page-content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    if (result.code === 200) {
      toast.success("Content saved successfully!");
      if (
        authStore.userRole === "admin" ||
        authStore.userRole === "super_admin"
      ) {
        router.push("/admin/website");
      } else {
        router.push("/");
      }
    } else {
      toast.error("Error: " + result.message);
    }
  } catch (error) {
    toast.error("Error: " + error.message);
  }
};

const fetchPageContent = async (pageId) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/edit-page-content?page_id=${pageId}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    if (!response.ok) {
      if (response.status === 403 || response.status === 400) {
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to fetch page content");
    }
    const data = await response.json();
    if (data.code === 200) {
      return data.data["Page Content"];
    } else {
      console.error("Error fetching page content:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching page content:", error);
    if (error.message === "Unauthorized") {
      toast.error("User does not have permission");
      router.push("/");
    } else {
      toast.error("Error fetching page content: " + error.message);
    }
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
      '<img data-gjs-type="image" src="/path-to-default-image.jpg" alt="Placeholder image"/>',
    category: "Basic",
    attributes: { class: "fa fa-image" },
  });

  editor.Blocks.add("icon-bar-block", {
    label: "Icon Bar",
    content: `
        <div class="container mx-auto" style="display: flex; justify-content: space-around; align-items: center; padding: 10px; background-color: #f4f4f4;">
        <div class="item" style="text-align: left; padding: 10px; color: #2c3e50; width: 300px">
            <img src="/apple-icon.png" style="width: 50px; height: 50px; float: left" alt="Student Clubs">
            <p style="font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; ">Student Clubs</p>
            <a style="font-size: 1rem; line-height: 1.5rem;  font-style: italic; font-weight: 700; " href="#">Read more ...</a>
        </div>
        <div class="item" style="text-align: left; padding: 10px; color: #2c3e50; width: 300px">
            <img src="/graduate-icon.png" style="width: 50px; height: 50px; float: left" alt="Partner Universities">
            <p style="font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; ">Partner Universities</p>
            <a style="font-size: 1rem; line-height: 1.5rem;  font-style: italic; font-weight: 700; " href="#">Read more ...</a>
        </div>
        <div class="item" style="text-align: left; padding: 10px; color: #2c3e50; width: 300px">
            <img src="/scholarship-icon.png" style="width: 50px; height: 50px; float: left" alt="Active Scholarships">
            <p style="font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; ">Active Scholarships</p>
            <a style="font-size: 1rem; line-height: 1.5rem;  font-style: italic; font-weight: 700; " href="#">Read more ...</a>
        </div>
        <div class="item" style="text-align: left; padding: 10px; color: #2c3e50; width: 300px">
            <img src="/gallery-icon.png" style="width: 50px; height: 50px; float: left" alt="Gallery">
            <p style="font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; ">Gallery</p>
            <a style="font-size: 1rem; line-height: 1.5rem;  font-style: italic; font-weight: 700; " href="#">View ...</a>
        </div>
    </div>`,
    category: "Advanced",
    attributes: { class: "fa fa-cog" },
  });

  editor.Blocks.add("page-detail-block", {
    label: "Page Detail",
    content: `
        <div class="container" style="width: 300px; margin: 20px auto; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div class="header" style="background-color: #f1f1f1; padding: 20px; text-align: center; border-bottom: 1px solid #ddd;">
            <h2 style="margin: 0; font-size: 1.5em; color: #333; text-align: left;">Computer Science</h2>
        </div>
        <div class="content" style="padding: 20px;">
            <a href="#" class="link" style="display: block; margin: 10px 0; text-decoration: none; color: #333; font-size: 1.2em; position: relative; padding-left: 20px;">Academic Staff</a>
            <a href="#" class="link" style="display: block; margin: 10px 0; text-decoration: none; color: #333; font-size: 1.2em; position: relative; padding-left: 20px;">Department FB Page</a>
            <a href="#" class="link" style="display: block; margin: 10px 0; text-decoration: none; color: #333; font-size: 1.2em; position: relative; padding-left: 20px;">FAQ</a>
            <a href="#" class="link" style="display: block; margin: 10px 0; text-decoration: none; color: #333; font-size: 1.2em; position: relative; padding-left: 20px;">Apply for Admission</a>
        </div>
    </div>`,
    category: "Advanced",
    attributes: { class: "fa fa-list-ul" },
  });

  editor.Blocks.add("dep-contact-block", {
    label: "Department Contact",
    content: `
    <body style="font-family: Arial, sans-serif;
            background-color: #1d274b;
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200vh;
            margin: 0;">
        <div class="container" style="background-color: #273264;
            padding: 20px;
            width: 300px;
            text-align: left;">
        <h2 style="color: #ffffff;
            margin-bottom: 20px;">Department Contact Info</h2>
        <div class="info" style="margin-bottom: 20px;">
            <h3 style="color: #fbbd05;
            margin-top: 0;">Department of Computer Science</h3>
            <p style="color: #ffffff"><span class="icon">📍</span> Paragon International University</p>
            <p style="color: #ffffff"><span class="icon">⏰</span> Monday – Friday ➡️ 08:00 – 17:00</p>
            <p style="color: #ffffff"><span class="icon">✉️</span> ict@paragoniu.edu.kh</p>
        </div>
        <div class="social">
            <h2 style="style="color: #ffffff;
            margin-bottom: 20px;">Social Info</h2>
            <p style="color: #ffffff"><a href="#">Facebook</a></p>
        </div>
    </div>
    </body>`,
    category: "Advanced",
    attributes: { class: "fa fa-list-ul" },
  });

  editor.Blocks.add("faculty-departments-block", {
    label: "Faculty Departments",
    content: `
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
        <table style="width: 100%; border-collapse: collapse; margin: 0 auto; background-color: #ffffff;">
            <thead>
                <tr>
                    <th style="background-color: #fbbd05; color: white; padding: 10px; text-align: left; font-size: 1.2em;">Faculty</th>
                    <th style="background-color: #fbbd05; color: white; padding: 10px; text-align: left; font-size: 1.2em;">Departments</th>
                    <th style="background-color: #fbbd05; color: white; padding: 10px; text-align: left; font-size: 1.2em;">Fee/Semester</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left;">Faculty of Engineering</td>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left; background-color: #f8f8f8;">Architecture<br>Civil Engineering<br>Industrial Engineering</td>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left;">2,250 USD</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left;">Faculty of Information and Computer Technologies</td>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left; background-color: #f8f8f8;">Computer Science<br>Management of Information Systems</td>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left;">1,750 USD</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left;">Economics and Administrative Sciences</td>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left; background-color: #f8f8f8;">Banking and Finance<br>Business Administration<br>International Trade and Logistics<br>International Relations</td>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left;">1,500 USD</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left;">English Preparatory School</td>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left; background-color: #f8f8f8;"></td>
                    <td style="border: 1px solid #dddddd; padding: 10px; text-align: left;">1,250 USD</td>
                </tr>
            </tbody>
        </table>
    </div>`,
    category: "Advanced",
    attributes: { class: "fa fa-table" },
  });

  editor.Blocks.add("video-block", {
    label: "Video",
    content:
      '<video controls><source src="/path-to-video.mp4" type="video/mp4">Your browser does not support the video tag.</video>',
    category: "Basic",
    attributes: { class: "fa fa-video-camera" },
  });

  editor.Blocks.add("link-block", {
    label: "Link",
    content: '<a href="#" class="custom-link">Click here</a>',
    category: "Basic",
    attributes: { class: "fa fa-link" },
  });

  editor.Blocks.add("map-block", {
    label: "Map",
    content: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019879094116!2d144.96305831531678!3d-37.81410797975133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf5777529bb4d3bd5!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1614114372457!5m2!1sen!2sau" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`,
    category: "Basic",
    attributes: { class: "fa fa-map" },
  });

  editor.Blocks.add("text-section-block", {
    label: "Text Section",
    content: `<div class="text-section">
                <h2>Title</h2>
                <p>This is a text section. Add your content here.</p>
              </div>`,
    category: "Basic",
    attributes: { class: "fa fa-font" },
  });

  editor.Blocks.add("link-block", {
    label: "Link",
    content: '<a href="#" class="custom-link">Click here</a>',
    category: "Basic",
    attributes: { class: "fa fa-link" },
  });

  editor.Blocks.add("testimonial-block", {
    label: "Testimonial",
    content: `<div class="testimonial">
                <p>"This is a fantastic product! Highly recommend it to everyone."</p>
                <cite>- Jane Doe</cite>
              </div>`,
    category: "Basic",
    attributes: { class: "fa fa-quote-right" },
  });

  editor.Blocks.add("form-block", {
    label: "Form",
    content: `<form class="custom-form" style=" max-width: 400px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <input type="text" style=" width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" name="name" placeholder="Your Name"/>
                <input type="text" style=" width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" name="phonenumber" placeholder="Phone Number"/>
                <input type="text" style=" width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" name="email" placeholder="Email"/>
                <textarea style=" width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; resize: vertical; height: 100px;" name="message" placeholder="Your Message"></textarea>
                <div>
                  <label><input type="checkbox" name="subscribe"/> Subscribe to newsletter</label>
                </div>
                <div>
                  <label><input type="radio" name="gender" value="male"/> Male</label>
                  <label><input type="radio" name="gender" value="female"/> Female</label>
                </div>
                <button type="submit" style="width: 100%; padding: 10px; background: #007bff; border: none; border-radius: 4px; color: #fff; font-size: 16px; cursor: pointer;">Submit</button>
              </form>`,
    category: "Forms",
    attributes: { class: "fa fa-wpforms" },
  });

  editor.Blocks.add("contact-form-block", {
    label: "Contact Form",
    content: `<form class="contact-form">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email">
                <label for="message">Message:</label>
                <textarea id="message" name="message"></textarea>
                <button type="submit">Send</button>
              </form>`,
    category: "Forms",
    attributes: { class: "fa fa-envelope" },
  });

  editor.Blocks.add("input-block", {
    label: "Input",
    content:
      '<input type="text" name="name" placeholder="Your Name" class="custom-input"/>',
    category: "Forms",
    attributes: { class: "fa fa-pencil" },
  });

  editor.Blocks.add("textarea-block", {
    label: "Textarea",
    content:
      '<textarea name="message" placeholder="Your Message" class="custom-textarea"></textarea>',
    category: "Forms",
    attributes: { class: "fa fa-align-left" },
  });

  editor.Blocks.add("select-block", {
    label: "Select",
    content: `<select name="options" class="custom-select">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>`,
    category: "Forms",
    attributes: { class: "fa fa-caret-down" },
  });

  editor.Blocks.add("checkbox-block", {
    label: "Checkbox",
    content:
      '<label><input type="checkbox" name="subscribe" class="custom-checkbox"/> Subscribe to newsletter</label>',
    category: "Forms",
    attributes: { class: "fa fa-check-square" },
  });

  editor.Blocks.add("radio-block", {
    label: "Radio",
    content: `<div>
                <label><input type="radio" name="gender" value="male" class="custom-radio"/> Male</label>
                <label><input type="radio" name="gender" value="female" class="custom-radio"/> Female</label>
              </div>`,
    category: "Forms",
    attributes: { class: "fa fa-dot-circle-o" },
  });

  editor.Blocks.add("button-block", {
    label: "Button",
    content: `<button class="btn-primary" style="font-size: .92em !important; padding: 15px 35px !important; background: #ffae00 !important; color: #ffffff !important; letter-spacing: 1px; font-weight: bold !important;
    text-transform: uppercase;
    border: none !important;
    border-radius: 3px !important;
    height: auto !important;">Click Me</button>`,
    category: "Forms",
    attributes: { class: "fa fa-minus-square-o" },
  });

  editor.Blocks.add("feature-list-block", {
    label: "Feature List",
    content: `<ul class="features">
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
              </ul>`,
    category: "Extra",
    attributes: { class: "fa fa-list" },
  });

  editor.Blocks.add("footer-block", {
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
          <img src="/assets/images/Logo.png" alt="Paragon University Logo" class="h-20">
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
    attributes: { class: "fa fa-file-text-o" },
  });

  editor.Blocks.add("faq-block", {
    label: "FAQ",
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
    category: "Extra",
    attributes: { class: "fa fa-question-circle" },
  });

  editor.Blocks.add("team-section-block", {
    label: "Team Section",
    content: `<div class="team-section">
                <h2>Our Team</h2>
                <div class="team-member">
                  <img src="/path-to-image.jpg" alt="Team Member">
                  <h3>Member Name</h3>
                  <p>Position</p>
                </div>
                <div class="team-member">
                  <img src="/path-to-image.jpg" alt="Team Member">
                  <h3>Member Name</h3>
                  <p>Position</p>
                </div>
              </div>`,
    category: "Extra",
    attributes: { class: "fa fa-users" },
  });

  editor.Blocks.add("cta-block", {
    label: "Call to Action",
    content: `<div class="cta">
                <h2>Call to Action</h2>
                <p>This is an important call to action message.</p>
                <button class="btn-cta">Take Action</button>
              </div>`,
    category: "Extra",
    attributes: { class: "fa fa-bullhorn" },
  });

  editor.Blocks.add("curriculum-table", {
    label: "Curriculum Table",
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
    category: "Extra",
    attributes: { class: "fa fa-table" },
  });

  editor.DomComponents.addType("fixed-content", {
    model: {
      defaults: {
        name: "Fixed Content",
        draggable: false,
        copyable: false,
        removable: false,
        content: `<div class="fixed-content">
                     <h1>Welcome to My Website</h1>
                     <p>This content is fixed and cannot be edited or removed.</p>
                   </div>`,
      },
    },
  });

  editor.Blocks.add("fixed-content-block", {
    label: "NavBar",
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
    category: "Layout",
    attributes: { class: "fa fa-lock" },
  });
};

const uploadFileToSpace = async (file) => {
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

  const pageId = route.query.id;
  if (!pageId) {
    console.error("Page ID is missing");
    return;
  }

  editor = grapesjs.init({
    container: grapesjsEditor.value,
    plugins: [customElementsPlugin, plugin],
    fromElement: true,
    height: "100vh",
    width: "100%",
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
            console.error("Error uploading file:", error);
          }
        }

        editor.AssetManager.add(images);
      },
    },
    styleManager: {
      sectors: [
        {
          name: "General",
          open: false,
          buildProps: [
            "float",
            "display",
            "position",
            "top",
            "right",
            "left",
            "bottom",
          ],
        },
        {
          name: "Dimension",
          open: false,
          buildProps: [
            "width",
            "min-height",
            "height",
            "max-width",
            "min-width",
            "max-height",
          ],
        },
        {
          name: "Typography",
          open: false,
          buildProps: [
            "font-family",
            "font-size",
            "font-weight",
            "letter-spacing",
            "color",
            "line-height",
            "text-align",
            "text-decoration",
            "text-shadow",
          ],
        },
        {
          name: "Decoration",
          open: false,
          buildProps: [
            "background-color",
            "border-radius",
            "border",
            "box-shadow",
            "background",
          ],
        },
        {
          name: "Extra",
          open: false,
          buildProps: ["opacity", "transition", "perspective", "transform"],
        },
        {
          name: "Flex",
          open: false,
          buildProps: [
            "flex-direction",
            "align-items",
            "justify-content",
            "flex-wrap",
            "align-content",
            "order",
            "flex-basis",
            "flex-grow",
            "flex-shrink",
          ],
          properties: [
            {
              name: "Flex",
              property: "display",
              type: "select",
              defaults: "flex",
              list: [{ value: "flex" }, { value: "inline-flex" }],
            },
            {
              name: "Direction",
              property: "flex-direction",
              type: "select",
              defaults: "row",
              list: [
                { value: "row" },
                { value: "row-reverse" },
                { value: "column" },
                { value: "column-reverse" },
              ],
            },
            {
              name: "Wrap",
              property: "flex-wrap",
              type: "select",
              defaults: "nowrap",
              list: [
                { value: "nowrap" },
                { value: "wrap" },
                { value: "wrap-reverse" },
              ],
            },
            {
              name: "Justify Content",
              property: "justify-content",
              type: "select",
              defaults: "flex-start",
              list: [
                { value: "flex-start" },
                { value: "flex-end" },
                { value: "center" },
                { value: "space-between" },
                { value: "space-around" },
                { value: "space-evenly" },
              ],
            },
            {
              name: "Align Items",
              property: "align-items",
              type: "select",
              defaults: "stretch",
              list: [
                { value: "stretch" },
                { value: "flex-start" },
                { value: "flex-end" },
                { value: "center" },
                { value: "baseline" },
              ],
            },
            {
              name: "Align Content",
              property: "align-content",
              type: "select",
              defaults: "stretch",
              list: [
                { value: "stretch" },
                { value: "flex-start" },
                { value: "flex-end" },
                { value: "center" },
                { value: "space-between" },
                { value: "space-around" },
              ],
            },
            {
              name: "Gap",
              property: "gap",
              type: "integer",
              units: ["px", "em", "%"],
              defaults: 0,
            },
            {
              name: "Row Gap",
              property: "row-gap",
              type: "integer",
              units: ["px", "em", "%"],
              defaults: 0,
            },
            {
              name: "Column Gap",
              property: "column-gap",
              type: "integer",
              units: ["px", "em", "%"],
              defaults: 0,
            },
          ],
        },
        {
          name: "Advanced",
          open: false,
          buildProps: [
            "z-index",
            "align-self",
            "background-attachment",
            "background-blend-mode",
            "background-clip",
            "background-origin",
            "background-position-x",
            "background-position-y",
            "background-repeat",
            "background-size",
            "border-collapse",
            "border-spacing",
            "caption-side",
            "empty-cells",
            "table-layout",
            "animation",
            "animation-name",
            "animation-duration",
            "animation-timing-function",
            "animation-delay",
            "animation-iteration-count",
            "animation-direction",
            "animation-fill-mode",
            "animation-play-state",
            "backdrop-filter",
            "cursor",
            "pointer-events",
            "transition-property",
            "transition-duration",
            "transition-timing-function",
            "transition-delay",
            "transform",
            "transform-origin",
            "backface-visibility",
            "filter",
          ],
        },
      ],
    },
  });

  document.documentElement.style.setProperty("--gjs-primary-color", "#172947");
  document.documentElement.style.setProperty("--gjs-secondary-color", "#fff");

  const pageContent = await fetchPageContent(pageId);
  if (pageContent && pageContent.html && pageContent.css) {
    editor.setComponents(pageContent.html);
    editor.setStyle(pageContent.css);
  } else {
    editor.BlockManager.get("fixed-content-block").set({ active: true });
    editor.runCommand("core:canvas-clear");
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
