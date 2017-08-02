const path = require('path');
const sqlite = require('sqlite');
const firebase = require("firebase");
const settings = require('./settings.js');
const respawnList = require("./respawn-list.js");
const util = require('./utils/utils.js');
const commando = require('discord.js-commando');
const bot = new commando.Client({
  owner: '243030019943694336'
});

firebase.initializeApp({
  apiKey: "AIzaSyCiXd4VGA_20F-zL1wlCXSXzPTWer_ZtXE",
  authDomain: "xbot-a8ca3.firebaseapp.com",
  databaseURL: "https://xbot-a8ca3.firebaseio.com",
  projectId: "xbot-a8ca3",
  storageBucket: "xbot-a8ca3.appspot.com",
  messagingSenderId: "169491584622"
});

bot.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new commando.SQLiteProvider(db))
).catch(console.error);

bot.registry.registerGroup('respawn', 'Respawns');
//bot.registry.registerGroup('events', 'Events');
bot.registry.registerGroup('util', 'Util');
bot.registry.registerDefaults();
bot.registry.registerCommandsIn(path.join(__dirname, 'commands'));

// Runs when the bot first joins the guild
bot.on('guildCreate', guild => {
  guild.defaultChannel.send('Hi! I\'m xBot. I\'m responsible for taking care of your guild respawn claims. In the future, I\'m going to do much more');
});

bot.on('ready', () => {
  console.log("xBot is online and ready");
  bot.guilds.forEach( guild => {
    if ( guild.available ) {
      createChannels(guild);
      startTracking(guild);
    }
  });
});


let startTracking = guild => {

  firebase.database().ref(`claimed-list/${guild.id}`).on('value', async snapshot => {
    let messageID = await firebase.database().ref().child(`claimed-message-id/${guild.id}`).once('value');
    if (snapshot.exists()) { // found the guild
      guild.channels.find('name', settings.respawnClaimChannel).fetchMessage(messageID.val()).then( message => {
        let values = Object.values(snapshot.val());
        let msg = '**# # # Respawn List # # #**\n==================\n';
        values.forEach( (row, index) => {
          let username = guild.members.find('id', row.uid);
          let dateDiff = Date.now() - row.createdAt;
          if ( row.nextUid ) {
            let next_username = guild.members.find('id', row.nextUid);
            msg += `${row.respawnID} - ${row.respawnName} - ${username} - **next:** ${next_username}\n`;
          } else {
            msg += `${row.respawnID} - ${row.respawnName} - ${username} - **next:** \n`;
          }
        });
        message.edit(msg);
      });
    } else {
      guild.channels.find('name', settings.respawnClaimChannel).fetchMessage(messageID.val()).then( message => {
        message.edit('**# # # Respawn List # # #**\n==================');
      }).catch(console.error("erro!"));
    }
  });

}

let setChannelsPermissions = (channel, guild) => {
  channel.overwritePermissions(guild.roles.find('name', 'xBot').id, {
    SEND_MESSAGES: true,
    MANAGE_MESSAGES: true,
  }).then( () => {
    console.log(`Allowed xBot role to send messages to #${channel.name} channel`);
  }).catch( console.error );

  channel.overwritePermissions(guild.id, {
    SEND_MESSAGES: false,
    SEND_TTS_MESSAGES: false,
    ATTACH_FILES: false,
    EMBED_LINKS: false,
    MANAGE_ROLES: false,
    MANAGE_MESSAGES: false,
  }).then( () => {
    console.log(`Disallowed @everyone from sending messages to #${channel.name} channel`);
  }).catch( console.error );
}

let createChannels = guild => {
  if ( ! guild.channels.find('name', settings.respawnListChannel) ) { // Respawn list channel does not exist
    guild.createChannel( settings.respawnListChannel, 'text' ).then( channel => {
      setChannelsPermissions(channel, guild);
      var index = 1;
      for ( var list of respawnList ) {
        var msgContent = '';
        msgContent += `\n#${list.city}\n\n`;
        for ( var resp of list.respawns ) {
          msgContent += `${index}. ${resp} \n`;
          index++;
        }
        channel.send(msgContent, { code: 'md' });
      }
    }).catch(console.error);
  }

  if ( guild.channels.find('name', settings.respawnClaimChannel) ) {
    guild.channels.find('name', settings.respawnClaimChannel).delete();
  }

  guild.createChannel( settings.respawnClaimChannel, 'text' ).then( channel => {
    setChannelsPermissions(channel, guild);
    channel.send("**# # # Respawn List # # #**\n==================").then( message => {
      firebase.database().ref().child(`claimed-message-id/${guild.id}`).set(message.id);
    });
  }).catch(console.error);

}


let setupDatabaseTables = () => {
  // Erases the claimed table
  firebase.database().ref().child('claimed-list').remove();
  firebase.database().ref().child('claimed-message-id').remove();

  var index = 1;
  for ( var list of respawnList ) {
    for ( var resp of list.respawns ) {
      firebase.database().ref().child(`respawn-list/${index}`).set( resp );
      index++;
    }
  }
}

setupDatabaseTables();
bot.login(settings.token);
