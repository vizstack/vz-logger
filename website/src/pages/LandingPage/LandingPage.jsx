import React from "react";
import classNames from "classnames";

// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import { MuiThemeProvider } from "@material-ui/core/styles";

// @material-ui/icons

// Core components
import Header from "components/Header/Header.jsx";
import Footer from "components/Footer/Footer.jsx";
import GridContainer from "components/Grid/GridContainer.jsx";
import GridItem from "components/Grid/GridItem.jsx";
import HeaderLinks from "components/Header/HeaderLinks.jsx";
import Parallax from "components/Parallax/Parallax.jsx";
import Button from "components/CustomButtons/Button.jsx";

import { container, title } from "assets/jss/material-kit-react.jsx";
import theme from "assets/jss/theme.jsx";

// Sections for this page
import PrinciplesSection from "./sections/PrinciplesSection.jsx";
import TeamSection from "./sections/TeamSection.jsx";


const dashboardRoutes = ['/', '/examples'];

class LandingPage extends React.Component {
  render() {
    const { classes, ...rest } = this.props;
    return (
      <div>
        <Header
          color="transparent"
          routes={dashboardRoutes}
          brand="vz-logger"
          rightLinks={<HeaderLinks />}
          fixed
          changeColorOnScroll={{
            height: 100,
            color: "white"
          }}
          {...rest}
        />
        <Parallax image={require("assets/img/landing-bg.jpg")}>
          <div className={classes.container}>
            <GridContainer>
              <GridItem xs={12} sm={9} md={6}>
                <h2 className={classes.title}>
                  A web-based visual logger <br/>
                  for debugging.
                </h2>
                <h4>
                  Visualize data structures from programs in different languages.
                </h4>
                <br />
                <Button
                  href="/docs"
                  color="primary"
                  className={classes.navLink}
                >
                  Get Started
                </Button>
                  
              </GridItem>
            </GridContainer>
          </div>
        </Parallax>
        <div className={classNames(classes.main, classes.mainRaised)}>
          <MuiThemeProvider theme={theme}>
            <div className={classes.container}>
            <PrinciplesSection />
            <TeamSection />
            </div>
          </MuiThemeProvider>
        </div>
        <Footer />
      </div>
    );
  }
}

const styles = {
  container: {
    zIndex: "12",
    // color: "#FFFFFF",  // If photo background, make white.
    ...container,
  },
  title: {
    ...title,
    display: "inline-block",
    position: "relative",
    marginTop: "30px",
    minHeight: "32px",
    textDecoration: "none"
  },
  subtitle: {
    fontSize: "1.313rem",
    maxWidth: "500px",
    margin: "10px auto 0"
  },
  main: {
    background: "#FFFFFF",
    position: "relative",
    zIndex: "3"
  },
  mainRaised: {
    borderRadius: "6px",
    boxShadow:
      "0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)",
    margin: "-60px 0px 0px",
    "@media (min-width: 600px)": {
      margin: "-60px 20px 0px",
    },
  },
  codebox: {
    borderRadius: 4,
    userSelect: 'all',
    background: 'rgba(213, 218, 231, 0.5) !important',
    padding: 16,
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
  }
};

export default withStyles(styles)(LandingPage);
