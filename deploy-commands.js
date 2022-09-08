/**
 * This script is used to add new slash commands to the bot. 
 * The script should only be run ONCE, unless a command is edited or added.
 */

// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json');

// Hold all of the slash commands of this bot (empty now)
const commands = [];
const commandsPath = path.join(__dirname, 'commands');  // The path of the file storing the commands
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); // Take only the javascript files

// fill the commands collection with the slash commands
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);   // A REST manager

// Add the commands to the bot
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);