import React from 'react'

export const CHROME_EXTENSION = !!process.env.REACT_APP_CHROME_EXTENSION

// Higher-Order Component
export default function withChromeExtension(component) {
  if (CHROME_EXTENSION)
    return () => React.createElement(component)

  return () => React.createElement(React.Fragment)
}

export const Css = withChromeExtension(() => {
  return <React.Fragment>
    {require('./index.css').default}
  </React.Fragment>
})
