import React from "react";
import ReactDOM from "react-dom";
import WeightTracker from "./weighttracker";

// Load saved state and instantiate app
const AppWrap = (
  <div className="appWrap">
    <WeightTracker />
  </div>
);

ReactDOM.render(AppWrap, document.getElementById("root"));
