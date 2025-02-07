fetch("/users/auth-check").then(response=>{
if (response.status===200)  window.location.href="/Profile.html";
return;
});


document.addEventListener('DOMContentLoaded', (event) => {

    const signUpBtn = document.getElementById('submit-btn');
    const logInBtn=document.getElementById('login-btn');

    const signUp=(event)=> {
        event.preventDefault(); 

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('signup-email').value;
        const phoneNumber = document.getElementById('phone-number').value;
        const password = document.getElementById('signup-password').value;

        // Create an object with the form data
        const formData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNumber: phoneNumber,
            password: password
        };


        fetch('/users/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
              return response.json().then(data => {
                // eslint-disable-next-line no-undef
                showToast(`Error: ${data.message}`);
                throw new Error(data.message || 'Request failed');
              });
            }
            window.location.href =  window.location.pathname = '/';
            return response.json();
          })
        .then(() => {

            // console.log('Login successful:', data);


        })
        .catch(error => {

            console.error('Login error:', error.message);

        });



    };

    const logIn=(event)=> {
        event.preventDefault(); // Prevent the default form submission


        const email = document.getElementById('login-email').value;

        const password = document.getElementById('login-password').value;

        // Create an object with the form data
        const formData = {

            email: email,

            password: password
        };


        fetch('/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                  // eslint-disable-next-line no-undef
                  showToast(`Error: ${data.message}`);
                  throw new Error(data.message || 'Request failed');
                });
              }
              return response.json();

        })
        .then(data => {

            console.log('Login successful:', data);
            window.location.pathname = '/';

        })
        .catch(error => {

            console.error('Login error:', error.message);

        });




    };

    logInBtn.addEventListener('click',logIn);
    signUpBtn.addEventListener('click', signUp);

});