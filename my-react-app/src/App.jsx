
import React, { useState, useEffect } from "react";
import TripForm from "./components/TripForm";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
// import destinations from "./api2";
import { getDestinations } from "../src/services/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "1rem",
  marginBottom: "2rem",
};

const defaultCenter = {
  lat: 36.7783,
  lng: -119.4179,
};

function App() {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );
  }, []);

  const handleFormSubmit = async (formData) => {
    const recommendations = await getDestinations(
      formData.country,
      formData.state,
      formData.days
      
      
    );
    console.log("Form Data:", formData);
    setPlaces(recommendations || []);
  };

  const onLoad = () => {
    setMapLoaded(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-purple-300 flex flex-col items-center px-4 py-8">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-8 drop-shadow-lg">
        Trip Planner
      </h1>
      <div className="w-full max-w-2xl space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-blue-100">
          <TripForm onSubmit={handleFormSubmit} />
        </div>

        {places.length > 0 && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-blue-100">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">
                Recommended Destinations
              </h2>

              <div className="mb-8">
                <LoadScript
                  googleMapsApiKey= 'AIzaSyC8eofZm52ABJWGCYyqc-7lnGEznHoCuwM'
                  onLoad={onLoad}
                >
                  {mapLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      zoom={6}
                      center={
                        places[0]
                          ? {
                              lat: places[0].coordinates.latitude,
                              lng: places[0].coordinates.longitude,
                            }
                          : defaultCenter
                      }
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        styles: [
                          {
                            featureType: "poi",
                            stylers: [{ visibility: "off" }],
                          },
                        ],
                      }}
                    >
                      {/* Marker for each recommended destination */}
                      {places.map((place) => (
                        <Marker
                          key={place.id}
                          position={{
                            lat: place.coordinates.latitude,
                            lng: place.coordinates.longitude,
                          }}
                          onClick={() => setSelectedPlace(place)}
                          label={{
                            text: place.name,
                            className: "map-marker-label",
                            color: "#1f2937",
                            fontWeight: "bold",
                          }}
                        />
                      ))}

                      {/* Marker for user's current location */}
                      {userLocation && (
                        <Marker
                          position={userLocation}
                          icon={{
                            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Custom icon URL (you can use a custom image as well)
                            scaledSize: new window.google.maps.Size(40, 40), // Scale the icon size (optional)
                          }}
                          label={{
                            text: "You are here", // Optional label text
                            color: "#FF0000", // Hex code for red
                            fontWeight: "bold", // Label text style
                            fontSize: "14px", // Label text size
                          }}
                        />
                      )}

                      {/* InfoWindow for selected place */}
                      {selectedPlace && (
                        <InfoWindow
                          position={{
                            lat: selectedPlace.coordinates.latitude,
                            lng: selectedPlace.coordinates.longitude,
                          }}
                          onCloseClick={() => setSelectedPlace(null)}
                        >
                          <div className="p-2">
                            <h3 className="font-bold text-gray-800">
                              {selectedPlace.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {selectedPlace.category}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </GoogleMap>
                  ) : (
                    <p>Loading map...</p>
                  )}
                </LoadScript>
              </div>

              <div className="grid gap-6">
                {places.map((place) => (
                  <div
                    key={place.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {place.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {place.category}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${place.coordinates.latitude},${place.coordinates.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
                      >
                        View on Map
                      </a>
                    </div>

                    <p className="text-gray-700 mb-4">{place.focus}</p>

                    <div className="space-y-4">
                      {Object.entries(place.activities).map(
                        ([category, description]) => (
                          <div
                            key={category}
                            className="border-l-4 border-blue-200 pl-4"
                          >
                            <h4 className="font-medium text-gray-800 capitalize">
                              {category}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1">
                              {description}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
