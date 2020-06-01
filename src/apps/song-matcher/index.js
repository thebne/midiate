import React, { useRef, useEffect, useState, Fragment } from "react";
import BubbleChart from '@weknow/react-bubble-chart-d3';
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Switch from '@material-ui/core/Switch'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import "./style.module.css"
import { useChords } from '../../api/chords'

export default function Chordify() {
  const [chords, id] = useChords()
  const [transpose, setTranspose] = useState(false)
  const [searchChords, setSearchChords] = useState([]);
  const [isLoaded, setLoaded] = useState(true);
  const [data, setData] = useState([]);
  const prevChord = usePrevious(chords)
  const prevId = usePrevious(id)

  // update search chords
  useEffect(() => {
    if (id === prevId || chords.length || prevChord == null || !prevChord.length) {
      return
    }
    const chord = prevChord[0]
    setSearchChords(searchChords =>  searchChords.concat(chord))
  }, [chords, prevId, prevChord, id]);

  // Issue a REST API query per new chord entered
  useEffect(() => {
    if (!searchChords.length) {
      setLoaded(true)
      setData([])
      return;
    }
    setLoaded(false)
    const searchString = searchChords.join(",")

    // TODO: Make only first query to fetch from DB and cache it
    fetch(`https://chordsearchapp.azurewebsites.net/api/GetAggChords?transpose=${transpose}&chords=${searchString}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setLoaded(true);
        setData(data);
      })
  }, [searchChords, transpose]);

  return (
    <Fragment>
      <Button onClick={function(){setLoaded(false); setSearchChords([])}}>Clear</Button>
      <FormGroup>
          <FormControlLabel label="Search transposed" control={<Switch
          onChange={(e) => setTranspose(e.target.checked)}
          checked={transpose}
        />} />
      </FormGroup>
      <h1>{searchChords.join("→")}</h1>
      {isLoaded && Object.keys(data).length !== 0 
        ? <Chart data={data.map(e => ({label: reverse(e.artist), value: e.count}))} /> 
        : isLoaded ? "No results" : <CircularProgress />
      }
    </Fragment>
  );
}

function reverse(s) {
  if (s.charCodeAt(0) < "א".charCodeAt(0) || s.charCodeAt(0) > "ת".charCodeAt(0))
    return s
  return s.split("").reverse().join("");
}

function Chart({data}) {
  return (
    <BubbleChart
      graph= {{
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      }}
      width={1000}
      height={800}
      padding={5} // optional value, number that set the padding between bubbles
      showLegend={false} // optional value, pass false to disable the legend.
      valueFont={{
            size: 12,
            color: '#fff',
            weight: 'bold',
          }}
      labelFont={{
            size: 16,
            color: '#fff',
            weight: 'bold',
          }}
      data={data}
    />
  )
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
export { default as config } from './config'
