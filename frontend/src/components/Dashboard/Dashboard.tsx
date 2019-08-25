import * as React from 'react';
import clsx from 'clsx';
import Immutable from 'seamless-immutable';
import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { createSelector } from 'reselect';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import TagsIcon from '@material-ui/icons/LabelOutlined';
import LevelIcon from '@material-ui/icons/LayersOutlined';  // Layers
import TimeIcon from '@material-ui/icons/Schedule';  // WatchLater

import { assemble, Text } from '@vizstack/js';
import { InteractionProvider, InteractionManager, Viewer } from '@vizstack/viewer';

import RecordViewer from '../RecordViewer';
import { Record } from '../../schema';

import { AppState } from '../../store';
import * as dashboard from '../../store/dashboard';

/* This smart component is the main dashboard view of the logger interface that allows exploration
 * and filtering of log records streamed from the various program clients. */

type DashboardProps = {
    /* React components within opening & closing tags. */
    children?: React.ReactNode;
};

type SortKey = keyof Record;

type DashboardState = {
    pinnedIdxs: Set<number>,
    sortBy: SortKey,
    sortReverse: boolean,
};

/**
 * A functional component which renders an interactive column header in the table of log entries.
 * Clicking the header will sort by that key or toggle the sort order if the key is already being
 * used.
 */
function Header(props: {
    text: string,
    sortKey: SortKey,
    sortBy: SortKey,
    sortReverse: boolean,
    setSortBy: (sortBy: SortKey) => void,
    toggleSortReverse: () => void,
} & WithStyles<typeof styles>) {
    const { text, sortKey, classes, sortBy, sortReverse, setSortBy, toggleSortReverse } = props;

    return (
        <Grid item className={classes.header} xs onClick={() => {
            if (sortBy !== sortKey) {
                setSortBy(sortKey);
            }
            else {
               toggleSortReverse();
            }
        }} >
            <Typography className={classes.headerText} variant='subtitle2'>{text}</Typography>
            {sortBy === sortKey ? (
                sortReverse ? <ArrowUpwardIcon className={classes.headerIcon} /> : <ArrowDownwardIcon className={classes.headerIcon} />
            ) : null}
        </Grid>
    )
}

class Dashboard extends React.Component<DashboardProps & InternalProps, DashboardState> {
    /* Prop default values. */
    static defaultProps = {
        // key: value,
    };

    _im: InteractionManager;

    /**
     * Constructor.
     * @param props
     */
    constructor(props: DashboardProps & InternalProps) {
        super(props);
        this.state = {
            pinnedIdxs: new Set(),
            sortBy: 'timestamp',
            sortReverse: false,
        };
        this._im = new InteractionManager();
    }

    /**
     * Change which key is used to sort the table of log entries.
     * @param sortBy 
     */
    setSortBy(sortBy: SortKey) {
        this.setState({sortBy, sortReverse: false});
    }

    /**
     * Toggle whether the table of log entries is presented in reverse order.
     */
    toggleSortReverse() { 
        this.setState((state) => ({sortReverse: !state.sortReverse}));
    }

    /**
     * Renderer.
     */
    render() {
        const { classes, records } = this.props;
        const { pinnedIdxs, sortBy, sortReverse } = this.state;

        const headerProps = {
            classes, sortBy, sortReverse, 
            setSortBy: (sortBy: SortKey) => this.setSortBy(sortBy),
            toggleSortReverse: () => this.toggleSortReverse(),
        }

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
                    <InteractionProvider manager={this._im}>
                        <Grid container direction="row">
                            <Grid item className={classes.buttonGutter} />
                            <Header 
                                text="Timestamp" 
                                sortKey="timestamp" 
                                {...headerProps} />
                            <Header 
                                text="File Path" 
                                sortKey="filePath" 
                                {...headerProps} />
                            <Header 
                                text="Line Number" 
                                sortKey="lineNumber" 
                                {...headerProps} />
                            <Header 
                                text="Column Number" 
                                sortKey="columnNumber" 
                                {...headerProps} />
                        </Grid>
                        <Grid container direction="column" justify="flex-start" alignItems="flex-start" >
                            {records.map((record, idx) => ({
                                idx,
                                record,
                                component: (
                                    <RecordViewer
                                        key={record.timestamp}
                                        record={record}
                                        pinned={pinnedIdxs.has(idx)}
                                        pin={() => this.setState((state) => ({
                                            pinnedIdxs: new Set(state.pinnedIdxs).add(idx),
                                        }))}
                                        unpin={() => this.setState((state) => {
                                            const pinnedIdxs = new Set(state.pinnedIdxs);
                                            pinnedIdxs.delete(idx);
                                            return { pinnedIdxs, };
                                        })}
                                    />
                                )
                            }))
                            .sort((r1, r2) => {
                                if (pinnedIdxs.has(r1.idx) && !pinnedIdxs.has(r2.idx)) {
                                    return -1;
                                }
                                if (pinnedIdxs.has(r2.idx) && !pinnedIdxs.has(r1.idx)) {
                                    return 1;
                                }
                                if (r1.record[sortBy] < r2.record[sortBy]) {
                                    return sortReverse ? 1 : -1;
                                }
                                if (r1.record[sortBy] > r2.record[sortBy]) {
                                    return sortReverse ? -1 : 1;
                                }
                                return 0;
                            })
                            .map(({component}) => component)}
                        </Grid>
                    </InteractionProvider>
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
        },
        header: {
            display: 'flex',
            alignItems: 'center',
        },
        headerText: {
            flexGrow: 1,
        },
        headerIcon: {
            marginRight: '10px',
        },
        buttonGutter: {
            width: '50px',
        },
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
