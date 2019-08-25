import * as React from 'react';
import clsx from 'clsx';
import Immutable, { ImmutableObject } from 'seamless-immutable';
import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { createSelector } from 'reselect';

import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import TagsIcon from '@material-ui/icons/LabelOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LevelIcon from '@material-ui/icons/LayersOutlined';  // Layers
import TimeIcon from '@material-ui/icons/Schedule';  // WatchLater

import { Viewer } from '@vizstack/viewer';

import { Record } from '../../schema';
import { AppState } from '../../store';
import * as dashboard from '../../store/dashboard';

/* This smart component is the main dashboard view of the logger interface that allows exploration
 * and filtering of log records streamed from the various program clients. */

type RecordViewerProps = {
    /* React components within opening & closing tags. */
    children?: React.ReactNode,

    /* The record being rendered in this row. */
    record: ImmutableObject<Record>,

    /* Whether this row is currently being pinned in the table of log entries. */
    pinned: boolean,

    /* A function which, when called, pins this row in the log entry table. */
    pin: () => void,

    /* A function which, when called, unpins this row in the log entry table. */
    unpin: () => void,
};

type RecordViewerState = {
    expanded: boolean,
};

class RecordViewer extends React.Component<RecordViewerProps & InternalProps, RecordViewerState> {
    /* Prop default values. */
    static defaultProps = {
        // key: value,
    };

    /**
     * Constructor.
     * @param props
     */
    constructor(props: RecordViewerProps & InternalProps) {
        super(props);
        this.state = {
            expanded: false,
        };
    }

    /**
     * Renderer.
     */
    render() {
        const { classes, record, pinned, pin, unpin } = this.props;
        const { timestamp, filePath, lineNumber, columnNumber, functionName, loggerName, level, tags, view } = record;

        const { expanded } = this.state;

        const date = new Date(timestamp);

        return (
            <Grid item container direction="row">
                <Grid item container direction="column" className={classes.buttonGutter}>
                    <Grid item>
                        {pinned ? (
                            <IconButton
                                className={classes.button}
                                aria-label="unlock"
                                onClick={() => unpin()}>
                                <LockIcon />
                            </IconButton>
                        ) : (
                            <IconButton
                                className={classes.button}
                                aria-label="lock"
                                onClick={() => pin()}>
                                <LockOpenIcon />
                            </IconButton>
                        )}
                    </Grid>
                    <Grid item>
                        {expanded ? (
                            <IconButton
                                className={classes.button}
                                aria-label="collapse"
                                onClick={() => this.setState({expanded: false})}>
                                <ExpandLessIcon />
                            </IconButton>
                        ) : (
                            <IconButton
                                className={classes.button}
                                aria-label="expand"
                                onClick={() => this.setState({expanded: true})}>
                                <ExpandMoreIcon />
                            </IconButton>
                        )}
                    </Grid>
                </Grid>
                <Grid item container direction="row" xs>
                    <Grid item xs={12} className={clsx({
                        [classes.viewerBox]: true,
                        [classes.viewerBoxCollapsed]: !expanded, 
                    })}>
                        <Viewer view={view.asMutable({deep: true})} />
                    </Grid>
                    <Grid item xs className={classes.metadata}>
                        {`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()}.${date.getMilliseconds()}`}
                    </Grid>
                    <Grid item xs className={classes.metadata}>
                        {filePath}
                    </Grid>
                    <Grid item xs className={classes.metadata}>
                        {lineNumber}
                    </Grid>
                    <Grid item xs className={classes.metadata}>
                        {columnNumber}
                    </Grid>
                </Grid>
            </Grid>
        )
    }
}

const styles = (theme: Theme) =>
    createStyles({
        metadata: {
            color: theme.color.grey.d2,
        },
        viewerBox: {
        },
        viewerBoxCollapsed: {
            maxHeight: 50,
            overflow: 'hidden',
        },
        buttonGutter: {
            width: '50px',
            height: '100%',
            textAlign: 'center',
            paddingTop: 10,
        },
        button: {
        }
    });

type InternalProps = WithStyles<typeof styles>;

export default withStyles(styles)(RecordViewer) as React.ComponentType<RecordViewerProps>;
