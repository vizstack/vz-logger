import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from '@material-ui/styles';
import io from 'socket.io-client';

import AppTheme from './theme';
import mainReducer from './redux';


class App extends React.Component<{}, { records: string[] }> {
    store = createStore<any, any, any, any>(mainReducer, applyMiddleware(thunk));

    constructor(props: any) {
        super(props);
        // TODO: Move to redux.
        this.state = {
            records: [],
        };

        const socket = io('http://localhost:4000/frontend');
        socket.on('ServerToFrontend', (msg: string) => {
            this.setState((s: { records: string[] }) => ({ records: [...s.records, msg] }));
        });
    }

    render() {
        return (
            <ReduxProvider store={this.store}>
                <ThemeProvider theme={AppTheme}>
                    <div>
                        <div>Number of records = {this.state.records.length}</div>
                        {this.state.records.map((r, i) => <div key={i}>{r}<br/><br/></div>)}
                    </div>
                </ThemeProvider>
            </ReduxProvider>
        );
    }
}

export default App;
