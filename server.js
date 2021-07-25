
const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");

const Pagination = require('discord-paginationembed');
var moment = require("moment");
let embeds = [];
var momentDurationFormatSetup = require("moment-duration-format");

momentDurationFormatSetup(moment);
typeof moment.duration.fn.format === "function";
// true
typeof moment.duration.format === "function";
// true




client.on("ready", () => {
  console.log("BOT LISTO!");
  let reportes = "CREATE TABLE IF NOT EXISTS reportes (id INTEGER PRIMARY KEY, nombre_reportado TEXT, id_reportado TEXT, id_staff TEXT, sancion TEXT, motivo TEXT,  autorizo TEXT, fecha_reporte DATE )"

  db.run(reportes, function (err) {
    if (err) return console.error(err.message)
  })
});
let entrada = new Date();

var prefix2 = config.prefix2;
var id_chanel = config.id_channel;

let reportado;
let id;
let staff;
let sancion;
let motivos;
let autorizo;

let userApplications = {}
client.on("message", async (message) => {
  let salida = moment(new Date());
  let fecha = salida;

  const args = message.content.slice(prefix2.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (message.author.equals(client.user)) return;

  let authorId = message.author.id;

  if (message.content === "/reporte") {
    console.log(`Apply begin for authorId ${authorId}`);
    // User is not already in a registration process    
    if (!(authorId in userApplications)) {
      userApplications[authorId] = { "step": 1 }

      const embed = new Discord.MessageEmbed()
        .setTitle("Sistema de reportes.")
        .setAuthor(message.author.username, message.author.avatarURL)
        .setColor(0x00AE86)
        .setDescription("Por favor enviame los datos que te solicito..")
        .setFooter("Si tienes alguna duda contacta con UnderZero", client.user.avatarURL)
        .setImage(message.author.avatarURL)
        .setThumbnail(message.author.avatarURL)
        .setTimestamp()
        .addField("UserName del Reportado (ID Discord)", "el username de la persona a reportar ")
        .addField("Id del mismo", "el id IN-GAME de la persona a reportar")
        .addField("Tipo de la sancion", "Menciona el tipo de la sancion, ejemplo: ban 24hrs, Strike, etc.")
        .addField("Motivo del reporte", "Menciona el motivo por el cual reportas")
        .addField("Nombre de quien te autorizo", "Menciona el UserName de quien te autorizo")
      message.author.send({ embed });
      message.author.send("```UserName del reportado: ```");
    }

  } else {

    if (message.channel.type === "dm" && authorId in userApplications) {
      let authorApplication = userApplications[authorId];

      if (authorApplication.step == 1) {

        authorApplication.answer1 = message.content;
        reportado = message.content;
        message.author.send("```Id del deportado: ```");
        authorApplication.step++;
      }
      else if (authorApplication.step == 2) {
        id = message.content;
        authorApplication.answer2 = message.content;
        message.author.send("```Tipo de la sancion: ```");
        authorApplication.step++;
      }
      else if (authorApplication.step == 3) {
        sancion = message.content;
        authorApplication.answer3 = message.content;
        message.author.send("```Motivo del reporte: ```");
        authorApplication.step++;
      }

      else if (authorApplication.step == 4) {
        motivos = message.content;
        authorApplication.answer4 = message.content;
        message.author.send("```Nombre de quien te autorizo el reporte: ```");

        authorApplication.step++;
      }
      else if (authorApplication.step == 5) {
        autorizo = message.content;
        staff = message.author.tag;
        authorApplication.answer4 = message.content;
        message.author.send("```Gracias, tu reporte se realizo con exito, favor de ir al canal de reportes para consultarlos.```");
        //before deleting, you can send the answers to a specific channel by ID

        let SQLInsert = `INSERT INTO reportes(id, nombre_reportado, id_reportado, id_staff, sancion, motivo, autorizo, fecha_reporte) VALUES(NULL, '${reportado}',  '${id}', '${staff}', '${sancion}', '${motivos}', '${autorizo}', '${fecha}' )`;
        console.log(message.author.avatarURL)
        db.run(SQLInsert, function (err) {
          if (err) return console.error(err.message)
          else {
            const embed = new Discord.MessageEmbed() //creamos un embed para darle mas estilo xD.

              .setTitle(`Nuevo reporte registrado con exito.`)
              .addField("Usuario reportado:", `${reportado}`)
              .addField("Id:", `${id}`)
              .addField("Razón:", `${motivos}`)
              .addField("Tipo Sancion:", `${sancion}`)
              .addField("Autorizo:", `${autorizo}`)
              .addField("Fecha reporte:", `${fecha}`)
              .addField("Mod/Admin/Staff:", `${staff}`)
              .setFooter(" Sistema de reportes uwu", message.author.displayAvatarURL())
              .setColor(0xff001e)

            client.channels.cache.get(id_chanel)
              .send(embed);
            delete userApplications[authorId];

          }
        })

      }
    }
  }





  switch (command) {

    case 'buscar':
      let embeds = [];
      // There you go, now you have paged embeds
      let id = args[0]
      let select = `SELECT * FROM reportes WHERE id_reportado = ${id}`;
      message.delete();
      db.all(select, (err, filas) => {

        console.log(filas.length)
        if (filas.length > 0) {

          filas.forEach(res => {

            embeds.push(new Discord.MessageEmbed()//creamos un embed para darle mas estilo xD.

              .setTitle('Reporte')
              .addField("Id de reporte:", `${res.id}`, true)
              .addField("Usuario reportado:", `${res.nombre_reportado}`, true)
              .addField("Id:", `${res.id_reportado}`, true)
              .addField("Razón:", `${res.motivo}`, true)
              .addField("Tipo Sancion:", `${res.sancion}`, true)
              .addField("Autorizo:", `${res.autorizo}`, true)
              .addField("Mod/Admin/Staff:", `${res.id_staff}`, true)
              .addField('\u200b', '\u200b')
              .addField("Fecha reporte:", `${res.fecha_reporte}`)

              .setFooter(" Sistema de reportes uwu", 'https://i.imgur.com/v4Fs8q1.png')
              .setColor(0xff001e));



          });
          const myImage = 'https://i.imgur.com/v4Fs8q1.png';
          new Pagination.Embeds()
            .setArray(embeds)
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.author)
            .setPageIndicator(true)
            .setPage(1)
            // Methods below are for customising all embeds
            .setImage(myImage)
            .setThumbnail(myImage)


            .build();



        }
        else {
          message.channel.send("No se encontro ningun reporte de ese perrito")
        }
      })
      break;
    case 'eliminar':
      message.channel.send("Esta en mantenimiento.")
      break;
    case 'editar':
      message.channel.send("Esta en mantenimiento")
      break;
    default:
      break;
  }





});

client.login("ODY4Mjg2OTM2NjAxNzMxMTEy.YPtdOQ.ggma6j13FY3CB1I9DWaExT47TGQ");
