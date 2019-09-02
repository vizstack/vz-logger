import * as React from 'react';
import clsx from 'clsx';
import Immutable, { ImmutableObject } from 'seamless-immutable';
import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { createSelector } from 'reselect';

import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LevelIcon from '@material-ui/icons/LayersOutlined';  // Layers
import TimeIcon from '@material-ui/icons/Schedule';  // WatchLater

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

    interactionManager: InteractionManager,
};

type RecordViewerState = {
};

class RecordViewer extends React.Component<RecordViewerProps & InternalProps, RecordViewerState> {
    /* Prop default values. */
    static defaultProps = {
        // key: value,
    };

    // TODO: currently we can't get the actual `Viewer` type, since `ViewerRoot` is exposed as `Viewer`.
    _viewer: any = null;

    /**
     * Constructor.
     * @param props
     */
    constructor(props: RecordViewerProps & InternalProps) {
        super(props);
        this.state = {};

        this.updateViewerRef = this.updateViewerRef.bind(this);
    }

    /**
     * Updates the locally stored reference to the rendered `Viewer`.
     * @param ref 
     */
    updateViewerRef(ref: any) {
        this._viewer = ref;
    }

    /**
     * Renderer.
     */
    render() {
        const { classes, record, pinned, togglePinned, expanded, toggleExpanded, interactionManager } = this.props;
        const { timestamp, filePath, lineNumber, columnNumber, functionName, loggerName, level, tags, view } = record;

        const date = new Date(timestamp);

        return (
            <div className={classes.container}>
                <div className={classes.buttons}>
                    {pinned ? (
                        <IconButton
                            className={classes.button}
                            aria-label="unlock"
                            tabIndex={-1} // Disable "tabbing" to this button so that we can tab from one row right to the next.
                            onClick={() => togglePinned()}>
                            <LockIcon className={classes.icon} />
                        </IconButton>
                    ) : (
                        <IconButton
                            className={classes.button}
                            aria-label="lock"
                            tabIndex={-1}
                            onClick={() => togglePinned()}>
                            <LockOpenIcon className={classes.icon} />
                        </IconButton>
                    )}
                    {expanded ? (
                        <IconButton
                            className={classes.button}
                            aria-label="collapse"
                            tabIndex={-1}
                            onClick={() => toggleExpanded()}>
                            <ExpandLessIcon className={classes.icon} />
                        </IconButton>
                    ) : (
                        <IconButton
                            className={classes.button}
                            aria-label="expand"
                            tabIndex={-1}
                            onClick={() => toggleExpanded()}>
                            <ExpandMoreIcon className={classes.icon} />
                        </IconButton>
                    )}
                </div>
                <div className={classes.content}>
                    <div className={classes.metadata}>
                            {`${date.toLocaleString().split(', ').join(' | ')} | ${filePath}:${lineNumber}`}
                      
                    </div>
                    <div className={clsx({
                        [classes.viewer]: true,
                        [classes.viewerCollapsed]: !expanded, 
                    })} tabIndex={0} onFocus={() => {
                        interactionManager.emit('RecordViewer.DidFocus', {viewerId: this._viewer ? this._viewer.viewerId : null});
                    }}>
                        <Viewer view={view.asMutable({deep: true})} ref={this.updateViewerRef} />
                    </div>
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
        container: {
            display: 'flex',
            flexDirection: 'row',
            borderTop: `2px solid ${theme.color.gray.base}`,
            paddingTop: theme.scale(2),
            paddingBottom: theme.scale(4),
        },
        buttons: {
            width: theme.scale(32),
        },
        content: {
            width: 0, // Hack to prevent overflow.
            flexGrow: 1,
        },

        viewer: {
            overflow: 'auto',
        },
        viewerCollapsed: {
            maxHeight: theme.scale(128),
        },
        metadata: {
            ...theme.vars.text.caption,
            color: theme.vars.emphasis.less,
            textAlign: 'right',
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
