import React, {useState} from 'react';
import Map, {Source, Layer} from 'react-map-gl';
import {FileUploader} from 'react-drag-drop-files';

import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const handleChange = async (file) => {
    try {
      const text = await file.text();
      setGeojsonData(JSON.parse(text))
      setFile(file);
    } catch (error) {
      console.log(error)
    }
  };
  console.log(geojsonData);
  return (
    <div className="app">
      <div className="map-container">
        <Map
          mapboxAccessToken="pk.eyJ1IjoibGlqaWFuZzAzMjciLCJhIjoiY2xrd2FjMXVwMHc1ZjNlcGRsNTd3MGlpbyJ9.OGVn2fKfa8m5RgPS93UPDw"
          initialViewState={{
            longitude: -122.4,
            latitude: 37.8,
            zoom: 14
          }}
          style={{width: '100%', height: '100%'}}
          mapStyle="mapbox://styles/mapbox/streets-v9"
        >
          {/* <Source>
            <Layer />
          </Source> */}
        </Map>
      </div>
      <div className="right-panel">
        <FileUploader handleChange={handleChange} name="mapFile" types={['geojson']} />
      </div>
    </div>
  );
}

export default App