  import React from "react";
import { Router } from "react-router-dom";
import {createMemoryHistory} from "history";


// Core components
import Header from "components/Header/Header.jsx";
import Footer from "components/Footer/Footer.jsx";
import HeaderLinks from "components/Header/HeaderLinks.jsx";

let hist = createMemoryHistory();

export default ({ children }) => {
  return (
    <Router history={hist}>
      <React.Fragment>
        <Header
          color="white"
          routes={[]}
          brand="vz-logger"
          rightLinks={<HeaderLinks />}
          fixed
        />
        {children}
      </React.Fragment>
    </Router>
  );
};