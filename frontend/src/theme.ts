/**
 * This file defines a CSS-in-JS custom theme object to define visual properties (fonts,
 * colors, spacing, etc.). It extends the built-in options provided by Material UI with
 * general-purpose variables as well as domain-specific (semantically meaningful) variables.
 */
import 'typeface-ubuntu-mono';
import { createMuiTheme } from '@material-ui/core/styles';
import { LightTheme } from '@vizstack/viewer';

type Color = string;
type Color5 = { l2: Color; l1: Color; base: Color; d1: Color; d2: Color };
type Color7 = { l3: Color; d3: Color } & Color5;

const general: {
    color: {
        white: Color;
        black: Color;
        gray: Color7;
        blue: Color5;
        teal: Color5;
        green: Color5;
        yellow: Color5;
        red: Color5;
    };
    // prettier-ignore
    scale: (value: 0 | 1 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 |24 | 32 | 48 | 64 | 96 | 128 | 192
        | 256 | 384 | 512 | 640 | 768 | 1024 | 1280 | 1536 | 1792 | 2048) => number;
} = {
    color: {
        white: '#FFFFFF',
        black: '#000000',
        gray: {
            l3: '#F8F9FA',
            l2: '#F1F3F5',
            l1: '#E9ECEE',
            base: '#DEE2E6',
            d1: '#B8C4CF',
            d2: '#8895A7',
            d3: '#5F6B7A',
        },
        blue: {
            l2: '#EFF8FF', // Container tints, secondary buttons.
            l1: '#AAD4F6', // Container borders, badges, chips.
            base: '#3183C8', // Icons, primary buttons.
            d1: '#2368A2', // Container text.
            d2: '#194971', // Heading text.
        },
        teal: {
            l2: '#E7FFFE',
            l1: '#A8EEEC',
            base: '#3CAEA3',
            d1: '#2A9187',
            d2: '#1B655E',
        },
        green: {
            l2: '#E3FCEC',
            l1: '#A8EEC1',
            base: '#38C172',
            d1: '#249D57',
            d2: '#187741',
        },
        yellow: {
            l2: '#FFFCF4',
            l1: '#FDF3D7',
            base: '#F4CA64',
            d1: '#CAA53D',
            d2: '#8C6D1F',
        },
        red: {
            l2: '#FCE8E8',
            l1: '#F4AAAA',
            base: '#DC3030',
            d1: '#B82020',
            d2: '#881B1B',
        },
    },
    scale: (value) => value,
};

// =================================================================================================

const specific = {
    vars: {
        ...LightTheme,
    },
};

// =================================================================================================

const fontFamily = '"Ubuntu Mono", "Courier New", monospace';
const builtin = {
    typography: {
        h1: { fontWeight: 300, fontFamily }, // Grabber.
        h2: { fontWeight: 400, fontFamily }, // Page title.
        h3: { fontWeight: 400, fontFamily }, // App title.
        h4: { fontWeight: 500, fontFamily }, // Page section heading.
        h5: { fontWeight: 500, fontFamily }, // Page section subheading.
        h6: { fontWeight: 500, fontFamily }, // App section heading.
        subtitle1: { fontFamily }, // Page subtitle.
        subtitle2: { fontFamily }, // App label.
        body1: { fontFamily }, // Page body.
        body2: { fontFamily }, // App body.
    },
    palette: {
        primary: {
            main: general.color.blue.base,
        },
        secondary: {
            main: general.color.blue.base,
        },
        error: {
            main: general.color.red.base,
        },
    },
    shape: {
        borderRadius: 8,
    },
    spacing: 4,
    overrides: {
        MuiIconButton: {
            root: {
                height: 10,
                width: 10,
                color: 'inherit',
            },
        },
        MuiSvgIcon: {
            root: {
                fontSize: 18,
            },
        },
        MuiList: {
            padding: {
                paddingTop: 0,
                paddingBottom: 0,
            }
        },
        MuiListItem: {
            root: {
                paddingTop: 0,
                paddingBottom: 0,
            }
        }
    },
};

type ThemeExtensions = typeof general & typeof specific;
declare module '@material-ui/core/styles/createMuiTheme' {
    interface Theme extends ThemeExtensions {}
    interface ThemeOptions extends ThemeExtensions {}
}

export default createMuiTheme({
    ...builtin,
    ...general,
    ...specific,
});
