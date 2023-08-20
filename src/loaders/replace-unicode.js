module.exports = function (source) {
    return source.replace(/\$'/g, '\\u0024\'');
};