<template>
  <div id="chartdiv" />
</template>

<script>
  import {
    create,
    Button,
    Sprite,
    useTheme,
    FontWeight
  } from "@amcharts/amcharts4/core";
  import {
    MapChart,
    projections,
    MapPolygonSeries,
    SmallMap,
    ZoomControl,
  } from "@amcharts/amcharts4/maps";
  import am4themes_spiritedaway from "@amcharts/amcharts4/themes/spiritedaway.js";
  import am4geodata_worldLow from "../assets/worldLow.js"
  import {
    db
  } from "../plugins/firebase"

  useTheme(am4themes_spiritedaway);
  export default {
    data: () => ({
      width: 0,
      height: 0,
      lastSelected: null,
      polygonSeries: null,
      countriesData: null,
      chart: null,
      colorsgg: ["#eceff1", "#cfd8dc", "#b0bec5", "#90a4ae", "#78909c", "#607d8b", "#546e7a", "#455a64", "#37474f",
        "#263238", "#fafafa", "#f5f5f5", "#eeeeee", "#e0e0e0", "#bdbdbd", "#9e9e9e", "#757575", "#616161",
        "#424242", "#212121"
      ],
      colorsg: ["#e8f5e9", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a", "#4caf50", "#43a047", "#388e3c", "#2e7d32",
        "#1b5e20", "#b9f6ca", "#69f0ae", "#00e676", "#00c853", "#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac",
        "#26a69a", "#009688",
        "#00897b", "#00796b", "#00695c", "#004d40", "#a7ffeb", "#64ffda", "#1de9b6", "#00bfa5"
      ],
      colorsY: ["#fffde7", "#fff9c4", "#fff59d", "#fff176", "#ffee58", "#ffeb3b", "#fdd835", "#fbc02d", "#f9a825",
        "#f57f17", "#ffff8d", "#ffff00", "#ffea00", "#ffd600", "#f9fbe7", "#f0f4c3", "#e6ee9c", "#dce775",
        "#d4e157", "#cddc39",
        "#c0ca33", "#afb42b", "#9e9d24", "#827717", "#f4ff81", "#eeff41", "#c6ff00", "#aeea00"
      ],
      colorsR: ["#fbe9e7", "#ffccbc", "#ffab91", "#ff8a65", "#ff7043", "#ff5722", "#f4511e", "#e64a19", "#d84315",
        "#bf360c", "#ff9e80", "#ff6e40", "#ff3d00", "#dd2c00", "#fff3e0", "#ffe0b2", "#ffcc80", "#ffb74d",
        "#ffa726", "#ff9800", "#fb8c00",
        "#f57c00", "#ef6c00", "#e65100", "#ffd180", "#ffab40", "#ff9100", "#ff6d00"
      ],
      colorsBlue: ["#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5", "#1976d2",
        "#1565c0", "#0d47a1", "#82b1ff", "#448aff", "#2979ff", "#2962ff]", "#e1f5fe", "#b3e5fc", "#81d4fa",
        "#4fc3f7", "#29b6f6", "#03a9f4",
        "#039be5", "#0288d1", "#0277bd", "#01579b", "#80d8ff", "#40c4ff", "#00b0ff", "#0091ea"
      ],
      colors1: ["#58b5e1", "#812050", "#05cfc0", "#374475", "#99c66d", "#7244b9", "#4cf185", "#eb1138", "#158a2c",
        "#ee88d9", "#385a3a", "#f1bb99", "#744822", "#bcaff9", "#c20da6", "#f1c039", "#6108e8", "#fe8f06",
        "#8a1b07", "#ff8889"
      ],
      colors2: ["#01c472", "#7c225f", "#ace1b7", "#432ab7", "#c0e15c", "#c00018", "#2cf52b", "#c052e4", "#056e12",
        "#ff6b97", "#4bd6fd", "#294d46", "#a8b8e6", "#304f9b", "#c697f4", "#683c00", "#dbb18b", "#42908c",
        "#ff743c", "#f8d147"
      ],

      colors4: ["#0D3BE2", "#11FFE4", "#3CE73C", "#5E3000", "#F408F4", "#FFF31B", "#E60000", "#E3E7E5", "#003F0C",
        "#000000", "#0FC0FF", "#FFC7F5", "#F98821", "#570098", "#E16A48"
      ],

      colors5: ["#ff1744", "#ff3d00", "#ffc400", "#ffea00", "#c6ff00", "#76ff03", "#00e676", "#1de9b6", "#00e5ff",
        "#00b0ff", "#2979ff", "#3d5afe", "#651fff", "#ff9100", "#d500f9", "#f50057"
      ],

      colors: ["#f44336", "#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
        "#8BC34A", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#9E9E9E", "#607D8B"
      ]

    }),
    mounted() {
      db.ref('public').on('child_changed', (snapshot) => {
        let j = this.colors.length
        let data = snapshot.val();
        if (data.length == 241) {
          // console.log(data)
          data.map((el, index) => {
            // var h = Math.floor(Math.floor((index / 10)) * (360 / 25)) / 360
            // var s = (20 + (index % 10) * (80 / 10)) / 100
            // var l = 0.2 + el['cohesion'] * 0.7
            // el['color'] = this.rgbToHex(this.hslToRgb(h, s, l))
            el['color'] = this.colors[j]
            el['id'] = this.universalMap(index, 'charId')
            j--;
            if (j < 0) {
              j = this.colors.length - 1
            }
          })
          data.map(el => {
            el['controllerCohesion'] = data[el['occupiedBy']]['cohesion'];
            el['color'] = data[el['occupiedBy']]['color'];
            el['occupiedBy'] = this.universalMap(el['occupiedBy'])
          })
          this.polygonSeries.data = data
          //this.polygonSeries.invalidateData()
        }

        // db.ref('public/countriesMap').orderByKey().equalTo(id).once('value', (snapshotChild) => {
        //   let id1 = Object.keys(snapshotChild.val())[0]
        //   var result = this.hexToHsl(this.polygonSeries.data[id1]['color'])
        //   var h = result[0] 
        //   var s = result[1] 
        //   var l = 0.2 + snapshotChild.val()[id1]['cohesion'] * 0.7
        //   this.polygonSeries.data[id]['color'] = this.rgbToHex(this.hslToRgb(h, s, l))
        //   //this.polygonSeries.data[id]['color'] = '#FFFFFF'
        //   this.polygonSeries.invalidateData()
        //   //this.chart.smallMap.series.push(this.polygonSeries);
        // })
      })




      db.ref('public/countriesMap').once('value', (snapshot) => {
        let j = this.colors.length
        let data = snapshot.val();
        data.map((el, index) => {
          // var h = Math.floor(Math.floor((index / 10)) * (360 / 25)) / 360
          // var s = (20 + (index % 10) * (80 / 10)) / 100
          // var l = 0.2 + el['cohesion'] * 0.7
          //el['color'] = this.rgbToHex(this.hslToRgb(h, s, l))
          el['color'] = this.colors[j]
          el['id'] = this.universalMap(index, 'charId')
          j--;
          if (j < 0) {
            j = this.colors.length - 1
          }
        })
        data.map(el => {
          el['controllerCohesion'] = (data[el['occupiedBy']]['cohesion'] * 100).toFixed(2);
          el['color'] = data[el['occupiedBy']]['color'];
          el['occupiedBy'] = this.universalMap(el['occupiedBy'])
          el['cohesion'] = (el['cohesion'] * 100).toFixed(2);
        })
        this.countriesData = data
        //this.polygonSeries.invalidateData()
        this.loadChart();
      })
    },
    methods: {
      clicked(ev) {
        this.$store.commit('setSelectedCountry', this.universalMap(ev.target.dataItem.dataContext.occupiedBy,
          'numberId'))
      },

      componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      },

      rgbToHex(color) {
        return "#" + this.componentToHex(color[0]) + this.componentToHex(color[1]) + this.componentToHex(color[
          2]);
      },

      hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      },

      hexToHsl(hex) {
        var result = this.hexToRgb(hex);
        var r = result.r;
        var g = result.g;
        var b = result.b
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b),
          min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
          h = s = 0;
        } else {
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }

          h /= 6;
        }

        return [((h * 100 + 0.5) | 0), ((s * 100 + 0.5) | 0), ((l * 100 + 0.5) | 0)];
      },


      hslToRgb(h, s, l) {
        var r, g, b;

        if (s == 0) {
          r = g = b = l; // achromatic
        } else {
          var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
          }

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
      },
      loadChart() {
        /* Create map instance */
        var chart = create("chartdiv", MapChart);

        /* Set map definition */
        chart.geodata = am4geodata_worldLow;

        /* Set projection */
        chart.projection = new projections.Miller();

        //chart.background.fill = "#37474f";
        chart.background.fill = "#B3E5FC";
        chart.background.fillOpacity = 1;

        /* Create map polygon series */
        var polygonSeries = chart.series.push(new MapPolygonSeries());

        /* Make map load polygon (like country names) data from GeoJSON */
        polygonSeries.useGeodata = true;

        polygonSeries.data = this.countriesData
        this.polygonSeries = polygonSeries
        this.polygonSeries = polygonSeries

        /* Configure series */
        var polygonTemplate = polygonSeries.mapPolygons.template;

        polygonSeries.tooltip.getFillFromObject = false;
        polygonSeries.tooltip.background.fill = chart.colors.getIndex(4);
        polygonTemplate.applyOnClones = true;
        polygonTemplate.togglable = true;

        polygonTemplate.tooltipText = "[bold]{name}[/] ({cohesion} %) \nOccupied by: [bold]{occupiedBy}[/] ({controllerCohesion} %)";
        polygonTemplate.nonScalingStroke = true;
        polygonTemplate.strokeOpacity = 0.5;

        polygonTemplate.propertyFields.fill = "color";


        polygonTemplate.events.on("hit", this.clicked)

        /* Create selected and hover states and set alternative fill color */
        var ss = polygonTemplate.states.create("active");
        ss.properties.fill = chart.colors.getIndex(2);

        var hs = polygonTemplate.states.create("highlight");
        hs.properties.fill = chart.colors.getIndex(4);

        polygonSeries.events.on("over", over);
        polygonSeries.events.on("out", out);

        function over(ev) {
          let hoveredState
          ev.target.mapPolygons.each(function (polygon) {
            if (polygon.isHover) {
              hoveredState = polygon.dataItem.dataContext.occupiedBy
              polygon.setState("highlight");
            }
          });
          ev.target.mapPolygons.each(function (polygon) {
            if (polygon.dataItem.dataContext.occupiedBy == hoveredState) {
              polygon.setState("highlight");
            }
          });
        }

        function out(ev) {
          ev.target.mapPolygons.each(function (polygon) {
            polygon.setState("default");
          });
        }

        // Hide Antarctica and all the states not present in the territories from michael API
        //polygonSeries.exclude = ["AQ"];


        // Small map
        chart.smallMap = new SmallMap();
        // Re-position to top right (it defaults to bottom left)
        chart.smallMap.align = "right";
        chart.smallMap.valign = "top";
        chart.smallMap.series.push(polygonSeries);

        // Zoom control
        chart.zoomControl = new ZoomControl();
        chart.chartContainer.wheelable = false;

        var homeButton = new Button();
        homeButton.events.on("hit", function () {
          chart.goHome();
        });

        homeButton.icon = new Sprite();
        homeButton.padding(7, 5, 7, 5);
        homeButton.width = 30;
        homeButton.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
        homeButton.marginBottom = 10;
        homeButton.parent = chart.zoomControl;
        homeButton.insertBefore(chart.zoomControl.plusButton);

        this.chart = chart;
      }

    },

    beforeDestroy() {
      if (this.chart) {
        this.chart.dispose();
      }
    }

  }
</script>


<style scoped>
  #chartdiv {
    width: 100%;
    height: 600px;
  }
</style>