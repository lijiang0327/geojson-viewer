import React, {
  useState, useRef, useMemo, useCallback,
} from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import { FileUploader } from 'react-drag-drop-files';
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Heading,
  VStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
  Input,
  Flex,
  Box,
  Collapse,
  HStack,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  centroid, point,
} from 'turf';
import * as turf from '@turf/turf';

import { Threebox } from 'threebox-plugin';

import elevatorSvg from './assets/elevator.svg';
import carParkSvg from './assets/car-park.svg';
import exitSvg from './assets/exit.svg';
import stairSvg from './assets/stair.svg';
import escalatorSvg from './assets/escalator.svg';
import toiletSvg from './assets/toilet.svg';

import './App.css';
import getJsonData from './utils/getGeojson';
import { format3DModelRotation, format3DModelScale } from './utils/modalFormatter';

function App() {
  const [geojsonDatas, setGeojsonDatas] = useState([]);
  const [files, setFiles] = useState([]);
  const [mapPitch, setMapPitch] = useState(70);
  const [zoom, setZoom] = useState(15);
  const [lightIntensity, setLightIntensity] = useState(0.5);
  const [lightColor, setLightColor] = useState('#FFFFFF');

  const [mapPropsExpand, setMapPropsExpand] = useState(false);
  const [geojsonPropsExpand, setGeojsonPropsExpand] = useState(false);
  const [layerPropsExpand, setLayerPropsExpand] = useState(false);
  const [mapUploadExpand, setMapUploadExpand] = useState(false);

  const jsonData = useMemo(() => getJsonData(), []);

  const mapRef = useRef();
  const threeBoxRef = useRef();
  const handleChange = async (file) => {
    try {
      const text = await file.text();
      setGeojsonDatas([...geojsonDatas, JSON.parse(text)]);
      setFiles([...files, file]);
      const center = centroid(JSON.parse(text));
      mapRef.current?.flyTo({
        center: center.geometry.coordinates,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getLayers = () => {
    if (!jsonData.layers) return null;

    return jsonData.layers.map((layer) => (
      <Layer {...layer} key={layer.id} />
    ));
  };

  const addImagesToMap = (map) => {
    const images = [{
      name: 'ips_car_park',
      src: carParkSvg,
    }, {
      name: 'ips_elevator',
      src: elevatorSvg,
    }, {
      name: 'ips_export',
      src: exitSvg,
    }, {
      name: 'ips_stair',
      src: stairSvg,
    }, {
      name: 'ips_escalator',
      src: escalatorSvg,
    }, {
      name: 'ips_toilet',
      src: toiletSvg,
    }];
    images.forEach(({ src, name }) => {
      const img = new Image(40, 40);
      img.src = src;
      img.onload = () => {
        map.addImage(name, img);
      };
    });
  };

  const onMapLoadHandler = (e) => {
    const map = e.target;
    addImagesToMap(map);

    if (!threeBoxRef.current) {
      threeBoxRef.current = new Threebox(
        map,
        map.getCanvas().getContext('webgl'),
        {
          defaultLights: true,
          enableDraggingObjects: true,
          enableRotatingObjects: true,
          enableSelectingObjects: true,
          enableSelectingFeatures: true,
          enableTooltips: true,
        },
      );

      window.tb = threeBoxRef.current;
    }
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

  const getSource = useCallback(() => {
    const sData = geojsonDatas.reduce((pre, data) => ({
      ...pre,
      features: [...pre.features, ...data.features],
    }), { generator: 'JOSM', type: 'FeatureCollection', features: [] });

    sData.features = sData.features.filter(({ properties: { minzoom, maxzoom } }) => {
      if (!minzoom && !maxzoom) return true;

      if (minzoom && maxzoom) return minzoom <= zoom && maxzoom >= zoom;

      if (minzoom && !maxzoom) return minzoom <= zoom;

      if (!minzoom && maxzoom) return maxzoom >= zoom;

      return true;
    });
    const mapData = sData;

    const d3Features = mapData?.features.filter(({ properties }) => properties.model === 'yes') || [];
    const imageFeatures = mapData?.features.filter(({ properties }) => properties.image === 'yes') || [];

    const on3DLayerAdded = () => {
      threeBoxRef.current?.clear();
      // eslint-disable-next-line array-callback-return
      d3Features.map((feature) => {
        const { coordinates } = feature.geometry;
        const { url } = feature.properties;
        const scale = format3DModelScale(feature.properties.scale || '1 1 1');
        const rotation = format3DModelRotation(feature.properties.rotation || '0 0 0');
        const anchor = feature.properties.anchor === 'auto' ? 'auto' : undefined;
        const type = feature.properties.type || 'gltf';
        const center = turf.center(turf.points(coordinates));

        threeBoxRef.current?.loadObj({
          obj: url,
          type,
          units: 'meters',
          clone: true,
          anchor,
          scale,
        }, (model) => {
          model.set({
            rotation,
          });
          model.setCoords(center.geometry.coordinates);
          model.addHelp('aaa');
          console.log(model);
          threeBoxRef.current.add(model);
        });
      });
    };

    return (
      <>
        {!!imageFeatures.length && imageFeatures.map((feature, index) => {
          const coordinates = [...(feature.geometry?.coordinates[0] ?? [])];
          coordinates.pop();
          const id = `image-source-${index}`;
          return (
            <Source
              key={id}
              type="image"
              url={feature.properties?.url}
              id={id}
              coordinates={[
                ...coordinates,
              ]}
            >
              <Layer
                id="overlay"
                source={id}
                type="raster"
                paint={{
                  'raster-opacity': 1,
                }}
              />
            </Source>
          );
        })}
        <Source
          type="geojson"
          data={mapData}
          id="my-data"
        >
          {getLayers()}
          {
            !!d3Features.length && (
            <Layer
              key="custom-3d-layer"
              id="custom-3d-layer"
              type="custom"
              renderingMode="3d"
              render={() => {
                threeBoxRef.current?.update();
              }}
              onAdd={on3DLayerAdded}
            />
            )
          }
        </Source>
      </>
    );
  }, [sourceData, zoom]);

  function getElementByCoordinate(coordinate) {
    if (!coordinate || !sourceData) {
      return null;
    }

    const pt = point([coordinate.lng, coordinate.lat]);

    try {
      const element = sourceData.features.find((feature) => {
        if (!feature.geometry?.coordinates?.length || feature.properties?.model !== 'yes') {
          return false;
        }
        const poly = feature.geometry?.type === 'Polygon' ? turf.polygon(feature.geometry.coordinates) : turf.polygon([feature.geometry.coordinates]);
        return turf.booleanPointInPolygon(pt, poly);
      });
      console.log(element);
      console.log(threeBoxRef.current);
      return element;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  return (
    <Flex direction="row">
      <Box height="100vh" flex={1} position="relative" overflow="hidden">
        <Map
          mapboxAccessToken="pk.eyJ1IjoibGlqaWFuZzAzMjciLCJhIjoiY2xrd2FjMXVwMHc1ZjNlcGRsNTd3MGlpbyJ9.OGVn2fKfa8m5RgPS93UPDw"
          initialViewState={{
            longitude: 115.457900,
            latitude: 38.915643,
            zoom: 15,
          }}
          ref={mapRef}
          onZoom={({ viewState: { zoom: z } }) => { setZoom(z); }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/lijiang0327/cll4ttex9008t01rd6lachq14"
          pitch={mapPitch}
          renderWorldCopies={false}
          attributionControl={false}
          pitchWithRotate
          touchPitch={false}
          dragRotate={false}
          light={{
            color: lightColor,
            intensity: lightIntensity,
          }}
          onLoad={onMapLoadHandler}
          onClick={(e) => {
            console.log(e);
            getElementByCoordinate(e.lngLat);
          }}
        >
          {getSource()}
          {/* <Source
            type="geojson"
            data={sourceData}
            id="source-data"
          >
            {getLayers()}
          </Source> */}
        </Map>
      </Box>
      <Box
        pt="4"
        pl="2"
        pr="2"
        top="0"
        right="0"
        display="flex"
        gap="32px"
        flexDirection="column"
        width="360px"
        backgroundColor="#EEEEEE"
        height="100vh"
        boxSizing="border-box"
      >
        <Box>
          <Heading
            size="md"
            mb="4"
            onClick={() => setMapUploadExpand(!mapUploadExpand)}
          >
            选择地图：
          </Heading>
          <FileUploader classes="uploader" style={{ minWidth: 'none' }} label="选择地图" handleChange={handleChange} name="mapFile" types={['geojson']} />
          <Collapse in={mapUploadExpand}>
            <VStack mt={4} alignItems="flex-start">
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
          </Collapse>
        </Box>

        <Box
          borderBottom="1px solid #ccc"
        >
          <Heading
            size="sm"
            mb="4"
            onClick={() => setMapPropsExpand(!mapPropsExpand)}
            cursor="pointer"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            MapBox 属性:
            {mapPropsExpand ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Heading>
          <Collapse in={mapPropsExpand}>
            <VStack
              alignItems="flex-start"
              width="100%"
              mt={4}
              gap={4}
            >
              <Box width="100%" display="flex" gap={4} alignItems="center" mb="4">
                <Heading size="sm" width="120px">3d效果：</Heading>
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
              </Box>
              <Box width="100%" display="flex" gap={4} alignItems="center" mb="4">
                <Heading size="sm" width="120px">灯光颜色</Heading>
                <Input
                  defaultValue={lightColor}
                  onChange={(event) => {
                    setLightColor(event.target.value);
                  }}
                />
              </Box>
              <Box width="100%" display="flex" gap={4} alignItems="center" mb="4">
                <Heading size="sm" width="120px">灯光强度：</Heading>
                <Slider aria-label="slider-ex-2" min={0} max={1} step={0.01} defaultValue={lightIntensity} onChange={(value) => { setLightIntensity(value); }}>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                  <SliderMark
                    value={lightIntensity}
                    textAlign="center"
                    bg="blue.500"
                    color="white"
                    mt="4"
                    ml="-5"
                    w="12"
                  >
                    {lightIntensity}
                    %
                  </SliderMark>
                </Slider>
              </Box>
              <Box width="100%" display="flex" gap={4} alignItems="center" mb="4">
                <Heading size="sm" width="120px">Zoom: </Heading>
                <Text>{zoom}</Text>
              </Box>
            </VStack>
          </Collapse>
        </Box>

        <Box
          borderBottom="1px solid #ccc"
        >
          <Heading
            size="sm"
            mb="4"
            onClick={() => setGeojsonPropsExpand(!geojsonPropsExpand)}
            cursor="pointer"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            GeoJson 属性:
            {geojsonPropsExpand ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Heading>
          <Collapse in={geojsonPropsExpand}>
            {/* <VStack
              alignItems="flex-start"
              width="100%"
              mt={4}
              gap={4}
              maxH="600px"
              overflowY="auto"
            >
              {geojsonPropsExpand && sourceData?.features?.map((feature) => (
                <Box width="100%" paddingLeft={2}>
                  <VStack
                    alignItems="flex-start"
                    width="100%"
                    mt={4}
                    gap={4}
                  >
                    <Heading size="small">Geometry:</Heading>
                    <HStack paddingLeft={4}>
                      <Heading size="small">Type: </Heading>
                      <Text>{feature.geometry.type}</Text>
                    </HStack>
                    <Heading size="small">Properties:</Heading>
                    {feature?.properties
                    && Object.entries(feature?.properties).map(([key, value]) => (
                      <HStack paddingLeft={4}>
                        <Heading size="small">
                          {key}
                          :
                        </Heading>
                        <Text>{value}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack> */}
          </Collapse>
        </Box>

        <Box
          borderBottom="1px solid #ccc"
        >
          <Heading
            size="sm"
            mb="4"
            onClick={() => setLayerPropsExpand(!layerPropsExpand)}
            cursor="pointer"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            Layers 属性:
            {layerPropsExpand ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Heading>
          <Collapse in={layerPropsExpand}>
            <VStack
              alignItems="flex-start"
              width="100%"
              mt={4}
              gap={4}
              maxH="600px"
              overflowY="auto"
            >
              {jsonData?.layers?.map((layer) => (
                <Box width="100%" paddingLeft={2} key={layer.id}>
                  <VStack
                    alignItems="flex-start"
                    width="100%"
                    mt={4}
                    gap={4}
                  >
                    <HStack paddingLeft={4}>
                      <Heading size="small">id: </Heading>
                      <Text>{layer.id}</Text>
                    </HStack>
                    <HStack paddingLeft={4}>
                      <Heading size="small">source: </Heading>
                      <Text>{layer.source}</Text>
                    </HStack>
                    <HStack paddingLeft={4}>
                      <Heading size="small">type: </Heading>
                      <Text>{layer.type}</Text>
                    </HStack>
                    <HStack paddingLeft={4}>
                      <Heading size="small">filter: </Heading>
                      <Text>{layer.filter?.join(',')}</Text>
                    </HStack>
                    <Box paddingLeft={4} width="100%">
                      <Heading size="small">paint: </Heading>
                      <VStack
                        alignItems="flex-start"
                        width="100%"
                        mt={4}
                        gap={4}
                      >
                        {layer?.paint && Object.entries(layer.paint).map(([key, value]) => (
                          <HStack paddingLeft={4} flexWrap="wrap" key={key}>
                            <Heading size="small" width="fit-content">
                              {key}
                              :
                            </Heading>
                            <Text paddingLeft={4}>{value?.join ? value.join(', ') : value}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Collapse>
        </Box>

        <Box>
          <Heading
            size="md"
            mb="4"
            onClick={() => setMapUploadExpand(!mapUploadExpand)}
          >
            上传模型：
          </Heading>
          <FileUploader classes="uploader" style={{ minWidth: 'none' }} label="选择模型" handleChange={handleChange} name="mapFile" types={['gltf']} />
          <Collapse in={mapUploadExpand}>
            <VStack mt={4} alignItems="flex-start">
              {!!files.length && files.map((file) => (
                <Tag key={file.name}>
                  <TagLabel>{file.name}</TagLabel>
                  <TagCloseButton onClick={() => {
                    // const newFileList = [...files];
                    // const newGeojsonList = [...geojsonDatas];
                    // newFileList.splice(index, 1);
                    // newGeojsonList.splice(index, 1);
                    // setFiles([...newFileList]);
                    // setGeojsonDatas([...newGeojsonList]);
                  }}
                  />
                </Tag>
              ))}
            </VStack>
          </Collapse>
        </Box>

        <Box>
          <Heading
            size="md"
            mb="4"
            onClick={() => setMapUploadExpand(!mapUploadExpand)}
          >
            上传图片：
          </Heading>
          <FileUploader classes="uploader" style={{ minWidth: 'none' }} label="选择图片" handleChange={handleChange} name="mapFile" types={['jpg', 'png']} />
          <Collapse in={mapUploadExpand}>
            <VStack mt={4} alignItems="flex-start">
              {!!files.length && files.map((file) => (
                <Tag key={file.name}>
                  <TagLabel>{file.name}</TagLabel>
                  <TagCloseButton onClick={() => {
                    // const newFileList = [...files];
                    // const newGeojsonList = [...geojsonDatas];
                    // newFileList.splice(index, 1);
                    // newGeojsonList.splice(index, 1);
                    // setFiles([...newFileList]);
                    // setGeojsonDatas([...newGeojsonList]);
                  }}
                  />
                </Tag>
              ))}
            </VStack>
          </Collapse>
        </Box>
      </Box>
    </Flex>
  );
}

export default App;
