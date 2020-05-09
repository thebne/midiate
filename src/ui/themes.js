import { createMuiTheme } from '@material-ui/core/styles'

const commonTheme = {
}

// easy mode is either on or off
const defaultMode = {
  easyMode: false,
}
const easyMode = {
  easyMode: true,
  transitions: {
    create: () => 'none',
  },
	overrides: {
		// Name of the component 
		MuiCssBaseline: {
			// Name of the rule
			'@global': {
				'*, *::before, *::after': {
					transition: 'none !important',
					animation: 'none !important',
				},
			},
		},
	},
}
// palette is either 'dark' or 'light'
const lightTheme = {palette: {type: 'light'}}
const darkTheme = {palette: {type: 'dark'}}

export default [
  {
    theme: createMuiTheme({...commonTheme, ...lightTheme, ...defaultMode}),
    name: "Light Theme",
    description: "Default theme, full animations",
  },
  {
    theme: createMuiTheme({...commonTheme, ...darkTheme, ...defaultMode}),
    name: "Dark Theme",
    description: 'Dark theme ("Dark Mode"), full animations',
  },
  {
    theme: createMuiTheme({...commonTheme, ...lightTheme, ...easyMode}),
    name: "Easy Light Theme",
    description: "Default theme, friendly for slower browsers",
  },
  {
    theme: createMuiTheme({...commonTheme, ...darkTheme, ...easyMode}),
    name: "Easy Dark Theme",
    description: 'Dark theme ("Dark Mode"), friendly for slower browsers',
  },
]
