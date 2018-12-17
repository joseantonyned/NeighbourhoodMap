// Array of location objects
var locList = [{
    title: 'Cochin International Airport',
    lat: 10.155278,
    lng: 76.391111,
    imageUrl: '<img src="https://upload.wikimedia.org/wikipedia/commons/0/06/Cochin_international_airport_terminal.jpg" height="100%" width="100%">'
},
{
    title: 'Kannur International Airport',
    lat: 11.92,
    lng: 75.55,
    imageUrl: '<img src="https://i0.wp.com/www.airwhizz.com/wp-content/uploads/2018/10/news-3-2.jpeg?resize=820%2C400&ssl=1" height="100%" width="100%">'
},
{
    title: 'Calicut International Airport',
    lat: 11.14,
    lng: 75.95,
    imageUrl: '<img src="https://upload.wikimedia.org/wikipedia/commons/c/c8/%E0%B4%95%E0%B5%8B%E0%B4%B4%E0%B4%BF%E0%B4%95%E0%B5%8D%E0%B4%95%E0%B5%8B%E0%B4%9F%E0%B5%8D_%E0%B4%B5%E0%B4%BF%E0%B4%AE%E0%B4%BE%E0%B4%A8%E0%B4%A4%E0%B5%8D%E0%B4%A4%E0%B4%BE%E0%B4%B5%E0%B4%B3%E0%B4%82.jpg" height="100%" width="100%">'
},
{
    title: 'Trivandrum International Airport',
    lat: 8.48,
    lng: 76.92,
    imageUrl: '<img src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Terminal_trv.jpg" height="100%" width="100%">'
},
{
    title: 'INS Garuda',
    lat: 9.941,
    lng: 76.275,
    imageUrl: '<img src="https://c.ndtvimg.com/1bln7c4s_kochi-naval-base_625x300_19_August_18.jpg?output-quality=70&output-format=webp" height="100%" width="100%">'
},
];

// creates infoWindow contents
function createWindowContent(loc) {return ('<div>'+'<h2>'+loc.title+'</h2>'+'<div>'+loc.imageUrl+'</div>'+'</div>');
}

// global map declaration
var map;

// loads infoWindow and animates marker with a bounce 
function loadMarker(marker, i) {
return function() {
    infoWin.setContent(createWindowContent(locList[i]));
    infoWin.open(map, marker);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {marker.setAnimation(null);}, 400);
    vModel.wikiInfo(locList[i]);
};
}

// map not defined 
var mapDef = false;

// initialize map function
function initMap() {
var bounds = new google.maps.LatLngBounds();

// Defining the map on the page
map = new google.maps.Map(document.getElementById("map"),{zoom: 7});

// placing markers on the map as it iterates through the locList
function placeMarker() {
    for (i = 0; i < locList.length; i++) {
        var loc = locList[i];
        var position = new google.maps.LatLng(loc.lat, loc.lng);
        bounds.extend(position);
        var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: loc.title
        });
        loc.marker = marker;
        map.fitBounds(bounds);
        google.maps.event.addListener(marker, 'click', loadMarker(marker, i));
    }
    infoWin = new google.maps.InfoWindow();
}

// invoking placeMarker
placeMarker(locList);

// map defined
mapDef = true;
}

// ViewModel
var Locate = function() {
var that = this;
that.locList = ko.observableArray(locList);
that.input = ko.observable('');
that.wikiArray = ko.observableArray([]);

// filters the search and sets the visibility accordingly
that.filterSearch = ko.computed(function() {
    var inp = that.input().toLowerCase();
    var filteredLocList = that.locList().filter(function(loc) {
        return loc.title.toLowerCase().indexOf(inp) >= 0;
    });
    if (mapDef) {
        for (var i = 0; i < locList.length; i++) {
            locList[i].marker.setVisible(false);
        }
        for (i = 0; i < filteredLocList.length; i++) {
            filteredLocList[i].marker.setVisible(true);
        }
    }
    return filteredLocList;
});

// enables click fuctionality in the menu resulting in the boucing animation of the marker and display of info about the location
that.clickLoc = function(loc) {
    loc.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        loc.marker.setAnimation(null);}, 400);
    infoWin.open(map, loc.marker);
    infoWin.setContent(createWindowContent(loc));
    that.wikiInfo(loc);
};

that.wikiInfo = function(loc) {

    // clearing the array
    that.wikiArray([]);

    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+loc.title+'&format=json&callback=wikiCallback';

    // wikipedia request time out error handling
    var wikiReqTimeout = setTimeout(function() {
        that.wikiArray.push("Wikipedia request timed out.");
    }, 8000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function(response) {
            var wikiResp = response[1][0];
                var url = 'http://en.wikipedia.org/wiki/' + wikiResp;
                that.wikiArray.push('<a href="' + url + '">' + wikiResp + '</a>');
            clearTimeout(wikiReqTimeout);
        }
    });
    return false;
};
};

// applying bindings
var vModel = new Locate();
ko.applyBindings(vModel);

// Google Maps API Error Handling
function gmApiError() {
alert("Google Maps API error.");
}
