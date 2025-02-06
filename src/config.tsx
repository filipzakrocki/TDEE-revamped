import { Calendar, BarChart3, HelpCircle, Settings, LogOut } from "lucide-react";

interface Config {
    startingPoint: string;

    headingFont: string;
    bodyFont: string;

    backgroundColor: string;
    backgroundNav: string;

    green: string;
    red: string;
    orange: string;
    purple: string;
    black: string;

    test1: string;
    test2: string;
    test3: string;
    test4: string;
    test5: string;
    
    headerHeight: number;
    padding: number;
    headingMargin: number;

    subheaderMargin: number;
    footerHeight: number;
    sidenavWidth: string;
    leftPanelWidth: number;
    rightPanelWidth: number;
    minRightPanelWidth: number;
    mainFrameHeight:  string;
    borderRadius: number;

    menuItems: MenuItem[]
}

interface MenuItem {
    icon: React.ElementType;
    route: string;
    divider?: boolean;
}

export const config: Config = {
    // misc
    startingPoint: '/calculator',

    // font families:
    headingFont: `'Raleway', sans-serif`,
    bodyFont: `'Lato', sans-serif`,

    // colors
    backgroundColor: '#fbf9f7',                 // off-white
    backgroundNav: '#f3ebe4',                   // light beige

    green: '#c0f1dc',
    red: '#f3c5c5',
    orange: '#f9e1c0',
    purple: '#d5d3ff',
    black: '#0a060e',

    test1: '#BFA897',
    test2: '#D6C5B8',
    test3: '#6B8F71',
    test4: '#3D5C47',
    test5: '#4A7A57',


    // spacing
    padding: 4,
    headingMargin: 20,
    subheaderMargin: 5,

    headerHeight: 0,
    footerHeight: 60,
    sidenavWidth: '100px',
    leftPanelWidth: 20,
    rightPanelWidth: 5,
    minRightPanelWidth: 300,
    mainFrameHeight: `calc(100vh - 50px)`,
    borderRadius: 15,

    // menu items
    menuItems: [
        { icon: Calendar, route: "/calculator" },
        { icon: BarChart3, route: "/analysis" },
        { icon: HelpCircle, route: "/faq", divider: true },
        { icon: Settings, route: "/setup" },
        { icon: LogOut, route: "/logout" },
      ]
};