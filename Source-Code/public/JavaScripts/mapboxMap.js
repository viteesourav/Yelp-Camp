mapboxgl.accessToken = mapbox_token;
// console.log(JSON.parse(geoLocation));   //we are able to receive the campdata here..
const campData = JSON.parse(geoLocation);
const pinAt = campData.geometry.coordinates;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL: We are showing outdoor maps.
  center: pinAt, // starting position [lng, lat]
  zoom: 12, // starting zoom
});

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
.setLngLat(pinAt)
.setPopup(
    new mapboxgl.Popup({offset: 20})
    .setHTML(
        `<b>${campData.title}</b><p>${campData.location}</p>`
    )
)
.addTo(map);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//add full SCreen accessability
map.addControl(new mapboxgl.FullscreenControl());

