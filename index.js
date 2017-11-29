// This example adds a user-editable rectangle to the map.
// When the user changes the bounds of the rectangle,
// an info window pops up displaying the new bounds.


///// Data Object

let dataObject = [];

///// Google Maps

let rectangle;
let map;
let elevator;
let infoWindow;


///// D3

// Set the dimensions of the canvas / graph
let margin = { top: 30, right: 20, bottom: 30, left: 50 },
    width = 600 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

// Set the ranges
let x = d3.scaleLinear().range([0, width]);
let y = d3.scaleLinear().range([height, 0]);

// Define the line
let valueline = d3.line()
    .x(function(d, i) { return x(i); })
    .y(function(d) { return y(d.elevation); });

// Adds the svg canvas
let svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


////// GOOGLE MAPS FUNCTIONS

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 44.5452, lng: -78.5389 },
        zoom: 9
    });
    elevator = new google.maps.ElevationService;


    let bounds = {
        north: 44.599,
        south: 44.490,
        east: -78.443,
        west: -78.649
    };

    // Define the rectangle and set its editable property to true.
    rectangle = new google.maps.Rectangle({
        bounds: bounds,
        editable: true,
        draggable: true
    });

    rectangle.setMap(map);

    // Add an event listener on the rectangle.
    rectangle.addListener('bounds_changed', showNewRect);

    // Define an info window on the map.
    infoWindow = new google.maps.InfoWindow();
}
// Show the new coordinates for the rectangle in an info window.

/** @this {google.maps.Rectangle} */
function showNewRect(event) {
    let ne = rectangle.getBounds().getNorthEast();
    let sw = rectangle.getBounds().getSouthWest();
    console.log(rectangle.getBounds());

    let contentString = '<b>Rectangle moved.</b><br>' +
        'New north-east corner: ' + ne.lat() + ', ' + ne.lng() + '<br>' +
        'New south-west corner: ' + sw.lat() + ', ' + sw.lng();

    // Set the info window's content and position.
    infoWindow.setContent(contentString);
    infoWindow.setPosition(ne);

    infoWindow.open(map);

    // construct path request
    let path = [
        { lat: ne.lat(), lng: sw.lng() },
        { lat: sw.lat(), lng: ne.lng() }
    ];

    // initiate path request
    elevator.getElevationAlongPath({
        'path': path,
        'samples': 30
    }, updateData);


}


// Get the data
d3.json("data2.json", function(error, dataReturn) {

    dataObject = dataReturn;
    console.log(dataObject);
    initGraph(dataObject);

});


function updateData(data, status) {
	dataObject = data;
	updateGraph(data);
}

function initGraph(data) {
    // Scale the range of the data
    x.domain(d3.extent(data, function(d, i) { return i; }));
    y.domain([-100, d3.max(data, function(d) { return d.elevation; })]);

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline(data));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));
}


function updateGraph(data) {
    // Scale the range of the data
    x.domain(d3.extent(data, function(d, i) { return i; }));
    y.domain([-100, d3.max(data, function(d) { return d.elevation; })]);


    let svg = d3.select("#graph-container").transition();
    // Add the valueline path.
    svg.select(".line")
        .duration(750)
        .attr("d", valueline(data));

    // Add the X Axis
    svg.select(".x.axis")
        .duration(750)
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.select(".y.axis")
        .duration(750)
        .call(d3.axisLeft(y));
}