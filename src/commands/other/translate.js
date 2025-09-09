/**
 * @fileoverview
 * This script is designed to generate SEO-friendly content for a given HTML source.
 * It uses the Gemini API to translate and generate content based on the provided HTML and languages.
 *
 * Prerequisites:
 * - Node.js installed on your system.
 * - The Google Generative AI library installed:
 * `npm install @google/generative-ai`
 * - A valid Gemini API key.
 *
 * Usage:
 * Import and call the `translateHtml` function with the HTML source, languages array, and options.
 */

/**
 * Example for structured data translation:
 *
 * {
 *   "selector": "script[type='application/ld+json']",
 *   "innerHTML": {
 *     "en": {
 *       "@context": "http://schema.org",
 *       "@type": "WebPage",
 *       "name": "Basketball Betting Sportsbook | NBA, EuroLeague, NCAA & Global Leagues",
 *       "description": "Unlock premier basketball betting at Amapola Sportsbook. Get competitive odds for NBA, EuroLeague, NCAA, and global basketball. Enjoy live betting, swift payouts, and insightful picks for an unmatched wagering experience.",
 *       "url": "https://amapolacasino.com/sportsbook/basketball/",
 *       "image": "https://amapolacasino.com/assets/basketball-og.jpg",
 *       "author": {
 *         "@type": "Organization",
 *         "name": "AmapolaCasino"
 *       }
 *     },
 *     "es": { ... },
 *     "fr": { ... },
 *     "pt": { ... },
 *     "ht": { ... },
 *     "nl": { ... },
 *     "gn": { ... }
 *   }
 * }
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Config = require("@cocreate/config");
const MODEL_NAME = "gemini-2.5-flash-lite";

// Send HTML to Gemini AI and get translation JSON
// Exported function to generate translation object for HTML source and languages
async function getApiKey(options) {
	if (options.apiKey) return options.apiKey;
	const config = await Config({
		GoogleGenerativeAIApiKey: {
			prompt: "Enter your Google Generative AI API key: "
		}
	});
	return config.GoogleGenerativeAIApiKey;
}

module.exports = async function translateHtml(html, languages, options = {}) {
	const apiKey = await getApiKey(options);
	if (!apiKey)
		throw new Error(
			"Google Generative AI API key is required in options.apiKey, process.env, or via prompt."
		);
	const genAI = new GoogleGenerativeAI(apiKey);
	const model =
		options.model || genAI.getGenerativeModel({ model: MODEL_NAME });
	const translationObj = await generateTranslationObject(
		html,
		model,
		languages
	);
	return translationObj;
};

// Update generateTranslationObject to accept only html, model, languages
async function generateTranslationObject(html, model, languages) {
	const langList = languages.map((l) => `"${l}"`).join(", ");
	const prompt = `
You are an expert web localization AI. Given the following HTML file, extract all translatable content (titles, meta tags, headers, buttons, video/image alt/title, labels, aria-label, all aria-* attributes, and placeholders) and generate a JSON object in the following format:

{
  "translations": [
    {
      "selector": "<css selector>",
      "innerHTML": {
        ${languages
			.map((l) => `\"${l}\"`)
			.join(
				", \
        "
			)}
      }
    },
    {
      "selector": "<css selector>",
      "attributes": {
        "alt": { ${langList} },
        "label": { ${langList} },
        "aria-label": { ${langList} },
        "aria-*": { ${langList} },
        "title": { ${langList} },
        "placeholder": { ${langList} }
      }
    },
    // Example for structured data translation:
    {
      "selector": "script[type='application/ld+json']",
      "innerHTML": {
        "en": { "@context": "http://schema.org", "@type": "WebPage", "name": "English name", "description": "English description" },
        "es": { "@context": "http://schema.org", "@type": "WebPage", "name": "Spanish name", "description": "Spanish description" },
        "fr": { "@context": "http://schema.org", "@type": "WebPage", "name": "French name", "description": "French description" }
        // ...other languages
      }
    }
    // ...more selectors as needed
  ]
}

Do not add any extra keys or key names not shown in this structure. Only use the keys: name, directory, path, content-type, translations, selector, innerHTML, attributes, alt, label, aria-label, aria-*, title, placeholder, and the language codes (${languages.join(
		", "
	)}).

For every translatable item (innerHTML and attributes), provide a translation for each language: ${languages.join(
		", "
	)}. Do not leave any language blank. For Guarani (\"gn\"), always translate to Guarani and never leave it in English.

Only output the JSON object, do not include any explanation or extra text.

HTML:
${html}
`;

	try {
		const result = await model.generateContent(prompt);
		let jsonText = result.response.candidates[0].content.parts[0].text;
		jsonText = jsonText
			.replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1")
			.trim();
		return JSON.parse(jsonText).translations;
	} catch (err) {
		console.error(`AI error:`, err);
		return null;
	}
}
