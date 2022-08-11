const cf_data = require('../../config/cloudflare.json');
const roles = require('../../config/roles.json');
const zonas = require('../../data/zonas.json');

const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ver_estadisticas')
        .setDescription('Visualizar las estadísticas de los últimos 30 días')
        .addStringOption(option => option.setName('dominio').setDescription('El dominio a revisar').setRequired(true).addChoices(...Object.keys(zonas).map((key) => ({ 'name' : zonas[key], 'value' : key }))))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const memberHasRole = interaction.member.roles.cache.filter((role) => roles.includes(role.id)).map((role) => role.id);
            if(!memberHasRole.length) {
                return interaction.reply({ content: '🚨 **no tienes permiso para ejecutar este comando!**', ephemeral: true });
            }

            const dominio = interaction.options.getString('dominio');

            var date = new Date();
            date.setMonth(date.getMonth() - 1);
            var first_day = date.toLocaleDateString('en-GB').split('/').reverse().join('-');
            
            var date = new Date();
            var last_day = date.toLocaleDateString('en-GB').split('/').reverse().join('-');

            const headers = {
                'Content-Type': 'application/json',
                'X-Auth-Email': cf_data.email_account,
                'X-Auth-Key': cf_data.global_key
            };

            const data = {
                'query' : `
                    { viewer {
                        zones(filter:{zoneTag:"${dominio}"}) {
                            httpRequests1dGroups( orderBy: [date_ASC], limit: 100, filter: {date_gt: "${first_day}", date_lt: "${last_day}"}) {
                                dimensions { date }
                                sum {
                                    bytes
                                    requests
                                    cachedBytes
                                    cachedRequests
                                    threats
                                    browserMap { pageViews uaBrowserFamily }
                                    countryMap { bytes requests threats clientCountryName }
                                    clientSSLMap { requests clientSSLProtocol }
                                }
                            }
                        }
                    } }
                `
            };
              
            axios.post('https://api.cloudflare.com/client/v4/graphql', data, { headers: headers }).then((res) => {
                if(res.data.errors) {
                    return interaction.reply({ content: 'No se pudo obtener las estadísticas del dominio solicitado~', ephemeral: true });
                }

                const dataPorDia = res.data.data.viewer.zones[0].httpRequests1dGroups;


                var countRequests = 0;
                var totalCachedBytes = 0;
                var totalCachedRequests = 0;
                var totalUncachedBytes = 0;
                var totalUncachedRequests = 0;
                var totalTransferedDataBytes = 0;
                var totalTransferedDataRequests = 0;
                var totalThreats = 0;

                dataPorDia.forEach((dia) => {
                    countRequests = (countRequests + dia.sum.requests);
                    totalCachedBytes = (totalCachedBytes + dia.sum.cachedBytes);
                    totalCachedRequests = (totalCachedRequests + dia.sum.cachedRequests);
                    totalUncachedBytes = (totalUncachedBytes + (dia.sum.bytes - dia.sum.cachedBytes));
                    totalUncachedRequests = (totalUncachedRequests + (dia.sum.requests - dia.sum.cachedRequests));
                    totalTransferedDataBytes = (totalTransferedDataBytes + dia.sum.bytes);
                    totalTransferedDataRequests = (totalTransferedDataRequests + dia.sum.requests);
                    totalThreats = (totalThreats + dia.sum.threats);
                });

                return interaction.reply({ embeds: [{
                    color: 0xf58540,
                    title: `📊 Estadísticas de los últimos 30 días de \`${zonas[dominio]}\``,
                    fields: [
                        { name: 'Solicitudes', value: "```yaml\n"+numFormat(countRequests)+"\n```" },
                        { name: 'Ataques Mitigados', value: "```yaml\n"+numFormat(totalThreats)+"\n```" },
                        { name: 'Contenido cacheado', value: "```yaml\nSolicitudes: "+numFormat(totalCachedRequests)+"\nTotal:       "+formatBytes(totalCachedBytes)+"\n```" },
                        { name: 'Contenido no cacheado', value: "```yaml\nSolicitudes: "+numFormat(totalUncachedRequests)+"\nTotal:       "+formatBytes(totalUncachedBytes)+"\n```" },
                        { name: 'Total Transferido', value: "```yaml\nSolicitudes: "+numFormat(totalTransferedDataRequests)+"\nTotal:       "+formatBytes(totalTransferedDataBytes)+"\n```" },
                    ]
                }] });

                function formatBytes(bytes, dp = 1) {
                    const thresh = 1024;

                    if(Math.abs(bytes) < thresh) { return bytes + ' B'; }

                    const units =  ['Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
                    let u = -1;
                    const r = 10**dp;

                    do {
                        bytes /= thresh;
                        ++u;
                    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

                    return bytes.toFixed(dp)+units[u];
                }
                function numFormat(x) {
                    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                }
            }).catch((error) => {
                console.error('[error] cmdSlash:purgar_cache:axios |', error.message);
            });
        } catch (error) {
            console.error('[error] cmdSlash:purgar_cache |', error.message);
            return interaction.reply({ content: '😖 Hubo un inconveniente al ejecutar el comando, revisa la consola del servidor para saber mas', ephemeral: true });
        }
    }
};