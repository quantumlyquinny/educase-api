import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import './App.css';

// Fix for the missing marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = "https://educase-api-qfr3.onrender.com/listSchools";

function App() {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setSchools(res.data))
      .catch(err => console.error("API Error:", err));
  }, []);

  return (
    <div className="map-wrapper">
      <h2 className="title">School Locator Dashboard</h2>
      <MapContainer center={[28.6139, 77.2090]} zoom={11} scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {schools.map(school => (
          <Marker key={school.id} position={[school.latitude, school.longitude]}>
            <Popup>
              <strong>{school.name}</strong><br />
              {school.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;