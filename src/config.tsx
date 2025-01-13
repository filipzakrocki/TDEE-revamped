interface Config {
    backgroundLeft: string;
    backgroundRight: string;
    headerLeft: string;
    headerRight: string;
    headerHeight: number;
    footerHeight: number;
    mainFrameHeight: () => string;
}

export const config: Config = {
    backgroundLeft: "linear(to-r, green.200, teal.500)",
    backgroundRight: "linear(to-r, teal.500, green.200)",
    headerLeft: "linear(to-r, blue.900, blue.700, blue.500)",
    headerRight: "linear(to-r, blue.500, blue.700, blue.900)",
    headerHeight: 60,
    footerHeight: 60,
    mainFrameHeight: (noFooter: boolean = false) => `calc(100vh - ${noFooter ? config.headerHeight : config.headerHeight + config.footerHeight}px)`,
};
