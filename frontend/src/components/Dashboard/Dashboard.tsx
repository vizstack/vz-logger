import * as React from 'react';
import clsx from 'clsx';
import Immutable from 'seamless-immutable';
import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { createSelector } from 'reselect';

import { AppState } from '../../store';
import * as dashboard from '../../store/dashboard';

/* This [pure dumb / stateful dumb / smart] component ___. */
type ExampleProps = {
    /* React components within opening & closing tags. */
    children?: React.ReactNode;
};

type ExampleState = {};

class Example extends React.Component<ExampleProps & InternalProps, ExampleState> {
    /* Prop default values. */
    static defaultProps = {
        // key: value,
    };

    /**
     * Constructor.
     * @param props
     */
    constructor(props: ExampleProps & InternalProps) {
        super(props);
        this.state = Immutable({});
    }

    /**
     * Renderer.
     */
    render() {
        const { classes, records } = this.props;
        return (
            <div
                className={clsx(classes.container, {
                    [classes.optional]: false,
                })}
            >
                {records.map((record) => <p key={record.timestamp}>{JSON.stringify(record)}</p>)}
            </div>
        );
    }
}

const styles = (theme: Theme) =>
    createStyles({
        // cssKey: value,
        container: {},
        optional: {},
    });

function mapStateToProps() {
    const recordsSelector = dashboard.selectors.recordsFactory();
    return (state: AppState, props: ExampleProps) => ({
        records: recordsSelector(state),
    });
}

function mapDispatchToProps(dispatch: Dispatch) {
    return bindActionCreators(
        {
            clearRecords: dashboard.actions.clearAllRecordsAction,
        },
        dispatch,
    );
}

type InternalProps = WithStyles<typeof styles> &
    ReturnType<ReturnType<typeof mapStateToProps>> &
    ReturnType<typeof mapDispatchToProps>;

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(styles)(Example)) as React.ComponentType<ExampleProps>;
