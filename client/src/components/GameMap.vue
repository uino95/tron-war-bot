<template>
  <div id="chartdiv" />
</template>

<script>
import { create, Button, Sprite, useTheme } from "@amcharts/amcharts4/core";
import {
  MapChart,
  projections,
  MapPolygonSeries,
  ZoomControl
} from "@amcharts/amcharts4/maps";
import am4themes_spiritedaway from "@amcharts/amcharts4/themes/spiritedaway.js";
import am4geodata_worldLow from "../assets/worldLow.js";
import { db } from "../plugins/firebase";
import { hslToHex } from "../utils/ColorUtils";

useTheme(am4themes_spiritedaway);
export default {
  data: () => ({
    polygonSeries: null,
    countriesData: null,
    chart: null,
    colorsDefault: [],
    colors: [
      "#f44336",
      "#E91E63",
      "#9C27B0",
      "#3F51B5",
      "#2196F3",
      "#03A9F4",
      "#00BCD4",
      "#009688",
      "#4CAF50",
      "#8BC34A",
      "#FFEB3B",
      "#FFC107",
      "#FF9800",
      "#FF5722",
      "#9E9E9E",
      "#607D8B"
    ],
    defaultColor: 12
  }),

  mounted() {
    // subscribe to chanhges
    db.ref("public/countriesMap").on("child_changed", snapshot => {
      let data = snapshot.val();
      data["id"] = this.universalMap(data.idx, "charId");
      data["percentagesOfDeath"] =
        parseFloat((data.deaths / data.population).toFixed(3)) * 100;
      data["color"] = hslToHex(
        this.defaultColor,
        100,
        100 - (data.percentagesOfDeath) 
      );
      this.polygonSeries.data[data.idx] = data;
      this.polygonSeries.invalidateData();
    });

    db.ref("public/countriesMap").once("value", snapshot => {
      let data = snapshot.val();
      data.map((el, index) => {
        el["id"] = this.universalMap(index, "charId");
        el["percentagesOfDeath"] =
          parseFloat((el.deaths / el.population).toFixed(3)) * 100;
        el["color"] = hslToHex(
          this.defaultColor,
          100,
          100 - (el.percentagesOfDeath) 
        );
      });
      // // assign a color to a particular country
      // this.colorsDefault[90] = "#009688"
      // data.map(el => {
      //   el['controllerCohesion'] = (data[el['occupiedBy']]['cohesion']);
      //   el['color'] = this.colorsDefault[el['occupiedBy']];
      //   el['occupiedBy'] = this.universalMap(el['occupiedBy'])
      // })
      this.countriesData = data;
      this.loadChart();
    });
  },

  methods: {
    clicked(ev) {
      this.$store.commit(
        "setSelectedCountry",
        this.universalMap(ev.target.dataItem.dataContext.occupiedBy, "numberId")
      );
    },

    loadChart() {
      /* Create map instance */
      var chart = create("chartdiv", MapChart);

      /* Set map definition */
      chart.geodata = am4geodata_worldLow;

      /* Set projection */
      chart.projection = new projections.Miller();

      //chart.background.fill = "#37474f";
      // chart.background.fill = "#B3E5FC";
      chart.background.fill = "#455a64";
      chart.background.fillOpacity = 1;

      /* Create map polygon series */
      var polygonSeries = chart.series.push(new MapPolygonSeries());

      /* Make map load polygon (like country names) data from GeoJSON */
      polygonSeries.useGeodata = true;

      polygonSeries.data = this.countriesData;
      this.polygonSeries = polygonSeries;
      /* Configure series */
      var polygonTemplate = polygonSeries.mapPolygons.template;

      polygonSeries.tooltip.getFillFromObject = false;
      polygonSeries.tooltip.background.fill = chart.colors.getIndex(4);
      polygonTemplate.applyOnClones = true;
      polygonTemplate.togglable = true;

      polygonTemplate.tooltipText =
        "[bold]{name}[/] ({percentagesOfDeath} %) \n Deaths:[bold]{deaths}[/]\n Infected: [bold]{infected}[/]\n Population: [bold]{population}[/]";
      polygonTemplate.nonScalingStroke = true;
      polygonTemplate.strokeOpacity = 0.5;

      polygonTemplate.propertyFields.fill = "color";

      polygonTemplate.events.on("hit", this.clicked);

      /* Create selected and hover states and set alternative fill color */
      // var ss = polygonTemplate.states.create("active");
      // ss.properties.fill = chart.colors.getIndex(2);

      var hs = polygonTemplate.states.create("hover");
      hs.properties.fill = chart.colors.getIndex(4);

      // polygonSeries.events.on("over", over);
      // polygonSeries.events.on("out", out);

      // function over(ev) {
      //   let hoveredState
      //   ev.target.mapPolygons.each(function (polygon) {
      //     if (polygon.isHover) {
      //       hoveredState = polygon.dataItem.dataContext.occupiedBy
      //       polygon.setState("highlight");
      //     }
      //   });
      //   ev.target.mapPolygons.each(function (polygon) {
      //     if (polygon.dataItem.dataContext.occupiedBy == hoveredState) {
      //       polygon.setState("highlight");
      //     }
      //   });
      // }

      // function out(ev) {
      //   ev.target.mapPolygons.each(function (polygon) {
      //     polygon.setState("default");
      //   });
      // }

      // Zoom control
      chart.zoomControl = new ZoomControl();
      chart.chartContainer.wheelable = false;

      var homeButton = new Button();
      homeButton.events.on("hit", function() {
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

      this.$root.$emit("map_loaded", true);
    }
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }
};
</script>


<style scoped>
#chartdiv {
  width: 100%;
  height: 600px;
}
</style>