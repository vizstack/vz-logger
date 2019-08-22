import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { Provider as ReduxProvider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core/styles';
import io from 'socket.io-client';

import AppTheme from './theme';
import { appReducer } from './store';

import * as dashboard from './store/dashboard';
import Dashboard from './components/Dashboard';

class App extends React.Component<{}, { records: string[] }> {
    store = createStore(appReducer, composeWithDevTools(applyMiddleware(thunk)));
    socket = io('http://localhost:4000/frontend');

    constructor(props: any) {
        super(props);

        // Reconstruct the log record and add to store.
        this.socket.on('ServerToFrontend', (msg: string) => {
            const record = JSON.parse(msg);
            this.store.dispatch(dashboard.actions.addRecordAction(record));
        });
    }

    render() {
        return (
            <ReduxProvider store={this.store}>
                <MuiThemeProvider theme={AppTheme}>
                    <Dashboard />
                </MuiThemeProvider>
            </ReduxProvider>
        );
    }
}

export default App;
