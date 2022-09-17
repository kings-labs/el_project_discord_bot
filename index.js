/**
 * This is the main script of the bot. Running it takes the bot online.
 * It needs to be constantly run for the bot to be always available.
 */

// Require the necessary discord.js classes
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SelectMenuBuilder, Collection } = require('discord.js');
const { token, mainChannelId } = require('./config.json');
const feedbackRequest = require("./services/feedback-request");
const fs = require('node:fs');
const path = require('node:path');

// Import dependecies to work with CSV
const fsCsv = require("fs");
const csv = require("csvtojson"); // To read the csv file 
const { Parser } = require("json2csv"); // To write the 

// Create a new client instance
const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
	],
});

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
	console.log('Ready !');	
	sendNewClientMessage(1, ["Monday 9AM", "Wednesday 2PM", "Thursday 6PM"], 10, "Maths", "GCSE", 2, 1);
	sendNewClientMessage(2, ["Monday 9AM", "Wednesday 2PM", "Thursday 6PM"], 10, "CS", "Uni", 1, 2);
});

/**
 * Sends a message displaying a new client annoucement to tutor's discord channel.
 * User has the possibility to select time slots via a button.
 * @param {Array} availabilities 
 * @param {number} money 
 * @param {String} subject 
 * @param {String} level 
 * @param {number} frequency
 * @param {number} classDuration
 */
function sendNewClientMessage(announcementId, availabilities, money, subject, level, frequency, classDuration) {

	// Get the channel to which it will send the annoucements
	const channel = client.channels.cache.get(mainChannelId);
	// Create message object 
	const msgEmbed = new EmbedBuilder()
		.setColor(0x7289DA)
		.setTitle('New Client Anouncement')
		.setDescription(`**Subject:** ${subject} \n**Level:** ${level} \n**Class(es) per week:** ${frequency} \n**Pay per class:** ${money} \n**Time slots:** ${availabilities.join(", ")}\n**Class duration**: ${classDuration} hour(s)`)
		.setTimestamp() 
		.setFooter({ text: 'Please select the date and time that fits you best and we will get back to you on the next steps.', iconURL:'https://i.imgur.com/i1k870R.png'});

	//Create a row object that will hold the select menu
	const row = new ActionRowBuilder();

	//Create Select Menu object
	const menu = new SelectMenuBuilder()
				.setCustomId("dateSelection")
				.setPlaceholder(`Please select ${frequency} date option(s)`)
				.setMinValues(frequency)
				.setMaxValues(frequency)

	//Loop through the availabilities' list and display every ability to tutor via select menu 
	availabilities.forEach((dateAndTime) => {
		menu.addOptions(
			{
				"label": dateAndTime,
				"value": dateAndTime
			}
		)
	});

	//Add menu to row
	row.addComponents(menu);

	// Add submit button inside new row
	const row2 = new ActionRowBuilder()
		.addComponents( 
			new ButtonBuilder()
				.setCustomId("submitButton")
				.setLabel('Submit request')
				.setStyle(ButtonStyle.Success),

			new ButtonBuilder()
				.setCustomId("cancelButton")
				.setLabel('Cancel request')
				.setStyle(ButtonStyle.Danger),

		);
			
	// Sends both objects to channel
	channel.send({ embeds: [msgEmbed], components: [row,row2]});
}


client.on('interactionCreate', async interaction => {
	
	// The answers of all tutors that are stored inside the CSV in the form of an array
	const answers = await csv().fromFile("answers.csv");

	if (interaction.customId === 'dateSelection') {
	
		// Checks if the tutor has already an answer stored inside then CVS
		if (tutorMadeASelection(interaction.user.id, answers)) {
			interaction.reply({ content: "You have registered answers to a previous announcement which you have not yet submitted or canceled. Please do so before attempting to register new one for this announcement.", ephemeral: true });
		} 
		else {
			// Pushes the latest answer 
			answers.push({ tutorId: interaction.user.id, selection: interaction.values.toString() });

			//Writes the modifications in the CSV file 
			fsCsv.writeFileSync("answers.csv", new Parser({fields: ["tutorId", "selection"] }).parse(answers));

			interaction.reply({ content: "If you're done with your selection, please submit. You can still change your selection.", ephemeral: true });
		}
		
	}

	if (interaction.customId === 'submitButton') {

		if (tutorMadeASelection(interaction.user.id, answers)) {

			// POST request to API is created with tutorId and selection under tutorDemand route

			interaction.reply({content: "Your request has been sent.", ephemeral: true});

			// Delete the appropriate line in the CSV and write the new CSV state
			fsCsv.writeFileSync("answers.csv", new Parser({fields: [ "tutorId", "selection"] }).parse(deleteTutorAnswer(interaction.user.id, answers)));
		}
		else {
			interaction.reply({content: "Please make sure to select your date options before submitting a request.", ephemeral: true});
		}
	}

	if (interaction.customId === 'cancelButton') {

		if (tutorMadeASelection(interaction.user.id, answers)) {

			fsCsv.writeFileSync("answers.csv", new Parser({fields: [ "tutorId", "selection"] }).parse(deleteTutorAnswer(interaction.user.id, answers)));

			interaction.reply({content: "Your request has been successfully canceled.", ephemeral: true});
		}
		else {
			interaction.reply({content: "You don't have any request in progress at the moment.", ephemeral: true});
		}
	}

});

/**
 * Searches through the csv file if there already is an answer of a particular tutor. 
 * 
 * @param {Number} tutorId The id of the tutor we're looking for.
 * @param {Array} csvArray The array that contains all the tutors' answers.
 * @returns true if the tutor has been found, false otherwise.
 */
function tutorMadeASelection(tutorId, csvArray) {

	if (csvArray.length == 0) return false;

	let isFound = false;

	csvArray.forEach(answer => {
		if (answer.tutorId == tutorId) {
			isFound = true;
		}
	});

	return isFound;
}
/**
 * 
 * This function deletes the object of a particular tutor inside the csv array.
 * 
 * @param {number} tutorId The id of the tutor from whom we are going to delete the answer.
 * @param {Array} csvArray The array that contains the element we want to delete. 
 * @returns The updated version of the csv array.
 */
function deleteTutorAnswer(tutorId, csvArray) {

	let tutorAnswerObject = undefined;

	// Find the object to delete and assign it to tutorAnswerObject variable
	csvArray.every(answer => {

		if (answer.tutorId == tutorId) {
			tutorAnswerObject = answer;
		 	return false;
		}

		return true;
	});

	const indexOfElementToDelete = csvArray.indexOf(tutorAnswerObject); // Get the idex of the object to delete

	if (indexOfElementToDelete > -1) { // only splice array when item is found
		csvArray.splice(indexOfElementToDelete, 1); // 2nd parameter means remove one item only
	}

	return csvArray;
}

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
	// Handle clicking the start button for submitting a class feedback
	if (interaction.isButton() && interaction.customId === 'startFeedback')	{
		feedbackRequest.sendFeedbackMessage(interaction);
	}

	// Handle choosing the class for submitting a class feedback
	else if (interaction.isSelectMenu() && interaction.customId === 'feedbackClassSelected')	{
		feedbackRequest.showFeedbackForm(interaction);
	}

	// Handle submitting a class feedback form
	else if(interaction.isModalSubmit() && interaction.customId === 'feedbackForm') {
		feedbackRequest.feedbackFormSubmission(interaction);
	}	
	
});


// Login to Discord with your client's token
client.login(token);