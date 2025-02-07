// eslint-disable-next-line no-undef
const { createApp } = Vue;

createApp({
  data() {
    return {

      modalContent: {},
      articles: [],
      auht:false,

    };
  },
  mounted() {
    this.getArticlesPublic();
    this.checkAuth();
  },
  methods: {
    goto(url) {
      window.location.href = url;
    },
    checkAuth(){

      fetch("/users/auth-check").then((res)=>{

        if (res.status!=403) this.auth=true;
        else this.auth= false;
      });



    },
    openModal(index) {
      const modal = document.getElementById('modal-1');

      const modalContent = this.articles[index];


      modal.classList.add("open");
      document.querySelector("#date_branch").innerText = modalContent.date + ' | ' + modalContent.Name;
      document.querySelector(".modal-content-news h2").innerText = modalContent.ArticleName;
      modal.querySelector('#article-content').innerText = modalContent.ArticleContent;

    },
    closeModal() {
      this.showModal = false;

    },
    getArticlesPublic() {



      fetch('/articles')
        .then(response => response.json())
        .then(news => {
          this.articles = news.map(article => {
            let preview = '';
            const prev_words = article.ArticleContent.split(' ');

            for (let i = 0; i < 20 && i < prev_words.length; i++) {
              preview += prev_words[i] + ' ';
            }

            preview += '... ';


            const timestamp = new Date(article.TimestampID);
            const day = timestamp.getDate();
            const month_num = timestamp.getMonth();
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const month = months[month_num];
            const year = timestamp.getFullYear();

            const date = `${day} ${month} ${year}`;

            return {
              ArticleId: article.ArticleID,
              ArticleName: article.ArticleName,
              ArticleContent: article.ArticleContent,
              Visibility: article.Visibility,
              Name: article.Name,
              TimestampID: article.TimestampID,
              BranchID: article.BranchID,
              date: date,
              preview: preview
            };
          });
        })
        .catch(error => console.error('Error fetching news articles: ', error));
        this.articles.reverse;
    }
  },

}).mount('#main');