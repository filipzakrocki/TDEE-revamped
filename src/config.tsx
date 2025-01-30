import { Calendar, BarChart3, HelpCircle, Settings, LogOut } from "lucide-react";

interface Config {
    startingPoint: string;

    backgroundColor: string;
    backgroundNav: string;
    backgroundLeft: string;
    backgroundRight: string;

    green: string;
    red: string;
    orange: string;
    purple: string;
    black: string;
    
    headerHeight: number;
    padding: number;
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

    // colors
    backgroundColor: '#fbf9f7',
    backgroundNav: '#f3ebe4',
    backgroundLeft: "transparent",
    backgroundRight: "transparent",

    green: '#c0f1dc',
    red: '#f3c5c5',
    orange: '#f9e1c0',
    purple: '#d5d3ff',
    black: '#0a060e',

    // spacing
    padding: 4,
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