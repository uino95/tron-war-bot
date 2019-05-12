
import React from "react"
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
} from "react-simple-maps"

import geoData from "./world-50m.json"
import { connect } from "react-redux";

import {selectedNations, nations} from '../redux/selector'
import {selectNation, updateMap} from '../redux/actions'

const wrapperStyles = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto",
}

class BasicMap extends React.Component{ 
  
  handleClick = (event) => {
    const currentNation = event.properties.name
    console.log("clicked on ", currentNation)
    this.props.selectNation(currentNation)
    console.log("nations: ", this.props.nations)
  }

  render(){
    let isSelected
    return (
      <div style={wrapperStyles}>
        <ComposableMap
          projectionConfig={{
            scale: 205,
            rotation: [-11,0,0],
          }}
          width={980}
          height={551}
          style={{
            width: "100%",
            height: "auto",
          }}
          >
          <ZoomableGroup center={[0,20]} disablePanning>
            <Geographies geography={geoData} disableOptimization>
              {(geographies, projection) => {
                if(geographies.length !== this.props.nations.length) this.props.updateMap(geographies) 
                return (
                  geographies.map((geography, i) => 
                  {
                    isSelected = this.props.selectedNations.includes(geography.properties.name) 
                    return geography.id !== "ATA" && 
                    (
                      <Geography
                        key={i}
                        geography={geography}
                        projection={projection}
                        onClick={(event) => this.handleClick(event)}
                        style={{
                          default: {
                            fill: isSelected ? "#FF5722" : "#ECEFF1",
                            stroke: "#607D8B",
                            strokeWidth: 0.75,
                            outline: "none",
                          },
                          hover: {
                            fill: isSelected ? "#FF5722" : "#ECEFF1",
                            stroke: "#607D8B",
                            strokeWidth: 0.75,
                            outline: "none",
                          },
                          pressed: {
                            fill: "#FF5722",
                            stroke: "#607D8B",
                            strokeWidth: 0.75,
                            outline: "none",
                          },
                        }}
                      />
                    )
                  })
                )
              }
            }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  selectedNations: selectedNations(state),
  nations: nations(state)
});

const mapDispatchToProps = dispatch => ({
  selectNation: (nation) => dispatch(selectNation(nation)),
  updateMap: (nations) => dispatch(updateMap(nations))
});

export default connect(mapStateToProps, mapDispatchToProps)(BasicMap);
