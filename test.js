// File: generate-gmail-aliases.js
const fs = require('fs');

// Constants
const COMBINATIONS_HARD_LIMIT = 20000;

// Function to generate all combinations
function generateCombinations(email, maxCombinations = COMBINATIONS_HARD_LIMIT) {
    let [username, domain] = email.split("@");
    let queue = [''];

    // Sanitize inputs
    if (!username || typeof username !== "string") username = 'generator';
    if (!domain || typeof domain !== "string") domain = 'gmail.com';
    username = username.trim().replace(/\./g, '');

    // Remove plus part (if any)
    const plusIndex = username.lastIndexOf('+');
    let plus = null;
    if (plusIndex !== -1) {
        plus = username.slice(plusIndex + 1);
        username = username.slice(0, plusIndex);
    }

    // Process each character in the username
    for (let i = 0; i < username.length; i++) {
        let nextQueue = [];

        while (queue.length > 0) {
            let current = queue.shift();
            
            // Add without dot
            nextQueue.push(current + username[i]); 
            
            // Add with dot, but not at the last character
            if (i < username.length - 1 && nextQueue.length < maxCombinations) { 
                nextQueue.push(current + username[i] + '.');
            }
            
            // Stop processing if max combinations is reached
            if (nextQueue.length >= maxCombinations) {
                break; 
            }
        }

        queue = nextQueue;
    }

    let aliases = queue;
    
    // Format aliases with plus part (if any)
    if (plus) aliases = aliases.map(a => `${a}+${plus}`);
    
    // Add domain to each alias
    aliases = aliases.map(a => `${a}@${domain}`);

    return aliases;
}

// Function to save aliases to a JS file
function saveAliasesToFile(aliases, filename = 'allAccounts.js') {
    let output = 'let allAccounts = {\n';
    
    aliases.forEach((email, index) => {
        output += `  ${index + 1}: { email: '${email}' },\n`;
    });
    
    output += '};\n\nmodule.exports = allAccounts;';
    
    fs.writeFileSync(filename, output);
    console.log(`Saved ${aliases.length} aliases to ${filename}`);
}

// Main function
function generateAndSaveAliases(email) {
    try {
        console.log(`Generating aliases for: ${email}`);
        const aliases = generateCombinations(email);
        console.log(`Generated ${aliases.length} aliases`);
        
        saveAliasesToFile(aliases);
        console.log('Done!');
    } catch (error) {
        console.error('Error generating aliases:', error);
    }
}

// Get email from command line argument or use a default
const email = process.argv[2] || 'test@gmail.com';
generateAndSaveAliases(email);

