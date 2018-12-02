import React, { Component } from 'react';
import styled from 'styled-components';
import { colors } from '../util/colors';
import * as d3 from 'd3';

const Legend = styled.div`
  display: flex;
  flex-direction: row;
`;

const Title = styled.h5`
  margin: 0 0 5px;
`;

const ScaleContainer = styled.div`
  padding-right: 15px;
`;

const Scale = styled.div`
  height: 60px;
  position: relative;
  p {
    font-size: 9px;
    margin: 0;
    position: absolute;
    left: 22px;
    &.max {
      top: 0;
    }
    &.min {
      bottom: 0;
    }
  }
  .circles {
    list-style-type: none;
    margin: 0;
    padding: 0;
    width: 15px;
    li {
      background-color: ${colors.color_blue};
      border-radius: 50%;
      height: 15px;
      width: 15px;
      margin: 0 auto 5px;
      &:nth-child(2) {
        height: 13px;
        width: 13px;
      }
      &:nth-child(3) {
        height: 9px;
        width: 9px;
      }
      &:nth-child(4) {
        height: 5px;
        width: 5px;
      }
    }
  }
`;

const LinearGradient = styled.div`
  background: linear-gradient(to bottom, ${colors.color_coral} 0%, ${colors.color_coral_light} 100%);
  width: 18px;
  height: 100%;
`;

class MapLegend extends Component {
  componentDidMount() {
    // time to make a legend here
    // start by storing all color values in an array
    let colorLegend = ["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)"];

    // get the svg that just mounted - this is componentDidMount()
    // so this function gets fired just after render()
    let svgLegend = d3.select('#legend');

    // now just inject standard D3 code
    svgLegend.append("g")
        .attr("transform", "translate(0, 0)")
        .selectAll("rect")
        .data(colorLegend)
        .enter()
        .append("rect")
        .attr("fill", function(d, i){ return colorLegend[i]; })
        .attr("y", function(d, i){ return (i*30); })
        .attr("x", 30)
        .attr("width", 30)
        .attr("height", 30);

    // add a title
    svgLegend.append("text")
        .attr("transform", "translate(0, 0)")
        .attr("font-size", "12px")
        .attr("font-family", "HelveticaNeue-Bold, Helvetica, sans-serif")
        .attr("y", 20)
        .text("People in Need");
  }
  
  render() {
    return (
      <Legend style={this.props.style} className={this.props.className}>
        <ScaleContainer>
          <Title>People in Need</Title>
          <Scale>
            <p className='max'>5M</p>
            <LinearGradient />
            <p className='min'>0</p>
          </Scale>
        </ScaleContainer>
        <ScaleContainer>
          <Title>Active Orgs</Title>
          <Scale>
            <p className='max'>200</p>
            <ul className='circles'>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
            <p className='min'>20</p>
          </Scale>
        </ScaleContainer>
      </Legend>
    );
  }
}

export default MapLegend;