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
     * have entered an invalid date, either because it has passed or it is
     * in an invalid format.
     * 
     * @param {interaction} interaction The user interaction object
     */
     async invalidDateMessage(interaction)	{
        try {
            const invalidDateMessage = 'Invalid date entered! \nPlease suggest a new date which has not passed, in MM/DD/YYYY format.';
            await interaction.update({ content: invalidDateMessage, embeds: [], components: [] , ephemeral: true });
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

}