// eslint-disable-next-line no-undef
const { createApp } = Vue;

createApp({
  data() {
    return {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      emailNotif: false,
      eventNotif: false,
      role: "",
      users: [],
      branches: [],
      branch: {
        name: '',
        housenumber:" ",
        address: '',
        city: '',
        state: '',
        postcode: '',
        phone: '',
        email: '',
        id: ''
      },
      userBranch: "",
      options: ["user", "manager", "admin"],
      selectedValue: null,
      selectedUser: null,
      userSearch: "",
      branchSearch: "",
      selectedBranch: null,
      currAction: "",
      actionIdx: 0,
    };
  },
  beforeCreate() {
    fetch('users/auth-check')
      .then(response => {
        if (!response.ok) {
          // If the response status is not OK (200), handle error or unauthorized access
          if (response.status === 403) {
            this.showToast("Unauthorized access");
            window.location.pathname = "/LoginPage.html";
          } else {
            this.showToast("Error occurred: " + response.statusText);
          }
        }
      })
      .catch(error => {
        // Handle fetch errors
        this.showToast("Fetch error: " + error.message);
      });
  },
  beforeMount() {
    this.fetchDataFromDatabase();
  },
  mounted() {
    this.fetchUsers();
    this.fetchBranches();
  },
  methods: {
    showToast(text, pos = false) {
      const toast = document.getElementById("toast");
      toast.classList.add('show');
      toast.classList.remove('hide');

      if (pos) {
        toast.classList.add('pos');
      }
      toast.innerText = text;
      setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
      }, 2000);
    },
    fetchDataFromDatabase() {
      fetch("/users/user")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((userData) => {
          console.log(userData);
          this.firstName = userData.GivenName;
          this.lastName = userData.LastName;
          this.phoneNumber = userData.PhoneNumber;
          this.email = userData.EmailAddress;
          this.role = userData.UserType;
          this.userBranch = userData.BranchID;
          this.selectedBranch = this.userBranch;
          this.emailNotif = userData.ReceiveEmailNews==1? true:false;
      this.eventNotif = userData.ReceiveEmailEvents==1?true:false;
          console.log("selected branch", this.emailNotif);
        })
        .catch((error) => {
          this.showToast("Error: " + error.message);
        });
    },
    change(n) {
      let nav = Array.from(document.getElementsByClassName("nav"));
      let dash = Array.from(document.getElementsByClassName("dash"));
      dash.forEach((p) => p.classList.remove("active"));
      nav.forEach((p) => p.classList.remove("active-nav"));
      dash[n - 1].classList.add("active");
      nav[n - 1].classList.add("active-nav");
    },
    submitForm() {
      const formData = {
        GivenName: this.firstName,
        LastName: this.lastName,
        PhoneNumber: this.phoneNumber,
        EmailAddress: this.email,
        ReceiveEmailNews: this.emailNotif,
        ReceiveEmailEvents: this.eventNotif,
      };

      fetch("/users/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          this.showToast("Updated successfully", true);
          return response.json();
        })
        .catch((error) => {
          this.showToast("There was a problem with form submission: " + error.message);
        });
    },
    deleteAccount() {
      fetch(`/users/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            this.showToast("Account deleted successfully", true);
            window.location.pathname = "/";
          }
        })
        .catch((error) => {
          this.showToast("Error: " + error.message);
        });
    },
    fetchUsers() {
      fetch("/manager/users-all")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((usersData) => {
          this.users = usersData;
        })
        .catch((error) => {
          throw new error;
        });
    },
    editUser(index) {
      const role = this.users[index].UserType;
      const userId = this.users[index].UserID;
      this.selectedValue = role;
      this.selectedUser = userId;
    },
    updateUser() {
      const role = this.selectedValue;
      const userID = this.selectedUser;
      fetch(`/admin/updateType/${userID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ UserType: role }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          this.fetchUsers();
          this.showToast('User updated successfully!', true);
          return response.json();
        })
        .catch((error) => {
          this.showToast("There was a problem with form submission: " + error.message);
        });
    },
    deleteUser(index) {
      const userId = this.users[index].UserID;
      fetch(`/admin/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            this.showToast("User deleted successfully", true);
            this.users.splice(index, 1);
          }
        })
        .catch((error) => {
          this.showToast("Error: " + error.message);
        });
    },
    fetchBranches() {
      fetch("/admin/branches")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((branchesData) => {
          this.branches = branchesData;
        })
        .catch((error) => {
          throw new error;
        });
    },
    deleteBranch(index) {
      const BranchId = this.branches[index].BranchID;
      fetch(`/admin/deleteBranch/${BranchId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            this.showToast("Branch deleted successfully", true);
            this.branches.splice(index, 1);
          }
        })
        .catch((error) => {
          this.showToast("Error: " + error.message);
        });
    },
    createBranch() {
      const branchData = {
        name: this.branch.name,
        address: this.branch.housenumber,
        street:this.branch.address,
        city: this.branch.city,
        state: this.branch.state,
        postcode: this.branch.postcode,
        phone: this.branch.phone,
        email: this.branch.email
      };

      fetch('/admin/createBranch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(branchData)
      })
        .then(response => {
          if (response.ok) {
            this.showToast('Branch created successfully', true);
            this.resetForm();
            this.fetchBranches();
          } else {
            throw new Error(response.statusText);
          }
        })
        .catch(error => {
          this.showToast("Error creating branch: " + error.message);
        });

      this.resetForm();
    },
    resetForm() {
      this.branch = {
        name: '',
        address: '',
        city: '',
        state: '',
        postcode: '',
        phone: '',
        email: ''
      };
    },
    editBranch(index) {
      this.resetForm();
      const branchToEdit = this.branches[index];
      this.branch = {
        id: branchToEdit.BranchID,
        name: branchToEdit.name,
        city: branchToEdit.address.city,
        state: branchToEdit.address.state,
        postcode: branchToEdit.address.postcode,
        address: branchToEdit.address.houseNumber,
        housenumber:branchToEdit.address.streetName,
        phone: branchToEdit.phone,
        email: branchToEdit.email,
      };
    },
    updateBranch() {
      const branchData = {
        name: this.branch.name,
        address: this.branch.address,
        street: this.branch.housenumber,
        city: this.branch.city,
        state: this.branch.state,
        postcode: this.branch.postcode,
        phone: this.branch.phone,
        email: this.branch.email
      };
      const bId = this.branch.id;
      fetch(`/admin/updateBranch/${bId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(branchData)
      })
        .then(response => {
          if (response.ok) {
            this.showToast('Branch updated successfully', true);
            this.fetchBranches();
          } else {
            throw new Error(response.statusText);
          }
        })
        .catch(error => {
          this.showToast("Error updating branch: " + error.message);
        });

      this.resetForm();
    },
    logOut() {
      window.location.href = '/users/logout';
    },
    searchUsers() {
      if (this.userSearch == "") {
        this.fetchUsers();
        return;
      }
      fetch(`/admin/users-all/${this.userSearch}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          if (response.status === 204) {
            this.showToast("User not found");
            return {};
          }
          return response.json();
        })
        .then((usersData) => {
          this.users = usersData;
        })
        .catch((error) => {
          this.showToast("There was a problem fetching users: " + error.message);
        });
    },
    searchBranches() {
      if (this.branchSearch == "") {
        this.fetchBranches();
        return;
      }
      fetch(`/admin/branch-all/${this.branchSearch}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          if (response.status === 204) {
            return {};
          }
          return response.json();
        })
        .then((branchData) => {
          this.branches = branchData;
        })
        .catch((error) => {
          this.showToast("There was a problem fetching branches: " + error.message);
        });
    },
    handleBranchChange() {
      fetch('users/set_branch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ BranchID: this.selectedBranch })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          this.fetchUsers();
          this.showToast('Branch set successfully', true);
        })
        .catch(error => {
          this.showToast('Error updating user branch: ' + error.message);
        });
    },
    removeFromBranch() {
      const userID = this.selectedUser;
      fetch(`/manager/remove_branch/${userID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          this.fetchUsers();
          this.showToast('User removed from branch successfully', true);
          return response.json();
        })
        .catch((error) => {
          this.showToast("There was a problem with form submission: " + error.message);
        });
    },
    deleteSelf() {
      this.currAction = "delSelf";
    },
    deleteUserConfirm(index) {
      this.currAction = "delUser";
      this.actionIdx = index;
    },
    removeFromBranchConfirm(index) {
      const role = this.users[index].UserType;
      const userId = this.users[index].UserID;
      this.selectedValue = role;
      this.selectedUser = userId;
      this.currAction = "removeFromBranch";
    },
    deleteBranchConfirm(index) {
      this.currAction = "delBranch";
      this.actionIdx = index;
    },
    logOutConfirm() {
      this.currAction = "logout";
    },
    action() {
      if (this.currAction === "delSelf") {
        this.deleteAccount();
      }
      if (this.currAction === "delUser") {
        this.deleteUser(this.actionIdx);
      }
      if (this.currAction == "removeFromBranch") {
        this.removeFromBranch();
      }
      if (this.currAction === "delBranch") {
        this.deleteBranch(this.actionIdx);
      }
      if (this.currAction === "logout") {
        this.logOut();
      }
    }
  },
}).mount("#profile");
