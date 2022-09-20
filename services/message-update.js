/**
 * This script holds methods to send users messages about the status 
 * of their requests. It is useful for multiple classes.
 */

module.exports = {

    /**
     * Update the interaction's message to confirm to the user
     * that their request has been successful.
     * 
     * @param {interaction} interaction The user interaction object
     */
    async confirmationMessage(interaction)	{
        try {
            const confirmationMessage = 'Your submission has been received successfully! \nYou will recieve an email about the status of your request when it is completed.';
            await interaction.update({ content: confirmationMessage, embeds: [], components: [] , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Update the interaction's message to confirm to the user that their rescheduling request 
     * has been successful and show them their selected date.
     * 
     * Example of the date format of the message: 09 September 2001
     * 
     * @param {interaction} interaction The user interaction object
     * @param {string} newDate The user chosen date in MM/DD/YYYY format
     */
    async newDateConfirmationMessage(interaction, newDate)  {
        // Holds number of the months and their corresponding names
        const monthNumToText = {"01" : "January", "02" : "February", "03" : "March", "04" : "April", "05" : "May",
        "06" : "June", "07" : "July", "08" : "August", "09" : "September", "10" : "October", "11" : "November",
        "12" : "December"};
        // Extract the day, month's name and year of the user chosen date
        const extractedMonth = monthNumToText[newDate.split("/")[0]];
        const extractedDay = newDate.split("/")[1];
        const extractedYear = newDate.split("/")[2];

        try {
            const newDateConfirmationMessage = `You have requested to reschedule your class to ${extractedDay} ${extractedMonth} ${extractedYear} \nYou will recieve an email about the status of your request when it is completed.`;
            await interaction.update({ content: newDateConfirmationMessage, embeds: [], components: [] , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Update the interaction's message to inform the user that there
     * was an error because they changed the class ID to an invalid ID.
     * 
     * @param {interaction} interaction The user interaction object
     */
    async invalidClassIdMessage(interaction)	{
        try {
            const invalidClassIdMessage = 'Invalid class ID entered! \nPlease do not change the class ID unless instructed otherwise.';
            await interaction.update({ content: invalidClassIdMessage, embeds: [], components: [] , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Update the interaction's message to inform the user that they
     * have entered an invalid date format.
     * 
     * @param {interaction} interaction The user interaction object
     */
     async invalidDateFormatMessage(interaction)	{
        try {
            const invalidDateFormatMessage = 'Invalid date format entered! \nPlease suggest a new date in MM/DD/YYYY format.';
            await interaction.update({ content: invalidDateFormatMessage, embeds: [], components: [] , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Update the interaction's message to inform the user that they
     * have entered an invalid date because it is not in the future.
     * 
     * @param {interaction} interaction The user interaction object
     */
     async datePassedMessage(interaction)	{
        try {
            const datePassedMessage = 'Invalid date entered! \nYour suggested date has to be in the future.';
            await interaction.update({ content: datePassedMessage, embeds: [], components: [] , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Update the interaction's message to inform the user that their request
     * is unsuccessful because they have already sent a request.
     * 
     * @param {interaction} interaction The user interaction object
     */
    async pendingRequestMessage(interaction)	{
        try {
            const pendingRequestMessage = 'You have already submitted a request for this class! \nWe will get back to you soon, thank you.';
            await interaction.update({ content: pendingRequestMessage, embeds: [], components: [] , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Reply to the interaction's message to inform the user that their request
     * is unsuccessful because they do not have any active classes
     * 
     * @param {interaction} interaction The user interaction object
     */
    async noAvailableClassesMessage(interaction)	{
        try {
            const noAvailableClassesMessage = 'You do not have any active classes!';
            await interaction.reply({ content: noAvailableClassesMessage , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Reply to the interaction's message to inform the user about server errors
     * 
     * @param {interaction} interaction The user interaction object
     */
    async serverErrorMessage(interaction)	{
        try {
            const serverErrorMessage = 'There was an error while communicating with the server!';
            await interaction.reply({ content: serverErrorMessage , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    // --- COURSE REQUEST MESSAGES ---

    /**
     * Reply to the interaction's message to inform the user that they need to submit or cancel 
     * their answer to a previous course request to proceed to another one.
     * 
     * @param {Interaction} interaction 
     */
    async alreadySelectedCourseOptionsMessage(interaction)    {
        try {
            const alreadySelectedCourseOptionsMessage = 'You have registered answers to a previous announcement which you have not yet submitted or cancelled! \nPlease do so before attempting to register a new one for this announcement.';
            await interaction.reply({ content: alreadySelectedCourseOptionsMessage , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Reply to the interaction's message to inform the user that their answer is in a pending and needs to be submitted.
     * 
     * @param {Interaction} interaction 
     */
    async waitingForCourseSubmissionMessage(interaction)    {
        try {
            const waitingForCourseSubmissionMessage = 'If you are done with your selection, please submit! \nYou can still change your selection.';
            await interaction.reply({ content: waitingForCourseSubmissionMessage , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Reply to the interaction's message to confirm to the user that their answer has been saved.
     * 
     * @param {Interaction} interaction 
     */
    async courseRequestConfirmationMessage(interaction, answer)    {
        try {
            const courseRequestConfirmationMessage = `Your request for ${answer.replace(",", ", ")} has been sent.`;
            await interaction.reply({ content: courseRequestConfirmationMessage , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Reply to the interaction's message to confirm to the user that their answer has been canceled.
     * 
     * @param {Interaction} interaction 
     */
    async courseRequestCancellationMessage(interaction, answer)    {
        try {
            const courseRequestCancellationMessage = `Your request for ${answer.replace(",", ", ")} has been cancelled.`;
            await interaction.reply({ content: courseRequestCancellationMessage , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Reply to the interaction's message to inform the user that they haven't selected any answer. 
     * It occurs whenever the user tries to submit their answer without acc having selected their date options.
     * 
     * @param {Interaction} interaction 
     */
    async noCourseDateSelectedMessage(interaction)    {
        try {
            const noCourseDateSelectedMessage = 'Please (re)select your date options before submitting a request.';
            await interaction.reply({ content: noCourseDateSelectedMessage , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

    /**
     * Reply to the interaction's message to inform the user that they don't have any pending request at the moment. 
     * It occurs whenever the user tries to cancel their answer to a course without acc having selected their date options.
     * 
     * @param {Interaction} interaction 
     */
    async noCourseRequestActiveMessage(interaction)    {
        try {
            const noCourseRequestActiveMessage = 'You do not have any request in progress at the moment';
            await interaction.reply({ content: noCourseRequestActiveMessage , ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },

}