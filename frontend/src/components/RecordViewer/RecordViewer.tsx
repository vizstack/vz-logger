import * as React from 'react';
import clsx from 'clsx';
import Immutable, { ImmutableObject } from 'seamless-immutable';
import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { createSelector } from 'reselect';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TagsIcon from '@material-ui/icons/LabelOutlined';
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

    record: ImmutableObject<Record>,
};

type RecordViewerState = {};

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
        const { timestamp, filePath, lineNumber, columnNumber, functionName, loggerName, level, tags, view } = this.props.record;

        return (
            <div>
                <Viewer view={view.asMutable({deep: true})} />
            </div>
        )
    }
}

const styles = (theme: Theme) =>
    createStyles({});

type InternalProps = WithStyles<typeof styles>;

export default withStyles(styles)(RecordViewer) as React.ComponentType<RecordViewerProps>;
