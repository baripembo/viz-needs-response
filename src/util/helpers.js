import * as d3 from 'd3-format';

export function hxlProxyToJSON(input) {
  let output = [];
  let keys = [];
  input.forEach(function(e,i) {
    if (i===0) {
      e.forEach(function(e2,i2) {
        let parts = e2.split('+');
        let key = parts[0];
        if (parts.length>1) {
          let atts = parts.splice(1,parts.length);
          atts.sort();
          atts.forEach(function(att) {
            key +='+'+att
          });
        }
        keys.push(key);
      });
    } 
    else {
      var row = {};
      e.forEach(function(e2,i2) {
        row[keys[i2]] = e2;
      });
      output.push(row);
    }
  });
  return output;
}

export function hexToRgbA(hex, alpha) {
  console.log(hex);
  let c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
    c= hex.substring(1).split('');
    if(c.length== 3){
        c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x'+c.join('');
    return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
  }
  throw new Error('Bad Hex');
}

export function fetchJSON(file) {
  return fetch(file)
    .then(response => response.json());
}

export const formatValue = d3.format('.2s');
export const formatCommaValue = d3.format(',');