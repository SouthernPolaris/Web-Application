function sendQuestion() {
    var email = document.getElementById("email").value;
    var textBody = document.getElementById("question").value;

    // console.log(email);
    // console.log(textBody);

    let jsonData = {
        'email': email,
        'subject': "Testing",
        'text': textBody
    };

    var xhttp = new XMLHttpRequest();



    xhttp.onreadystatechange = function() {

        if(this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
        }

    };

    xhttp.open('POST', '/contact/user-contact');
    xhttp.setRequestHeader('content-type', 'application/json');

    xhttp.send(JSON.stringify(jsonData));
}
