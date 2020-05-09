import React, { useRef, useEffect, useState, Fragment } from "react";
import Button from '@material-ui/core/Button'
import "./style.module.css"
import { useChords } from '../../api/chords'

export default function Chordify() {
  const [chords, id] = useChords()
  const [searchString, setSearchString] = useState('');
  const [isLoaded, setLoaded] = useState(false);
  const [data, setData] = useState('');
  const prevChord = usePrevious(chords)
  const prevId = usePrevious(id)

  // Issue a REST API query per new chord entered
  useEffect(() => {
    if (id === prevId || chords.length || prevChord == null || !prevChord.length) {
      return
    }
    const chord = prevChord[0]
    setLoaded(false)
	  
    let newString = searchString + "," + chord;
    setSearchString(newString);

    // TODO: Make only first query to fetch from DB and cache it
    fetch("http://localhost:5000/api?chords=" + newString.slice(1))
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setLoaded(true);
        setData(data);
      });
  }, [chords, prevChord, id]);

  return (
    <Fragment>
      <Button onClick={function(){setLoaded(false); setSearchString('')}}>Clear</Button>
      <h1>{searchString.slice(1).split("'").join("").split(",").join("→")}</h1>
      {isLoaded && Object.keys(data).length !== 0 ? <Table data={data} /> : "No Results" }
    </Fragment>
  );
}

// TODO: maybe move to some general resource file
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

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
 
// midiate support
export { default as config } from './midiate/config'
