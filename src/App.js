import React from 'react';
import './App.css';
import {breadlistbase} from './breadlist.js'


// either saves the breadlist.js to local server if there isnt any
// value there yet, or it looks at the value in the localserver
// and adds and new recipes that are in breadlist.js but not
// the local server value
let  currentBread = localStorage.getItem('breadlist');
if (!currentBread) {
  localStorage.setItem('breadlist', JSON.stringify(breadlistbase));
} else {
  let parsedBread = JSON.parse(currentBread);
  let basekeylen = Object.keys(breadlistbase).length;
  let keymatchbool = true;
  for (let i = 0; i < basekeylen; i++) {
    if (!Object.keys(parsedBread).includes(Object.keys(breadlistbase)[i])) {
      keymatchbool = false;
    }
  }
  if (!keymatchbool) {
    for (let k = 0; k < Object.keys(breadlistbase).length; k++) {
      if (!Object.keys(parsedBread).includes(Object.keys(breadlistbase)[k])) {
        parsedBread[Object.keys(breadlistbase)[k]] = breadlistbase[Object.keys(breadlistbase)[k]];
      }
    }
  }
  // updates all the ingredients, measurements, and bakers notes from the breadlist.js
  for (let i = 0; i < Object.keys(parsedBread).length; i++) {
    parsedBread[Object.keys(parsedBread)[i]].ingredients = breadlistbase[Object.keys(parsedBread)[i]].ingredients;
    parsedBread[Object.keys(parsedBread)[i]].measurements = breadlistbase[Object.keys(parsedBread)[i]].measurements;
    parsedBread[Object.keys(parsedBread)[i]].notes = breadlistbase[Object.keys(parsedBread)[i]].notes;
  }
  localStorage.setItem('breadlist', JSON.stringify(parsedBread))
}

const rawbreadlist = localStorage.getItem('breadlist');
let breadlist = {};
for (key of JSON.parse(rawbreadlist)) {
  breadlist[key] = JSON.parse(rawbreadlist)[key];
}


class IngredientItem extends React.Component {
  constructor(props) {
    super(props);
    this.textChange = this.props.textChange.bind(this);
    this.bakersPerc = props.bakersPerc
  }

  render() {
    this.base = this.props.base
    this.flourtotal = this.props.flourtotal
    this.ratiotop = this.props.grandparentState.ratiotop;
    this.ratiobottom = this.props.grandparentState.ratiobottom;
    if (this.bakersPerc(this.props.value)) {
            this.bakerperc = <input type="text"
                                    value={Math.round(this.base / this.flourtotal * 100)} />;
            } else {
            this.bakerperc = <input type="text" />;
            }
    return (
      <tr id={this.props.value}>
        <td>{this.props.value}</td>
        <td>
          <input type="text"
                 name={this.props.value + " input " + this.base}
                 value={Math.round(this.props.base * this.ratiotop / this.ratiobottom * 100) / 100}
                 onChange={this.textChange} />
        </td>
        <td>
          {this.bakerperc}
        </td>
      </tr>
    );
  }
}

class IngredientTable extends React.Component {
  constructor(props) {
    super(props);
    this.textChange = this.props.textChange.bind(this);
  }

  bakersPerc(value) {
    if (value.slice(0,5) === "Flour") {
      return false;
    } else if (value.slice(-5) === "Seeds") {
      return false;
    } else if (value.slice(-4) === "Oats") {
      return false;
    } else if (value.slice(0,5) === "Cocoa") {
      return false;
    } else if (value === "Malted Wheat Flakes" || value === "KAF Harvest Grains" || value === "Whole Wheat") {
      return false;
    } else {
      return true;
    }
  }

  render() {
    this.columns = {values: this.props.type["ingredients"],
                    amount: this.props.type["measurements"]};
    this.ratiotop = this.props.parentState.ratiotop;
    this.ratiobottom = this.props.parentState.ratiobottom;
    this.flourtotal = 0;
    for (let i = 0; i < this.columns.values.length; i++) {
      if (!this.bakersPerc(this.columns.values[i])) {
        this.flourtotal = this.flourtotal + this.columns.amount[i];
      }
    }
    this.total = 0;
    for (let i = 0; i < this.columns.values.length; i++) {
      this.total = this.total + this.columns.amount[i];
    }
    return (
      <>
        <table>
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Measurement (g)</th>
              <th>Baker's Percentage</th>
            </tr>
          </thead>
          <tbody>
            {this.columns.values.map((ingredient) =>
            <IngredientItem key={ingredient}
                            grandparentState={this.props.parentState}
                            value={ingredient}
                            base={this.columns.amount[this.columns.values.indexOf(ingredient)]}
                            flourtotal={this.flourtotal}
                            textChange={this.textChange}
                            bakersPerc={this.bakersPerc} />
            )}
          </tbody>
        </table>
        <table>
          <tr>
            <td>Total: </td>
            <td>
              <input type="text"
                     name={this.props.type + " input " + this.total}
                     value={Math.round(this.total * this.ratiotop / this.ratiobottom * 100) / 100}
                     onChange={this.textChange} />
              <label for={this.props.type + " input " + this.total}> g </label>
            </td>
          </tr>
          <tr>
            <td>Total Flour: </td>
            <td>
              <input type="text"
                     name={this.props.type + " input " + this.flourtotal}
                     value={Math.round(this.flourtotal * this.ratiotop / this.ratiobottom * 100) / 100}
                     onChange={this.textChange} />
              <label for={this.props.type + " input " + this.total}> g </label>
            </td>
          </tr>
        </table>
      </>
    );
  }
}

class BakersNotes extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    let notes = this.props.type["notes"];
    return(
      <div className="column">
        <p className="short">Baker's Notes:</p>
        <textarea id="bakernotesarea"
                  rows="1"
                  className="auto-expand notes"
                  value={notes}
                  readOnly>
        </textarea>
        {/*<input type="text"
               id="bakernotes"
               className="notes"
               value={notes} />*/}
      </div>
    );
  }
}

class UsersNotes extends React.Component {
  constructor(props) {
    super(props);
    this.textChange = this.textChange.bind(this);
    this.state = {notes: this.props.type["usernotes"]}; // this
  }
  // whats going on with the state??? if i remove the state
  // parts it breaks even though state isnt used anywhere...

  textChange(e) {
    this.setState({notes: e.target.value}); // and this.
    breadlist[document.getElementById("type").value]["usernotes"] = e.target.value;
    localStorage.setItem('breadlist', JSON.stringify(breadlist));
  }

  render() {
    return(
      <div className="column">
        <p className="short">User's Notes:</p>
        <textarea id="usernotesarea"
                  rows="1"
                  className="auto-expand notes"
                  onChange={this.textChange}
                  value={this.props.type["usernotes"]}>
        </textarea>
        {/*<input type="text"
               id="usernotes"
               className="notes"
               value={this.props.type["usernotes"]}
               onChange={this.textChange}/>*/}
      </div>
    );
  }
}

class MainAppPage extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.textChange = this.textChange.bind(this);
    this.state = {type: "Basic",
                  ratiotop: 1,
                  ratiobottom: 1};
  }

  handleChange(e) {
    this.setState({type: e.target.value,
                   ratiotop: 1,
                   ratiobottom: 1});
    // document.getElementById("userid").setState({notes: breadlist[e.target.value]["usernotes"]});
    // document.getElementById("usernotes").value = breadlist[e.target.value]["usernotes"];
  }

  textChange(e) {
    this.setState({ratiotop: e.target.value,
                   ratiobottom: e.target.name.split(" input ")[1]});
  }

  render() {
    return (
      <>
        <header className="App-header">
          <h1 className="App-header">
            Nancy's Awesome Bread Grimoire
          </h1>
        </header>
        <img src='https://i.kisscc0.com/20180705/gqq/kisscc0-decorative-arts-computer-icons-ornament-over-the-r-decorative-border-divider-5b3da6f8d739a1.4027945815307670968816.png'
             alt='______________________________________________________________' width='900' height='60' />
        <br/>
        <label for="type">Choose a Type of Bread: </label>
        <select name="type" id="type" onChange={this.handleChange}>
          {Object.keys(breadlist).map((key) => <option value={key}>{key}</option>)}
        </select>
        <IngredientTable type={breadlist[this.state.type]}
                         parentState={this.state}
                         textChange={this.textChange} />
        <div className="row">
          <BakersNotes type={breadlist[this.state.type]} />
          <UsersNotes id="userid"
                      type={breadlist[this.state.type]} />
        </div>
      </>
    );
  }
}

function App() {
  return (
    <div className="App">
      <MainAppPage/>
    </div>
  );
}

export default App;

