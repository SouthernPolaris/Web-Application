// Define Footer Component
const FooterComponent = {
  template: `
    <footer>
    <div class="logo-slogan">
    <h2>
     Volunteer
     Today.
    </h2>
    <img  class="logo" alt="logo" src="./images/logo.png">


  </div>

  <div class="menu">
  <div>
    <a href="./findUs" class="footer-link">Find a branch</a>
    <br/>
    <a href="./joinUs" class="footer-link">Join a Branch</a>
    <br/>
    <a href="./news" class="footer-link">News</a>
  </div>

  <div>
    <a href="./event" class="footer-link">Events</a>
    <br/>
    <a href="./faq" class="footer-link">FAQs</a>
    <br/>
    <a href="./termsOfService" class="footer-link"></a>
    <br/>
    <a href="./privacyPolicy" class="footer-link">Privacy Policy</a>

  </div>

  </div>

  <div class="contact">

  <h3>
    Contact us
  </h3>

  <div>
  Phone:1234 456 456 43
  <br/>
  <br/>
  Email:<a class="footer-email">contact@banfood.org.au</a>
  </div>
  </div>


    </footer>


  `


};

// // eslint-disable-next-line no-undef
// const appFooter = Vue.createApp(FooterComponent);
// appFooter.component('app-footer', FooterComponent);
// appFooter.mount('#app-footer');