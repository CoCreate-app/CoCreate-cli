module.exports = {
	tabWidth: 4,
	endOfLine: "lf",
	semi: true,
	trailingComma: "none",
	bracketSameLine: true,
	useTabs: true,
	endOfLine: "lf",
	overrides: [
		{
			files: ["*.json", "*.yml", "*.yaml"],
			options: {
				tabWidth: 2,
				useTabs: false
			}
		}
	]
};
