const HeaderComponent = {
    template: `
      <header class="mainNav">

    <a href="./"><img class="logo-head" src="../images/logo.png" alt="logo"></a>
    <div id="links" >
    <a href="./events" v-if="auth">Events</a>
    <a href="./joinUs">Browse branches</a>
    <a href="./findUs">Branch Finder</a>
    <a href="./faq">FAQs</a>


    </div>
    <div v-if="show===true">

    <div v-if="auth===false">
    <a class="menuButton logIn" href="./loginPage">Log In</a>
    <a class="menuButton" href="./loginPage">Sign Up</a>
    </div>

    <a v-if="auth===true" href="./profile" class="menuButton">
    Profile
    </a>

    </div>
    <div v-if="show===false">

    </div>
      </header>

    `,
    data(){
      return{
        auth:false,
        show:true,
      };
    },
    mounted(){
      this.checkAuth();


    },
    methods:{
      checkAuth(){

        fetch("/users/auth-check").then((res)=>{

          if (res.status===200) this.auth=true;
          else this.auth= false;
        });

       if (window.location.pathname==="/Profile.html"||window.location.pathname==="/LoginPage.html"){
        this.show=false;
       }else{
        this.show=true;
       }

      }
    }
  };


  // eslint-disable-next-line no-undef
  const appHeader = Vue.createApp(HeaderComponent);
  appHeader.mount('#app-header');