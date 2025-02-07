
replaceNav();
replaceFooter();


function replaceNav() {
  var navElement = document.createElement("div");
  navElement.setAttribute("id", "app-header");
  var navData = `
   `;
  navElement.innerHTML = navData;

  document.body.insertAdjacentElement("afterbegin", navElement);
}

function replaceFooter() {
  var navElement = document.createElement("div");
  navElement.setAttribute("id", "app-footer");

  var navData = `

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

  <a href="./faq" class="footer-link">FAQs</a>
  <br/>
  <a href="./termsOfService" class="footer-link">Terms & Services</a>
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



     `;

  navElement.innerHTML = navData;

  document.body.insertAdjacentElement("beforeend", navElement);
}
