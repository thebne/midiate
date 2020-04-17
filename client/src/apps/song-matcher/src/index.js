import React, { useEffect, useState, Fragment } from "react";
import styles from "./style.module.css";

export default function Chordify({ currentChords }) {
  const [searchString, setSearchString] = useState("");
  const [isLoaded, setLoaded] = useState(false);
  const [data, setData] = useState("");

  // Issue a REST API query per new chord entered
  useEffect(() => {
    if (currentChords.detection[0]) {
      setLoaded(false);
	  
      let newString = searchString + ",''" + currentChords.detection[0] + "''";
      setSearchString(newString);

      // TODO: Make only first query to fetch from DB and cache it
      /* fetch("http://localhost:5000/api?chords=" + newString.slice(1))
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setLoaded(true);
          setData(data);
        }); */
    }
  }, [currentChords.detection]);

  return (
    <Fragment>
      <h1>{searchString.slice(1).split("'").join("").split(",").join("→")}</h1>
      {isLoaded && Object.keys(data).length !== 0 ? <Table data={data} /> : "No Results" }
    </Fragment>
  );
}

// TODO: should be in some general utils file
export class Table extends React.Component {
  constructor(props) {
    super(props);
    this.getHeader = this.getHeader.bind(this);
    this.getRowsData = this.getRowsData.bind(this);
    this.getKeys = this.getKeys.bind(this);
  }

  getKeys = function () {
    return Object.keys(this.props.data[0]);
  };

  getHeader = function () {
    var keys = this.getKeys();
    return keys.map((key, index) => {
      return <th key={key}> {key.toUpperCase()} </th>;
    });
  };

  getRowsData = function () {
    var items = this.props.data;
    var keys = this.getKeys();
    return items.map((row, index) => {
      return (
        <tr key={index}>
          <RenderRow key={index} data={row} keys={keys} />
        </tr>
      );
    });
  };

  render() {
    return (
      <div>
        <table>
          <thead>
            <tr>{this.getHeader()}</tr>
          </thead>
          <tbody>{this.getRowsData()}</tbody>
        </table>
      </div>
    );
  }
}

const RenderRow = (props) => {
  return props.keys.map((key, index) => {
    return <td key={props.data[key]}>{props.data[key]}</td>;
  });
};
 
// midiate support
export { default as config } from './midiate/config'
export { default as createSelectors } from './midiate/selectors'