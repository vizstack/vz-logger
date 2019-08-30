import 'date-fns';
import * as React from 'react';
import clsx from 'clsx';
import Immutable, { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { createSelector } from 'reselect';

import GridComponent from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import TagsIcon from '@material-ui/icons/LabelOutlined';
import LevelIcon from '@material-ui/icons/LayersOutlined';  // Layers
import TimeIcon from '@material-ui/icons/Schedule';  // WatchLater

import ChipInput from 'material-ui-chip-input';
import Autosuggest from 'react-autosuggest';
import Paper from '@material-ui/core/Paper';

import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnUtils from '@date-io/date-fns';

import { Text, Flow, Icon, Grid, Sequence, Token } from '@vizstack/js';
import { InteractionProvider, InteractionManager, Viewer } from '@vizstack/viewer';

import RecordViewer from '../RecordViewer';
import { Record as RecordSchema } from '../../schema';

import { AppState } from '../../store';
import * as dashboard from '../../store/dashboard';

/* This smart component is the main dashboard view of the logger interface that allows exploration
 * and filtering of log records streamed from the various program clients. */

type DashboardProps = {
    /* React components within opening & closing tags. */
    children?: React.ReactNode;
};

/* Keys which can be used to sort the table of records. */
type SortKey = keyof RecordSchema;

type DashboardState = {
    /* Records which are pinned to the dashboard; identified by their index in the record table. */
    pinnedIdxs: Set<number>,
    /* Records which are showing their full Viewer regardless of size; identified by their index
    in the record table.*/
    expandedIdxs: Set<number>,
    /* The key currently being used to sort the table. */
    sortBy: SortKey,
    /* Whether the table should be sorted from greatest to least value of `sortBy`. */
    sortReverse: boolean,
    /* A list of filtered levels; a record can only be shown if its level is in the list or the list is empty. */
    shownLevels: string[],
    /* A minimum timestamp that all shown records must have, or null if there is no lower bound. */
    startDate: Date | null,
    /* A maximum timestamp that all shown records must have, or null if there is no upper bound. */
    endDate: Date | null,
    /* Which page of records the dashboard is currently showing; 0-indexed. */
    page: number,
    /* How many records should be shown on each page. */
    recordsPerPage: number,
    /* Filters currently being applied to the record table, of the form `${type}:${name}. */
    filters: string[],
    /* The text currently being typed into the filter search bar, which is used to generate suggestions. */
    suggestionText: string,
    /* Filter suggestions built using the current value of `suggestionText`, excluding values already in `filters`.*/
    suggestions: string[],
};

/**
 * Returns every string in `options` that starts with `value`.
 */
const getSuggestions = (value: string, options: string[]) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
  
    return inputLength === 0 ? [] : options.filter((option) =>
        option.toLowerCase().slice(0, inputLength) === inputValue
    );
};

class Dashboard extends React.Component<DashboardProps & InternalProps, DashboardState> {
    /* Prop default values. */
    static defaultProps = {
        // key: value,
    };

    _tableManager: InteractionManager;

    /**
     * Constructor.
     * @param props
     */
    constructor(props: DashboardProps & InternalProps) {
        super(props);
        this.state = {
            pinnedIdxs: new Set(),
            expandedIdxs: new Set(),
            sortBy: 'timestamp',
            sortReverse: false,
            shownLevels: [],
            startDate: null,
            endDate: null,
            page: 0,
            recordsPerPage: 10,
            filters: [],
            suggestions: [],
            suggestionText: '',
        };

        this._tableManager = new InteractionManager();

        this.addTextFilter = this.addTextFilter.bind(this);
        this.deleteTextFilter = this.deleteTextFilter.bind(this);
        this.updateSuggestionText = this.updateSuggestionText.bind(this);
    }

    /**
     * Toggle whether the table of log entries is presented in reverse order.
     */
    private toggleSortReverse() { 
        this.setState((state) => ({sortReverse: !state.sortReverse}));
    }

    /**
     * Toggle whether a given level should be shown.
     * 
     * If `level` is not present in `this.state.shownLevels`, then it will be added to it.
     * Otherwise, it is removed from `this.state.shownLevels`.
     */
    private toggleLevelFilter(level: string) {
        this.setState((state) => {
            const newFilters = [...state.shownLevels];
            const filterIndex = state.shownLevels.indexOf(level);
            if (filterIndex === -1) {
                newFilters.push(level);
                return {
                    ...state,
                    shownLevels: newFilters,
                }
            }
            else {
                newFilters.splice(filterIndex, 1);
                return {
                    ...state,
                    shownLevels: newFilters,
                }
            }
        });
    }

    private addTextFilter(chip: string) {
        this.setState((state) => ({filters: state.filters.concat(chip), suggestionText: '', }))
    }

    private deleteTextFilter(chip: string, idx: number) {
        this.setState((state) => {
            const filters = [...state.filters];
            filters.splice(idx, 1);
            return { filters, };
        });
    }

    private updateSuggestionText(e: any) {
        const { records } = this.props;
        const { filters } = this.state;
        const filterOptions = Array.from(new Set(
            records.reduce((acc: string[], record) => {
                return [...acc, 
                    ...record.tags.asMutable().map((tag) => `tag:${tag}`), 
                    `file:${record.filePath}`, 
                    `logger:${record.loggerName}`,
                    `func:${record.functionName}`,
                ]
            }, [])
        )).filter((filter) => filters.indexOf(filter) === -1);
        this.setState({suggestions: getSuggestions(e.target.value, filterOptions)});
    }

    /**
     * Create components to render records.
     * @param record 
     * @param idx: The index of the record in the record table.
     */
    private getRecordViewers(records: ImmutableObject<RecordSchema>[], pinned: boolean, filterCollections: {
        shownTags: string[],
        shownLevels: string[],
        shownFiles: string[],
        shownLoggers: string[],
        shownFunctions: string[],
    }) {
        const { pinnedIdxs, expandedIdxs, endDate, startDate, sortBy, sortReverse } = this.state;
        const { shownTags, shownLevels, shownFiles, shownLoggers, shownFunctions } = filterCollections;

        return records.map((record, idx) => ({record, idx}))
        .filter(({idx}) => pinned ? pinnedIdxs.has(idx) : !pinnedIdxs.has(idx))
        .filter(({record}) => {
            const { startDate, endDate } = this.state;
            return (startDate === null || startDate.getTime() < record.timestamp) && 
            (endDate === null || endDate.getTime() > record.timestamp) && 
            (shownTags.length === 0 || shownTags.some((tag) => record.tags.indexOf(tag) !== -1)) &&
            (shownLevels.length === 0 || shownLevels.indexOf(record.level) !== -1) &&
            (shownFiles.length === 0 || shownFiles.indexOf(record.filePath) !== -1) &&
            (shownLoggers.length === 0 || shownLoggers.indexOf(record.loggerName) !== -1) &&
            (shownFunctions.length === 0 || shownFunctions.indexOf(record.functionName) !== -1)
        })
        .sort((r1, r2) => {
            if (r1.record[sortBy] < r2.record[sortBy]) {
                return sortReverse ? 1 : -1;
            }
            if (r1.record[sortBy] > r2.record[sortBy]) {
                return sortReverse ? -1 : 1;
            }
            return 0;
        })
        .map(({record, idx}) => (
            <RecordViewer
                key={record.timestamp}
                record={record}
                pinned={pinnedIdxs.has(idx)}
                togglePinned={() => this.setState((state) => {
                    const pinnedIdxs = new Set(state.pinnedIdxs);
                    if (pinnedIdxs.has(idx)) {
                        pinnedIdxs.delete(idx);
                    }
                    else {
                        pinnedIdxs.add(idx);
                    }
                    return {pinnedIdxs};
                })}
                expanded={expandedIdxs.has(idx)}
                toggleExpanded={() => this.setState((state) => {
                    const expandedIdxs = new Set(state.expandedIdxs);
                    if (expandedIdxs.has(idx)) {
                        expandedIdxs.delete(idx);
                    }
                    else {
                        expandedIdxs.add(idx);
                    }
                    return {expandedIdxs};
                })}
            />
        ));
    }

    /**
     * Renderer.
     */
    render() {
        const { classes, records } = this.props;
        const { pinnedIdxs, expandedIdxs, sortBy, sortReverse, page, recordsPerPage, shownLevels, startDate, endDate, filters, suggestions, suggestionText } = this.state;

        const maxPages = Math.max(1, Math.ceil(records.length / recordsPerPage));

        const filterCollections = {
            shownLevels,
            shownTags: filters.filter((filter) => filter.startsWith('tag:')).map((filter) => filter.replace('tag:', '')),
            shownFiles: filters.filter((filter) => filter.startsWith('file:')).map((filter) => filter.replace('file:', '')),
            shownLoggers: filters.filter((filter) => filter.startsWith('logger:')).map((filter) => filter.replace('logger:', '')),
            shownFunctions: filters.filter((filter) => filter.startsWith('func:')).map((filter) => filter.replace('func:', '')),
        }
        
        // TODO: keyboard controls for autocomplete

        return (
            <div className={classes.root}>
                {/* Sidebar ==================================================================== */}
                <div className={classes.sidebar}>
                    <Typography variant='h4' gutterBottom>
                        vz-logger
                    </Typography>
                    {/* Level ------------------------------------------------------------------ */}
                    <div className={classes.filterList}>
                        <div className={classes.subtitleWithIcon}>
                            <LevelIcon className={classes.icon}/>
                            <Typography variant='subtitle2'>Level</Typography>
                        </div>
                        {['debug', 'info', 'warn', 'error'].map((level) => (
                        <FormControlLabel
                            key={level}
                            control={
                            <Checkbox 
                            checked={shownLevels.indexOf(level) !== -1} 
                            onChange={() => this.toggleLevelFilter(level)} 
                            value={`${level}-checked`} />
                            }
                            label={(
                                <span>
                                    <Typography display='inline' className={clsx({
                                        [classes.levelFilterText]: true,
                                        [classes.debug]: level === 'debug',
                                        [classes.info]: level === 'info',
                                        [classes.warn]: level === 'warn',
                                        [classes.error]: level === 'error',
                                    })}>{level}</Typography>
                                    <div className={classes.filterSpacer} />
                                    <Typography display='inline' variant='caption' color='textSecondary'>{`${records.reduce((prev, record) => record.level === level ? prev + 1 : prev, 0)}`}</Typography>
                                </span>
                            )}
                        />
                        ))}
                    </div>
                    <div className={classes.spacer}/>
                    {/* Time ------------------------------------------------------------------- */}
                    <div className={classes.filterList}>
                        <div className={classes.subtitleWithIcon}>
                            <TimeIcon className={classes.icon}/>
                            <Typography variant='subtitle2'>Time</Typography>
                        </div>
                        <MuiPickersUtilsProvider utils={DateFnUtils}>
                            <DateTimePicker
                            clearable
                            autoOk
                            ampm={false}
                            label="Start"
                            inputVariant="outlined"
                            value={startDate}
                            onChange={(newDate: Date | null) => this.setState({startDate: newDate})}
                            />
                            <DateTimePicker 
                            clearable
                            autoOk
                            ampm={false}
                            label="End"
                            inputVariant="outlined"
                            value={endDate}
                            onChange={(newDate: Date | null) => this.setState({endDate: newDate})}
                            />
                        </MuiPickersUtilsProvider>
                    </div>
                </div>
                {/* Canvas ===================================================================== */}
                <div className={classes.canvas}>
                    <GridComponent container direction={"row"}>
                        <div className={classes.filterContainer}>
                            <ChipInput 
                                clearInputValueOnChange
                                className={classes.filterBar}
                                value={filters}
                                onAdd={this.addTextFilter}
                                onDelete={this.deleteTextFilter}
                                onUpdateInput={this.updateSuggestionText}
                                // when we click a suggestion, the chip input will blur, clearing the 
                                // suggestions before the click is consumed. a timeout delays the clear.
                                onBlur={() => setTimeout(() => this.setState({suggestions: []}), 100)}
                            />
                            {
                                suggestions.length > 0 ? (
                                    <Paper className={classes.suggestionsContainer}>
                                        {suggestions.map((suggestion) => (
                                            <MenuItem component="div" onClick={(e: any) => {
                                                this.addTextFilter(suggestion);
                                                this.setState({suggestions: []});
                                                e.preventDefault();
                                            }}>{suggestion}</MenuItem>
                                        ))}
                                    </Paper>
                                ): null
                            }
                        </div>
                    </GridComponent>
                    <InteractionProvider manager={this._tableManager}>
                        {this.getRecordViewers(records, true, filterCollections)}
                        <div className={classes.recordList}>
                            {this.getRecordViewers(records, false, filterCollections)}
                        </div>
                    </InteractionProvider>
                    <div className={classes.pageBar}>
                        <Button variant='contained' className={classes.pageBarItem} onClick={() => this.toggleSortReverse()}>
                            {sortReverse ? <ArrowUpwardIcon/> : <ArrowDownwardIcon />}
                            sort
                        </Button>
                        <Button variant='contained' className={classes.pageBarItem} disabled={page === 0} onClick={() => this.setState({page: page - 1})}>prev</Button>
                        <Input 
                        className={clsx(classes.pageBarItem, classes.pageBarInput)}
                        value={page + 1}
                        onChange={(event) => {
                            if (event.target.value !== '') {
                                this.setState({page: (Number(event.target.value) as number) - 1});
                            }
                        }}
                        inputProps={{
                            step: 1,
                            min: 1,
                            max: maxPages,
                            type: 'number',
                        }}
                        />
                        <div>of&nbsp;</div>
                        {maxPages}
                        <Button variant='contained' className={classes.pageBarItem} disabled={page === maxPages - 1} onClick={() => this.setState({page: page + 1})}>next</Button>
                        <FormControl className={classes.pageBarSelect}>
                            <InputLabel htmlFor='perpage-select'>Per Page</InputLabel>
                            <Select 
                            className={classes.pageBarItem}
                            value={recordsPerPage} 
                            onChange={(event) => this.setState({
                                recordsPerPage: event.target.value as number,
                                // If the new value causes there to be fewer pages than the current page,
                                // set the new page to be the new value of `maxPages`
                                page: Math.min(page, Math.max(0, Math.ceil(records.length / (event.target.value as number) - 1)))
                            })}
                            inputProps={{
                                name: 'perpage',
                                id: 'perpage-select',
                            }}>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>
            </div>
        );
    }
}

// {records.map((record) => <p key={record.timestamp}>{JSON.stringify(record)}</p>)}

const styles = (theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            height: 'calc(100vh - 32px)',
            display: 'flex',
            margin: theme.scale(16),
        },
        sidebar: {
            minWidth: theme.scale(256),
            overflow: 'auto',
        },
        canvas: {
            flexGrow: 1,
            backgroundColor: theme.color.white,
            padding: theme.scale(16),
            borderRadius: theme.shape.borderRadius,
            display: 'flex',
            flexDirection: 'column',
        },
        filterBar: {
            width: '100%',
        },
        filterList: {
            display: 'flex',
            flexDirection: 'column',
        },
        filterContainer: {
            position: 'relative',
            width: '100%',
        },
        suggestionsContainer: {
            position: 'absolute',
            marginTop: '8px',
            marginBottom: '24px',
            left: 0,
            right: 0,
            zIndex: 1
        },
        levelFilterText: {
            paddingLeft: 5,
            borderLeftStyle: 'solid',
        },
        debug: {
            borderColor: 'gray',
        },
        info: {
            borderColor: 'blue',
        },
        warn: {
            borderColor: '#f5de0a',
        },
        error: {
            borderColor: 'red',
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
        filterSpacer: {
            width: theme.scale(8),
            display: 'inline-block',
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
        recordList: {
            overflow: 'auto',
            flexGrow: 1,
        },
        pageBar: {
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        pageBarItem: {
            margin: '10px',
        },
        pageBarInput: {
            maxWidth: '50px',
        },
        pageBarSelect: {
            width: '75px',
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
