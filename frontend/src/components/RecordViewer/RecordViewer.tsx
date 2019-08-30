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

import { Text, Flow, Icon, Sequence, Token } from '@vizstack/js';
import { InteractionProvider, InteractionManager, Viewer } from '@vizstack/viewer';

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

    togglePinned: () => void

    expanded: boolean,

    toggleExpanded: () => void,
};

type RecordViewerState = {
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
        this.state = {};
    }

    /**
     * Renderer.
     */
    render() {
        const { classes, record, pinned, togglePinned, expanded, toggleExpanded } = this.props;
        const { timestamp, filePath, lineNumber, columnNumber, functionName, loggerName, level, tags, view } = record;

        const date = new Date(timestamp);

        return (
            <div className={classes.root}>
                <div className={clsx({
                    [classes.box]: true,
                    [classes.viewerBoxCollapsed]: !expanded, 
                })}>
                    <Viewer view={view.asMutable({deep: true})} />
                </div>
                <div className={clsx(classes.box, classes.metadata)}>
                    <Grid item container direction="row" alignItems="center">
                        <Grid item>
                            <Typography variant='caption' color='textSecondary'>
                                {`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()}.${date.getMilliseconds()} from ${filePath}:${lineNumber}`}
                            </Typography>
                        </Grid>
                        <Grid item>
                            {pinned ? (
                                <IconButton
                                    className={classes.button}
                                    aria-label="unlock"
                                    onClick={() => togglePinned()}>
                                    <LockIcon className={classes.icon} />
                                </IconButton>
                            ) : (
                                <IconButton
                                    className={classes.button}
                                    aria-label="lock"
                                    onClick={() => togglePinned()}>
                                    <LockOpenIcon className={classes.icon} />
                                </IconButton>
                            )}
                        </Grid>
                        <Grid item>
                            {expanded ? (
                                <IconButton
                                    className={classes.button}
                                    aria-label="collapse"
                                    onClick={() => toggleExpanded()}>
                                    <ExpandLessIcon className={classes.icon} />
                                </IconButton>
                            ) : (
                                <IconButton
                                    className={classes.button}
                                    aria-label="expand"
                                    onClick={() => toggleExpanded()}>
                                    <ExpandMoreIcon className={classes.icon} />
                                </IconButton>
                            )}
                        </Grid>
                    </Grid>
                </div>
            </div>
            /* <Grid container direction="row">
                <Grid item className={clsx({
                    [classes.viewerBox]: true,
                    [classes.viewerBoxCollapsed]: !expanded, 
                })}>
                </Grid>
                <Grid item container direction="row" alignItems="center">
                    <Grid item>
                        {pinned ? (
                            <IconButton
                                className={classes.button}
                                aria-label="unlock"
                                onClick={() => togglePinned()}>
                                <LockIcon className={classes.icon} />
                            </IconButton>
                        ) : (
                            <IconButton
                                className={classes.button}
                                aria-label="lock"
                                onClick={() => togglePinned()}>
                                <LockOpenIcon className={classes.icon} />
                            </IconButton>
                        )}
                    </Grid>
                    <Grid item>
                        {expanded ? (
                            <IconButton
                                className={classes.button}
                                aria-label="collapse"
                                onClick={() => toggleExpanded()}>
                                <ExpandLessIcon className={classes.icon} />
                            </IconButton>
                        ) : (
                            <IconButton
                                className={classes.button}
                                aria-label="expand"
                                onClick={() => toggleExpanded()}>
                                <ExpandMoreIcon className={classes.icon} />
                            </IconButton>
                        )}
                    </Grid>
                    <Grid item>
                        <Typography variant='caption' color='textSecondary'>
                            {`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()}.${date.getMilliseconds()} from ${filePath}:${lineNumber}`}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid> */

            // <Grid container direction="row">
            //     <Grid item container direction="column" className={clsx({
            //         [classes.buttonGutter]: true,
            //         [classes.buttonGutterDebug]: record.level === 'debug',
            //         [classes.buttonGutterInfo]: record.level === 'info',
            //         [classes.buttonGutterWarn]: record.level === 'warn',
            //         [classes.buttonGutterError]: record.level === 'error',
            //     })}>
                    
            //     </Grid>
            //     <Grid item container direction 
            //     <Grid item container direction="row" xs>
            //         <Grid item className={clsx({
            //             [classes.viewerBox]: true,
            //             [classes.viewerBoxCollapsed]: !expanded, 
            //         })}>
            //             <Viewer view={view.asMutable({deep: true})} />
            //         </Grid>
            //     </Grid>
            // </Grid>
        )
    }
}

const styles = (theme: Theme) =>
    createStyles({
        root: {
            display: 'inline-block',
            width: '100%',
        },
        metadata: {
            float: 'right',
        },
        box: {
            display: 'inline-block',
        },
        viewerBoxCollapsed: {
            maxHeight: 50,
            overflow: 'hidden',
            verticalAlign: 'bottom',  // this prevents the row height from changing when overflow is set to "hidden"; see https://stackoverflow.com/questions/22421782/css-overflow-hidden-increases-height-of-container
        },
        buttonGutter: {
            width: '50px',
            height: '100%',
            textAlign: 'center',
            paddingTop: 10,
            borderLeftStyle: 'solid',
        },
        buttonGutterDebug: {
            borderColor: 'gray',
        },
        buttonGutterInfo: {
            borderColor: 'blue',
        },
        buttonGutterWarn: {
            borderColor: '#f5de0a',
        },
        buttonGutterError: {
            borderColor: 'red',
        },
        button: {
        },
        icon: {
            fontSize: 16,
            margin: -8,
        }
    });

type InternalProps = WithStyles<typeof styles>;

export default withStyles(styles)(RecordViewer) as React.ComponentType<RecordViewerProps>;
