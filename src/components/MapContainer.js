import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from '../util/colors';
import { ComposableMap, Geographies, Geography, Markers, Marker, ZoomableGroup } from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';
import { scaleLinear } from 'd3-scale';
import MapLegend from './MapLegend';


const Container = styled.div`
  position: relative;
`;

const StyledMapLegend = styled(MapLegend)`
  position: absolute;
  bottom: 15px;
  right: 15px;
`;

const pinScale = scaleLinear()
  .domain([0, 1000000])
  .range([colors.color_coral_light, colors.color_coral]);

const orgScale = scaleLinear()
  .domain([0, 120])
  .range([3, 20]);


class MapContainer extends Component {
  static propTypes = {
    geoData: PropTypes.object,
    regionData: PropTypes.array,
    handleRegionSelect: PropTypes.func,
    initialRegion: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = { currRegion: this.props.initialRegion };
  }

  componentDidMount() {
    setTimeout(() => {
      ReactTooltip.rebuild()
    }, 100);

    this.setActiveRegion(this.props.initialRegion);
  }

  handleMapClick(geography) {
    this.setState({ currRegion: geography.properties.admin1Name });
    this.setActiveRegion(geography.properties.admin1Name);
  }

  handleMarkerClick(marker) {
    let region = marker.name==='Koulikoro'? 'Koulikouro' : marker.name; //fix this
    this.setState({ currRegion: marker.name });
    this.setActiveRegion(region);
  }

  setActiveRegion(region) {
    let paths = [...document.getElementsByClassName('rsm-geographies')[0].childNodes];
    paths && paths.map(path => {
      if (path.getAttribute('data-tip')===region) {
        path.parentElement.appendChild(path);
      }
    });

    this.props.handleRegionSelect(region);
  }

  regionStyle(geography) {
    return {
      fill: pinScale(geography.properties.pin),
      stroke: this.state.currRegion===geography.properties.admin1Name? '#666' : colors.color_gray,
      strokeWidth: this.state.currRegion===geography.properties.admin1Name? 2 : 1,
      outline: 'none',
    }
  }

  render() {
    let viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    console.log(viewportWidth);
    const yOffset = -130;
    const xOffset = -30;//, yOffset: yOffset, xOffset: xOffset
    return (
      <Container>
        <ComposableMap projectionConfig={{ scale: 2000 }} width={500} height={500} style={{
          width: '100%',
          height: '100%',
        }}>
          <ZoomableGroup center={[-4, 18]}>
            <Geographies geography={this.props.geoData} disableOptimization={ true }>
              {(geographies, projection) => geographies.map((geography, index) => (
                <Geography
                  key={ `geography-${index}` }
                  data-tip={geography.properties.admin1Name}
                  geography={ geography }
                  projection={ projection }
                  style={{
                    default: this.regionStyle(geography),
                    hover: this.regionStyle(geography),
                    pressed: this.regionStyle(geography)
                  }}
                  onClick={this.handleMapClick.bind(this)}
                  />
              ))}
            </Geographies>
            <Markers>
              {
                this.props.regionData.map((region, index) => (
                  <Marker 
                    key={index} 
                    marker={region}
                    onClick={this.handleMarkerClick.bind(this)}
                    >
                    <circle
                      cx={0}
                      cy={0}
                      data-tip={region.name}
                      r={orgScale(region.orgs)}
                      fill='rgba(0,124,224,0.5)'
                      stroke={colors.color_blue}
                      strokeWidth='2'
                    />
                  </Marker>
                ))
              }
            </Markers>
          </ZoomableGroup>
        </ComposableMap>
        {/*<MapLegend style={{position: 'absolute', bottom: '15px', right: '15px'}}/>*/}
        <StyledMapLegend />
        <ReactTooltip />
      </Container>
    )
  }
}

export default MapContainer;
