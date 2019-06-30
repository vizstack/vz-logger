import * as React from 'react';
import clsx from 'clsx';
import Immutable from 'seamless-immutable';
import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { createSelector } from 'reselect';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TagsIcon from '@material-ui/icons/LabelOutlined';
import LevelIcon from '@material-ui/icons/LayersOutlined';  // Layers
import TimeIcon from '@material-ui/icons/Schedule';  // WatchLater

import { AppState } from '../../store';
import * as dashboard from '../../store/dashboard';

/* This smart component is the main dashboard view of the logger interface that allows exploration
 * and filtering of log records streamed from the various program clients. */

type DashboardProps = {
    /* React components within opening & closing tags. */
    children?: React.ReactNode;
};

type DashboardState = {};

class Dashboard extends React.Component<DashboardProps & InternalProps, DashboardState> {
    /* Prop default values. */
    static defaultProps = {
        // key: value,
    };

    /**
     * Constructor.
     * @param props
     */
    constructor(props: DashboardProps & InternalProps) {
        super(props);
        this.state = Immutable({});
    }

    /**
     * Renderer.
     */
    render() {
        const { classes, records } = this.props;
        return (
            <div className={classes.container}>
                {/* Sidebar ==================================================================== */}
                <div className={classes.sidebar}>
                    <Typography variant='h4' gutterBottom>
                        vz-logger
                    </Typography>
                    {/* Tags ------------------------------------------------------------------- */}
                    <div className={classes.subtitleWithIcon}>
                        <TagsIcon className={classes.icon} />
                        <Typography variant='subtitle2'>Tags</Typography>
                    </div>
                    <div className={classes.spacer}/>
                    {/* Level ------------------------------------------------------------------ */}
                    <div className={classes.subtitleWithIcon}>
                        <LevelIcon className={classes.icon}/>
                        <Typography variant='subtitle2'>Level</Typography>
                    </div>
                    <div className={classes.spacer}/>
                    {/* Time ------------------------------------------------------------------- */}
                    <div className={classes.subtitleWithIcon}>
                        <TimeIcon className={classes.icon}/>
                        <Typography variant='subtitle2'>Time</Typography>
                    </div>
                </div>
                {/* Canvas ===================================================================== */}
                <div className={classes.canvas}>
                    Number of Records: {records.length}
                    {records.map((record) => <p key={record.timestamp}>{JSON.stringify(record)}</p>)}
                </div>
            </div>
        );
    }
}

// {records.map((record) => <p key={record.timestamp}>{JSON.stringify(record)}</p>)}

const styles = (theme: Theme) =>
    createStyles({
        container: {
            flexGrow: 1,
            display: 'flex',
            padding: theme.scale(16),
        },
        sidebar: {
            minWidth: theme.scale(256),
        },
        canvas: {
            flexGrow: 1,
            backgroundColor: theme.color.white,
            padding: theme.scale(16),
            borderRadius: theme.shape.borderRadius,
        },
        subtitleWithIcon: {
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none',
        },
        icon: {
            marginRight: theme.scale(8),
        },
        spacer: {
            height: theme.scale(32),
        }
    });

function mapStateToProps() {
    const recordsSelector = dashboard.selectors.recordsFactory();
    return (state: AppState, props: DashboardProps) => ({
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
)(withStyles(styles)(Dashboard)) as React.ComponentType<DashboardProps>;
