import React, { Fragment, useState, useEffect } from 'react'
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import States from './states'

const useStyles = makeStyles((theme) => ({

}));


const FailedState = () => {
 
    return (
        <Fragment>
            <Typography variant="h4" gutterBottom>
            Gave Over :( Try Again.
            </Typography>
        </Fragment>
    )
}

export default FailedState;