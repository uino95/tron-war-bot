<template>
<v-container flex>
  <div id="datamap"></div>
</v-container>
</template>


<script>
import * as Datamap from "datamaps";
import * as d3 from "d3";
export default {
  props: {
    projects: Array,
    name: String
  },
  data: () => ({
    width: 0,
    height: 0
  }),
  computed: {},
  mounted() {
    var map = new Datamap({
      element: document.getElementById('datamap'),
      fills: {
        HIGH: '#afafaf',
        LOW: '#123456',
        MEDIUM: 'blue',
        UNKNOWN: 'rgb(0,0,0)',
        defaultFill: 'green'
      },
      data: {
        IRL: {
          fillKey: 'LOW',
          numberOfThings: 2002
        },
        USA: {
          fillKey: 'MEDIUM',
          numberOfThings: 10381
        }
      }
    });

    // Pure JavaScript
   window.addEventListener('resize', function() {
       map.resize();
   });
  },
  methods: {

  }
};
</script>

<style scoped>
#datamap {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
