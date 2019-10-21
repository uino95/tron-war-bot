<template>
  <div id="chartdiv" />
</template>

<script>
  import {
    create,
    Button,
    Sprite,
    useTheme
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
      colorsDefault: [],
      colors: ["#f44336", "#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
        "#8BC34A", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#9E9E9E", "#607D8B"
      ]

    }),
    mounted() {
      db.ref('public').on('child_changed', (snapshot) => {
        let data = snapshot.val();
        if (data.length == 241) {
          // console.log(data)
          data.map((el, index) => {
            // var h = Math.floor(Math.floor((index / 10)) * (360 / 25)) / 360
            // var s = (20 + (index % 10) * (80 / 10)) / 100
            // var l = 0.2 + el['cohesion'] * 0.7
            // el['color'] = this.rgbToHex(this.hslToRgb(h, s, l))
            el['id'] = this.universalMap(index, 'charId')
            el['cohesion'] = (el['cohesion'] * 100).toFixed(2);
          })
          data.map(el => {
            el['controllerCohesion'] = (data[el['occupiedBy']]['cohesion']);
            el['color'] = this.colorsDefault[el['occupiedBy']];
            el['occupiedBy'] = this.universalMap(el['occupiedBy'])
          })
          this.polygonSeries.data = data
          //this.polygonSeries.invalidateData()
        }
      })

      db.ref('public/countriesMap').once('value', (snapshot) => {
        let j = this.colors.length
        let data = snapshot.val();
        data.map((el, index) => {
          // var h = Math.floor(Math.floor((index / 10)) * (360 / 25)) / 360
          // var s = (20 + (index % 10) * (80 / 10)) / 100
          // var l = 0.2 + el['cohesion'] * 0.7
          //el['color'] = this.rgbToHex(this.hslToRgb(h, s, l))
          this.colorsDefault.push(this.colors[j])
          el['id'] = this.universalMap(index, 'charId')
          el['cohesion'] = (el['cohesion'] * 100).toFixed(2);
          j--;
          if (j < 0) {
            j = this.colors.length - 1
          }
        })
        data.map(el => {
          el['controllerCohesion'] = (data[el['occupiedBy']]['cohesion']);
          el['color'] = this.colorsDefault[el['occupiedBy']];
          el['occupiedBy'] = this.universalMap(el['occupiedBy'])
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
        // chart.smallMap = new SmallMap();
        // // Re-position to top right (it defaults to bottom left)
        // chart.smallMap.align = "right";
        // chart.smallMap.valign = "top";
        // chart.smallMap.series.push(polygonSeries);

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

        this.$root.$emit('map_loaded', true);
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