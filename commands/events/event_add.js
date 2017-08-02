const commando = require('discord.js-commando');
const util = require('../../utils/utils.js');
const firebase = require("firebase");
let db = firebase.database().ref();

class EventAdd extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'event',
      group: 'respawn',
      memberName: 'event',
      description: 'Sets the respawn you are going to hunt',
      args: [
        {
          key: 'respawn',
          label: 'respawn ID',
          prompt: 'I need an ID to work with',
          type: 'integer',
          min: 1,
        }
      ]
    });
  }

  async run(message, args) {
    try {
      let respawns = await db.child('respawn-list').once('value');
      let id = args.respawn;
      if ( util.getRespawnName(id, respawns.val()) ) { // Does this respawn exist? If so, return it's name.
        let respawn_name = util.getRespawnName(id, respawns.val());
        let claimed = await db.child(`claimed-list/${message.guild.id}`).orderByChild('respawnID').equalTo(id).once('value');

        if ( claimed.val() === null ) { // There's nobody at this respawn. Let's assign it to the user
          db.child(`claimed-list/${message.guild.id}`).push({
            createdAt: Date.now(),
            respawnID: id,
            respawnName: respawn_name,
            uid: message.author.id
          });
          message.channel.send(`${message.author}, the ${respawn_name} (#${id}) respawn is now yours!`);
        } else {
          let key = Object.keys(claimed.val())[0];
          if ( claimed.val()[key].uid == message.author.id ) {
            message.channel.send(`You are already hunting at ${respawn_name}(#${id})!`);
          } else {
            let username = message.guild.members.find('id', claimed.val()[key].uid);
            message.channel.send(`${username} is still hunting at ${respawn_name} (#${id}). Get in line with \`!respnext ${id}\`.`);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = EventAdd;
