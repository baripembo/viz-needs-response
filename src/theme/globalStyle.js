import { createGlobalStyle } from 'styled-components';
import { colors } from '../util/colors';

export const GlobalStyles = createGlobalStyle`
	@font-face {
		font-family: 'GothamBold';
		src: url('../assets/fonts/gothambold/gothambold.ttf');
	}

  body {
    @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 14px;
    padding: 20px;
  }

  h1,
  h2,
  h3,
  h4 {
		font-family: 'Source Sans Pro', sans-serif;
  }

  p,
  h5 {
  	font-family: 'Source Sans Pro', sans-serif;
  	font-size: 14px;
  	font-weight: normal;
  }

  h5 {
  	font-size: 12px;
  }

  a {
  	color: ${colors.color_blue};
  	&:hover {
  		color: ${colors.color_coral};
  	}
  }
`