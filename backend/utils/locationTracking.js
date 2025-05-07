// this utility handles location tracking for delivery personnel and uses google maps api for geocoding and distance calculation

import axios from "axios"
const geocodeAddress=async(address)=>{
    try {
        const response=await axios.get( 'https://maps.googleapis.com/maps/api/geocode/json',
            {
              params: {
                address: `${address.street}, ${address.city}, ${address.state}, ${address.postalCode}`,
                key: process.env.GOOGLE_MAPS_API_KEY
              }
            }
          );

          if(response.data.status==="OK"&& response.data.results.length>0){
            const location=response.data.results[0].geometry.location;
            return {
                lat:location.lat,
                lng:location.lng
            };
          }
          throw new Error(`Geocoding failed :${response.data.status}`);
    } catch (error) {
        console.log('geocodeAddress error',error);
        throw error;
    }
}

