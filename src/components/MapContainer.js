import React, { Component } from 'react';
import {findDOMNode} from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from '../util/colors';
import { hexToRgbA } from '../util/helpers';
import { ComposableMap, Geographies, Geography, Markers, Marker, ZoomableGroup } from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';
import { scaleLinear } from 'd3-scale';
import MapLegend from './MapLegend';


const Container = styled.div`
  position: relative;
`;

const pinScale = scaleLinear()
  .domain([0, 1000000])
  .range([colors.color_coral_light, colors.color_coral]);

const pinAlphaScale = scaleLinear()
  .domain([0, 1000000])
  .range([hexToRgbA(colors.color_coral_light,0.5), hexToRgbA(colors.color_coral,0.5)]);

const orgScale = scaleLinear()
  .domain([0, 120])
  .range([3, 20]);


class MapContainer extends Component {
  static propTypes = {
    geoData: PropTypes.object,
    regionData: PropTypes.array,
    handleRegionSelect: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { currPin: 0 };
  }

  componentDidMount() {
    setTimeout(() => {
      ReactTooltip.rebuild()
    }, 100)
  }

  handleMapClick(geography, event) {
    this.setState({currPin: geography.properties.pin});
    this.props.handleRegionSelect(geography.properties.admin1Name);
  }

  handleMarkerClick(marker) {
    let region = marker.name==='Koulikoro'? 'Koulikouro' : marker.name; //fix this
    this.setState({currPin: marker.pin});
    this.props.handleRegionSelect(region);
  }

  render() {
    return (
      <Container>
        <ComposableMap projectionConfig={{ scale: 200 }} width={500} height={500} style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}>
          <ZoomableGroup zoom={10} center={[-3.5, 17.5]}>
            <Geographies geography={this.props.geoData} disableOptimization={ true }>
              {(geographies, projection) => geographies.map((geography, index) => (
                <Geography
                  key={ `geography-${index}` }
                  data-tip={geography.properties.admin1Name}
                  geography={ geography }
                  projection={ projection }
                  style={{
                    default: {
                      fill: this.state.currPin===geography.properties.pin? pinScale(geography.properties.pin) : pinScale(geography.properties.pin),
                      stroke: colors.color_gray,
                      strokeWidth: 0.1,
                      outline: 'none',
                    },
                    hover: {
                      fill: this.state.currPin===geography.properties.pin? pinScale(geography.properties.pin) : pinScale(geography.properties.pin),
                      stroke: colors.color_gray,
                      strokeWidth: 0.1,
                      outline: 'none',
                    },
                    pressed: {
                      fill: this.state.currPin===geography.properties.pin? pinScale(geography.properties.pin) : pinScale(geography.properties.pin),
                      stroke: colors.color_gray,
                      strokeWidth: 0.1,
                      outline: 'none',
                    }
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
        <MapLegend style={{position: 'absolute', bottom: '15px', right: '15px'}}/>
        <ReactTooltip />
      </Container>
    )
  }
}

export default MapContainer;
