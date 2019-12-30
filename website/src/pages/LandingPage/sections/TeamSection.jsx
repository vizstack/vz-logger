import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";

// @material-ui/icons

// React icons
import { FaGithub, FaLinkedin } from 'react-icons/fa';

// core components
import GridContainer from "components/Grid/GridContainer.jsx";
import GridItem from "components/Grid/GridItem.jsx";
import Button from "components/CustomButtons/Button.jsx";
import Card from "components/Card/Card.jsx";

import { cardTitle, title } from "assets/jss/material-kit-react.jsx";
import imagesStyle from "assets/jss/material-kit-react/imagesStyles.jsx";

import faceNikhilBhattasali from "assets/img/face-nikhilbhattasali.jpg";
import faceRyanHolmdahl from "assets/img/face-ryanholmdahl.jpg";

class TeamSection extends React.Component {
  render() {
    const { classes } = this.props;
    const imageClasses = classNames(
      classes.imgRaised,
      classes.imgRoundedCircle,
      classes.imgFluid,
      classes.imgSmall,
    );
    return (
      <div className={classes.section}>
        <h2 className={classes.title}>Maintainers</h2>
        <div>
          <GridContainer justify='center'>
            {/* Nikhil Bhattasali ============================================================== */}
            <GridItem xs={12} sm={4} md={4}>
              <Card plain>
                <GridItem xs={12} sm={6} md={6} className={classes.itemGrid}>
                  <img src={faceNikhilBhattasali} alt="..." className={imageClasses} />
                </GridItem>
                <h4 className={classes.cardTitle}>
                  Nikhil Bhattasali
                  <br />
                  <small className={classes.smallTitle}>Core Developer</small>
                  <br />
                  <Button
                    justIcon
                    color="transparent"
                    className={classes.margin5}
                    target='_blank'
                    href='https://github.com/nikhilxb'
                  >
                    <FaGithub/>
                  </Button>
                  <Button
                    justIcon
                    color="transparent"
                    className={classes.margin5}
                    target='_blank'
                    href='https://www.linkedin.com/in/nikhilbhattasali/'
                  >
                    <FaLinkedin/>
                  </Button>
                </h4>
              </Card>
            </GridItem>
            {/* Ryan Holmdahl ================================================================== */}
            <GridItem xs={12} sm={4} md={4}>
              <Card plain>
                <GridItem xs={12} sm={6} md={6} className={classes.itemGrid}>
                  <img src={faceRyanHolmdahl} alt="..." className={imageClasses} />
                </GridItem>
                <h4 className={classes.cardTitle}>
                  Ryan Holmdahl
                  <br />
                  <small className={classes.smallTitle}>Core Developer</small>
                  <br />
                  <Button
                    justIcon
                    color="transparent"
                    className={classes.margin5}
                    target='_blank'
                    href='https://github.com/ryanholmdahl'
                  >
                    <FaGithub/>
                  </Button>
                  <Button
                    justIcon
                    color="transparent"
                    className={classes.margin5}
                    target='_blank'
                    href='https://www.linkedin.com/in/ryan-holmdahl-3bb142a7/'
                  >
                    <FaLinkedin/>
                  </Button>
                </h4>
              </Card>
            </GridItem>
          </GridContainer>
        </div>
      </div>
    );
  }
}

const styles = {
  section: {
    padding: "70px 0",
    textAlign: "center"
  },
  title: {
    ...title,
    marginBottom: "1rem",
    marginTop: "30px",
    minHeight: "32px",
    textDecoration: "none"
  },
  ...imagesStyle,
  itemGrid: {
    marginLeft: "auto",
    marginRight: "auto"
  },
  cardTitle,
  smallTitle: {
    color: "#6c757d"
  },
  description: {
    color: "#999"
  },
  justifyCenter: {
    justifyContent: "center !important"
  },
  socials: {
    marginTop: "0",
    width: "100%",
    transform: "none",
    left: "0",
    top: "0",
    height: "100%",
    lineHeight: "41px",
    fontSize: "20px",
    color: "#999"
  },
  margin5: {
    margin: "5px"
  },
  imgSmall: {
    maxHeight: 75,
  },
};

export default withStyles(styles)(TeamSection);
