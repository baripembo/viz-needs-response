import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Pie } from "react-chartjs-2";

class PieChart extends Component {
  static propTypes = {
  };

  render() {
    let data = {
      datasets: [{
        data: this.props.data,
        backgroundColor: this.props.colors,
        hoverBackgroundColor: this.props.colors,
      }],
      labels: this.props.labels,
    };

    let options = {
      responsive: false,
      tooltips: {
        filter: function (tooltipItem, data) {
          if (tooltipItem.index===1)
            return false;
          else
            return true;
        },
        callbacks: {
          label: function(tooltipItem, data) {
            let dataset = data.datasets[0];
            let meta = dataset._meta[Object.keys(dataset._meta)[0]];
            let total = meta.total;
            let currentValue = dataset.data[0];
            let percentage = parseFloat((currentValue/total*100).toFixed(0));
            return data.labels[0] + ': ' + percentage + '%';
          },
        }
      },      
      title: {
        display: true,
        position: 'bottom',
        text: this.props.title,
      },
      legend: {
        display: false,
      },
    }
    return (      
      <Pie 
        width={this.props.width}
        data={data} 
        options={options} 
      />
    )
  }
}

export default PieChart;
