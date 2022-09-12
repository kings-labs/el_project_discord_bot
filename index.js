/**
 * This is the main script of the bot. Running it takes the bot online.
 * It needs to be constantly run for the bot to be always available.
 */

// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const forms = require("./forms");
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

// ---- INTERACTION HANDLING ----

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
	// Handle the submit form interaction for T04 testing
	if (interaction.isModalSubmit() && interaction.customId === 'testModal') {
		testModalSubmission(interaction);
	}	
	
	// Handle the select menu interaction (/job command) for T04 testing
	else if (interaction.isSelectMenu() && interaction.customId === 'classSelect')	{
		jobMessageInteraction(interaction);
	}
	
});

/**
 * Handle the select menu interaction (/job command).
 * Take the chosen class' class ID, then call the 'forms' script execute function 
 * and pass it the class ID.
 * 
 * @param {Interaction} interaction The user interaction object
 */
async function jobMessageInteraction(interaction)	{
	// The chosen class' ID
	const selectedClassId = interaction.values[0];

	try {
		// call the forms function which shows users a form (modal)
		forms.execute(interaction, selectedClassId);
	} catch (error) {
		console.error(error);
		interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

/**
 * Handle the test modal submission (forms submission).
 * Extract all of the data from the interaction, then make an
 * HTTP POST request with the API.
 * 
 * The API part is now commented out because there's no route for
 * this test function.
 * 
 * @param {Interaction} interaction The user interaction object
 */
async function testModalSubmission(interaction)	{
	// Get the data entered by the user
	const userName = interaction.fields.getTextInputValue('nameInput');
	const aboutSelf = interaction.fields.getTextInputValue('aboutSelfInput');
	const selectedClassId = interaction.fields.getTextInputValue('classInfo');

	// print the data. FOR TESTING ONLY
	console.log(`User: ${interaction.user.id} \nName: ${userName} \nWhy apply: ${aboutSelf} \nClass ID: ${selectedClassId}\n`);
	
	// Holds the extracted data in JSON format (to be sent to the API)
	const requestData = {
		name: userName,
		about: aboutSelf,
		classId: selectedClassId
	};
	// const params = {
	// 	headers : {'Content-Type': 'application/json'},
	// 	body: requestData,
	// 	method: "POST"
	// };

	// fetch("url", params);

	try {
		// Update the user's request into a confirmation message
		const confirmationMessage = 'Your submission has been received successfully! \nYou will recieve an email about the status of your request when it is completed.';
		await interaction.update({ content: confirmationMessage, embeds: [], components: [] , ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

// Login to Discord with your client's token
client.login(token);