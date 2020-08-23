import 'date-fns';
import * as React from 'react';
import clsx from 'clsx';
import Immutable, { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import { withStyles, createStyles, Theme, WithStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { createSelector } from 'reselect';

import GridComponent from '@material-ui/core/Grid';

import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import Slider from '@material-ui/core/Slider';

import Typography from '@material-ui/core/Typography';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

import TagsIcon from '@material-ui/icons/LabelOutlined';
import LevelIcon from '@material-ui/icons/LayersOutlined';  // Layers
import TimeIcon from '@material-ui/icons/Schedule';  // WatchLater

import ChipInput from 'material-ui-chip-input';
import Paper from '@material-ui/core/Paper';

import { InteractionProvider, InteractionManager, Viewer } from '@vizstack/viewer';

import RecordViewer from '../RecordViewer';
import { Record as RecordSchema } from '../../schema';

import { AppState } from '../../store';
import * as dashboard from '../../store/dashboard';


/** This smart component is the main dashboard view of the logger interface that allows exploration
 * and filtering of log records streamed from the various program clients. */

type DashboardProps = {
    /* React components within opening & closing tags. */
    children?: React.ReactNode;
};

/* Keys which can be used to sort the table of records. */
type SortKey = keyof RecordSchema;

type DashboardState = {
    /** Records which are pinned to the dashboard; identified by their index in the record table. */
    pinnedIdxs: Set<number>,
    
    /** Records which are showing their full Viewer regardless of size; identified by their index
    in the record table. */
    expandedIdxs: Set<number>,
    
    /** The key currently being used to sort the table. */
    sortBy: SortKey,
    
    /** Whether the table should be sorted from greatest to least value of `sortBy`. */
    sortReverse: boolean,
    
    /** A list of filtered levels; a record can only be shown if its level is in the list or the list is empty. */
    shownLevels: string[],
    
    /** Epoch time (in ms) at which this Dashboard was opened. */
    creationTime: number,

    /** A minimum timestamp that all shown records must have, or null if there is no lower bound. */
    filterTimeStart?: number,
    
    /** A maximum timestamp that all shown records must have, or null if there is no upper bound. */
    filterTimeEnd?: number,
    
    /** Which page of records the dashboard is currently showing; 0-indexed. */
    page: number,
    
    /** How many records should be shown on each page. */
    recordsPerPage: number,
    
    /** Filters currently being applied to the record table, of the form `${type}:${name}. */
    filters: string[],
    
    /** Values needed to show and select filter suggestions. */
    suggestions: {
        /** The current filter strings to be suggested. */
        options: string[],
        
        /** The index of the currently hovered option in `options`, or -1 if none is selected. */
        selectedIdx: number,
    }
};

/**
 * Returns every string in `options` that starts with `value`.
 */
const getSuggestionOptions = (value: string, options: string[]) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
  
    return inputLength === 0 ? [] : options.filter((option) =>
        option.toLowerCase().slice(0, inputLength) === inputValue
    );
};

const kSliderStep = 1000;

class Dashboard extends React.Component<DashboardProps & InternalProps, DashboardState> {
    private _tableManager: InteractionManager;

    constructor(props: DashboardProps & InternalProps) {
        super(props);
        this.state = {
            pinnedIdxs: new Set(),
            expandedIdxs: new Set(),
            sortBy: 'timestamp',
            sortReverse: true,
            shownLevels: [],
            creationTime: Date.now(),
            filterTimeStart: undefined,
            filterTimeEnd: undefined,
            page: 0,
            recordsPerPage: 10,
            filters: [],
            suggestions: {
                options: [],
                selectedIdx: -1,
            },
        };

        this._tableManager = new InteractionManager();
        this._tableManager.on('RecordViewer.DidFocus', (all, msg, global) => {
            // Only select the viewer if it's not being hovered; otherwise, clicking directly on the 
            // viewer would cause it to select here, then in the click handler unselect
            if (msg.viewerId && global.selected !== msg.viewerId && global.hovered !== msg.viewerId) {
                all.viewerId(global.selected).forEach((viewer) => viewer.appearance.doSetLight('normal'));
                global.prevSelected = global.selected;
                global.selected = msg.viewerId;
                all.viewerId(global.selected).forEach((viewer) => viewer.appearance.doSetLight('selected'));
            }
        })

        this.addTextFilter = this.addTextFilter.bind(this);
        this.deleteTextFilter = this.deleteTextFilter.bind(this);
        this.updateSuggestionInput = this.updateSuggestionInput.bind(this);
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
            }
            else {
                newFilters.splice(filterIndex, 1);
            }
            return {
                ...state,
                shownLevels: newFilters,
                // If the current page would be more than the new number of pages, go to the max possible page
                page: Math.min(state.page, Math.max(0, Math.ceil(this.getShownRecords({shownLevels: newFilters}).length / state.recordsPerPage - 1))),
            }
        });
    }

    private addTextFilter(chip: string) {
        this.setState((state) => {
            const filters = state.filters.concat(chip);
            return {
                filters, 
                suggestions: {...state.suggestions, selectedIdx: -1}, 
                // If the current page would be more than the new number of pages, go to the max possible page
                page: Math.min(state.page, Math.max(0, Math.ceil(this.getShownRecords({textFilters: filters}).length / state.recordsPerPage - 1))),
            }
        })
    }

    private deleteTextFilter(chip: string, idx: number) {
        this.setState((state) => {
            const filters = [...state.filters];
            filters.splice(idx, 1);
            return { filters, };
        });
    }

    private updateSuggestionInput(e: any) {
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
        const input = e.target.value;
        this.setState((state) => ({suggestions: {...state.suggestions, options: getSuggestionOptions(input, filterOptions)}}));
    }

    /**
     * Create components to render records.
     * @param record 
     * @param idx: The index of the record in the record table.
     */
    private getRecordViewers(records: ImmutableObject<RecordSchema>[], pinned: boolean) {
        const { pinnedIdxs, expandedIdxs, sortBy, sortReverse, page, recordsPerPage } = this.state;

        const startIdx = recordsPerPage * page;
        const endIdx = recordsPerPage * (page + 1);
        const visibleRecords = records.map((record, idx) => ({record, idx}))
        .filter(({idx}) => pinned ? pinnedIdxs.has(idx) : (
            !pinnedIdxs.has(idx)))
        .sort((r1, r2) => {
            if (r1.record[sortBy] < r2.record[sortBy]) {
                return sortReverse ? 1 : -1;
            }
            if (r1.record[sortBy] > r2.record[sortBy]) {
                return sortReverse ? -1 : 1;
            }
            return 0;
        })
        .filter((_, aidx) => aidx >= startIdx && aidx < endIdx);
        return visibleRecords.map(({record, idx}, vidx) => (
            <RecordViewer
                key={`${record.timestamp}:${idx}`}
                record={record}
                pinned={pinnedIdxs.has(idx)}
                interactionManager={this._tableManager}
                togglePinned={() => this.setState((state) => {
                    const pinnedIdxs = new Set(state.pinnedIdxs);
                    if (pinnedIdxs.has(idx)) {
                        pinnedIdxs.delete(idx);
                    } else {
                        pinnedIdxs.add(idx);
                    }
                    return {pinnedIdxs};
                })}
                expanded={expandedIdxs.has(idx) || (sortReverse ? vidx === 0 : vidx === visibleRecords.length - 1)}
                toggleExpanded={() => this.setState((state) => {
                    const expandedIdxs = new Set(state.expandedIdxs);
                    if (expandedIdxs.has(idx)) {
                        expandedIdxs.delete(idx);
                    } else {
                        expandedIdxs.add(idx);
                    }
                    return {expandedIdxs};
                })}
            />
        ));
    }

    /**
     * Get all of the records that would be a shown under a given set of filters.
     * @param filterOverrides Filter values to use to determine which records are shown. Undefined values will use the Dashboard's current state.
     */
    private getShownRecords(filterOverrides: {
        textFilters?: string[],
        shownLevels?: string[],
        filterTimeStart?: Date,
        filterTimeEnd?: Date
    } = {}) {
        const { records } = this.props;

        const {
            filterTimeStart = this.state.filterTimeStart,
            filterTimeEnd = this.state.filterTimeEnd,
            shownLevels = this.state.shownLevels,
            textFilters = this.state.filters,
        } = filterOverrides;

        const shownTags = textFilters.filter((filter) => filter.startsWith('tag:')).map((filter) => filter.replace('tag:', ''));
        const shownFiles = textFilters.filter((filter) => filter.startsWith('file:')).map((filter) => filter.replace('file:', ''));
        const shownLoggers = textFilters.filter((filter) => filter.startsWith('logger:')).map((filter) => filter.replace('logger:', ''));
        const shownFunctions = textFilters.filter((filter) => filter.startsWith('func:')).map((filter) => filter.replace('func:', ''));

        return records.filter((record) => {
            return (filterTimeStart === undefined || filterTimeStart < record.timestamp) && 
            (filterTimeEnd === undefined || filterTimeEnd > record.timestamp) && 
            (shownTags.length === 0 || shownTags.some((tag) => record.tags.indexOf(tag) !== -1)) &&
            (shownLevels.length === 0 || shownLevels.indexOf(record.level) !== -1) &&
            (shownFiles.length === 0 || shownFiles.indexOf(record.filePath) !== -1) &&
            (shownLoggers.length === 0 || shownLoggers.indexOf(record.loggerName) !== -1) &&
            (shownFunctions.length === 0 || shownFunctions.indexOf(record.functionName) !== -1)
        });
    }

    /**
     * Renderer.
     */
    render() {
        const { classes, records } = this.props;
        const { sortReverse, page, recordsPerPage, shownLevels, creationTime, filterTimeStart, filterTimeEnd, filters, suggestions } = this.state;

        const shownRecords = this.getShownRecords();

        const maxPages = Math.max(1, Math.ceil(shownRecords.length / recordsPerPage));

        let sliderMin, sliderMax, sliderValue;
        if(records.length === 0) {
            // When no records, display dummy slider.
            sliderMin = 0;
            sliderMax = kSliderStep;
            sliderValue = [sliderMin, sliderMax];
        } else {
            // When have records, display slider between timestamp bounds, unless manually changed.
            sliderMin = records[0].timestamp;
            sliderMax = records[records.length-1].timestamp;
            sliderValue = [filterTimeStart || sliderMin, filterTimeEnd || sliderMax];
        }
        

        return (
            <div className={classes.root}>
                {/* Sidebar ==================================================================== */}
                <div className={classes.sidebar}>
                    <Typography variant='h3' gutterBottom>vz-logger</Typography>
                    {/* Level ------------------------------------------------------------------ */}
                    <div className={classes.sidebarBox}>
                        <div className={classes.sidebarIconHeading}>
                            <LevelIcon className={classes.icon}/>
                            <span>Level</span>
                        </div>
                        <List>
                        {['debug', 'info', 'warn', 'error'].map((level) => (
                            <ListItem key={level} disableGutters>
                                    <Checkbox 
                                        checked={shownLevels.indexOf(level) !== -1} 
                                        onChange={() => this.toggleLevelFilter(level)} 
                                        value={`${level}-checked`} />
                                <span className={classes.levelFilterContainer}>
                                    <div className={clsx({
                                        [classes.levelFilterSwatch]: true,
                                        [classes.levelFilterSwatchDebug]: level === 'debug',
                                        [classes.levelFilterSwatchInfo]: level === 'info',
                                        [classes.levelFilterSwatchWarn]: level === 'warn',
                                        [classes.levelFilterSwatchError]: level === 'error',
                                    })}></div>
                                    <span className={classes.levelFilterLabel}>{level}</span>
                                    <span className={classes.levelFilterCaption}>{`${records.reduce((prev, record) => record.level === level ? prev + 1 : prev, 0).toLocaleString()}`}</span>
                                </span>
                                
                            </ListItem> 
                        ))}
                        </List>
                        
                    </div>
                    <div className={classes.sidebarSpacer}/>
                    {/* Time ------------------------------------------------------------------- */}
                    <div className={classes.sidebarBox}>
                        <div className={classes.sidebarIconHeading}>
                            <TimeIcon className={classes.icon}/>
                            <span>Time</span>
                        </div>
                        <Slider
                            value={sliderValue}
                            step={kSliderStep}
                            min={records.length == 0 ? 0 : sliderMin}
                            max={records.length == 0 ? kSliderStep : sliderMax}
                            valueLabelDisplay="off"
                            onChange={(e, value) => this.setState({
                                filterTimeStart: (value as [number, number])[0],
                                filterTimeEnd: (value as [number, number])[1],
                            })}
                            disabled={records.length === 0}
                        />
                        <div className={classes.timeFilterContainer}>
                            <div style={{ textAlign: 'left '} as any}>
                            {(new Date(records.length === 0 ? creationTime : sliderValue[0])).toLocaleString().split(', ').map((text, i) => <div key={i}>{text}</div>)}
                            </div>
                            <div style={{ textAlign: 'right '} as any}>
                                {(new Date(records.length === 0 ? creationTime : sliderValue[1])).toLocaleString().split(', ').map((text, i) => <div key={i}>{text}</div>)}
                            </div>
                            
                        </div>
                    </div>
                    <div className={classes.sidebarSpacer}/>
                    {/* Tags ------------------------------------------------------------------- */}
                    <div className={classes.sidebarBox}>
                        <div className={classes.sidebarIconHeading}>
                            <TagsIcon className={classes.icon}/>
                            <span>Tags</span>
                        </div>
                        <ChipInput 
                            clearInputValueOnChange
                            className={classes.filterBar}
                            value={filters}
                            onAdd={this.addTextFilter}
                            onDelete={this.deleteTextFilter}
                            onUpdateInput={this.updateSuggestionInput}
                            // When we click a suggestion, the chip input will blur, clearing the 
                            // suggestions before the click is consumed. a timeout delays the clear.
                            onBlur={() => setTimeout(() => this.setState((state) => ({suggestions: {options: [], selectedIdx: -1}})), 100)}
                            onKeyDown={(e: any) => {
                                if (e.key === 'ArrowDown') {
                                    if (suggestions.options.length > 0 && suggestions.selectedIdx < suggestions.options.length - 1) {
                                        this.setState((state) => ({suggestions: {...state.suggestions, selectedIdx: suggestions.selectedIdx + 1}}));
                                    }
                                }
                                if (e.key === 'ArrowUp') {
                                    if (suggestions.options.length > 0 && suggestions.selectedIdx >= 0) {
                                        this.setState((state) => ({suggestions: {...state.suggestions, selectedIdx: suggestions.selectedIdx - 1}}));
                                    }
                                }
                                if (e.key === 'Enter') {
                                    if (suggestions.options.length > 0 && suggestions.selectedIdx !== -1) {
                                        this.addTextFilter(suggestions.options[suggestions.selectedIdx]);
                                        this.setState((state) => ({suggestions: {...state.suggestions, options: []}}));
                                        e.preventDefault();
                                    }
                                }
                            }}
                        />
                        {
                            suggestions.options.length > 0 ? (
                                <Paper className={classes.suggestionsContainer}>
                                    {suggestions.options.map((suggestion, idx) => (
                                        <MenuItem 
                                        key={suggestion} 
                                        selected={suggestions.selectedIdx === idx}
                                        component="div" 
                                        onClick={(e: any) => {
                                            this.addTextFilter(suggestion);
                                            this.setState((state) => ({suggestions: {...state.suggestions, options: []}}));
                                            e.preventDefault();
                                        }}>{suggestion}</MenuItem>
                                    ))}
                                </Paper>
                            ): null
                        }
                    </div>
                </div>
                {/* Canvas ===================================================================== */}
                <div className={classes.canvas}>
                    <InteractionProvider manager={this._tableManager}>
                        <div className={classes.recordsContainer}>
                            <div className={classes.pinnedRecordsList}>
                                {this.getRecordViewers(shownRecords, true)}
                            </div>
                            <div className={classes.unpinnedRecordsList}>
                                {this.getRecordViewers(shownRecords, false)}
                            </div>
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
                                page: Math.min(page, Math.max(0, Math.ceil(shownRecords.length / (event.target.value as number) - 1)))
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

const styles = (theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            alignSelf: 'stretch',
            display: 'flex',
            margin: theme.scale(16),
        },
        sidebar: {
            width: 220,
            marginRight: theme.scale(16),
            overflow: 'auto',
        },
        canvas: {
            width: 0,  // Hack to stop overflow.
            flexGrow: 1,
            backgroundColor: theme.color.white,
            padding: theme.scale(16),
            borderRadius: theme.shape.borderRadius,
            display: 'flex',
            flexDirection: 'column',
        },
        sidebarBox: {
            backgroundColor: theme.color.white,
            borderRadius: theme.shape.borderRadius,
            padding: theme.scale(16),

            display: 'flex',
            flexDirection: 'column',
        },
        sidebarSpacer: {
            height: theme.scale(32),
        },
        sidebarIconHeading: {
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none',
            ...theme.vars.text.subheading,
        },
        icon: {
            marginRight: theme.scale(8),
        },

        // Level filter.
        levelFilterContainer: {
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
        },
        levelFilterSwatch: {
            width: theme.scale(6),
            borderRadius: theme.scale(2),
            marginLeft: theme.scale(2),
            marginRight: theme.scale(8),
        },
        levelFilterSwatchDebug: {
            backgroundColor: theme.color.gray.base,
        },
        levelFilterSwatchInfo: {
            backgroundColor: theme.color.blue.base,
        },
        levelFilterSwatchWarn: {
            backgroundColor: theme.color.yellow.base,
        },
        levelFilterSwatchError: {
            backgroundColor: theme.color.red.base,
        },
        levelFilterLabel: {
            ...theme.vars.text.body,
            marginRight: theme.scale(8),
        },
        levelFilterCaption: {
            ...theme.vars.text.caption,
            color: theme.vars.emphasis.less,
            flexGrow: 1,
            alignSelf: 'flex-end',
            textAlign: 'right',
        },
        
        // Time filter.
        timeFilterContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            ...theme.vars.text.caption,
            color: theme.vars.emphasis.less,
        },

        // Tags filter.
        tagsFilterContainer: {

        },

        // Records.
        recordsContainer: {
            height: '100%',
            overflow: 'scroll',
        },
        pinnedRecordsList: {

        },

        unpinnedRecordsList: {
            
        },

        filterBar: {
            width: '100%',
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
