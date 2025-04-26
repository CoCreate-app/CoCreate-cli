// Define an object holding various spinner patterns, each pattern is an array of strings representing different frames
const spinnerPatterns = {
	// Dots pattern: sequential increase in dots
	dots: [".  ", ".. ", "..."],

	// Bar filling up incrementally
	bar: ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"],

	// A bouncing ball effect using Braille characters
	bouncingBall: ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],

	// Wave pattern: characters form a wave-like effect
	wave: ["⎺", "⎻", "⎼", "⎽", "⎼", "⎻"],

	// Rotating arrows pattern for direction indication
	arrows: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],

	// Rotating dots pattern with increasing and decreasing length
	rotatingDots: [
		".    ",
		"..   ",
		"...  ",
		".... ",
		".....",
		" ....",
		"  ...",
		"   ..",
		"    ."
	],

	// Horizontal bounce pattern to simulate a bouncing ball effect
	horizontalBounce: [
		"[    ]",
		"[=   ]",
		"[==  ]",
		"[=== ]",
		"[ ===]",
		"[  ==]",
		"[   =]"
	]
};

// spinner.js

/**
 * Creates a spinner with the specified configuration
 * @param {Object} options - Configuration options for the spinner
 * @param {string} options.type - The type of spinner pattern
 * @param {number} options.milliseconds - Interval in milliseconds for frame change
 * @param {string} options.prefix - String to prefix before the spinner frame
 * @param {string} options.suffix - String to suffix after the spinner frame
 * @param {Function} options.onComplete - Callback function to execute when the spinner ends
 * @returns {Object} - An object with an `end` method to stop the spinner
 */
function createSpinner({
	type = "dots", // Default type is 'dots'
	milliseconds = 200, // Default interval time is 200 ms
	prefix = "", // Default prefix is an empty string
	suffix = "", // Default suffix is an empty string
	onComplete = () => process.stdout.write("\r") // Default onComplete action is to clear the line
}) {
	// Get the frames for the specified spinner type, fall back to 'dots' pattern if type not found
	const frames = spinnerPatterns[type] || spinnerPatterns.dots;
	let spinnerIndex = 0; // Track current frame index

	// Set an interval to update the spinner frame
	const interval = setInterval(() => {
		// Write spinner frame to the process standard output along with prefix and suffix
		process.stdout.write(`\r${prefix}${frames[spinnerIndex]}${suffix}`);
		// Update frame index, reset to 0 if it exceeds available frames
		spinnerIndex = (spinnerIndex + 1) % frames.length;
	}, milliseconds);

	// Return an interface to interact with spinner
	return {
		// Method to stop the spinner and execute the onComplete callback
		end: () => {
			clearInterval(interval); // Clear the frame update interval
			onComplete(); // Execute onComplete callback (default clears the current line)
		}
	};
}

// Export createSpinner function as a module
module.exports = createSpinner;
