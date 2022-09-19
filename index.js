/**
 * This is the main script of the bot. Running it takes the bot online.
 * It needs to be constantly run for the bot to be always available.
 * 
 * To learn more about Discord.js: https://discordjs.guide
 */

// Require the necessary files
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const feedbackRequest = require('./services/feedback-request');
const cancellationRequest = require('./services/cancellation-request');
const reschedulingRequest = require('./services/rescheduling-request');
const courseRequest = require('./services/course-requests');
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Hold all of the slash commands of this client (empty now)
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands'); // The path of the file storing the commands
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); // Take only the javascript files

// fill the client.commands collection with the slash commands
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log('Ready !');
	// Executes the function getCourseRequests every 1 hour (=3,600,000 millisecs).
	setInterval(() => courseRequest.getCourseRequests(), 3600000);
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
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true
		});
	}
});

// This block of code has if else statements to handle all of the users' interactions with the bot
client.on('interactionCreate', async interaction => 
{
	// Handle button interactions
	if (interaction.isButton())	{
		// Handle clicking the start button for submitting a class feedback
		if (interaction.customId === 'startFeedback')	{
			feedbackRequest.sendFeedbackMessage(interaction);
		}
		// Handle clicking the start button for requesting a class cancellation
		else if (interaction.customId === 'startCancellation')	{
			cancellationRequest.sendCancellationMessage(interaction);
		}
		// Handle clicking the start button for requesting a class rescheduling
		else if (interaction.customId === 'startRescheduling')	{
			reschedulingRequest.sendReschedulingMessage(interaction);
		}
	}

	// Handle select-menu interactions
	else if (interaction.isSelectMenu())	{
		// Handle choosing the class for submitting a class feedback
		if (interaction.customId === 'feedbackClassSelected')	{
			feedbackRequest.showFeedbackForm(interaction);
		}
		// Handle choosing the class for requesting a class cancellation
		else if (interaction.customId === 'cancellationClassSelected')	{
			cancellationRequest.showCancellationForm(interaction);
		}
		// Handle choosing the class for requesting a class rescheduling
		else if (interaction.customId === 'reschedulingClassSelected')	{
			reschedulingRequest.showReschedulingForm(interaction);
		}
	}

	// Handle modal submission interactions
	else if (interaction.isModalSubmit())	{
		// Handle submitting a class feedback form
		if (interaction.customId === 'feedbackForm') {
			feedbackRequest.feedbackFormSubmission(interaction);
		}
		// Handle submitting a class cancellation request
		else if (interaction.customId === 'cancellationForm')	{
			cancellationRequest.cancellationFormSubmission(interaction);
		}
		// Handle submitting a class rescheduling request
		else if (interaction.customId === 'reschedulingForm')	{
			reschedulingRequest.reschedulingFormSubmission(interaction);
		}
	} 
});

// Login to Discord with your client's token
client.login(token);