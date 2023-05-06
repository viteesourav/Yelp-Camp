//This code-base is take from mapbox gl js -> cluster map
mapboxgl.accessToken = mapbox_token;

//Manipulating allcampData to include 'properties' key containing information about camp...
// allCampData.features.forEach((camp)=>{
//     camp.properties = {
//         id: camp._id,
//         images: camp.images,
//         title: camp.title
//     }
// });
//Added a virtual Propety in the schema to handle the 'properties' key for campground.[Better Approach]

const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-103.5917, 40.6699],
    zoom: 3
});

map.on('load', () => {
    // console.log('Triggers when we load the map !!!');
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campgrounds', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ campgrounds
        data: allCampData,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    //updating layers to have more colors and partion to show them on map...
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * orange, 20px  circles when point count is less than 50
            //   * Blue, 30px circles when point count is between 50 and 100
            //   * Yellow, 40px circles when point count is between 100 and 500
            //   * Pink, 50px circles when point count is greater than or equal to 500
            'circle-color': [
                'step',
                ['get', 'point_count'],
                'orange',
                50,
                '#51bbd6',
                100,
                '#f1f075',
                500,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                50,
                30,
                100,
                40,
                550,
                50
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': 'green',
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'grey'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        // console.log('Event Triggered when you press the Cluster icon');
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', (e) => {
        // console.log('Event Triggered when we click on the uncluster-points');
        const coordinates = e.features[0].geometry.coordinates.slice();
        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // This part we will modified to handle the popup content 
        const title = e.features[0].properties.title;
        const location = e.features[0].properties.location;
        const campPopupMsg = e.features[0].properties;   //this is a virtual property we have for showing popups.. 
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                `<div class="container text-center">
                <img src="${campPopupMsg.imgUrl}" alt="popup_image" height="100px" style="aspect-ratio: 1/1; border: 1px solid black; border-radius: 8px;">
                <p><a href="/campgrounds/${campPopupMsg.id}"><span class="text-info">${campPopupMsg.title}</span></a></p>
              </div>`
            )
            .addTo(map);
    });

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//add full SCreen accessability
map.addControl(new mapboxgl.FullscreenControl());