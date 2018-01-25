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
import { getDateKey, getDayIdsBetweenDayIds } from "./calendarDb";

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
        if (dateKeysToFill.length > 0) {
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

  renderRow(dateKey, idx) {
    return <div>{dateKey}</div>;
  }

  renderWeekRow(data) {}

  renderData() {
    const { days, dateKeys } = this.state;
    if (dateKeys.length === 0) {
      return <div style={{ margin: 5, color: "red" }}>No Data Yet</div>;
    }

    const allKeys = [...dateKeys];
    const weeks = [];

    // datekeys are ASC
    while (allKeys.length > 0) {
      weeks.push(allKeys.splice(0, 7));
    }

    console.log(weeks);

    return [];

    // loop days, new week every 7th
    // while (allKeys.length > 0) {
    //   const prevWeek = { ...weekRow };
    //
    //   // splice off week
    //   weekKeys = allKeys.splice(-7);
    //
    //   // set week data
    //   weekRow.days = weekKeys.length;
    //   weekRow.total_weight = 0;
    //   weekRow.total_body_fat = 0;
    //   weekRow.date = weekKeys[weekKeys.length - 1];
    //   for (let weekKey of weekKeys) {
    //     const day = days[weekKey];
    //     weekRow.total_weight = parseFloat(
    //       (weekRow.total_weight + parseFloat(day.weight)).toFixed(1),
    //     );
    //     weekRow.total_body_fat = parseFloat(
    //       (weekRow.total_body_fat + parseFloat(day.body_fat)).toFixed(1),
    //     );
    //   }
    //   weekRow.average_weight = parseFloat(
    //     weekRow.total_weight / weekRow.days,
    //   ).toFixed(1);
    //   weekRow.average_body_fat = parseFloat(
    //     weekRow.total_body_fat / weekRow.days,
    //   ).toFixed(1);
    //
    //   if (prevWeek.average_weight) {
    //     console.log(prevWeek.average_weight, weekRow.average_weight);
    //   }
    //
    //   weekRow.weight_delta =
    //     prevWeek.average_weight - weekRow.average_weight || "fo";
    //   weekRow.body_fat_delta =
    //     prevWeek.average_body_fat - weekRow.average_body_fat || "fo";
    //   // push row
    //   rows.push(this.renderRow(weekRow));
    // }
    // return rows;
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
      <div style={styles.appWrap}>
        <div style={styles.titleRowWrap}>{new Date().toString()}</div>
        <div style={styles.inputRowWrap}>
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
        {this.renderData()}
        <div style={{ marginTop: 10 }}>
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
