const getJsonData = () => {
  const jsonData = {
    version: 8,
    name: 'L1',
    owner: '九思信息技术',
    center: [108.94844344171187, 34.21781929955912],
    zooms: [18, 20],
    zoom: 19.7,
    pitch: 0,
    light: {
      color: 'white',
      position: [3, 150, 30],
    },
    glyphs: '/fonts/{fontstack}/{range}.pbf',
    // sprite: "https://cdn.mall-to.com/sprites/s3?v=1",
    sources: {
      floorplan: {
        type: 'geojson',
        data: '/map/datang/f1.geojson',
      },
    },
    layers: [
      {
        id: 'ground',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'ground'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#ffffff'],
        },
      },
      {
        id: 'way',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'way'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#ffffff'],
        },
      },
      {
        id: 'greenbelt',
        type: 'fill-extrusion',
        source: 'floorplan',
        filter: ['all', ['==', 'style_type', 'greenbelt']],
        paint: {
          'fill-extrusion-color': ['case', ['has', 'fill_extrusion_color'], ['get', 'fill_extrusion_color'], '#daead8'],
          'fill-extrusion-height': ['case', ['has', 'fill_extrusion_height'], ['to-number', ['get', 'fill_extrusion_height']], 0.5],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'parking-area',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'parking-area'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#e6eaef'],
        },
      },
      {
        id: 'parking-space',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'parking-space'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#e6eaef'],
        },
      },
      {
        id: 'passageway',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'passageway'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#fffff5'],
        },
      },
      {
        id: 'gallery',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'gallery'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#fffff5'],
        },
      },
      {
        id: 'toilet',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'toilet'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#e0fcd2'],
        },
      },
      {
        id: 'escalator',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'escalator'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#ffffff'],
        },
      },
      {
        id: 'elevator',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'elevator'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#ededed'],
        },
      },
      {
        id: 'stair',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'stair'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#ffefd9'],
        },
      },
      {
        id: 'ips_stair',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'ips_stair'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], 'rgb(255,221,213)'],
        },
      },
      {
        id: 'room',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'room'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], '#eef5fe'],
        },
      },
      {
        id: 'wall',
        type: 'fill-extrusion',
        source: 'floorplan',
        filter: ['==', 'style_type', 'wall'],
        paint: {
          'fill-extrusion-color': ['case', ['has', 'fill_extrusion_color'], ['get', 'fill_extrusion_color'], '#FFFFFF'],
          'fill-extrusion-height': ['case', ['has', 'fill_extrusion_height'], ['to-number', ['get', 'fill_extrusion_height']], 3],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'opacity-wall',
        type: 'fill-extrusion',
        source: 'floorplan',
        filter: ['==', 'style_type', 'opacity-wall'],
        paint: {
          'fill-extrusion-color': ['case', ['has', 'fill_extrusion_color'], ['get', 'fill_extrusion_color'], '#FFFFFF'],
          'fill-extrusion-height': ['case', ['has', 'fill_extrusion_height'], ['to-number', ['get', 'fill_extrusion_height']], 3],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.7,
        },
      },
      {
        id: 'furniture',
        type: 'fill-extrusion',
        source: 'floorplan',
        filter: ['==', 'style_type', 'furniture'],
        paint: {
          'fill-extrusion-color': ['case', ['has', 'fill_extrusion_color'], ['get', 'fill_extrusion_color'], '#999999'],
          'fill-extrusion-height': ['case', ['has', 'fill_extrusion_height'], ['to-number', ['get', 'fill_extrusion_height']], 1.5],
          'fill-extrusion-base': ['case', ['has', 'fill_extrusion_base'], ['to-number', ['get', 'fill_extrusion_base']], 0.5],
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'booth',
        type: 'fill-extrusion',
        source: 'floorplan',
        filter: ['==', 'style_type', 'booth'],
        paint: {
          'fill-extrusion-color': ['case', ['has', 'fill_extrusion_color'], ['get', 'fill_extrusion_color'], '#999999'],
          'fill-extrusion-height': ['case', ['has', 'fill_extrusion_height'], ['to-number', ['get', 'fill_extrusion_height']], 1.5],
          'fill-extrusion-base': ['case', ['has', 'fill_extrusion_base'], ['to-number', ['get', 'fill_extrusion_base']], 0.5],
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'line',
        type: 'line',
        source: 'floorplan',
        filter: ['==', 'style_type', 'line'],
        paint: {
          'line-color': ['case', ['has', 'line_color'], ['get', 'line_color'], '#aaaaaa'],
          'line-width': 1,
          'line-opacity': 1,
        },
      },
      {
        id: 'table',
        type: 'fill-extrusion',
        source: 'floorplan',
        filter: ['==', 'style_type', 'table'],
        paint: {
          'fill-extrusion-color': ['case', ['has', 'fill_extrusion_color'], ['get', 'fill_extrusion_color'], '#FF0000'],
          'fill-extrusion-height': ['case', ['has', 'fill_extrusion_height'], ['to-number', ['get', 'fill_extrusion_height']], 3],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'house',
        type: 'fill-extrusion',
        source: 'floorplan',
        filter: ['all', ['==', 'style_type', 'house']],
        paint: {
          'fill-extrusion-color': ['case', ['has', 'fill_extrusion_color'], ['get', 'fill_extrusion_color'], '#FAFCFF'],
          'fill-extrusion-height': ['case', ['has', 'fill_extrusion_height'], ['to-number', ['get', 'fill_extrusion_height']], 3],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'opacity-house',
        type: 'fill-extrusion',
        source: 'floorplan',
        filter: ['all', ['==', 'style_type', 'opacity-house']],
        paint: {
          'fill-extrusion-color': ['case', ['has', 'fill_extrusion_color'], ['get', 'fill_extrusion_color'], '#FAFCFF'],
          'fill-extrusion-height': ['case', ['has', 'fill_extrusion_height'], ['to-number', ['get', 'fill_extrusion_height']], 3],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.3,
        },
      },
      {
        id: 'building',
        type: 'fill-extrusion',
        source: 'floorplan',
        filter: ['all', ['==', 'style_type', 'building']],
        paint: {
          'fill-extrusion-color': ['case', ['has', 'fill_extrusion_color'], ['get', 'fill_extrusion_color'], '#FAFCFF'],
          'fill-extrusion-height': ['case', ['has', 'fill_extrusion_height'], ['to-number', ['get', 'fill_extrusion_height']], 3],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'icon',
        type: 'symbol',
        source: 'floorplan',
        filter: ['==', 'plot_name', 'true'],
        layout: {
          'icon-image': ['get', 'icon_sails'],
          'icon-size': 0.5,
          'text-field': ['get', 'name'],
          'text-size': ['case', ['has', 'text-size'], ['to-number', ['get', 'text-size']], 10],
          'text-offset': [0, 1.35],
        },
        paint: {
          'text-color': ['case', ['has', 'text-color'], ['get', 'text-color'], '#000000'],
        },
      },
      {
        id: 'label',
        type: 'symbol',
        source: 'floorplan',
        filter: ['==', 'style_type', 'label'],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            0, 0,
            17, 3,
            18, 4,
            18.5, 5,
            19, 6,
            19.5, 8,
            20, 10,
            21.3, 14,
            21.5, 18,
            21.8, 22,
            22, 26,
          ],
          'text-offset': [0, 0],
        },
        paint: {
          'text-color': ['case', ['has', 'text-color'], ['get', 'text-color'], '#000000'],
        },
      },
      {
        id: 'polyline',
        type: 'line',
        source: 'floorplan',
        filter: ['==', 'style_type', 'polyline'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': ['case', ['has', 'line_color'], ['get', 'line_color'], '#888'],
          'line-width': 1,
        },
      },
      {
        id: 'customPoint',
        type: 'fill',
        source: 'floorplan',
        filter: ['==', 'style_type', 'customPoint'],
        paint: {
          'fill-color': ['case', ['has', 'fill_color'], ['get', 'fill_color'], 'rgb(235,10,10)'],
        },
      },
      {
        id: 'lineString',
        type: 'line',
        source: 'floorplan',
        filter: ['==', 'model', 'yes'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': ['case', ['has', 'line_color'], ['get', 'line_color'], '#880'],
          'line-width': 1,
        },
      },
    ],
  };

  return jsonData;
};

export default getJsonData;
