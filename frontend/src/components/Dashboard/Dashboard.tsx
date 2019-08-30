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
    /* A list of filtered tags; a record can only be shown if one of its tags is in the list or the list is empty. */
    shownTags: string[],
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

    filters: string[],

    suggestions: string[],

    suggestionText: string,
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
        <GridComponent item className={classes.header} xs onClick={() => {
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
        </GridComponent>
    )
}

const getSuggestions = (value: string, options: string[]) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
  
    const s = inputLength === 0 ? [] : options.filter((option) =>
        option.toLowerCase().slice(0, inputLength) === inputValue
    );
    console.log(s);
    return s;
  };
const getSuggestionValue = (suggestion: string) => suggestion;
const renderSuggestion = (suggestion: string) => {
    console.log('rendering');
    return (
        <MenuItem component="div"><div>{suggestion}</div></MenuItem>
    )
};
const renderSuggestionsContainer = ({containerProps, children}: any) => (
    <Paper {...containerProps}>
    {children}
    </Paper>
)
const renderChipInput = (inputProps: any) => {
    const { classes, filters, onChange, onAdd, onDelete, ref } = inputProps;
    return (<ChipInput
        clearInputValueOnChange
        className={classes.filterBar}
        value={filters}
        onAdd={onAdd}
        onDelete={onDelete}
        onUpdateInput={onChange}
    />);
}

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
            shownTags: [],
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
    }

    /**
     * Change which key is used to sort the table of log entries.
     * @param sortBy 
     */
    private setSortBy(sortBy: SortKey) {
        this.setState({sortBy, sortReverse: false});
    }

    /**
     * Toggle whether the table of log entries is presented in reverse order.
     */
    private toggleSortReverse() { 
        this.setState((state) => ({sortReverse: !state.sortReverse}));
    }

    /**
     * Toggle whether a given filter should be used for the given key.
     * 
     * If `filter` is not present in `this.state[filterKey]`, then it will be added to it.
     * Otherwise, it is removed from `this.state[filterKey]`.
     */
    private toggleFilter(filterKey: 'shownTags' | 'shownLevels', filter: string) {
        this.setState((state) => {
            const newFilters = [...state[filterKey]];
            const filterIndex = state[filterKey].indexOf(filter);
            if (filterIndex === -1) {
                newFilters.push(filter);
                return {
                    ...state,
                    [filterKey]: newFilters,
                }
            }
            else {
                newFilters.splice(filterIndex, 1);
                return {
                    ...state,
                    [filterKey]: newFilters,
                }
            }
        });
    }

    /**
     * Create a component to render a given record.
     * @param record 
     * @param idx: The index of the record in the record table.
     */
    private getRecordViewerComponent(record: ImmutableObject<RecordSchema>, idx: number) {
        const { pinnedIdxs, expandedIdxs } = this.state;

        return (
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
        );
    }

    /**
     * Renderer.
     */
    render() {
        const { classes, records } = this.props;
        const { pinnedIdxs, expandedIdxs, sortBy, sortReverse, page, recordsPerPage, shownLevels, startDate, endDate, filters, suggestions, suggestionText } = this.state;

        const maxPages = Math.max(1, Math.ceil(records.length / recordsPerPage));

        const filterOptions = Array.from(new Set(
            records.reduce((acc: string[], record) => {
                return [...acc, 
                    ...record.tags.asMutable().map((tag) => `tag:${tag}`), 
                    `file:${record.filePath}`, 
                    `logger:${record.loggerName}`,
                    `func:${record.functionName}`,
                ]
            }, [])
        ))

        const shownTags = filters.filter((filter) => filter.startsWith('tag:')).map((filter) => filter.replace('tag:', ''));
        const shownFiles = filters.filter((filter) => filter.startsWith('file:')).map((filter) => filter.replace('file:', ''));
        const shownLoggers = filters.filter((filter) => filter.startsWith('logger:')).map((filter) => filter.replace('logger:', ''));
        const shownFunctions = filters.filter((filter) => filter.startsWith('func:')).map((filter) => filter.replace('func:', ''));

        // const allTags = Array.from(new Set(records.reduce((acc: string[], record) => acc.concat(record.tags.asMutable()), [])));
        // const shownTags = filters.filter((filter) => filter.startsWith('tag:')).map((filter) => filter.replace('tag:', ''));
        
        // const allFiles = Array.from(new Set(records.map((record) => record.asMutable().filePath)))
        // const shownFiles = filters.filter((filter) => filter.startsWith('file:')).map((filter) => filter.replace('file:', ''));
        
        // const filterOptions = [...allTags, ...allFiles]; 

        // const inputProps: any = {
        //     classes, filters,
        //     onChange: ((e: any) => {
                
        //     }),
        // }

        const addFilter = (chip: string) => this.setState((state) => ({filters: state.filters.concat(chip), suggestionText: '', }));
        const deleteFilter = (chip: string, idx: number) => this.setState((state) => {
            const filters = [...state.filters];
            filters.splice(idx, 1);
            return { filters, };
        });
        const updateSuggestionText = (e: any) => this.setState({suggestions: getSuggestions(e.target.value, filterOptions)});

        // TODO: keyboard controls for autocomplete

        return (
            <div className={classes.root}>
                {/* Sidebar ==================================================================== */}
                <div className={classes.sidebar}>
                    <Typography variant='h4' gutterBottom>
                        vz-logger
                    </Typography>
                    {/* Tags ------------------------------------------------------------------- */}
                    {/* <div className={classes.filterList}> */}
                        {/* <div className={classes.subtitleWithIcon}>
                            <TagsIcon className={classes.icon} />
                            <Typography variant='subtitle2'>Tags</Typography>
                        </div>
                        {tagInfo.tags.map((tag) => (
                        <FormControlLabel
                            control={
                            <Checkbox 
                            checked={shownTags.indexOf(tag) !== -1} 
                            onChange={() => this.toggleFilter('shownTags', tag)} 
                            value={`${tag}-checked`} />
                            }
                            label={(
                                <span>
                                    <Typography display='inline'>{tag}</Typography>
                                    <div className={classes.filterSpacer} />
                                    <Typography display='inline' variant='caption' color='textSecondary'>{`${tagInfo.counts[tag]}`}</Typography>
                                </span>
                            )}
                        />
                        ))} */}
                    {/* </div> */}
                    {/* <div className={classes.spacer}/> */}
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
                            onChange={() => this.toggleFilter('shownLevels', level)} 
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
                            onAdd={addFilter}
                            onDelete={deleteFilter}
                            onUpdateInput={updateSuggestionText}
                            // when we click a suggestion, the chip input will blur, clearing the 
                            // suggestions before the click is consumed. a timeout delays the clear.
                            onBlur={() => setTimeout(() => this.setState({suggestions: []}), 100)}
                        />
                        {
                            suggestions.length > 0 ? (
                                <Paper className={classes.suggestionsContainer}>
                                    {suggestions.map((suggestion) => (
                                        <MenuItem component="div" onClick={(e: any) => {
                                            addFilter(suggestion);
                                            this.setState({suggestions: []});
                                            e.preventDefault();
                                        }}>{suggestion}</MenuItem>
                                    ))}
                                </Paper>
                            ): null
                        }
                        </div>
                        {/* <Autosuggest
                            theme={{
                            container: classes.container,
                            suggestionsContainerOpen: classes.suggestionsContainerOpen,
                            suggestionsList: classes.suggestionsList,
                            suggestion: classes.suggestion
                            }}
                            renderInputComponent={renderChipInput}
                            suggestions={suggestions}
                            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                            onSuggestionsClearRequested={onSuggestionsClearRequested}
                            getSuggestionValue={getSuggestionValue}
                            renderSuggestion={renderSuggestion}
                            renderSuggestionsContainer={renderSuggestionsContainer}
                            onSuggestionSelected={(e: any, { suggestionValue }: {suggestionValue: string}) => { inputProps.onAdd(suggestionValue); e.preventDefault() }}
                            focusInputOnSuggestionClick={false}
                            inputProps={inputProps}
                        /> */}
                        {/* <div className={classes.buttonGutter}/> */}
                        {/* <Header 
                        text={'Time'}
                        sortKey={'timestamp'}
                        {...headerProps}
                        /> */}
                        {/* <Header 
                        text={'File'}
                        sortKey={'filePath'}
                        {...headerProps}
                        />
                        <Header 
                        text={'Line'}
                        sortKey={'lineNumber'}
                        {...headerProps}
                        />
                        <Header 
                        text={'Column'}
                        sortKey={'columnNumber'}
                        {...headerProps}
                        /> */}
                    </GridComponent>
                    <InteractionProvider manager={this._tableManager}>
                        {records.map((record, idx) => ({record, idx}))
                        .filter(({idx}) => pinnedIdxs.has(idx))
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
                        .map(({record, idx}) => this.getRecordViewerComponent(record, idx))}
                        <div className={classes.recordList}>
                            {records.map((record, idx) => ({record, idx}))
                            .filter(({idx}) => !pinnedIdxs.has(idx) && idx >= recordsPerPage * page && idx < recordsPerPage * (page + 1))
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
                            .map(({record, idx}) => this.getRecordViewerComponent(record, idx))}
                        </div>
                    </InteractionProvider>
                    <div className={classes.pageBar}>
                        <Button className={classes.pageBarItem} disabled={page === 0} onClick={() => this.setState({page: page - 1})}>prev</Button>
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
                        <Button className={classes.pageBarItem} disabled={page === maxPages - 1} onClick={() => this.setState({page: page + 1})}>next</Button>
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
        suggestion: {
            display: 'block'
        },
        suggestionsList: {
            margin: 0,
            padding: 0,
            listStyleType: 'none'
        },


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
