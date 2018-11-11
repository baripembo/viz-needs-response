import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { formatValue } from "../util/helpers";

const Value = styled.h2`
  font-size: 36px;
  margin: 0;
`;

const StyledP = styled.p`
  margin: 0;
`;

class KeyFigure extends Component {
  static propTypes = {
    value: PropTypes.number,
    label: PropTypes.string,
    source: PropTypes.string,
  };

  render() {
    if (this.props.value) {
      return (
        <div>
          { this.props.value && <Value style={this.props.style}>{formatValue(this.props.value)}</Value> }
          { this.props.label && <StyledP>{this.props.label}</StyledP> }
          { this.props.source && <StyledP>{this.props.source}</StyledP> }
        </div>
      )
    }
    else {
      return null;
    }
  }
}

export default KeyFigure;
