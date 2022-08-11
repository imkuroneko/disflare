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

        rest.put(Routes.applicationCommands(clientId), { body: client.slashRegister }).then(() => {
            message.reply('🦄 Todos los comandos fueron registrados/actualizados!');
        }).catch((error) => {
            console.error('prfx cmd slashregister ::'+error.message);
        });
    } catch (error) {
        console.error('[error] cmdPrefix:slashregister |',error.message);
    }
}