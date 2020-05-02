import React, { Fragment, useState, useEffect } from 'react'
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import { Scale, Range, Note } from "@tonaljs/tonal";
import States from './states'

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));


const StartingState = ({ setScale, setGameState }) => {
    const classes = useStyles()
    const [scaleType, setScaleType] = useState('')
    const [scaleRoot, setScaleRoot] = useState('')

    const chromaticOctaveNotes = Range.chromatic(['C0','B0']).map(Note.pitchClass)

    return (
        <Fragment>
            <Typography variant="h4" gutterBottom>
            Welcome! Choose a scale.
            </Typography>
            <FormControl className={classes.formControl}>
                <InputLabel>Scale Root</InputLabel>
                <Select
                    value={scaleRoot}
                    onChange={(event) => setScaleRoot(event.target.value)} >
                    {chromaticOctaveNotes.map(n => (
                    <MenuItem key={n} value={n}>{n}</MenuItem>
                    ))}
                </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                <InputLabel>Scale Type</InputLabel>
                <Select
                    value={scaleType}
                    onChange={(event) => setScaleType(event.target.value)} >
                    <MenuItem key={'major'} value={'major'}>Major</MenuItem>
                    <MenuItem key={'minor'} value={'minor'}>Minor</MenuItem>
                </Select>
            </FormControl>
            <Button variant="contained"
            onClick={() => {
                setScale(Scale.get(`${scaleRoot} ${scaleType}`)) 
                setGameState(States.PLAYING)
            }}>
            Play!
            </Button>
        </Fragment>
    )
}

export default StartingState;