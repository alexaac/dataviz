import styles from '../css/main.scss';
import { loadGoogleMapsApi } from './loadApi';

loadGoogleMapsApi();

let marker;

// Initialize and add the map
window.initMap = function () {
  // The location of Cluj-Napoca
  const CLUJ = { lat: 46.7747569, lng: 23.5901995 };
  const TIMIS = { lat: 45.7494444, lng: 21.2272222 };

  const options = {
    center: CLUJ,
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };

  const map = new google.maps.Map(document.getElementById('map'), options);

  //Autocomplete
  const autocompleteFrom = new google.maps.places.Autocomplete(
    document.getElementById('from-input'),
    {
      types: ['(cities)'],
    }
  );
  autocompleteFrom.addListener('place_changed', onPlaceChanged);
  const autocompleteTo = new google.maps.places.Autocomplete(
    document.getElementById('to-input'),
    {
      types: ['(cities)'],
    }
  );
  autocompleteTo.addListener('place_changed', onPlaceChanged);

  function onPlaceChanged() {
    const place = this.getPlace();
    map.panTo(place.geometry.location);
  }

  const directionsService = new google.maps.DirectionsService();
  const directionsDisplay = new google.maps.DirectionsRenderer();

  // Calculate route
  const calcRoute = () => {
    document.getElementById('error').innerHTML = '';

    const request = {
      origin: document.getElementById('from-input').value,
      destination: document.getElementById('to-input').value,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    };

    directionsDisplay.setMap(null);
    directionsDisplay.setMap(map);

    directionsService.route(request, function (result, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        document.getElementById('route-info').innerHTML = `
        The traveling distance is ${result.routes[0].legs[0].distance.text}.<br/>
        The traveling time is ${result.routes[0].legs[0].duration.text}.

        `;
        directionsDisplay.setDirections({ routes: [] });

        directionsDisplay.setDirections(result);
      } else {
        directionsDisplay.setDirections({ routes: [] });
        map.setCenter(CLUJ);
        document.getElementById('error').innerHTML = status;
        document.getElementById('route-info').innerHTML = '';
      }
    });
  };

  document.getElementById('create-route').addEventListener('click', calcRoute);
};
