export const getJsonData = () => {
  const jsonData = {
    version: 8,
    name: "L1",
    owner: "九思信息技术",
    center: [108.94844344171187, 34.21781929955912],
    zooms: [18, 20],
    zoom: 19.7,
    pitch: 0,
    light: {
      color: "white",
      position: [3, 150, 30],
    },
    glyphs: "/fonts/{fontstack}/{range}.pbf",
    // sprite: "https://cdn.mall-to.com/sprites/s3?v=1",
    sources: {
      floorplan: {
        type: "geojson",
        data: "/map/datang/f1.geojson",
      },
    },
    layers: [
      {
        id: "way",
        type: "fill",
        source: "floorplan",
        filter: ["==", "style_type", "way"],
        paint: {
          "fill-color": ["case", ["has", "fill_color"], ["get", "fill_color"], "#fff"],
        },
      },
      {
        id: "greenbelt",
        type: "fill-extrusion",
        source: "floorplan",
        filter: ["all", ["==", "style_type", "greenbelt"]],
        paint: {
          "fill-extrusion-color": ["case", ["has", "fill_extrusion_color"], ["get", "fill_extrusion_color"], "#8F0"],
          "fill-extrusion-height": ["case", ["has", "fill_extrusion_height"], ["to-number", ["get", "fill_extrusion_height"]], 0.5],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 1,
        },
      },
      {
        id: "parking-area",
        type: "fill",
        source: "floorplan",
        filter: ["==", "style_type", "parking-area"],
        paint: {
          "fill-color": ["case", ["has", "fill_color"], ["get", "fill_color"], "#e7e8ee"],
        },
      },
      {
        id: "room",
        type: "fill",
        source: "floorplan",
        filter: ["==", "style_type", "room"],
        paint: {
          "fill-color": ["case", ["has", "fill_color"], ["get", "fill_color"], "rgb(165,212,249)"],
        },
      },
      {
        id: "passageway",
        type: "fill",
        source: "floorplan",
        filter: ["==", "style_type", "passageway"],
        paint: {
          "fill-color": ["case", ["has", "fill_color"], ["get", "fill_color"], "rgb(255,255,255)"],
        },
      },
      {
        id: "toilet",
        type: "fill",
        source: "floorplan",
        filter: ["==", "style_type", "toilet"],
        paint: {
          "fill-color": ["case", ["has", "fill_color"], ["get", "fill_color"], "rgb(235,207,163)"],
        },
      },
      {
        id: "escalator",
        type: "fill",
        source: "floorplan",
        filter: ["==", "style_type", "escalator"],
        paint: {
          "fill-color": ["case", ["has", "fill_color"], ["get", "fill_color"], "rgb(255,221,213)"],
        },
      },
      {
        id: "elevator",
        type: "fill",
        source: "floorplan",
        filter: ["==", "style_type", "elevator"],
        paint: {
          "fill-color": ["case", ["has", "fill_color"], ["get", "fill_color"], "rgb(255,221,213)"],
        },
      },
      {
        id: "stair",
        type: "fill",
        source: "floorplan",
        filter: ["==", "style_type", "stair"],
        paint: {
          "fill-color": ["case", ["has", "fill_color"], ["get", "fill_color"], "rgb(255,221,213)"],
        },
      },
      {
        id: "ips_stair",
        type: "fill",
        source: "floorplan",
        filter: ["==", "style_type", "ips_stair"],
        paint: {
          "fill-color": ["case", ["has", "fill_color"], ["get", "fill_color"], "rgb(255,221,213)"],
        },
      },
      {
        id: "wall",
        type: "fill-extrusion",
        source: "floorplan",
        filter: ["==", "style_type", "wall"],
        paint: {
          "fill-extrusion-color": ["case", ["has", "fill_extrusion_color"], ["get", "fill_extrusion_color"], "#FFFFFF"],
          "fill-extrusion-height": ["case", ["has", "fill_extrusion_height"], ["to-number", ["get", "fill_extrusion_height"]], 3],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 1,
        },
      },
      {
        id: "line",
        type: "line",
        source: "floorplan",
        filter: ["==", "style_type", "line"],
        paint: {
          "line-color": ["case", ["has", "line_color"], ["get", "line_color"], "#aaaaaa"],
          "line-width": 1,
          "line-opacity": 1,
        },
      },
      {
        id: "table",
        type: "fill-extrusion",
        source: "floorplan",
        filter: ["==", "style_type", "table"],
        paint: {
          "fill-extrusion-color": ["case", ["has", "fill_extrusion_color"], ["get", "fill_extrusion_color"], "#FFFFFF"],
          "fill-extrusion-height": ["case", ["has", "fill_extrusion_height"], ["to-number", ["get", "fill_extrusion_height"]], 3],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 1,
        },
      },
      {
        id: "house",
        type: "fill-extrusion",
        source: "floorplan",
        filter: ["all", ["==", "style_type", "house"]],
        paint: {
          "fill-extrusion-color": ["case", ["has", "fill_extrusion_color"], ["get", "fill_extrusion_color"], "#FFFFFF"],
          "fill-extrusion-height": ["case", ["has", "fill_extrusion_height"], ["to-number", ["get", "fill_extrusion_height"]], 3],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.8,
        },
      },
      {
        id: "icon",
        type: "symbol",
        source: "floorplan",
        filter: ["==", "plot_name", "true"],
        layout: {
          "icon-image": ["get", "icon_sails"],
          "icon-size": 0.5,
          "text-field": ["get", "name"],
          "text-size": 10,
          "text-offset": [0, 1.25],
        },
        paint: {
          "text-color": ["case", ["has", "line_color"], ["get", "line_color"], "#000000"],
        },
      },
      {
        id: "polyline",
        type: "line",
        source: "floorplan",
        filter: ["==", "style_type", "polyline"],
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ["case", ["has", "line_color"], ["get", "line_color"], "#888"],
          "line-width": 1,
        },
      },
      {
        id: "customPoint",
        type: "fill",
        source: "floorplan",
        filter: ["==", "style_type", "customPoint"],
        paint: {
          "fill-color": ["case", ["has", "fill_color"], ["get", "fill_color"], "rgb(235,10,10)"],
        },
      },
    ],
  };

  return jsonData;
};