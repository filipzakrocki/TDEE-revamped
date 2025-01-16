interface Config {
    backgroundLeft: string;
    backgroundRight: string;
    headerLeft: string;
    headerRight: string;
    headerHeight: number;
    padding: number;
    footerHeight: number;
    leftPanelWidth: number;
    rightPanelWidth: number;
    minRightPanelWidth: number;
    mainFrameHeight: () => string;
}

export const config: Config = {
    headerLeft: "#1f3c4d",
    headerRight: "#04e0be",
    backgroundLeft: "transparent",
    backgroundRight: "#1f3c4d",
    padding: 6,
    headerHeight: 40,
    footerHeight: 60,
    leftPanelWidth: 9,
    rightPanelWidth: 2,
    minRightPanelWidth: 300,
    mainFrameHeight: (noFooter: boolean = false) => `calc(100vh - ${noFooter ? config.headerHeight : config.headerHeight + config.footerHeight}px)`,
};
