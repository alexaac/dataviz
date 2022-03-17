const API_URL = 'https://maps.googleapis.com/maps/api/js';
const CALLBACK_NAME = 'initMap';

const loadGoogleMapsApi = () => {
  // Prepare the `script` tag to be inserted into the page
  const scriptElement = document.createElement('script');

  scriptElement.src = `${API_URL}?callback=${CALLBACK_NAME}&key=${process.env.GOOGLE_API_KEY}&libraries=places`;

  // Insert the `script` tag
  document.body.appendChild(scriptElement);
};

export { loadGoogleMapsApi };
