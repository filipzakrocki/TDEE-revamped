interface Config {
    headerHeight: number;
    footerHeight: number;
    mainFrameHeight: () => string;
}

export const config: Config = {
    headerHeight: 60,
    footerHeight: 60,
    mainFrameHeight: () => `calc(100vh - ${config.headerHeight + config.footerHeight}px)`,
};
