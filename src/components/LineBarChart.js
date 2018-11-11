import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { formatValue, formatCommaValue } from "../util/helpers";
import { Bar } from "react-chartjs-2";


class LineBarChart extends Component {
  static propTypes = {
    lineTitle: PropTypes.string,
    lineData: PropTypes.array.isRequired,
    lineColor: PropTypes.string,
    barTitle: PropTypes.string,
    barData: PropTypes.array.isRequired,
    barColor: PropTypes.string,
    labels: PropTypes.array,
    height: PropTypes.number,
    width: PropTypes.number,
  };

  render() {
    let sectorData = {
      datasets: [{
        yAxisID: 'y-axis-2',
        type: 'line',
        label: this.props.lineTitle || 'Line',
        data: this.props.lineData,
        fill: false,
        lineTension: 0,
        borderWidth: 1,
        pointRadius: 2,
        borderColor: this.props.lineColor,
        backgroundColor: this.props.lineColor,
        pointBorderColor: this.props.lineColor,
        pointBackgroundColor: this.props.lineColor,
        pointHoverBackgroundColor: this.props.lineColor,
        pointHoverBorderColor: this.props.lineColor,
      },
      {
        yAxisID: 'y-axis-1',
        type: 'bar',
        fill: false,
        label: this.props.barTitle || 'Bar',
        data: this.props.barData,
        backgroundColor: this.props.barColor,
        borderColor: this.props.barColor,
        hoverBackgroundColor: this.props.barColor,
        hoverBorderColor: this.props.barColor,
      }]
    };

    const sectorOptions = {
      responsive: true,
      tooltips: {
        mode: 'label',
        callbacks: {
          label: function(tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label || '';
            if (label) {
              label += ': ';
            }
            label += formatCommaValue(tooltipItem.yLabel);
            return label;
          }
        }
      },
      legend: {
        display: true,
        labels: { boxWidth: 12 }
      },
      elements: {
        line: { fill: false }
      },
      scales: {
        xAxes: [
          {
            gridLines: { display: false },
            ticks: { autoSkip: false },
            labels: this.props.labels,
          }
        ],
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            position: 'right',
            gridLines: { display: false },
            ticks: {
              min: 0,
              maxTicksLimit: 5,
              callback: function(value, index, values) {
                return formatValue(value);
              }
            }
          },
          {
            id: 'y-axis-2',
            type: 'linear',
            position: 'left',
            gridLines: { display: false },
            ticks: {
              min: 0,
              maxTicksLimit: 5,
              callback: function(value, index, values) {
                return formatValue(value);
              }
            }
          }
        ]
      }
    };

    return (      
      <Bar
        height={this.props.height}
        width={this.props.width}
        data={sectorData}
        options={sectorOptions}
      />
    )
  }
}

export default LineBarChart;
