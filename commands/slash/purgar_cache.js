const cf_data = require('../../config/cloudflare.json');
const roles = require('../../config/roles.json');
const zonas = require('../../data/zonas.json');

const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purgar_cache')
        .setDescription('Purgar toda la caché de una zona indicada')
        .addStringOption(option => option.setName('dominio').setDescription('El dominio a purgar').setRequired(true).addChoices(...Object.keys(zonas).map((key) => ({ 'name' : zonas[key], 'value' : key }))))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const memberHasRole = interaction.member.roles.cache.filter((role) => roles.includes(role.id)).map((role) => role.id);
            if(!memberHasRole.length) {
                return interaction.reply({ content: '🚨 **no tienes permiso para ejecutar este comando!**', ephemeral: true });
            }

            const dominio = interaction.options.getString('dominio');

            const headers = {
                'Content-Type': 'application/json',
                'X-Auth-Email': cf_data.email_account,
                'X-Auth-Key': cf_data.global_key
            };

            const data = {
                'purge_everything' : "true"
            };
              
            axios.post(`https://api.cloudflare.com/client/v4/zones/${dominio}/purge_cache`, data, { headers: headers }).then((res) => {
                if(!res.data.success) {
                    return interaction.reply({ content: 'No se pudo purgar la caché del dominio solicitado~', ephemeral: true });
                }
                return interaction.reply(`🦄 Se ha purgado exitosamente la caché de \`${zonas[dominio]}\`.`);
            }).catch((error) => {
                console.error('[error] cmdSlash:purgar_cache:axios |', error.message);
                return interaction.reply({ content: '😖 Hubo un inconveniente al ejecutar el comando, revisa la consola del servidor para saber mas', ephemeral: true });
            });

        } catch (error) {
            console.error('[error] cmdSlash:purgar_cache |', error.message);
            return interaction.reply({ content: '😖 Hubo un inconveniente al ejecutar el comando, revisa la consola del servidor para saber mas', ephemeral: true });
        }
    }
};