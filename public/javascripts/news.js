    // eslint-disable-next-line no-undef
    const { createApp } = Vue;


    createApp({
      data() {
        return {
          articles: [],
          edit: false,
          index:0,
          article_to_delete: null,
          branchArticles:[],
          branch:"",
          role:""

          // otherArticles:[]

        };
      },
      mounted() {
        this.getUsers();
        this.getArticlesPublic();





        // Event listeners
        window.addEventListener("load", () => {
          document.addEventListener("click", (event) => {
            if (event.target.classList.contains("modal")) {
              this.closeModal();
            }
          });
        });

        document.getElementById('edit-form').addEventListener('submit', this.submitEditForm);
        document.getElementById('post-publicly').addEventListener('click', this.postPublicly);
        document.getElementById('post-privately').addEventListener('click', this.postPrivately);
      },
      methods: {
        getUsers(){
          fetch("/users/user")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();

          })
          .then((userData) => {
            this.branch=userData.BranchID;
            this.role = userData.UserType;
            console.log(this.branch,userData.BranchID);
            this.getArticlesBranch();
            this.getArticlesPublic();

          })
          .catch((error) => {
            console.error("Fetch eroorr", error);
            throw new Error("Network response was not ok");
          });
        },
       getArticlesPublic() {

          fetch('/news/article-all')
            .then(response => response.json())
            .then(news => {
              this.articles = news.map(article => {
                let preview = '';
                const prev_words = article.ArticleContent.split(' ');

                for (let i = 0; i < 10 && i < prev_words.length; i++) {
                  preview += prev_words[i] + ' ';
                  console.log(preview);
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
                  ArticleId:article.ArticleID,
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
            .catch(error => console.error('Error fetching new articles: ', error));

        },
        getArticlesBranch() {

          fetch(`/news/article/${this.branch}`)
            .then(response => response.json())
            .then(news => {
              this.branchArticles = news.map(article => {
                let preview = '';
                const prev_words = article.ArticleContent.split(' ');

                for (let i = 0; i < 10 && i < prev_words.length; i++) {
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
                  ArticleId:article.ArticleID,
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
            .catch(error => console.error('Error fetching new articles: ', error));
        },
        create_article(visibility) {
          const new_article = {
            ArticleName: document.getElementById('title-input').value,
            ArticleContent: document.getElementById('body-input-news').value,
            Visibility: visibility,
            BranchID: this.branch
          };

          fetch('/news/create_article', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(new_article)
          })
            .then(response => {
              if (!response.ok) {
                alert('Error creating article');
              }
              return response.text();
            })
            .then(data => {
              if (JSON.parse(data) !== null) {
                const d = JSON.parse(data);
                const email = d.map(user => user.EmailAddress);
                this.sendEmail(email, new_article);
                this.getArticlesPublic();
                this.getArticlesBranch();
                document.getElementById("title-input").innerText = '';
                document.getElementById("body-input-news").innerText = '';
              }
            })
            .catch(error => {
              console.error('Fetch not working', error);
            });
        },
        sendEmail(usersInBranch, article) {
          fetch('/contact/news', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([usersInBranch, article])
          })
            .then(response => {
              if (!response.ok) {
                alert('Error sending article emails');
              }
              return response.text();
            })
            .then(data => {
              console.log(data);
            })
            .catch(error => {
              console.error('Email not working', error);
            });
        },
        changeArticle(visibility) {
          event.preventDefault();

          const id=this.index;
          console.log(id);

          const edited_article = {
            ArticleName: document.getElementById('title-input').value,
            ArticleContent: document.getElementById('body-input-news').value
          };

          fetch(`/news/edit_article/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(edited_article)
          })
            .then(response => {
              if (!response.ok) {
                alert('Error editing article');
              }
              this.getArticlesPublic();
              this.getArticlesBranch();
              this.closeModal();
            })
            .catch(error => console.error('Error fetching edited articles: ', error));
        },
        postPublicly(event) {
          event.preventDefault();
          console.log("here,",this.edit);
          if(this.edit==true){
            this.changeArticle(true);
            this.edit=false;
            this.closeModal();
            return;
          }
          this.create_article(true);
          this.closeModal();
        },
        postPrivately(event) {
          event.preventDefault();
          if(this.edit==true){
            this.changeArticle(false);
            this.edit=false;
            this.closeModal();
            return;
          }
          this.create_article(false);
          this.getArticlesBranch();
          this.getArticlesPublic();
          this.closeModal();
        },
        confirmDelete(article) {
          this.article_to_delete = article;
          console.log("confirm pop up");
          this.openConfirmModal('modal-4');
        },
        deleteArticle() {
          if (this.article_to_delete) {

            const id = this.article_to_delete;

            fetch( `/news/delete_article/${id}`, {
              method:'DELETE',
              headers: {
                'Content-Type': 'application/json'
              },

            })
            .then(response => {
              if (response.ok) {
                const index = this.articles.indexOf(this.article_to_delete);

                this.getArticlesPublic();
                this.getArticlesBranch();

                this.closeModal();
                console.log("article successfully deleted");
              } else {
                console.error('Error deleting article');
              }
            })
            .catch(error => {
              console.error('Error deleting article:', error);
            });
          }
        },
        openModal(id, date, title, content, branch, edit,articleId='') {
          const modal = document.getElementById(id);
          this.index=articleId;
          if(edit){this.edit=true;}

          if (id === 'modal-1') {
            modal.querySelector('.modal-content-news h2').innerText = title;
            modal.querySelector('#article-content').innerText = content;
            modal.querySelector('#date_branch').innerText = date + ' | ' + branch;
          }

          if (edit) {

            modal.querySelector("#title-input").value = title;
            modal.querySelector("#body-input-news").value = content;
          }

          modal.classList.add("open");
          document.body.classList.add("modal-open");
          console.log("normal modal open");
        },
        cancelDelete() {
          this.article_to_delete = null; // empty out the article
          this.closeModal();
          console.log("confirm modal closed");
        },
        openConfirmModal(id) {
          const modal = document.getElementById(id);

          modal.classList.add("open");
          document.body.classList.add("modal-open");
        },
        closeModal() {
          const openModal = document.querySelector(".modal.open");
          if (openModal) {
            openModal.classList.remove("open");
          }
          document.body.classList.remove("modal-open");
        }
      }
    }).mount('#news-app');