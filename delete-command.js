/**
 * This script is used to remove a slash commands from the bot. 
 * The script should only be run ONCE for a command!
 * 
 * To find the command ID, you have to activate developer mode on discord:
 * Server Settings -> Integrations -> Bots and Apps and choose your bot. Then, right click a command and click Copy ID.
 */

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(token);

// Add here the command ID of the command to be deleted
const commandId = '';

// for guild-based commands
rest.delete(Routes.applicationGuildCommand(clientId, guildId, commandId))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);