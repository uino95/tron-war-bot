<template>

    <div  id="chartdiv"></div>

</template>

<script>
    import * as am4core from "@amcharts/amcharts4/core";
    import * as am4maps from "@amcharts/amcharts4/maps";
    import am4themes_spiritedaway from "@amcharts/amcharts4/themes/spiritedaway.js";
    import am4geodata_worldLow from "../assets/worldLow.js"
    import {db} from "../plugins/firebase"
    //import countries from "../assets/countries.js"

    am4core.useTheme(am4themes_spiritedaway);
    let _this
    export default {
        props: {
            projects: Array,
            name: String
        },
        data: () => ({
            width: 0,
            height: 0,
            lastSelected: null,
            polygonSeries : null,
            loaded: false,
            countriesRef: [],
            countries: []
        }),

        firebase: {
            countries: db.ref('countries').once('value').then((snapshot) => {
                if(_this.polygonSeries ){
                    _this.polygonSeries.data = snapshot.val()
                    _this.polygonSeries.invalidateData()
                } 
            }),
            cuntriesRef: db.ref('countries')
        },
        beforeMount(){
            _this = this
        },
          mounted() {
            /* Create map instance */
                var chart = am4core.create("chartdiv", am4maps.MapChart);

                /* Set map definition */
                chart.geodata = am4geodata_worldLow;

                /* Set projection */
                chart.projection = new am4maps.projections.Miller();

                chart.background.fill = "#37474f";
                chart.background.fillOpacity = 1;

                /* Create map polygon series */
                var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

                /* Make map load polygon (like country names) data from GeoJSON */
                polygonSeries.useGeodata = true;

                //polygonSeries.data = this.countriesRef;
                this.polygonSeries = polygonSeries

                /* Configure series */
                var polygonTemplate = polygonSeries.mapPolygons.template;
                
                polygonSeries.tooltip.getFillFromObject = false;
                polygonSeries.tooltip.background.fill = chart.colors.getIndex(4);
                polygonTemplate.applyOnClones = true;
                polygonTemplate.togglable = true;
                polygonTemplate.tooltipText = "'{name}' controlled by '{controlledBy}'";
                
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
                  ev.target.mapPolygons.each(function(polygon) {
                    if(polygon.isHover){
                        hoveredState = polygon.dataItem.dataContext.controlledBy
                        polygon.setState("highlight");
                    } 
                  });
                  ev.target.mapPolygons.each(function(polygon) {
                    if(polygon.dataItem.dataContext.controlledBy == hoveredState){
                        polygon.setState("highlight");
                    } 
                  });
                }

                function out(ev) {
                  ev.target.mapPolygons.each(function(polygon) {
                    polygon.setState("default");
                  });
                }

                // Hide Antarctica and all the states not present in the territories from michael API
                //polygonSeries.exclude = ["AQ"];


                // Small map
                chart.smallMap = new am4maps.SmallMap();
                // Re-position to top right (it defaults to bottom left)
                chart.smallMap.align = "right";
                chart.smallMap.valign = "top";
                chart.smallMap.series.push(polygonSeries);

                // Zoom control
                chart.zoomControl = new am4maps.ZoomControl();
                chart.chartContainer.wheelable = false;

                var homeButton = new am4core.Button();
                homeButton.events.on("hit", function () {
                    chart.goHome();
                });

                homeButton.icon = new am4core.Sprite();
                homeButton.padding(7, 5, 7, 5);
                homeButton.width = 30;
                homeButton.icon.path = "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
                homeButton.marginBottom = 10;
                homeButton.parent = chart.zoomControl;
                homeButton.insertBefore(chart.zoomControl.plusButton);

            this.chart = chart;

        },
        methods: {
            clicked(ev){
                this.$emit('select',ev.target.dataItem.dataContext.name)
                
                // this is to update the data array and change color or stuff like that or you can just replace the data array with a brand ne
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