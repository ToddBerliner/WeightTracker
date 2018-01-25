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
[ 1/19 Weight: 165.2 (▾0.2) BF: 18.8% (N/C) ][edit]
[ 1/19 Weight: 165.2 (▾0.2) BF: 18.8% (N/C) ]
[ ... ]

*/
import React, { Component } from "react";
import ReactDOM from "react-dom";
import {
  getDateKey,
  getDayIdsBetweenDayIds,
  getFriendlyDate,
  getDateFromKey,
} from "./calendarDb";

import "./styles.css";

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
    this.clearState = this.clearState.bind(this);
    this.addData = this.addData.bind(this);
    this.renderData = this.renderData.bind(this);
  }

  handleInput() {
    const dateTime = new Date();
    const dateKey = getDateKey(dateTime);

    // get values
    const newDay = {
      date_time: dateTime,
      weight: parseFloat(this.inputWeight.value),
      body_fat: parseFloat(this.inputBodyFat.value),
    };
    // update state
    this.setState(
      state => {
        const newDays = { ...state.days };
        const newDateKeys = [...state.dateKeys];

        // check for gaps and fill in w/ empty days (abstract to DB class)
        const lastDateKey = newDateKeys[newDateKeys.length - 1];
        const dateKeysToFill = getDayIdsBetweenDayIds(lastDateKey, dateKey);
        if (dateKeysToFill && dateKeysToFill.length > 0) {
          dateKeysToFill.forEach(dateKey => {
            newDays[dateKey] = {
              date_time: new Date(parseInt(dateKey, 10)),
              weight: null,
              body_fat: null,
            };
            newDateKeys.push(dateKey);
          });
        }

        const newState = {
          days: { ...newDays, [dateKey]: newDay },
          dateKeys: newDateKeys.includes(dateKey)
            ? newDateKeys
            : [...newDateKeys, dateKey],
        };
        console.log(`new state`, newState);
        return newState;
      },
      // setState callback
      () => {
        // save state
        try {
          console.log(`saving state`, this.state);
          localStorage.setItem("state", JSON.stringify(this.state));
        } catch (err) {
          console.log(`Storage failed: ${err}`);
        }
      },
    );
  }

  clearState() {
    try {
      localStorage.removeItem("state");
      this.setState(this.emptyState);
    } catch (err) {
      console.log(`Clearing state failed: ${err}`);
    }
  }

  renderRow(dateKey, day) {
    return (
      <div key={dateKey}>
        {getFriendlyDate(dateKey)}
        -- Weight: {day.weight || "--"}lbs. -- Body Fat: {day.body_fat || "--"}%
      </div>
    );
  }

  renderWeekRow(dateKey, data) {
    return (
      <div key={dateKey} style={styles.weekRow}>
        [{data.dows.join(",")}] - Avg. Weight: {data.average_weight}lbs. ({data.weight_delta ||
          "--"}lbs.) - Avg. Body Fat: {data.average_body_fat}% ({data.body_fat_delta ||
          "--"}%)
      </div>
    );
  }

  renderData() {
    const { days, dateKeys } = this.state;
    if (dateKeys.length === 0) {
      return <div style={{ margin: 5, color: "red" }}>No Data Yet</div>;
    }

    let counters = { dows: [], weight: 0, body_fat: 0 };
    let lastWeight, lastBodyFat;
    const rows = [];
    dateKeys.forEach((dateKey, idx, arr) => {
      const dow = getDateFromKey(dateKey).getDay();
      const day = days[dateKey];
      // add the day row
      rows.push(this.renderRow(dateKey, day));
      // update the counters
      if (day.weight) {
        counters.dows.push(dow);
        counters.weight = parseFloat(
          (counters.weight + parseFloat(day.weight)).toFixed(1),
        );
      }
      if (day.body_fat) {
        counters.body_fat = parseFloat(
          (counters.body_fat + parseFloat(day.body_fat)).toFixed(1),
        );
      }
      // write the day row
      if (dow === 6 || idx === arr.length - 1) {
        const rowData = {
          dows: counters.dows,
          average_weight: parseFloat(
            counters.weight / counters.dows.length,
          ).toFixed(1),
          average_body_fat: parseFloat(
            counters.body_fat / counters.dows.length,
          ).toFixed(1),
        };
        if (lastWeight) {
          rowData.weight_delta = parseFloat(
            rowData.average_weight - lastWeight,
          ).toFixed(1);
        }
        if (lastBodyFat) {
          rowData.body_fat_delta = parseFloat(
            rowData.average_body_fat - lastBodyFat,
          ).toFixed(1);
        }
        rows.push(this.renderWeekRow(`w${dateKey}`, rowData));
        lastWeight = rowData.average_weight;
        lastBodyFat = rowData.average_body_fat;
        counters = { dows: [], weight: 0, body_fat: 0 };
      }
    });

    rows.reverse();
    return rows;
  }

  addData() {
    let weight = 165.5;
    let body_fat = 19;
    const state = { days: {}, dateKeys: [] };
    for (let i = 1; i < 15; i++) {
      const dateKey = getDateKey(new Date(2018, 0, i));
      const day = {
        date_time: new Date(2018, 0, i),
        weight,
        body_fat,
      };
      weight = parseFloat((weight + 0.1).toFixed(1));
      body_fat = parseFloat((body_fat + 0.1).toFixed(1));
      state.days[dateKey] = day;
      state.dateKeys.push(dateKey);
    }
    this.setState(
      state, // setState callback
      () => {
        // save state
        try {
          localStorage.setItem("state", JSON.stringify(this.state));
        } catch (err) {
          console.log(`Storage failed: ${err}`);
        }
      },
    );
  }

  render() {
    /*
    [ weight: [ ] body fat: [ ]%] [+]
    [ 1/19 Weight: 165.2 (▾0.2) BF: 18.8% (N/C) ]
    [ 1/19 Weight: 165.2 (▾0.2) BF: 18.8% (N/C) ]
    [ ... ]

    Input row + button
    Weeks rows, newest on top
    dateKey -> dayId 0-6 -> group into weeks
    -> per week, get averages of w + bf, calc changes since prev week
    */
    const { days, dateKeys } = this.state;
    return (
      <div className="wtWrap">
        <div className="wtTitle" style={styles.titleRowWrap}>
          {new Date().toString()}
        </div>
        <div className="wtInput" style={styles.inputRowWrap}>
          <div style={styles.inputWrap}>
            <div style={styles.inputTitle}>Weight</div>
            <input
              style={styles.input}
              type="number"
              ref={node => (this.inputWeight = node)}
            />
            <label style={styles.inputLabel}>lbs.</label>
          </div>
          <div style={styles.inputWrap}>
            <div style={styles.inputTitle}>Body Fat</div>
            <input
              style={styles.input}
              type="number"
              ref={node => (this.inputBodyFat = node)}
            />
            <label style={styles.inputLabel}>%</label>
          </div>
          <button type="button" onClick={this.handleInput}>
            +
          </button>
        </div>
        <div className="wtData" ref="wtData">
          {this.renderData()}
        </div>
        <div className="wtFooter" style={{ marginTop: 10 }}>
          <button onClick={this.clearState}>Clear State</button>
          <button onClick={this.addData}>Add Data</button>
        </div>
      </div>
    );
    /*
      <div className="appWrap">
        <InputRow />
        <ResultsGrid />
      </div>
    */
  }
}

const styles = {
  appWrap: {},
  input: {},
  inputRowWrap: {},
  titleRowWrap: {},
};
