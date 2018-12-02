import React, { Component } from 'react';
import styled from 'styled-components';
import { hxlProxyToJSON, fetchJSON } from "../util/helpers";
import { colors } from "../util/colors";
import crossfilter from 'crossfilter';
import KeyFigure from '../components/KeyFigure';
import MapContainer from '../components/MapContainer';
import LineBarChart from '../components/LineBarChart';
import PieChart from '../components/PieChart';

//local data
import geoData from "../data/mali-topo.json";
import regionData from "../data/regions.json";

//data urls
const API_URL        = 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1eNrVfniiv62WlpKAyrA6VJJx-plGa__6n0hbVnRdCbA%2Fedit%23gid%';
const PIN_SECTOR_URL = API_URL + '3D1866689087&force=on';
const PIN_GLOBAL_URL = API_URL + '3D752739684&force=on';
const _3W_URL        = API_URL + '3D803716133';

const Container = styled.div`
  margin: 0 auto;
  max-width: 1000px;
`;

const Title = styled.h1`
  font-size: 16px;
  margin: 0;
`;

const KeyFiguresContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 30px 30px 0 0;
  > div {
    margin-bottom: 30px;
  }
  @media only screen and (min-width: 768px) {
    flex-direction: row;
  }
`;

const VisualizationContainer = styled.div`
  border: 1px solid #999;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  @media only screen and (min-width: 1024px) {
    flex-direction: row;
  }
`;

const DetailContainer = styled.div`
  border: 0;
  border-top: 1px solid #999;
  padding: 20px;
  .title {
    padding-bottom: 20px;
  }
  .detailInner {
    display: flex;
    flex-direction: row;
    padding-top: 20px;
  }
  @media only screen and (min-width: 1024px) {
    border: 0;
    border-left: 1px solid #999;
    flex-direction: row;
  }
`;

const DetailStats = styled.div`
  margin-left: 20px;
  > div {
    padding-bottom: 13px;
  }
`;


class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataReady: false,
      mergedGeoData: null,
      mergedRegionData: null,
      keyFigures: {}, //object of global key figures
      currentStats: {}, //object of overall stats for current region
      currentPinSector: [], //array of number of people in need per sector for current region
      currentOrgSector: [], //array of number of orgs per sector for current region
      sectors: [], //array of sector names
    };

    this.pinCF = null;
    this.orgsCF = null;
    this.sectorCF = null;
    this.regionDimension = null;
    this.sectorDimension = null;
    this.orgDimension = null;
  }

  componentDidMount() {
    Promise.all([fetchJSON(PIN_SECTOR_URL), fetchJSON(PIN_GLOBAL_URL), fetchJSON(_3W_URL)])
      .then(([pinSector, pinGlobal, _3w]) => {
        let pinSectorData = hxlProxyToJSON(pinSector);
        let pinGlobalData = hxlProxyToJSON(pinGlobal);
        let _3wData = hxlProxyToJSON(_3w);

        this.pinCF = crossfilter(pinGlobalData);
        this.sectorCF = crossfilter(pinSectorData);
        this.orgsCF = crossfilter(_3wData);
        this.regionDimension = this.pinCF.dimension(function(d) { return d['#adm1+name']; });
        this.sectorDimension = this.sectorCF.dimension(function(d) { return d['#adm1+name']; });
        this.orgDimension = this.orgsCF.dimension(function(d) { return d['#adm1+name']; });
        
        this.getKeyFigures();
        this.combineData();
        this.getSectorLabels();

        this.setState({ dataReady: true });

        //initialize map with a starting region
        this.regionSelect('Mopti');
      });
  }

  getSectorLabels() {
    let sectors = this.sectorCF.dimension(function(d) { return d['#sector']; }).group().top(Infinity);
    let sectorArray = [];
    sectors.forEach(function(sector) {
      sectorArray.push(sector.key);
    });
    this.setState({ sectors: sectorArray.sort() });
  }
  
  combineData() {
    geoData.objects.mli.geometries.map(geom => {
      //get pin count by region
      let pin = this.getValueByDimension(this.regionDimension, 'inneed', geom.properties.admin1Name);
      geom.properties.pin = pin;
    });

    regionData.map(region => {
      //get org count by region
      this.orgDimension.filter(region.name);
      let orgs = this.orgsCF.groupAll().reduceCount().value();
      this.orgDimension.filterAll();
      region.orgs = orgs;

      //get pin count by region
      let pin = this.getValueByDimension(this.regionDimension, 'inneed', region.name);
      region.pin = pin;
    });

    this.setState({ 
      mergedGeoData: geoData,
      mergedRegionData: regionData,
    });
  }

  getValueByDimension(dim, value, region) {    
    dim.filter(region);
    let filteredValue = this.pinCF.groupAll().reduceSum(function(d) { return d[`#${value}`]; }).value();
    dim.filterAll();
    return filteredValue;
  }

  getCountByRegion(dim, region) {    
    dim.filter(region);
    let filteredValue = this.orgsCF.groupAll().reduceCount().value();
    dim.filterAll();
    return filteredValue;
  }

  getKeyFigures() {
    let keyFiguresObj = {
      pinTotal:this.pinCF.groupAll().reduceSum(function(d) { return d['#inneed']; }).value(),
      affectedTotal: this.pinCF.groupAll().reduceSum(function(d) { return d['#affected']; }).value(),
      popTotal: this.pinCF.groupAll().reduceSum(function(d) { return d['#population+y2018']; }).value(),
      orgsTotal: this.orgsCF.size(),
    };
    this.setState({ keyFigures: keyFiguresObj });
  }

  getSectorData(region) {
    let currPin = [];
    this.sectorDimension.filterExact(region);
    this.sectorDimension.top(Infinity).map(d => {
      this.state.sectors.map((sector, index) => {
        if (d['#sector']===sector) {
          let val = currPin[index]===undefined? 0 : currPin[index];
          currPin[index] = val + Number(d['#inneed']);
        }
      });
    });
    this.sectorDimension.filterAll();

    let currOrgs = [];
    //fix discrepancy of region name in 3w data
    region = region==='Koulikouro'? 'Koulikoro' : region;
    this.orgDimension.filterExact(region);
    this.orgDimension.top(Infinity).map(d => {
      this.state.sectors.map((sector, index) => {
        //fix label differences from 3w data
        let currSector = d['#sector'];
        switch(d['#sector']) {
          case 'Eau, Hygiène et Assainissement':
              currSector = 'Wash';
              break;
          case 'Abris et NFI':
              currSector = 'Abris';
              break;
          case 'Sécurité alimentaire':
              currSector = 'Securité alimentaire';
              break;
          default:
              currSector = d['#sector'];
        }
        if (currSector===sector) {
          let val = currOrgs[index]===undefined? 0 : currOrgs[index];
          currOrgs[index] = val + 1;
        }
      });
    });
    this.orgDimension.filterAll();

    this.setState({ 
      currentPinSector: currPin,
      currentOrgSector: currOrgs,
    });
  }

  regionSelect(region) {
    this.getSectorData(region);
    //fix discrepancy of region name in 3w data
    let regionName = region==='Koulikouro'? 'Koulikoro' : region;
    let currStats = {
      region: region,
      pin: this.getValueByDimension(this.regionDimension, 'inneed', region),
      pop: this.getValueByDimension(this.regionDimension, 'population+y2018', region),
      orgs: this.getCountByRegion(this.orgDimension, regionName),
    };
    this.setState({ currentStats: currStats });
  }

  render() {
    return (
      <Container>
        <Title>MALI - 2018 Needs and Response Overview</Title>
        <p>Lorem ipsum proident dolor labore elit elit non proident occaecat ex nostrud est consequat magna aute sit in sunt veniam sint minim magna et cupidatat tempor exercitation nulla elit nisi aliquip pariatur dolor esse velit eu consequat laborum fugiat id aute aute sed excepteur deserunt dolor aliqua adipisicing id sunt velit aliquip in ex ad dolore dolor aliquip enim nulla fugiat veniam occaecat aliquip occaecat nisi in officia et officia magna ullamco velit minim nostrud occaecat cupidatat adipisicing consequat proident mollit irure consequat dolor esse irure officia ut ut in non sunt et labore aute laboris commodo ullamco.</p>   
        {
          this.state.dataReady &&
          <React.Fragment>
            <KeyFiguresContainer>
              <KeyFigure value={this.state.keyFigures.pinTotal} label={'OVERALL PEOPLE IN NEED'} source={'(HNO 2018)'} />
              <KeyFigure value={this.state.keyFigures.popTotal} label={'TOTAL POPULATION'} source={'(HNO 2018)'} />
              <KeyFigure value={this.state.keyFigures.orgsTotal} label={'ACTIVE ORGANIZATIONS'} source={'(3W 2018)'} />
            </KeyFiguresContainer>
            <VisualizationContainer>
              <MapContainer 
                geoData={this.state.mergedGeoData} 
                regionData={this.state.mergedRegionData} 
                initialRegion={'Mopti'}
                handleRegionSelect={this.regionSelect.bind(this)}
              /> 
              <DetailContainer>
                <div className='title'>Region: <h4 style={{display: 'inline-block', margin: '0'}}>{this.state.currentStats.region}</h4></div>
                <div className='mixedChartContainer'>
                  <LineBarChart
                    height={280}
                    width={450}
                    labels={this.state.sectors}
                    barColor={colors.color_coral}
                    barData={this.state.currentPinSector}
                    barTitle={'People in Need per Sector'}
                    lineColor={colors.color_blue}
                    lineData={this.state.currentOrgSector}
                    lineTitle={'Active Orgs per Sector'}
                  />
                </div>
                <div className='detailInner'>
                  <div className='pieChartContainer' style={{width: '50%'}}>
                    <PieChart
                      width={200}
                      colors={[colors.color_coral, colors.color_gray_light]}
                      data={[this.state.currentStats.pin, this.state.currentStats.pop-this.state.currentStats.pin]}
                      labels={['People in need', '']}
                      title={'% of population in need'}
                    />
                  </div>
                  <DetailStats>
                    <KeyFigure
                      className='stat'
                      value={this.state.currentStats.pin} 
                      label={'People in Need'} 
                      style={{fontSize: '20px', margin: '0'}} />
                    <KeyFigure 
                      className='stat'
                      value={this.state.currentStats.pop} 
                      label={'Total Population'} 
                      style={{fontSize: '20px', margin: '0'}} />
                    <KeyFigure 
                      className='stat'
                      value={this.state.currentStats.orgs} 
                      label={'Active Organizations'} 
                      style={{fontSize: '20px', margin: '0'}} />
                  </DetailStats>
                </div>
              </DetailContainer>
            </VisualizationContainer>
            <p><a href="https://data.humdata.org/dataset/mali-humanitarian-needs-overview" target="_blank" rel="noopener noreferrer">HNO Data</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://data.humdata.org/dataset/mali-3wop" target="_blank" rel="noopener noreferrer">3W Data</a></p>
          </React.Fragment>
        }
      </Container>
    );
  }
}

export default Main;
