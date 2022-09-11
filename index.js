/**
 * This is the main script of the bot. Running it takes the bot online.
 * It needs to be constantly run for the bot to be always available.
 */

// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Hold all of the slash commands of this client (empty now)
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');	// The path of the file storing the commands
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));	// Take only the javascript files

// fill the client.commands collection with the slash commands
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// A listener for user interactions which dictates how the bot handles slash command calls
client.on('interactionCreate', async interaction => {

	// Exit if the interaction isn't a chat command
	if (!interaction.isChatInputCommand()) return;

	// fetch the command in the Collection with that name and assign it to the variable chosenCommand
	const chosenCommand = interaction.client.commands.get(interaction.commandName);

	// exit early if the command doesn't exist
	if (!chosenCommand) return;

	try {
		// call the command's .execute() method, and pass in the interaction variable as its argument.
		await chosenCommand.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// This block of code has if else statements to handle all of the users' interactions with the bot
client.on('interactionCreate', async interaction => 
{
	// Handle the submit form interaction for the '/forms' command
	if (interaction.isModalSubmit() && interaction.customId === 'testModal') {
		interestModalSubmission(interaction);
	}	
	
	// Handle the register interest button for the '/job-message' command
	else if (interaction.isButton() && interaction.customId === 'register_interest')	{
		jobMessageInteraction(interaction);
	}
	
});

/**
 * Prompt the user to fill an interest form by calling another command '/forms'
 */
async function jobMessageInteraction(interaction)	{
	// fetch the 'forms' command in the Collection and assign it to the variable chosenCommand
	const chosenCommand = interaction.client.commands.get('forms');

	try {
		// call the command's .execute() method, and pass in the interaction variable as its argument.
		chosenCommand.execute(interaction);
	} catch (error) {
		console.error(error);
		interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

/**
 * Handle interest form submission
 */
async function interestModalSubmission(interaction)	{
	// Get and handle the data entered by the user
	const name = interaction.fields.getTextInputValue('nameInput');
	const aboutSelf = interaction.fields.getTextInputValue('aboutSelfInput');
	const classId = interaction.fields.getTextInputValue('classInfo');

	// console.log("Here: ", interaction);
	console.log(`User: ${interaction.member.user.username} \nName: ${name} \nWhy apply: ${aboutSelf} \nClass ID: ${classId}`);
	
	// const params = {
	// 	headers : {'Content-Type': 'application/json'},
	// 	body: {classId : "4232"},
	// 	method: "POST"
	// };

	// fetch("url", params);

	try {
		// Show the user a confirmation message
		await interaction.reply({ content: 'Your submission was received successfully!', ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

// Login to Discord with your client's token
client.login(token);