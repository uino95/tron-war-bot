<template>

    <div  id="chartdiv"></div>

</template>

<script>
    import * as am4core from "@amcharts/amcharts4/core";
    import * as am4maps from "@amcharts/amcharts4/maps";
    import am4themes_spiritedaway from "@amcharts/amcharts4/themes/spiritedaway.js";
    import am4geodata_worldLow from "../assets/worldLow.js"
    import {db} from "../plugins/firebase"

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
            countries: [],
            colorsGray : ["#eceff1","#cfd8dc","#b0bec5","#90a4ae","#78909c","#607d8b","#546e7a","#455a64","#37474f","#263238","#fafafa","#f5f5f5","#eeeeee","#e0e0e0","#bdbdbd","#9e9e9e","#757575","#616161","#424242","#212121"],
            colorsGreen : ["#e8f5e9","#c8e6c9","#a5d6a7","#81c784","#66bb6a","#4caf50","#43a047","#388e3c","#2e7d32","#1b5e20","#b9f6ca","#69f0ae","#00e676","#00c853","#e0f2f1","#b2dfdb","#80cbc4","#4db6ac","#26a69a","#009688","#00897b","#00796b","#00695c","#004d40","#a7ffeb","#64ffda","#1de9b6","#00bfa5"],
            colorsYellow : ["#fffde7","#fff9c4","#fff59d","#fff176","#ffee58","#ffeb3b","#fdd835","#fbc02d","#f9a825","#f57f17","#ffff8d","#ffff00","#ffea00","#ffd600","#f9fbe7","#f0f4c3","#e6ee9c","#dce775","#d4e157","#cddc39","#c0ca33","#afb42b","#9e9d24","#827717","#f4ff81","#eeff41","#c6ff00","#aeea00"],
            colorsRed : ["#fbe9e7","#ffccbc","#ffab91","#ff8a65","#ff7043","#ff5722","#f4511e","#e64a19","#d84315","#bf360c","#ff9e80","#ff6e40","#ff3d00","#dd2c00","#fff3e0","#ffe0b2","#ffcc80","#ffb74d","#ffa726","#ff9800","#fb8c00","#f57c00","#ef6c00","#e65100","#ffd180","#ffab40","#ff9100","#ff6d00"],
            colorBlue : ["#e3f2fd","#bbdefb","#90caf9","#64b5f6","#42a5f5","#2196f3","#1e88e5","#1976d2","#1565c0","#0d47a1","#82b1ff","#448aff","#2979ff","#2962ff]","#e1f5fe","#b3e5fc","#81d4fa","#4fc3f7","#29b6f6","#03a9f4","#039be5","#0288d1","#0277bd","#01579b","#80d8ff","#40c4ff","#00b0ff","#0091ea"]

        }),

        firebase: {
            countries: db.ref('countries').once('value').then((snapshot) => {
                let j = _this.colorBlue.length
                let data = snapshot.val()
                if(_this.polygonSeries ){
                    for (var i = snapshot.val().length - 1; i >= 0; i--) {
                        data[i]['color'] = _this.colorBlue[j];
                        data[i]['id'] = _this.universalMap(i, 'charId')
                        j --;
                        if (j < 0) { j=_this.colorBlue.length - 1}
                    }
                    for (var k = data.length - 1; k >= 0; k--) {

                        data[k]['color'] = data[data[k]['controlledBy']]['color']
                        data[k]['controlledBy'] = _this.universalMap(data[k]['controlledBy'])
                    }
                    _this.polygonSeries.data = data
                    _this.polygonSeries.invalidateData()
                } 
            }),
            mapStatus: db.ref('countries').on('child_changed', function(){
                location.reload()
            })
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
                this.$emit('select', this.universalMap(ev.target.dataItem.dataContext.controlledBy,'numberId'))   
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