const { clientId, token } = require('../../config/bot.json');
const roles = require('../../config/roles.json');

const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

exports.run = (client, message, args) => {
    try {

        const memberHasRole = message.member.roles.cache.filter((role) => roles.includes(role.id)).map((role) => role.id);
        if(!memberHasRole.length) {
            return message.reply("🚨 **no tienes permiso para ejecutar este comando!**");
        }

        const rest = new REST({ version: '10' }).setToken(token);

        rest.get(Routes.applicationCommands(clientId)).then((data) => {
            const promises = [];
            for(const command of data) {
                const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            Promise.all(promises);
        });

        return message.reply('🦄 Todos los comandos slash fueron eliminados (global y del guild)');

    } catch (error) {
        console.error('[error] cmdPrefix:slashdeleter |',error.message);
    }
}