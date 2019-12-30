import React from "react";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";

// @material-ui/icons
import VisualsIcon from "@material-ui/icons/Wallpaper";
import SearchFilterIcon from "@material-ui/icons/FilterList";
import MultipleLanguagesIcon from "@material-ui/icons/Code";

import GridContainer from "components/Grid/GridContainer.jsx";
import GridItem from "components/Grid/GridItem.jsx";
import InfoArea from "components/InfoArea/InfoArea.jsx";

import { title } from "assets/jss/material-kit-react.jsx";

class PrinciplesSection extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.section}>
        {/* <GridContainer justify="center">
          <GridItem xs={12} sm={12} md={8}>
            <h2 className={classes.title}>Let's talk product</h2>
            <h5 className={classes.description}>
              This is the paragraph where you can write more details about your
              product. Keep you user engaged by providing meaningful
              information. Remember that by this time, the user is curious,
              otherwise he wouldn't scroll to get here. Add a button if you want
              the user to see more.
            </h5>
          </GridItem>
        </GridContainer> */}
        <div>
          <GridContainer>
            <GridItem xs={12} sm={12} md={4}>
              <InfoArea
                title="Interactive Visuals"
                description={<span>Takes print statements to the next level by showing data structures as <b>interactive, composable visualizations</b>, built with Vizstack.</span>}
                icon={VisualsIcon}
                iconColor="primary"
                vertical
              />
            </GridItem>
            <GridItem xs={12} sm={12} md={4}>
              <InfoArea
                title="Search and Filter"
                description={<span>Stop scrolling through long lists of text! Use <b>tags, filenames, and levels</b> to easily find the messages you're looking for.</span>}
                icon={SearchFilterIcon}
                iconColor="primary"
                vertical
              />
            </GridItem>
            <GridItem xs={12} sm={12} md={4}>
              <InfoArea
                title="Multiple Languages"
                description={<span>Different processes, written in different languages, can <b>all log to the same place</b>. Makes distributed debugging much less painful!</span>}
                icon={MultipleLanguagesIcon}
                iconColor="primary"
                vertical
              />
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
  description: {
    color: "#999"
  }
};

export default withStyles(styles)(PrinciplesSection);
