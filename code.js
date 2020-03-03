const themes = {};
const genereteThemes = () => {
    figma.getLocalPaintStyles().forEach(style => {
        const [theme, colorName] = style.name.split('/');
        if (!themes[theme])
            themes[theme] = {};
        themes[theme][colorName] = style;
    });
};
genereteThemes();
const invertTheme = {
    themeD: 'themeN',
    themeN: 'themeD',
};
const findThemeColor = (style) => {
    if (!style)
        return;
    const [theme, colorName] = style.name.split('/');
    const newTheme = invertTheme[theme];
    if (!newTheme)
        return style;
    return themes[invertTheme[theme]][colorName];
};
function applyColor(node) {
    if (node.children) {
        node.children.forEach(child => {
            applyColor(child);
        });
    }
    try {
        //handle background fills
        if (node.type === 'COMPONENT' || 'INSTANCE' || 'FRAME' || 'GROUP') {
            if (node.backgroundStyleId && node.backgroundStyleId !== figma.mixed) {
                let style = figma.getStyleById(node.backgroundStyleId);
                const newStyle = findThemeColor(style);
                if (newStyle) {
                    node.backgroundStyleId = newStyle.id;
                }
            }
        }
        //handle fills + strokesx
        if (node.type === 'RECTANGLE' || 'POLYGON' || 'ELLIPSE' || 'STAR' || 'TEXT' || 'VECTOR' || 'BOOLEAN_OPERATION' || 'LINE') {
            //fills
            if (node.fillStyleId && node.fillStyleId !== figma.mixed) {
                let style = figma.getStyleById(node.fillStyleId);
                const newStyle = findThemeColor(style);
                if (newStyle) {
                    node.fillStyleId = newStyle.id;
                }
            }
            //strokes
            if (node.strokeStyleId && node.strokeStyleId !== figma.mixed) {
                let style = figma.getStyleById(node.strokeStyleId);
                const newStyle = findThemeColor(style);
                if (newStyle) {
                    node.strokeStyleId = newStyle.id;
                }
            }
        }
        if (invertTheme[node.name]) {
            node.visible = !node.visible;
        }
    }
    catch (e) {
        debugger;
        console.log('e', e);
    }
}
figma.currentPage.clone();
const lastIndex = figma.root.children.length - 1;
figma.root.children[lastIndex].name = `${figma.currentPage.name} cloned`;
figma.root.children[lastIndex].children.forEach(node => applyColor(node));
figma.closePlugin();
