import React, { useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import { FileUploader } from 'react-drag-drop-files';
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Heading,
  Container,
  VStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
} from '@chakra-ui/react';

import './App.css';
import getJsonData from './utils/getGeojson';

function App() {
  const [geojsonDatas, setGeojsonDatas] = useState([]);
  const [files, setFiles] = useState([]);
  const [mapPitch, setMapPitch] = useState(70);
  const [zoom, setZoom] = useState(15);
  const handleChange = async (file) => {
    try {
      const text = await file.text();
      setGeojsonDatas([...geojsonDatas, JSON.parse(text)]);
      setFiles([...files, file]);
    } catch (error) {
      console.log(error);
    }
  };

  const getLayers = () => {
    const jsonData = getJsonData();
    if (!jsonData.layers) return null;

    return jsonData.layers.map((layer) => (
      <Layer {...layer} key={layer.id} />
    ));
  };

  const sourceData = geojsonDatas.reduce((pre, data) => ({
    ...pre,
    features: [...pre.features, ...data.features],
  }), { generator: 'JOSM', type: 'FeatureCollection', features: [] });

  sourceData.features = sourceData.features.filter(({ properties: { minzoom, maxzoom } }) => {
    if (!minzoom && !maxzoom) return true;

    if (minzoom && maxzoom) return minzoom <= zoom && maxzoom >= zoom;

    if (minzoom && !maxzoom) return minzoom <= zoom;

    if (!minzoom && maxzoom) return maxzoom >= zoom;

    return true;
  });

  return (
    <Container p="0" className="app">
      <Container p="0" height="100vh" maxW="480px">
        <Map
          mapboxAccessToken="pk.eyJ1IjoibGlqaWFuZzAzMjciLCJhIjoiY2xrd2FjMXVwMHc1ZjNlcGRsNTd3MGlpbyJ9.OGVn2fKfa8m5RgPS93UPDw"
          initialViewState={{
            longitude: 115.457900,
            latitude: 38.915643,
            zoom: 15,
          }}
          onZoom={({ viewState: { zoom: z } }) => { setZoom(z); }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          pitch={mapPitch}
          renderWorldCopies={false}
        >
          <Source
            type="geojson"
            data={sourceData}
            id="source-data"
          >
            {getLayers()}
          </Source>
        </Map>
      </Container>
      <Container
        pt="4"
        pl="2"
        pr="2"
        position="absolute"
        top="0"
        right="0"
        display="flex"
        gap="32px"
        flexDirection="column"
        width="240px"
        backgroundColor="#EEEEEE"
        height="100vh"
      >
        <VStack>
          {!!files.length && files.map((file, index) => (
            <Tag key={file.name}>
              <TagLabel>{file.name}</TagLabel>
              <TagCloseButton onClick={() => {
                const newFileList = [...files];
                const newGeojsonList = [...geojsonDatas];
                newFileList.splice(index, 1);
                newGeojsonList.splice(index, 1);
                setFiles([...newFileList]);
                setGeojsonDatas([...newGeojsonList]);
              }}
              />
            </Tag>
          ))}
        </VStack>
        <Container>
          <Heading size="md" mb="4">选择地图：</Heading>
          <FileUploader classes="uploader" style={{ minWidth: 'none' }} label="选择地图" handleChange={handleChange} name="mapFile" types={['geojson']} />
        </Container>
        <Container>
          <Heading size="md" mb="4">3d效果：</Heading>
          <Slider aria-label="slider-ex-1" defaultValue={mapPitch} onChange={(value) => { setMapPitch(value); }}>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
            <SliderMark
              value={mapPitch}
              textAlign="center"
              bg="blue.500"
              color="white"
              mt="4"
              ml="-5"
              w="12"
            >
              {mapPitch}
              %
            </SliderMark>
          </Slider>
        </Container>
        <Container>
          <Heading size="md" mb="4">Zoom</Heading>
          <Text>{zoom}</Text>
        </Container>
      </Container>
    </Container>
  );
}

export default App;
