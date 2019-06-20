import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from '@material-ui/styles';

import AppTheme from './theme';
import mainReducer from './redux';

class App extends React.Component {
    store = createStore<any, any, any, any>(mainReducer, applyMiddleware(thunk));
    render() {
        return (
            <ReduxProvider store={this.store}>
                <ThemeProvider theme={AppTheme}>
                    <div>Insert App Here</div>
                </ThemeProvider>
            </ReduxProvider>
        );
    }
}

export default App;
