// function filterCards(state) {
//   const cards = document.querySelectorAll(".card");

//   if (state === "ALL") {
//     cards.forEach((card) => {
//       card.style.display = "block";
//     });
//   } else {
//     cards.forEach((card) => {
//       if (card.getAttribute("data-state") === state) {
//         card.style.display = "block";
//       } else {
//         card.style.display = "none";
//       }
//     });
//   }
//   const buttons = document.querySelectorAll(".state-btn");
//   buttons.forEach((button) => {
//     if (button.dataset.stateId === state) {
//       button.classList.add("active");
//     } else {
//       button.classList.remove("active");
//     }
//   });
// }

// Initially display all cards
// filterCards("ALL");

// eslint-disable-next-line no-undef
const { createApp } = Vue;

createApp({
  data() {
    return {
      branches: [],
      filter: 'ALL',
      loading: true,
      error: null,
      joinedBranchID: null // track joined branch
    };
  },
  computed: {
    filteredBranches() {
      if (this.filter === 'ALL') {
        return this.branches;
      }
      return this.branches.filter(branch => branch.State === this.filter);
    }
  },
  methods: {
    filterCards(state) {
      this.filter = state;
    },
    fetchBranches() {
      fetch('/branch')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          this.branches = data;
        })
        .catch(error => {
          console.error("Error fetching branches:", error);

        });

    },
    joinBranch(branchID) {
      // Ensure user is authenticated
      fetch('/users/auth-check')
        .then(res => {
          if (!res.ok || res.status === 403) {
            window.location.pathname = "/loginPage";
            return;
          }


          const userData = { BranchID: branchID };
          return fetch('/users/set_branch', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });
        })
        .then(response => {
          if (!response) return;
          return response.json();
        })
        .then(data => {
          if (data.error) {
            console.error("Error:", data.error);
            // alert(`Error: ${data.error}`);
          } else {
            this.joinedBranchID = branchID; // Update joined branch ID

          }
        })
        .catch(error => {
          console.error("Error:", error);
        });
    },
    fetchDataFromDatabase() {
      fetch("/users/user")
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(userData => {
          this.joinedBranchID = userData.BranchID; // Set the user's joined branch ID
        })
        .catch(error => {
          console.error("There was a problem with the fetch operation:", error);
        });
    }
  },
  mounted() {
    this.fetchBranches();
    this.fetchDataFromDatabase();
  }
}).mount('#join-us');
