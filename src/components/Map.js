
import React from "react"
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
} from "react-simple-maps"

import geoData from "./world-50m.json"
import { connect } from "react-redux";

import {selectedNations} from '../redux/selector'
import {selectNation} from '../redux/actions'

const wrapperStyles = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto",
}

class BasicMap extends React.Component{ 
  
  handleClick = (event) => {
    console.log("clicked on ", event.properties.name)
    this.props.selectNation(event.properties.name)
    this.forceUpdate()
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
            <Geographies geography={geoData}>
              {(geographies, projection) => geographies.map((geography, i) => 
                {
                  console.log(geography)
                  isSelected = this.props.nations.includes(geography.properties.name)
                  
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
              })}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  nations: selectedNations(state)
});

const mapDispatchToProps = dispatch => ({
  selectNation: (nation) => dispatch(selectNation(nation))
});

export default connect(mapStateToProps, mapDispatchToProps)(BasicMap);
