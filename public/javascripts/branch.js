
function getBranches() {

    fetch('/branch/')
        .then(response => {

            if (!response.ok) {
                alert('Error creating article');
            }

            console.log(response);
            return response.text();

        })
        .then(data => {
            console.log(data);
            var locations = document.getElementById("possible-locations");

            var response = JSON.parse(data);

            locations.innerHTML = "";

            // console.log(JSON.parse(response)[0].Name);

            for(let i = 0; i < response.length; i++) {
                var tempDiv = document.createElement('div');
                tempDiv.setAttribute("data-location", "1");

                var currentLocation = response[i];
                var address = currentLocation.HouseNumber + `, ` + currentLocation.StreetName + `, `
                + currentLocation.City + `, ` + currentLocation.State + `, `
                + currentLocation.Postcode;

                var name = currentLocation.Name;

                var nameText = document.createElement('p');
                nameText.innerText = name;

                var addressText = document.createElement('p');
                addressText.innerText = address;
                addressText.setAttribute("id", "address");

                var distanceText = document.createElement('p');
                distanceText.innerText = "-- km away";
                distanceText.setAttribute("id", "distance");

                tempDiv.appendChild(nameText);
                tempDiv.appendChild(addressText);
                tempDiv.appendChild(distanceText);

                locations.appendChild(tempDiv);
            }
        })
        .catch (error => {
            console.log(error);
        });

}


function browseBranches() {
    console.log("this code is for the join us page");
}