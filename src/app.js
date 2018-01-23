import React from "react";
import ReactDOM from "react-dom";
import WeightTracker from "./weighttracker";

const styles = {
  appWrap: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
};

// Load saved state and instantiate app
const AppWrap = (
  <div style={styles.appWrap}>
    <WeightTracker />
  </div>
);

ReactDOM.render(AppWrap, document.getElementById("root"));
