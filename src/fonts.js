const color = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[39m',
};

const background = {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    reset: '\x1b[49m',
};

const font = {
    underline: '\x1b[4m',
    strikethrough: '\x1b[9m',
    bold: '\x1b[1m',
    italic: '\x1b[3m',
    inverse: '\x1b[7m',
    reset: '\x1b[0m',
    link: '\x1b]8;;',
    linkClose: '\x1b]8;;\x1b\\',
};

// console.log(color.blue + 'This text will be displayed in blue.' + font.reset);
// console.log(color.red + font.bold + 'This text will be displayed in bold red.' + font.reset);
// console.log(background.yellow + color.black + 'This text will have a yellow background and black text color.' + font.reset);
// console.log(font.link + 'https://example.com' + font.linkClose + 'Click here to visit the website');
// console.log(font.underline + color.green + 'Underlined green text.' + font.reset);

module.exports = { color, background, font }