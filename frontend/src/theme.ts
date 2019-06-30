import { createMuiTheme } from '@material-ui/core/styles';

/* CSS-in-JS custom theme object to set visual properties (fonts, colors, spacing, etc.) */
type Color = string;
type Color5 = { l2: Color; l1: Color; base: Color; d1: Color; d2: Color };
type Color7 = { l3: Color; d3: Color } & Color5;
type ScaleValues =
    | 0
    | 1
    | 2
    | 4
    | 6
    | 8
    | 12
    | 16
    | 24
    | 32
    | 48
    | 64
    | 96
    | 128
    | 192
    | 256
    | 384
    | 512
    | 640
    | 768
    | 1024
    | 1280
    | 1536
    | 1792
    | 2048;
type AdditionalOptions = {
    color: {
        white: Color;
        grey: Color7;
        blue: Color5;
        teal: Color5;
        green: Color5;
        yellow: Color5;
        red: Color5;
    };
    scale: (value: ScaleValues) => ScaleValues;
};

// Extend default Material UI defined configuration options.
declare module '@material-ui/core/styles/createMuiTheme' {
    interface Theme extends AdditionalOptions {}
    interface ThemeOptions extends AdditionalOptions {}
}

export default createMuiTheme({
    typography: {
        h1: { fontWeight: 300 }, // Grabber.
        h2: { fontWeight: 400 }, // Page title.
        h3: { fontWeight: 400 }, // App title.
        h4: { fontWeight: 500 }, // Page section heading.
        h5: { fontWeight: 500 }, // Page section subheading.
        h6: { fontWeight: 500 }, // App section heading.
        // subtitle1 = Page subtitle.
        // subtitle2 = App label.
        // body1 = Page body.
        // body2 = App body.
    },
    palette: {
        primary: {
            main: '#3183C8', // Same as blue.base.
        },
        secondary: {
            main: '#3CAEA3', // Same as teal.base.
        },
        error: {
            main: '#DC3030', // Same as red.base.
        },
    },
    color: {
        white: '#FFFFFF',
        grey: {
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
    spacing: 4,
    scale: (value: ScaleValues) => value,
    overrides: {
        MuiIconButton: {
            root: {
                height: 24,
                width: 24,
                color: 'inherit',
            },
        },
        MuiSvgIcon: {
            root: {
                fontSize: 16,
            },
        },
    },
});
