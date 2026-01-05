const { nanoid } = require('nanoid');

// Generate a short code of specified length (default 7)
// Using nanoid which is URL safe by default
// Note: nanoid v3+ is ESM only, but we are using CommonJS. 
// If the installed version is v3.3.7 (as in requirement), it supports CJS. 
// If v4+ or v5 is installed, we might need dynamic import or fix.
// PROMPT said "nanoid": "^3.3.7" in package list, which works with require.
const generateShortCode = async (length = 6) => {
    // Dynamically import nanoid if needed, but assuming v3 with require works as requested
    // If require fails we will fetch specific version.
    // For now, assuming require works.
    return nanoid(length);
};

module.exports = { generateShortCode };
