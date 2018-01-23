/*
React app w/ state saved to local storage

Daily input of weight, body fat %
Calculations (display only) at 1 week intervals
- avg weight, avg fat, change

State
* days: [{day, weight, body, fat}...]

Flow
* enter weight, body fat, tap "+"
* handleInput(weight, body_fat) (redraw happens)
(TBD: edit existing day)

Display
[ weight: [ ] body fat: [ ]%] [+]
[ 1/19 Weight: 165.2 (▾0.2) BF: 18.8% (N/C) ]
[ 1/19 Weight: 165.2 (▾0.2) BF: 18.8% (N/C) ]
[ ... ]

*/
import React, { Component } from "react";
import ReactDOM from "react-dom";

// TODO: autoprefixer, create react app (CRA)

export default class WeightTracker extends Component {
  constructor(props) {
    super(props);
    let state;
    try {
      state = JSON.parse(localStorage.getItem("state"));
    } catch (err) {
      state = null;
    }
    this.emptyState = {
      days: {},
      dateKeys: [],
    };
    this.state = state || this.emptyState;

    // TODO: refactor the class methods to class properties
    // as arrow functions with auto-scoping
    this.handleInput = this.handleInput.bind(this);
    this.getDateKey = this.getDateKey.bind(this);
    this.clearState = this.clearState.bind(this);
  }

  handleInput = () => {
    const dateKey = this.getDateKey();

    // get values
    const newDay = {
      weight: this.inputWeight.value,
      body_fat: this.inputBodyFat.value,
    };
    // update state
    this.setState(
      state => {
        const newState = {
          days: { ...state.days, [dateKey]: newDay },
          dateKeys: state.dateKeys.includes(dateKey)
            ? state.dateKeys
            : [...state.dateKeys, dateKey],
        };
        return newState;
      },
      () => {
        // save state
        try {
          localStorage.setItem("state", JSON.stringify(this.state));
        } catch (err) {
          console.log(`Storage failed: ${err}`);
        }
      },
    );
  };

  getDateKey(date = new Date()) {
    const keyMonth = date.getMonth();
    const keyDate = date.getDate();
    const keyYear = date.getFullYear();
    const dateKey = new Date(keyYear, keyMonth, keyDate).getTime().toString();
    return dateKey;
  }

  clearState() {
    try {
      localStorage.removeItem("state");
      this.setState(this.emptyState);
    } catch (err) {
      console.log(`Clearing state failed: ${err}`);
    }
  }

  render() {
    /*
    [ weight: [ ] body fat: [ ]%] [+]
    [ 1/19 Weight: 165.2 (▾0.2) BF: 18.8% (N/C) ]
    [ 1/19 Weight: 165.2 (▾0.2) BF: 18.8% (N/C) ]
    [ ... ]

    Input row + button
    Weeks rows, newest on top
    */
    const { days, dateKeys } = this.state;
    return (
      <div style={styles.appWrap}>
        Weight:
        <input type="number" ref={node => (this.inputWeight = node)} />
        Body Fat:
        <input type="number" ref={node => (this.inputBodyFat = node)} />%
        <button type="button" onClick={this.handleInput}>
          +
        </button>
        {dateKeys.map(key => {
          console.log(key, days[key]);
          return (
            <div key>
              {key} => Weight: {days[key].weight}, Body Fat:{" "}
              {days[key].body_fat}%
            </div>
          );
        })}
        <button onClick={this.clearState}>Clear State</button>
      </div>
    );
  }
}
