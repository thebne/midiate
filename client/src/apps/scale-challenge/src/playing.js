import React, { Fragment, useState, useEffect } from 'react'
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import States from './states'

const useStyles = makeStyles((theme) => ({

}));


const PlayingState = ({ currentlyPlayedNotes, setGameState, scale}) => {
    const classes = useStyles()
    const [count, setCount] = useState(0)   

    useEffect(() => {
        console.log(currentlyPlayedNotes)
        if (currentlyPlayedNotes.length == 0) {
            return
        }
        // must only play one note -- improve to check that other notes are just the old ones
        if (currentlyPlayedNotes.length > 1) {
            console.log('more than two notes played', currentlyPlayedNotes)
            setGameState(States.END_FAILURE)
            return
        }
        // if note is correct, increase count; else, game over
    
        setCount(count + 1)
        
      }, [currentlyPlayedNotes]) 

    return (
        <Fragment>
            <Typography variant="h4" gutterBottom>
            Scale: {scale.name} Correct: {count}
            </Typography>
        </Fragment>
    )
}

export default PlayingState;