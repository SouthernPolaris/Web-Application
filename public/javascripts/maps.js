/* global L */
/* global GeoSearch */
// These above 2 lines of comments stop linting errors by declaring these variables as global


var locations = document.getElementById("possible-locations");

var address = "University of Adelaide, North Terrace, Adelaide, South Australia, 5000, Australia";

var immediateChild = null;

var latitude = -34.9189226;
var longitude = 138.60423667410745;
var coords = [latitude, longitude];

locations.addEventListener('click', function(event) {

immediateChild = event.target.closest('#possible-locations > [data-location="1"]');

if(immediateChild) {
address = immediateChild.getElementsByTagName('p')[1].innerHTML;
coords = searchAddress(address, true);
}

});

var map = L.map('map').setView([latitude, longitude], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const search = new GeoSearch.GeoSearchControl({
provider: new GeoSearch.OpenStreetMapProvider(),
});

const provider = new GeoSearch.OpenStreetMapProvider();

var userCoords = [];

// inputField[0].addEventListener("keydown", function(e) {
// if(e.code === "Enter") {
//     validate(e);
// }
// });

function searchAddress(address, setView) {
return provider.search({ query: address})
.then(results => {
  if(results && results.length > 0) {
  const firstResult = results[0];
  const { x, y, label } = firstResult;
  const coords = [y, x];
  userCoords = coords;

  if(setView) {
      map.setView(coords, 13);

      L.marker(coords).addTo(map)
          .bindPopup(label)
          .openPopup();
  }

  return coords;
  } else {
  throw new Error("Address not found");
  }
})
.catch(error => {
  // console.error("Error geocoding: ", error);
  throw new Error("Error Geocoding", error);
});
}

function validate() {
var inputField = document.getElementsByClassName("search-input");

console.log("INPUT: ", inputField[0].value);

function distanceFinder(address, target, index) {
return searchAddress(address, true)
.then(coords => {

  searchAddress(target, false)
  .then (targetCoords => {
      var dist = getDistance(map, coords, targetCoords);
      locations.querySelectorAll("div")[index].querySelector('#distance').innerHTML = dist + " km away";
      // return 1;
  })
  .catch(err => {
      throw(err);
      // return -1;
  });


})
.catch(error => {
console.log(error);
throw(error);
// return -1;
});
}

var userAddress = inputField[0].value;
// console.log(userAddress);

var elementCount = locations.querySelectorAll('[data-location]').length;
// console.log(elementCount);



for(let i = 0; i < elementCount; i++) {

let finderAddress = locations.querySelectorAll('[data-location]')[i];
let newAddress = finderAddress.querySelector('#address').innerHTML;
// console.log(userAddress);
// console.log(newAddress);
distanceFinder(userAddress, newAddress, i);
}


const getDistance = (map, coordsFrom, coordsTo) => {
var num = map.distance(coordsFrom, coordsTo).toFixed(0);
// console.log("DISTANCE in km: ", num/1000);
return num/1000;
};
}

map.addControl(search);

function searchEventHandler(result) {
// console.log(result.location);
}

map.on('geosearch/showlocation', searchEventHandler);