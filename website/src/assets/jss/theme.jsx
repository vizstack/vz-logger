import { createMuiTheme } from "@material-ui/core/styles";
import { primaryColor, grayColor } from "./material-kit-react";

export default createMuiTheme({
    palette: {
        primary: {
            main: primaryColor,
        },
        secondary: {
            main: grayColor,
        }
    },
    overrides: {
        MuiIconButton: {
            root: {
                height: 32,
                width: 32,
            },
        },
        MuiSwitch: {
            switchBase: {
                height: 32,
            },
        },
    }
});