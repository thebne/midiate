import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Provider } from 'react-redux'
import store from './redux/store'

import Client from './ui/client';

const rootElement = document.getElementById('root')
ReactDOM.render(
    <Provider store={store}>
      <Client />
    </Provider>,
    rootElement
)
