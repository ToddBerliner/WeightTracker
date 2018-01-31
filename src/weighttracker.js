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
  getFriendlyTime,
  getDateFromKey,
  getMinMonDay,
} from "./calendarDb";

import "./styles.css";
import chart from "../art/chart.png";

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
      weight: 0,
      bodyfat: 0,
    };
    this.state = state || this.emptyState;

    // TODO: refactor the class methods to class properties
    // as arrow functions with auto-scoping
    this.handleInput = this.handleInput.bind(this);
    this.clearState = this.clearState.bind(this);
    this.addData = this.addData.bind(this);
    this.renderData = this.renderData.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange(event) {
    const { value, name } = event.target;
    this.setState(state => {
      return { ...state, [name]: value };
    });
  }

  handleInput() {
    const dateTime = new Date();
    const dateKey = getDateKey(dateTime);

    // get values
    const newDay = {
      date_time: dateTime,
      weight: this.state.weight,
      body_fat: this.state.bodyfat,
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

  renderRow(dateKey, day) {
    return (
      <div key={dateKey} className="wtDayRow">
        {getFriendlyDate(dateKey)}
        -- Weight: {day.weight || "--"}lbs. -- Body Fat: {day.body_fat || "--"}%
      </div>
    );
  }

  renderWeekRow(dateKey, data) {
    const { month, date } = getMinMonDay(dateKey.replace("w", ""), true);
    const {
      average_weight,
      average_body_fat,
      weight_delta,
      body_fat_delta,
    } = data;
    let weight_delta_class = "",
      body_fat_delta_class = "";
    if (weight_delta > 0) {
      weight_delta_class = "wtUp";
    }
    if (weight_delta < 0) {
      weight_delta_class = "wtDown";
    }
    if (body_fat_delta > 0) {
      body_fat_delta_class = "wtUp";
    }
    if (body_fat_delta < 0) {
      body_fat_delta_class = "wtDown";
    }
    return (
      <div key={dateKey} className="wtWeekRow">
        <div className="wtRowDate">
          {month}
          <div className="wtRowDateDate">{date}</div>
        </div>
        <div className="wtRowData weight">
          {average_weight || <div className="noData data">No data</div>}
        </div>
        <div className={`wtRowChange ${weight_delta_class}`}>
          {weight_delta ? (
            Math.abs(weight_delta)
          ) : (
            <div className="noData change">No data</div>
          )}
        </div>
        <div className="wtRowData bodyfat">
          {average_body_fat || <div className="noData data">No data</div>}
        </div>
        <div className={`wtRowChange ${body_fat_delta_class}`}>
          {body_fat_delta ? (
            Math.abs(body_fat_delta)
          ) : (
            <div className="noData change">No data</div>
          )}
        </div>
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
      // write the week row
      if (dow === 6 || idx === arr.length - 1) {
        const rowData = {
          dows: counters.dows,
          average_weight:
            counters.dows.length > 0
              ? parseFloat(counters.weight / counters.dows.length).toFixed(1)
              : null,
          average_body_fat:
            counters.dows.length > 0
              ? parseFloat(counters.body_fat / counters.dows.length).toFixed(1)
              : null,
        };
        if (lastWeight && rowData.average_weight) {
          rowData.weight_delta = parseFloat(
            rowData.average_weight - lastWeight,
          ).toFixed(1);
        } else {
          rowData.weight_delta = null;
        }
        if (lastBodyFat && rowData.average_body_fat) {
          rowData.body_fat_delta = parseFloat(
            rowData.average_body_fat - lastBodyFat,
          ).toFixed(1);
        } else {
          rowData.body_fat_delta = null;
        }
        // push the new row in
        rows.push(this.renderWeekRow(`w${dateKey}`, rowData));
        // update the stats for subsequent comparrison
        lastWeight = rowData.average_weight;
        lastBodyFat = rowData.average_body_fat;
        // reset the counters for the week
        counters = { dows: [], weight: 0, body_fat: 0 };
      }
    });

    rows.reverse();
    return rows;
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
    const { days, dateKeys, weight, bodyfat } = this.state;
    return (
      /* structure should be here */
      <div className="wtWrap">
        <div className="wtTitleRow">
          <WtTitle />
        </div>
        <div className="wtInputRow">
          <div className="wtInputsOuterWrap">
            <div className="wtInputsInnerWrap">
              <div className="wtInputs">
                <div className="wtInputWrap">
                  <WtInputItem
                    title="Weight"
                    type="weight"
                    units="LBS."
                    value={weight}
                    name="weight"
                    onInputChange={this.onInputChange}
                  />
                  <WtInputItem
                    title="Body Fat"
                    type="bodyfat"
                    units="%."
                    value={bodyfat}
                    name="bodyfat"
                    onInputChange={this.onInputChange}
                  />
                </div>
              </div>
            </div>
            <button
              className="wtInputButton"
              type="button"
              onClick={this.handleInput}
            >
              +
            </button>
          </div>
        </div>
        <div className="wtDataRow" ref="wtData">
          <div className="wtDataHeader">
            <WtDataHeaderLabel
              label="Avg. Weight"
              units="LBS."
              className="wtHeaderLabel weight"
            />
            <WtDataHeaderLabel
              label="Avg. Body Fat"
              units="%"
              className="wtHeaderLabel bodyfat"
            />
          </div>
          <div className="wtDataBody">{this.renderData()}</div>
          <div className="wtDataChart">
            <img src={chart} />
          </div>
        </div>
        <div className="wtFooter" style={{ marginTop: 10 }}>
          <button onClick={this.clearState}>Clear State</button>
          <button onClick={this.addData}>Add Data</button>
        </div>
      </div>
    );
  }
}

const WtTitle = props => {
  // TODO: accept variety of props with a default prop of date
  const displayDate = getFriendlyDate(); // expects timestamp
  const displayTime = getFriendlyTime(); // expects timestamp
  return (
    <div className="wtTitle">
      <div className="wtTitleDate">{displayDate}</div>
      <div className="wtTitleTime">{displayTime}</div>
    </div>
  );
};

const WtInputItem = props => {
  return (
    <div className={`wtInputItem ${props.type}`}>
      <div className="wtInputTitle">{props.title}</div>
      <div className="wtInputAndLabel">
        <input
          className={`wtInputInput ${props.type}`}
          type="number"
          ref={props.innerRef}
          value={props.value}
          onChange={props.onInputChange}
          name={props.name}
        />
        <div className="wtInputUnits">{props.units}</div>
      </div>
    </div>
  );
};
const WtDataHeaderLabel = props => (
  <div className={props.className}>
    {props.label} <span className="wtHeaderLabelUnits">({props.units})</span>
  </div>
);
const wtRow = props => {};
const wtWeekRow = props => {};

const styles = {
  appWrap: {},
  input: {},
  inputRowWrap: {},
  titleRowWrap: {},
};
