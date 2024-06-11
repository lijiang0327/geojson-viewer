/* eslint-disable no-mixed-operators */
/* eslint-disable no-param-reassign */
import React, {
  useState, useRef, useMemo,
} from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import { FileUploader } from 'react-drag-drop-files';
import { cloneDeep, throttle } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { saveAs } from 'file-saver';
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
  Button,
  Select,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  centroid, point,
} from 'turf';
import * as turf from '@turf/turf';
import html2canvas from 'html2canvas';

import { Threebox } from 'threebox-plugin';

import elevatorSvg from './assets/elevator.svg';
import carParkSvg from './assets/car-park.svg';
import exitSvg from './assets/exit.svg';
import stairSvg from './assets/stair.svg';
import escalatorSvg from './assets/escalator.svg';
import toiletSvg from './assets/toilet.svg';
import entranceSvg from './assets/entrance.svg';
import exportSvg from './assets/export.svg';

import './App.css';
import getJsonData from './utils/getGeojson';
import { format3DModelRotation, format3DModelScale } from './utils/modalFormatter';

function App() {
  const [geojsonDatas, setGeojsonDatas] = useState([]);
  const [files, setFiles] = useState([]);
  const [mapPitch, setMapPitch] = useState(0);
  const [zoom, setZoom] = useState(15);
  const [lightIntensity, setLightIntensity] = useState(0.5);
  const [lightColor, setLightColor] = useState('#FFFFFF');

  const [mapPropsExpand, setMapPropsExpand] = useState(false);
  const [layerPropsExpand, setLayerPropsExpand] = useState(false);
  const [mapUploadExpand, setMapUploadExpand] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedElementShadow, setSelectedElementShadow] = useState(null);

  const dragStartPointRef = useRef(null);

  const jsonData = useMemo(() => getJsonData(), []);

  const mapRef = useRef();
  const threeBoxRef = useRef();

  const onLightPresetChangeHandler = (e) => {
    console.log(e.target.value);
    console.log(mapRef.current);
    // const map = mapRef.current?.getMap();
    mapRef.current?.setConfigProperty('basemap', 'lightPreset', e.target.value);
  };

  const handleChange = async (file) => {
    try {
      const text = await file.text();
      const mapData = cloneDeep(JSON.parse(text));
      mapData.features.forEach((feature) => { Object.assign(feature, { id: uuidv4() }); });
      setGeojsonDatas([...geojsonDatas, mapData]);
      setFiles([...files, file]);
      const center = centroid(mapData);
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
    }, {
      name: 'ips_entrance',
      src: entranceSvg,
    }, {
      name: 'ips_exit',
      src: exportSvg,
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
          enableHelpTooltips: true,
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

  const on3DLayerAdded = throttle(() => {
    threeBoxRef.current?.clear();
    // eslint-disable-next-line array-callback-return
    d3Features.forEach((feature) => {
      const { coordinates } = feature.geometry;
      const {
        url, anchor, title, type, titleColor, titleFontSize, titleBackgroundColor,
      } = feature.properties;
      const scale = format3DModelScale(feature.properties.scale || '1 1 1');
      const rotation = format3DModelRotation(feature.properties.rotation || '0 0 0');
      const center = turf.center(turf.points(coordinates));

      threeBoxRef.current?.loadObj({
        obj: url,
        type: type ?? 'gltf',
        units: 'meters',
        clone: true,
        anchor,
        scale,
        name: feature.id,
        coordinates,
      }, (model) => {
        if (threeBoxRef.current?.world.children.find(({ name }) => name === feature.id)) {
          return;
        }
        model.set({
          rotation,
        });
        model.setCoords(center.geometry.coordinates);
        model.name = feature.id;
        model.userData.coordinates = coordinates;
        if (title) {
          const label = document.createElement('span');
          label.innerText = title;
          label.style.color = titleColor ?? '#000000';
          label.style.fontSize = titleFontSize ?? '12px';
          label.style.backgroundColor = titleBackgroundColor ?? 'transparent';
          label.style.padding = '2px 6px';
          label.style.borderRadius = '4px';
          const size = model.getSize();
          model.addLabel(
            label,
            true,
            {
              z: model.center.z,
              y: model.center.y + size.y * 0.5,
              x: model.center.x + size.x * 0.5,
            },
            1.2,
          );
        }
        threeBoxRef.current.add(model);
      });
    });
  }, 100);

  function getElementByCoordinate(coordinate) {
    if (!coordinate || !threeBoxRef.current) {
      return null;
    }

    const pt = point([coordinate.lng, coordinate.lat]);

    try {
      const objects = threeBoxRef.current?.world.children;
      const element = objects.find(({ userData }) => {
        if (!userData.coordinates?.length) {
          return false;
        }
        const poly = turf.polygon([userData.coordinates]);
        return turf.booleanPointInPolygon(pt, poly);
      });
      return element;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  const zoomOut = async () => {
    const mapContainer = document.getElementById('map');

    mapContainer.style.position = 'fix';

    mapContainer.style.left = 0;
    mapContainer.style.top = 0;
    mapContainer.style.width = '7500px';
    mapContainer.style.height = '4300px';

    mapRef.current.resize();
    mapRef.current.setZoom(19.6);
  };

  const saveToImage = async () => {
    const mapContainer = document.getElementById('map');
    const canvas = await html2canvas(mapContainer, {
      width: mapContainer.clientWidth,
      height: mapContainer.clientHeight,
    });

    setTimeout(() => {
      canvas.toBlob((blob) => {
        saveAs(blob, 'aaa');
      });
    }, 500);
  };

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
          id="map"
          ref={mapRef}
          onZoom={({ viewState: { zoom: z } }) => { setZoom(z); }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/lijiang0327/cll4ttex9008t01rd6lachq14"
          pitch={mapPitch}
          renderWorldCopies={false}
          attributionControl={false}
          touchPitch={false}
          preserveDrawingBuffer
          dragRotate
          light={{
            color: lightColor,
            intensity: lightIntensity,
          }}
          onLoad={onMapLoadHandler}
          onClick={(e) => {
            const element = getElementByCoordinate(e.lngLat);
            if (!element) {
              threeBoxRef.current?.world.children.forEach((child) => {
                child.selected = false;
              });
              setSelectedElement(null);
              setSelectedElementShadow(null);
            }
          }}
          onMouseDown={(e) => {
            const element = getElementByCoordinate(e.lngLat);
            if (element) {
              e.preventDefault();
              dragStartPointRef.current = e.lngLat;
              setSelectedElement(element);
              setSelectedElementShadow(cloneDeep(element));
              threeBoxRef.current?.world.children.forEach((child) => {
                child.selected = false;
              });
              element.selected = true;
            }
          }}
          onMouseMove={throttle((e) => {
            if (!dragStartPointRef.current || !selectedElement) return;

            const latDistance = e.lngLat.lat - dragStartPointRef.current.lat;
            const lngDistance = e.lngLat.lng - dragStartPointRef.current.lng;

            dragStartPointRef.current = e.lngLat;

            const coordinates = cloneDeep(selectedElement.userData.coordinates);
            selectedElement.userData.coordinates = coordinates.map(
              ([lng, lat]) => [lng + lngDistance, lat + latDistance],
            );
            const coords = selectedElement.coordinates;
            selectedElement.setCoords([coords[0] + lngDistance, coords[1] + latDistance]);
          }, 20)}
          onMouseUp={() => {
            dragStartPointRef.current = null;
            if (selectedElement) {
              setSelectedElementShadow(cloneDeep(selectedElement));
              const geojsonDatasShadow = cloneDeep(geojsonDatas);

              geojsonDatasShadow.forEach((source) => {
                source.features?.forEach((feature) => {
                  if (feature.properties.model !== 'yes' || feature.id !== selectedElement.name) {
                    return;
                  }

                  feature.properties.rotation = `${selectedElement.rotation.x * 180 / Math.PI} ${selectedElement.rotation.y * 180 / Math.PI} ${selectedElement.rotation.z * 180 / Math.PI}`;
                  feature.geometry.coordinates = selectedElement.userData.coordinates;
                });
              });

              setGeojsonDatas(geojsonDatasShadow);
            }
          }}
        >
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
              <Box width="100%" display="flex" gap={4} alignItems="center" mb="4">
                <Heading size="sm" width="120px">lightPreset: </Heading>
                <Select
                  onChange={onLightPresetChangeHandler}
                >
                  <option value="dawn">Dawn</option>
                  <option value="day">Day</option>
                  <option value="dusk">Dusk</option>
                  <option value="night">Night</option>
                </Select>
              </Box>
            </VStack>
          </Collapse>
        </Box>

        {
          selectedElement && (
            <Box
              borderBottom="1px solid #ccc"
            >
              <Heading
                size="sm"
                mb="4"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                Object:
                {selectedElement.name}
              </Heading>
              <VStack
                alignItems="flex-start"
                width="100%"
                mt={4}
                gap={4}
              >
                <Box width="100%" display="flex" flexDirection="column" gap={4} mb="4">
                  <Heading size="sm" width="120px">Center: </Heading>
                  <Text>{selectedElementShadow.coordinates.join(', ')}</Text>
                </Box>
                <Box width="100%" display="flex" flexDirection="column" gap={4} mb="4">
                  <Heading size="sm" width="120px">Coordinates: </Heading>
                  <Text>{selectedElementShadow.userData?.coordinates?.join(' ')}</Text>
                </Box>
                <Box width="100%" display="flex" flexDirection="column" gap={4} mb="4">
                  <Heading size="sm" width="120px">rotation: </Heading>
                  <HStack paddingLeft="16px">
                    <Heading size="sm">x: </Heading>
                    <Slider
                      min={-180}
                      max={180}
                      aria-label="slider-ex-1"
                      value={Math.floor(selectedElementShadow.rotation.x * 180 / Math.PI)}
                      onChange={(value) => {
                        if (value === selectedElementShadow.rotation.x) {
                          return;
                        }
                        selectedElement.setRotation(
                          { x: value },
                        );
                        setSelectedElementShadow(cloneDeep(selectedElement));
                      }}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                      <SliderMark
                        value={Math.floor(selectedElementShadow.rotation.x * 180 / Math.PI)}
                        textAlign="center"
                        bg="blue.500"
                        color="white"
                        mt="2"
                        ml="-5"
                        w="12"
                      >
                        {Math.floor(selectedElementShadow.rotation.x * 180 / Math.PI)}
                      </SliderMark>
                    </Slider>
                  </HStack>
                  <HStack paddingLeft="16px" paddingTop="8px">
                    <Heading size="sm">y: </Heading>
                    <Slider
                      min={-180}
                      max={180}
                      aria-label="slider-ex-1"
                      value={Math.floor(selectedElementShadow.rotation.y * 180 / Math.PI)}
                      onChange={(value) => {
                        if (value === selectedElementShadow.rotation.y) {
                          return;
                        }
                        selectedElement.setRotation(
                          { y: value },
                        );
                        setSelectedElementShadow(cloneDeep(selectedElement));
                      }}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                      <SliderMark
                        value={Math.floor(selectedElementShadow.rotation.y * 180 / Math.PI)}
                        textAlign="center"
                        bg="blue.500"
                        color="white"
                        mt="2"
                        ml="-5"
                        w="12"
                      >
                        {Math.floor(selectedElementShadow.rotation.y * 180 / Math.PI)}
                      </SliderMark>
                    </Slider>
                  </HStack>
                  <HStack paddingLeft="16px" paddingTop="8px">
                    <Heading size="sm">z: </Heading>
                    <Slider
                      min={-180}
                      max={180}
                      aria-label="slider-ex-1"
                      value={Math.floor(selectedElementShadow.rotation.z * 180 / Math.PI)}
                      onChange={(value) => {
                        if (value === selectedElementShadow.rotation.z) {
                          return;
                        }
                        selectedElement.setRotation(
                          { z: value },
                        );
                        setSelectedElementShadow(cloneDeep(selectedElement));
                      }}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                      <SliderMark
                        value={Math.floor(selectedElementShadow.rotation.z * 180 / Math.PI)}
                        textAlign="center"
                        bg="blue.500"
                        color="white"
                        mt="2"
                        ml="-5"
                        w="12"
                      >
                        {Math.floor(selectedElementShadow.rotation.z * 180 / Math.PI)}
                      </SliderMark>
                    </Slider>
                  </HStack>
                </Box>
              </VStack>
            </Box>
          )
        }

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

        <Box>
          <Button
            colorScheme="blue"
            disabled={!geojsonDatas?.length || !threeBoxRef.current}
            onClick={() => {
              const geojsonDatasShadow = cloneDeep(geojsonDatas);

              geojsonDatasShadow.forEach((source, index) => {
                source.features?.forEach((feature) => {
                  if (feature.properties.model !== 'yes') {
                    return;
                  }

                  const element = threeBoxRef.current.world.children.find(
                    (child) => child.name === feature.id,
                  );

                  if (!element) return;

                  feature.properties.rotation = `${element.rotation.x * 180 / Math.PI} ${element.rotation.y * 180 / Math.PI} ${element.rotation.z * 180 / Math.PI}`;
                  feature.geometry.coordinates = element.userData.coordinates;
                });

                const text = JSON.stringify(source ?? {}, null, 2);
                saveAs(new Blob([text], { type: 'text/plain;charset=utf-8' }), files?.[index]?.name ?? 'map.geojson');
              });
            }}
          >
            下载
          </Button>
          <Button
            onClick={zoomOut}
          >
            放大
          </Button>
          <Button
            onClick={saveToImage}
            marginLeft="8px"
          >
            下载成图片
          </Button>
        </Box>
      </Box>
    </Flex>
  );
}

export default App;
