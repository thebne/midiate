import React, { Fragment } from 'react'

export default ({lastEvent}) => {
  return <Fragment>
          {lastEvent && lastEvent.note
            ? lastEvent.note 
            : <i style={{color: '#ccc'}}>note</i>}
    </Fragment>
}
