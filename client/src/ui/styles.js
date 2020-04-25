import { makeStyles } from '@material-ui/core/styles'

export default makeStyles(theme => ({
  root: {
    position: 'fixed',
    width: '100%',
    height: '100%',
  },

  toolbar: {
    display: 'flex',
    itemAlign: 'middle',
  },
  title: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
  },

	titleSecondaryText: {
		paddingLeft: theme.spacing(3),
    '& svg': {
      verticalAlign: 'middle',
      marginRight: theme.spacing(1),
    },
	},

  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarSpacer: theme.mixins.toolbar,

  logo: {
    verticalAlign: 'middle',
    marginRight: '1vw',
    cursor: "pointer",
    width: '50px',
    height: '50px',
    tapHighlightColortap: "transparent",
  },

  content: {
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    flexGrow: 1,
    position: 'relative',
    '@global > .MuiContainer-root': {
      padding: theme.spacing(4),
    }
  },
  infoChip: {
    marginLeft: theme.spacing(1.5),
  },

  '@global': {
    '.hasMidiInputs': {
    },
    '.noMidiInputs': {
      '& .app-bar': {
        background: '#666' 
      }
    },
  }
}))
