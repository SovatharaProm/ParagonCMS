<template>
  <div ref="grapesjsEditor" class="grapesjs-editor border-[1px] border-[solid] border-[#ddd] rounded-[3px]"></div>

  <div class="flex justify-end my-5 ml-[300px] flex-grow">
    <NuxtLink to="/" class="mr-5">
      <v-btn class="text-none"
            color="blue-darken-4"
            variant="outlined"
            v-bind="props">Discard</v-btn>
    </NuxtLink>
    <NuxtLink to="/">
      <v-btn class="text-none text-white px-8 mr-5"
        color="blue-darken-4"
        variant="flat">Save</v-btn>
    </NuxtLink>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

const grapesjsEditor = ref(null);
const customElementsPlugin = editor => {
  editor.Blocks.add('1-column', {
    label: '1 Column',
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Basic',
    attributes: { class: 'fa fa-columns' }
  });

  editor.Blocks.add('2-columns', {
    label: '2 Columns',
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Basic',
    attributes: { class: 'fa fa-columns' }
  });

  editor.Blocks.add('2-columns-3-7', {
    label: '2 Columns 3/7',
    content: `<div style="display:flex;">
                <div style="flex: 3; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex: 7; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Basic',
    attributes: { class: 'fa fa-columns' }
  });

  editor.Blocks.add('3-columns', {
    label: '3 Columns',
    content: `<div style="display:flex;">
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
                <div style="flex-grow:1; min-height: 75px; margin: 5px; background-color: #f7f7f7"></div>
              </div>`,
    category: 'Basic',
    attributes: { class: 'fa fa-columns' }
  });

  editor.Blocks.add('text-block', {
    label: 'Text',
    content: '<div data-gjs-type="text">Insert your text here</div>',
    category: 'Basic',
    attributes: { class: 'fa fa-text-height' }
  });

  editor.Blocks.add('image-block', {
    label: 'Image',
    content: '<img data-gjs-type="image" src="path-to-default-image.jpg" alt="Placeholder image"/>',
    category: 'Basic',
    attributes: { class: 'fa fa-image' }
  });

  editor.Blocks.add('video-block', {
    label: 'Video',
    content: '<video controls><source src="path-to-video.mp4" type="video/mp4">Your browser does not support the video tag.</video>',
    category: 'Basic',
    attributes: { class: 'fa fa-video-camera' }
  });

   editor.Blocks.add('link-block', {
    label: 'Link',
    content: '<a href="#" class="custom-link">Click here</a>',
    category: 'Basic',
    attributes: { class: 'fa fa-link' }
  });

  editor.Blocks.add('map-block', {
    label: 'Map',
    content: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019879094116!2d144.96305831531678!3d-37.81410797975133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf5777529bb4d3bd5!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1614114372457!5m2!1sen!2sau" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`,
    category: 'Basic',
    attributes: { class: 'fa fa-map' }
  });

  editor.Blocks.add('text-section-block', {
    label: 'Text Section',
    content: `<div class="text-section">
                <h2>Title</h2>
                <p>This is a text section. Add your content here.</p>
              </div>`,
    category: 'Basic',
    attributes: { class: 'fa fa-font' }
  });

  editor.Blocks.add('link-block', {
    label: 'Link',
    content: '<a href="#" class="custom-link">Click here</a>',
    category: 'Basic',
    attributes: { class: 'fa fa-link' }
  });

  editor.Blocks.add('testimonial-block', {
    label: 'Testimonial',
    content: `<div class="testimonial">
                <p>"This is a fantastic product! Highly recommend it to everyone."</p>
                <cite>- Jane Doe</cite>
              </div>`,
    category: 'Basic',
    attributes: { class: 'fa fa-quote-right' }
  });

  editor.Blocks.add('form-block', {
    label: 'Form',
    content: `<form class="custom-form">
                <input type="text" name="name" placeholder="Your Name"/>
                <textarea name="message" placeholder="Your Message"></textarea>
                <select name="options">
                  <option value="option1">Option 1</option>
                  <option value="option2">Option 2</option>
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
    attributes: { class: 'fa fa-wpforms' }
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
    attributes: { class: 'fa fa-envelope' }
  });

  editor.Blocks.add('input-block', {
    label: 'Input',
    content: '<input type="text" name="name" placeholder="Your Name" class="custom-input"/>',
    category: 'Forms',
    attributes: { class: 'fa fa-pencil' }
  });

  editor.Blocks.add('textarea-block', {
    label: 'Textarea',
    content: '<textarea name="message" placeholder="Your Message" class="custom-textarea"></textarea>',
    category: 'Forms',
    attributes: { class: 'fa fa-align-left' }
  });

  editor.Blocks.add('select-block', {
    label: 'Select',
    content: `<select name="options" class="custom-select">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>`,
    category: 'Forms',
    attributes: { class: 'fa fa-caret-down' }
  });

  editor.Blocks.add('checkbox-block', {
    label: 'Checkbox',
    content: '<label><input type="checkbox" name="subscribe" class="custom-checkbox"/> Subscribe to newsletter</label>',
    category: 'Forms',
    attributes: { class: 'fa fa-check-square' }
  });

  editor.Blocks.add('radio-block', {
    label: 'Radio',
    content: `<div>
                <label><input type="radio" name="gender" value="male" class="custom-radio"/> Male</label>
                <label><input type="radio" name="gender" value="female" class="custom-radio"/> Female</label>
              </div>`,
    category: 'Forms',
    attributes: { class: 'fa fa-dot-circle-o' }
  });

  editor.Blocks.add('button-block', {
    label: 'Button',
    content: `<button class="btn-primary">Click Me</button>`,
    category: 'Forms',
    attributes: { class: 'fa fa-minus-square-o' }
  });

  editor.Blocks.add('navbar-block', {
    label: 'Navigation Bar',
    content: `<nav class="navbar">
                <a href="#home">Home</a>
                <a href="#services">Services</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
              </nav>`,
    category: 'Extra',
    attributes: { class: 'fa fa-bars' }
  });

  editor.Blocks.add('feature-list-block', {
    label: 'Feature List',
    content: `<ul class="features">
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
              </ul>`,
    category: 'Extra',
    attributes: { class: 'fa fa-list' }
  });

  editor.Blocks.add('footer-block', {
    label: 'Footer',
    content: `<footer>
                <p>Contact Us: email@example.com</p>
                <p>&copy; 2023 Company Name</p>
              </footer>`,
    category: 'Extra',
    attributes: { class: 'fa fa-file-text-o' } 
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
    attributes: { class: 'fa fa-question-circle' }
  });

  editor.Blocks.add('team-section-block', {
    label: 'Team Section',
    content: `<div class="team-section">
                <h2>Our Team</h2>
                <div class="team-member">
                  <img src="path-to-image.jpg" alt="Team Member">
                  <h3>Member Name</h3>
                  <p>Position</p>
                </div>
                <div class="team-member">
                  <img src="path-to-image.jpg" alt="Team Member">
                  <h3>Member Name</h3>
                  <p>Position</p>
                </div>
              </div>`,
    category: 'Extra',
    attributes: { class: 'fa fa-users' }
  });

  editor.Blocks.add('cta-block', {
    label: 'Call to Action',
    content: `<div class="cta">
                <h2>Call to Action</h2>
                <p>This is an important call to action message.</p>
                <button class="btn-cta">Take Action</button>
              </div>`,
    category: 'Extra',
    attributes: { class: 'fa fa-bullhorn' }
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
     label: 'Fixed Content',
     content: { type: 'fixed-content' },
     category: 'Fixed Elements',
     attributes: { class: 'fa fa-lock' }
   });
};
 // You can define a fixed content block here that won't change

const editor = grapesjs.init({
  container : '#gjs',
  plugins: [customElementsPlugin],
});

onMounted(() => {
  const editor = grapesjs.init({
    container: grapesjsEditor.value,
    plugins: [customElementsPlugin],
    fromElement: true,
    height: '100vh',
    width: '100%',
    storageManager: false,
  });
  
  document.documentElement.style.setProperty('--gjs-primary-color', '#172947');
  document.documentElement.style.setProperty('--gjs-secondary-color', '#fff');

    // Immediately load the fixed content into the editor on mount
    editor.BlockManager.get('fixed-content-block').set({ active: true });
  editor.runCommand('core:canvas-clear');
  editor.addComponents(
    `<body>
    <header class="header-banner" id="i8zx">
    <div id="isk2" class="container-width">
      <div class="logo-container">
        <div class="logo">GrapesJS
        </div>
      </div>
      <nav class="menu">
        <div class="menu-item">BUILDER
        </div>
        <div class="menu-item">TEMPLATE
        </div>
        <div class="menu-item">WEB
        </div>
      </nav>
      <div class="clearfix">
      </div>
      <div id="igboek">
        <span data-js="countdown" class="countdown-cont"><div class="countdown-block">
          <div data-js="countdown-day" class="countdown-digit">
          </div>
          <div class="countdown-label">days
          </div>
          </div><div class="countdown-block">
          <div data-js="countdown-hour" class="countdown-digit">
          </div>
          <div class="countdown-label">hours
          </div>
          </div><div class="countdown-block">
          <div data-js="countdown-minute" class="countdown-digit">
          </div>
          <div class="countdown-label">minutes
          </div>
          </div><div class="countdown-block">
          <div data-js="countdown-second" class="countdown-digit">
          </div>
          <div class="countdown-label">seconds
          </div>
          </div></span>
        <span data-js="countdown-endtext" class="countdown-endtext"></span>
      </div>
      <label>Label</label>
      <div id="igtewq" class="gjs-row">
        <div class="gjs-cell">
        </div>
        <div class="gjs-cell">
        </div>
      </div>
      <a id="i0jfzi"></a>
      <blockquote class="quote">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit
      </blockquote>
      <iframe frameborder="0" id="itdg1y" src="https://maps.google.com/maps?&q=cambodia&z=6&t=q&output=embed"></iframe>
      <div class="lead-title">Build your templates without coding
      </div>
      <div id="irty9i">Insert your text here
      </div>
      <div class="sub-lead-title">All text blocks could be edited easily with double clicking on it. You can create new text blocks with the command from the left panel
      </div>
      <div id="iq2z51" class="gjs-row">
        <div class="gjs-cell">
        </div>
        <div class="gjs-cell">
        </div>
        <div id="i6mwnk" class="gjs-cell">
        </div>
      </div>
      <div class="lead-btn">Hover me
      </div>
    </div>
  </header>
  <section class="flex-sect">
    <div class="container-width">
      <div class="flex-title">Flex is the new black
      </div>
      <div class="flex-desc">With flexbox system you're able to build complex layouts easily and with free responsivity
      </div>
      <div class="cards">
        <div class="card">
          <div class="card-header">
          </div>
          <div class="card-body">
            <div class="card-title">Title one
            </div>
            <div class="card-sub-title">Subtitle one
            </div>
            <div class="card-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header ch2">
          </div>
          <div class="card-body">
            <div class="card-title">Title two
            </div>
            <div class="card-sub-title">Subtitle two
            </div>
            <div class="card-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header ch3">
          </div>
          <div class="card-body">
            <div class="card-title">Title three
            </div>
            <div class="card-sub-title">Subtitle three
            </div>
            <div class="card-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header ch4">
          </div>
          <div class="card-body">
            <div class="card-title">Title four
            </div>
            <div class="card-sub-title">Subtitle four
            </div>
            <div class="card-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header ch5">
          </div>
          <div class="card-body">
            <div class="card-title">Title five
            </div>
            <div class="card-sub-title">Subtitle five
            </div>
            <div class="card-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header ch6">
          </div>
          <div class="card-body">
            <div class="card-title">Title six
            </div>
            <div class="card-sub-title">Subtitle six
            </div>
            <div class="card-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="am-sect">
    <div class="container-width">
      <div class="am-container">
        <img src="./img/phone-app.png" class="img-phone"/>
        <div class="am-content">
          <div class="am-pre">ASSET MANAGER
          </div>
          <div class="am-title">Manage your images with Asset Manager
          </div>
          <div class="am-desc">You can create image blocks with the command from the left panel and edit them with double click
          </div>
          <div class="am-post">Image uploading is not allowed in this demo
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="blk-sect">
    <div class="container-width">
      <div class="blk-title">Blocks
      </div>
      <div class="blk-desc">Each element in HTML page could be seen as a block. On the left panel you could find different kind of blocks that you can create, move and style
      </div>
      <div class="price-cards">
        <div class="price-card-cont">
          <div class="price-card">
            <div class="pc-title">Starter
            </div>
            <div class="pc-desc">Some random list
            </div>
            <div class="pc-feature odd-feat">+ Starter feature 1
            </div>
            <div class="pc-feature">+ Starter feature 2
            </div>
            <div class="pc-feature odd-feat">+ Starter feature 3
            </div>
            <div class="pc-feature">+ Starter feature 4
            </div>
            <div class="pc-amount odd-feat">$ 9,90/mo
            </div>
          </div>
        </div>
        <div class="price-card-cont">
          <div class="price-card pc-regular">
            <div class="pc-title">Regular
            </div>
            <div class="pc-desc">Some random list
            </div>
            <div class="pc-feature odd-feat">+ Regular feature 1
            </div>
            <div class="pc-feature">+ Regular feature 2
            </div>
            <div class="pc-feature odd-feat">+ Regular feature 3
            </div>
            <div class="pc-feature">+ Regular feature 4
            </div>
            <div class="pc-amount odd-feat">$ 19,90/mo
            </div>
          </div>
        </div>
        <div class="price-card-cont">
          <div class="price-card pc-enterprise">
            <div class="pc-title">Enterprise
            </div>
            <div class="pc-desc">Some random list
            </div>
            <div class="pc-feature odd-feat">+ Enterprise feature 1
            </div>
            <div class="pc-feature">+ Enterprise feature 2
            </div>
            <div class="pc-feature odd-feat">+ Enterprise feature 3
            </div>
            <div class="pc-feature">+ Enterprise feature 4
            </div>
            <div class="pc-amount odd-feat">$ 29,90/mo
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="bdg-sect">
    <div class="container-width">
      <h1 class="bdg-title">The team
      </h1>
      <div class="badges">
        <div class="badge">
          <div class="badge-header">
          </div>
          <img src="img/team1.jpg" class="badge-avatar"/>
          <div class="badge-body">
            <div class="badge-name">Adam Smith
            </div>
            <div class="badge-role">CEO
            </div>
            <div class="badge-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit
            </div>
          </div>
          <div class="badge-foot">
            <span class="badge-link">f</span>
            <span class="badge-link">t</span>
            <span class="badge-link">ln</span>
          </div>
        </div>
        <div id="ilewj8" class="badge-header">
        </div>
        <div class="badge-header">
        </div>
        <div class="badge">
          <div id="ik1cs4" class="badge">
            <img src="img/team2.jpg" class="badge-avatar"/>
            <div class="badge-body">
              <div class="badge-name">John Black
              </div>
              <div class="badge-role">Software Engineer
              </div>
              <div class="badge-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit
              </div>
            </div>
            <div class="badge-foot">
              <span class="badge-link">f</span>
              <span class="badge-link">t</span>
              <span class="badge-link">ln</span>
            </div>
          </div>
          <img src="img/team3.jpg" class="badge-avatar"/>
          <div class="badge-body">
            <div class="badge-name">Jessica White
            </div>
            <div class="badge-role">Web Designer
            </div>
            <div class="badge-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit
            </div>
          </div>
          <div class="badge-foot">
            <span class="badge-link">f</span>
            <span class="badge-link">t</span>
            <span class="badge-link">ln</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  <footer class="footer-under">
    <div class="container-width">
      <div class="footer-container">
        <div class="foot-lists">
          <div class="foot-list">
            <div class="foot-list-title">About us
            </div>
            <div class="foot-list-item">Contact
            </div>
            <div class="foot-list-item">Events
            </div>
            <div class="foot-list-item">Company
            </div>
            <div class="foot-list-item">Jobs
            </div>
            <div class="foot-list-item">Blog
            </div>
          </div>
          <div class="foot-list">
            <div class="foot-list-title">Services
            </div>
            <div class="foot-list-item">Education
            </div>
            <div class="foot-list-item">Partner
            </div>
            <div class="foot-list-item">Community
            </div>
            <div class="foot-list-item">Forum
            </div>
            <div class="foot-list-item">Download
            </div>
            <div class="foot-list-item">Upgrade
            </div>
          </div>
          <div class="clearfix">
          </div>
        </div>
        <div class="form-sub">
          <div class="foot-form-cont">
            <div class="foot-form-title">Subscribe
            </div>
            <div class="foot-form-desc">Subscribe to our newsletter to receive exclusive offers and the latest news
            </div>
            <input type="text" name="name" placeholder="Name" class="sub-input"/>
            <input type="text" name="email" placeholder="Email" class="sub-input"/>
            <button type="button" class="sub-btn">Submit</button>
          </div>
        </div>
      </div>
    </div>
    <div class="copyright">
      <div class="container-width">
        <div class="made-with">
          made with GrapesJS
        </div>
        <div class="foot-social-btns">facebook twitter linkedin mail
        </div>
        <div class="clearfix">
        </div>
      </div>
    </div>
  </footer>
</body>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
.clearfix{
  clear:both;
}
.header-banner{
  padding-top:35px;
  padding-bottom:100px;
  color:#ffffff;
  font-family:Helvetica, serif;
  font-weight:100;
  background-image:url("https://grapesjs.com/img/bg-gr-v.png"), url("https://grapesjs.com/img/work-desk.jpg");
  background-attachment:scroll, scroll;
  background-position:left top, center center;
  background-repeat:repeat-y, no-repeat;
  background-size:contain, cover;
}
.container-width{
  width:90%;
  max-width:1150px;
  margin:0 auto;
}
.logo-container{
  float:left;
  width:50%;
}
.logo{
  background-color:#fff;
  border-radius:5px;
  width:130px;
  padding:10px;
  min-height:30px;
  text-align:center;
  line-height:30px;
  color:#4d114f;
  font-size:23px;
}
.menu{
  float:right;
  width:50%;
}
.menu-item{
  float:right;
  font-size:15px;
  color:#eee;
  width:130px;
  padding:10px;
  min-height:50px;
  text-align:center;
  line-height:30px;
  font-weight:400;
}
.lead-title{
  margin:150px 0 30px 0;
  font-size:40px;
}
.sub-lead-title{
  max-width:650px;
  line-height:30px;
  margin-bottom:30px;
  color:#c6c6c6;
}
.lead-btn{
  margin-top:15px;
  padding:10px;
  width:190px;
  min-height:30px;
  font-size:20px;
  text-align:center;
  letter-spacing:3px;
  line-height:30px;
  background-color:#d983a6;
  border-radius:5px;
  transition:all 0.5s ease;
  cursor:pointer;
}
.lead-btn:hover{
  background-color:#ffffff;
  color:#4c114e;
}
.lead-btn:active{
  background-color:#4d114f;
  color:#fff;
}
.flex-sect{
  background-color:#fafafa;
  padding:100px 0;
  font-family:Helvetica, serif;
}
.flex-title{
  margin-bottom:15px;
  font-size:2em;
  text-align:center;
  font-weight:700;
  color:#555;
  padding:5px;
}
.flex-desc{
  margin-bottom:55px;
  font-size:1em;
  color:rgba(0, 0, 0, 0.5);
  text-align:center;
  padding:5px;
}
.cards{
  padding:20px 0;
  display:flex;
  justify-content:space-around;
  flex-flow:wrap;
}
.card{
  background-color:white;
  height:300px;
  width:300px;
  margin-bottom:30px;
  box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.2);
  border-radius:2px;
  transition:all 0.5s ease;
  font-weight:100;
  overflow:hidden;
}
.card:hover{
  margin-top:-5px;
  box-shadow:0 20px 30px 0 rgba(0, 0, 0, 0.2);
}
.card-header{
  height:155px;
  background-image:url("https://via.placeholder.com/350x250/78c5d6/fff");
  background-size:cover;
  background-position:center center;
}
.card-header.ch2{
  background-image:url("https://via.placeholder.com/350x250/459ba8/fff");
}
.card-header.ch3{
  background-image:url("https://via.placeholder.com/350x250/79c267/fff");
}
.card-header.ch4{
  background-image:url("https://via.placeholder.com/350x250/c5d647/fff");
}
.card-header.ch5{
  background-image:url("https://via.placeholder.com/350x250/f28c33/fff");
}
.card-header.ch6{
  background-image:url("https://via.placeholder.com/350x250/e868a2/fff");
}
.card-body{
  padding:15px 15px 5px 15px;
  color:#555;
}
.card-title{
  font-size:1.4em;
  margin-bottom:5px;
}
.card-sub-title{
  color:#b3b3b3;
  font-size:1em;
  margin-bottom:15px;
}
.card-desc{
  font-size:0.85rem;
  line-height:17px;
}
.am-sect{
  padding-top:100px;
  padding-bottom:100px;
  font-family:Helvetica, serif;
}
.img-phone{
  float:left;
}
.am-container{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  justify-content:space-around;
}
.am-content{
  float:left;
  padding:7px;
  width:490px;
  color:#444;
  font-weight:100;
  margin-top:50px;
}
.am-pre{
  padding:7px;
  color:#b1b1b1;
  font-size:15px;
}
.am-title{
  padding:7px;
  font-size:25px;
  font-weight:400;
}
.am-desc{
  padding:7px;
  font-size:17px;
  line-height:25px;
}
.am-post{
  padding:7px;
  line-height:25px;
  font-size:13px;
}
.blk-sect{
  padding-top:100px;
  padding-bottom:100px;
  background-color:#222222;
  font-family:Helvetica, serif;
}
.blk-title{
  color:#fff;
  font-size:25px;
  text-align:center;
  margin-bottom:15px;
}
.blk-desc{
  color:#b1b1b1;
  font-size:15px;
  text-align:center;
  max-width:700px;
  margin:0 auto;
  font-weight:100;
}
.price-cards{
  margin-top:70px;
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  justify-content:space-around;
}
.price-card-cont{
  width:300px;
  padding:7px;
  float:left;
}
.price-card{
  margin:0 auto;
  min-height:350px;
  background-color:#d983a6;
  border-radius:5px;
  font-weight:100;
  color:#fff;
  width:90%;
}
.pc-title{
  font-weight:100;
  letter-spacing:3px;
  text-align:center;
  font-size:25px;
  background-color:rgba(0, 0, 0, 0.1);
  padding:20px;
}
.pc-desc{
  padding:75px 0;
  text-align:center;
}
.pc-feature{
  color:rgba(255,255,255,0.5);
  background-color:rgba(0, 0, 0, 0.1);
  letter-spacing:2px;
  font-size:15px;
  padding:10px 20px;
}
.pc-feature:nth-of-type(2n){
  background-color:transparent;
}
.pc-amount{
  background-color:rgba(0, 0, 0, 0.1);
  font-size:35px;
  text-align:center;
  padding:35px 0;
}
.pc-regular{
  background-color:#da78a0;
}
.pc-enterprise{
  background-color:#d66a96;
}
.footer-under{
  background-color:#312833;
  padding-bottom:100px;
  padding-top:100px;
  min-height:500px;
  color:#eee;
  position:relative;
  font-weight:100;
  font-family:Helvetica,serif;
}
.copyright{
  background-color:rgba(0, 0, 0, 0.15);
  color:rgba(238, 238, 238, 0.5);
  bottom:0;
  padding:1em 0;
  position:absolute;
  width:100%;
  font-size:0.75em;
}
.made-with{
  float:left;
  width:50%;
  padding:5px 0;
}
.foot-social-btns{
  display:none;
  float:right;
  width:50%;
  text-align:right;
  padding:5px 0;
}
.footer-container{
  display:flex;
  flex-wrap:wrap;
  align-items:stretch;
  justify-content:space-around;
}
.foot-list{
  float:left;
  width:200px;
}
.foot-list-title{
  font-weight:400;
  margin-bottom:10px;
  padding:0.5em 0;
}
.foot-list-item{
  color:rgba(238, 238, 238, 0.8);
  font-size:0.8em;
  padding:0.5em 0;
}
.foot-list-item:hover{
  color:rgba(238, 238, 238, 1);
}
.foot-form-cont{
  width:300px;
  float:right;
}
.foot-form-title{
  color:rgba(255,255,255,0.75);
  font-weight:400;
  margin-bottom:10px;
  padding:0.5em 0;
  text-align:right;
  font-size:2em;
}
.foot-form-desc{
  font-size:0.8em;
  color:rgba(255,255,255,0.55);
  line-height:20px;
  text-align:right;
  margin-bottom:15px;
}
.sub-input{
  width:100%;
  margin-bottom:15px;
  padding:7px 10px;
  border-radius:2px;
  color:#fff;
  background-color:#554c57;
  border:none;
}
.sub-btn{
  width:100%;
  margin:15px 0;
  background-color:#785580;
  border:none;
  color:#fff;
  border-radius:2px;
  padding:7px 10px;
  font-size:1em;
  cursor:pointer;
}
.sub-btn:hover{
  background-color:#91699a;
}
.sub-btn:active{
  background-color:#573f5c;
}
.bdg-sect{
  padding-top:100px;
  padding-bottom:100px;
  font-family:Helvetica, serif;
  background-color:#fafafa;
}
.bdg-title{
  text-align:center;
  font-size:2em;
  margin-bottom:55px;
  color:#555555;
}
.badges{
  padding:20px;
  display:flex;
  justify-content:space-around;
  align-items:flex-start;
  flex-wrap:wrap;
}
.badge{
  width:290px;
  font-family:Helvetica, serif;
  background-color:white;
  margin-bottom:30px;
  box-shadow:0 2px 2px 0 rgba(0, 0, 0, 0.2);
  border-radius:3px;
  font-weight:100;
  overflow:hidden;
  text-align:center;
}
.badge-header{
  height:115px;
  background-image:url("https://grapesjs.com/img/bg-gr-v.png"), url("https://grapesjs.com/img/work-desk.jpg");
  background-position:left top, center center;
  background-attachment:scroll, fixed;
  overflow:hidden;
}
.badge-name{
  font-size:1.4em;
  margin-bottom:5px;
}
.badge-role{
  color:#777;
  font-size:1em;
  margin-bottom:25px;
}
.badge-desc{
  font-size:0.85rem;
  line-height:20px;
}
.badge-avatar{
  width:100px;
  height:100px;
  border-radius:100%;
  border:5px solid #fff;
  box-shadow:0 1px 1px 0 rgba(0, 0, 0, 0.2);
  margin-top:-75px;
  position:relative;
}
.badge-body{
  margin:35px 10px;
}
.badge-foot{
  color:#fff;
  background-color:#a290a5;
  padding-top:13px;
  padding-bottom:13px;
  display:flex;
  justify-content:center;
}
.badge-link{
  height:35px;
  width:35px;
  line-height:35px;
  font-weight:700;
  background-color:#fff;
  color:#a290a5;
  display:block;
  border-radius:100%;
  margin:0 10px;
}
.quote{
  color:#777;
  font-weight:300;
  padding:10px;
  box-shadow:-5px 0 0 0 #ccc;
  font-style:italic;
  margin:20px 30px;
}
.gjs-row{
  display:flex;
  justify-content:flex-start;
  align-items:stretch;
  flex-wrap:nowrap;
  padding:10px;
}
.gjs-cell{
  min-height:75px;
  flex-grow:1;
  flex-basis:100%;
}
#irty9i{
  padding:10px;
}
.countdown-block{
  display:inline-block;
  margin:0 10px;
  padding:10px;
}
.countdown-digit{
  font-size:5rem;
}
.countdown-endtext{
  font-size:5rem;
}
.countdown-cont{
  display:inline-block;
}
#igboek{
  float:none;
  opacity:1;
}
#itdg1y{
  height:350px;
}
#i0jfzi{
  display:inline-block;
  padding:5px;
  min-height:50px;
  min-width:50px;
}
@media (max-width: 768px){
  .foot-form-cont{
    width:400px;
  }
  .foot-form-title{
    width:autopx;
  }
  .gjs-row{
    flex-wrap:wrap;
  }
}
@media (max-width: 480px){
  .foot-lists{
    display:none;
  }
}
</style>`);
});
</script>