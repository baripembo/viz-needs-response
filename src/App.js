import React, { Component } from 'react';
import './App.css';
import Main from './screens/Main';
import { GlobalStyles } from './theme/globalStyle';

class App extends Component {
  render() {
    return (
    	<React.Fragment>
    		<GlobalStyles />
      	<Main/>
      </React.Fragment>
    );
  }
}

export default App;
