const cf_data = require('../../config/cloudflare.json');
const roles = require('../../config/roles.json');

const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cuenta')
        .setDescription('Ver información de mi cuenta')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const memberHasRole = interaction.member.roles.cache.filter((role) => roles.includes(role.id)).map((role) => role.id);
            if(!memberHasRole.length) {
                return interaction.reply({ content: '🚨 **no tienes permiso para ejecutar este comando!**', ephemeral: true });
            }

            let res = await axios({
                method: 'get',
                url: 'https://api.cloudflare.com/client/v4/user',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Email': cf_data.email_account,
                    'X-Auth-Key': cf_data.global_key
                }
            });

            if(!res.data.success) {
                return interaction.reply({ content: 'No se pudo obtener la información de la cuenta~', ephemeral: true });
            }

            const info = res.data.result;

            return interaction.reply({ embeds: [{
                color: 0xf58540,
                title: `🔍 Información de la cuenta Cloudflare`,
                fields: [
                    { name: 'ID', value: "```"+info.id+"```" },
                    { name: 'Nombre y Apellido', value: "```"+info.first_name+' '+info.last_name+"```" },
                    { name: 'Correo Electrónico', value: "```"+info.email+"```" },
                    { name: '2FA Activado', value: "```"+((info.two_factor_authentication_enabled) ? 'Si 💯' : 'No ⛔')+"```" }
                ]
            }] });
        } catch (error) {
            console.error('[error] cmdSlash:cuenta |', error.message);
            return interaction.reply({ content: '😖 Hubo un inconveniente al ejecutar el comando, revisa la consola del servidor para saber mas', ephemeral: true });
        }
    }
};