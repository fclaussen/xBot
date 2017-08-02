const commando = require('discord.js-commando');
const util = require('../../utils/utils.js');
const firebase = require("firebase");
let db = firebase.database().ref();

class RespnextCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'respnext',
      group: 'respawn',
      memberName: 'respnext',
      description: 'Get in line as the next to hunt on a respawn',
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
      if ( util.getRespawnName(args.respawn, respawns.val()) ) { // Does this respawn exist? If so, return it's name.
        let respawn_name = util.getRespawnName(args.respawn, respawns.val());
        let claimed = await db.child(`claimed-list/${message.guild.id}`).orderByChild('respawnID').equalTo(args.respawn).once('value');
        if ( claimed.val() === null ) { // There's nobody at this respawn. You can get in as the main player.
          message.channel.send(`${message.author}, the ${respawn_name} (#${args.respawn}) is empty, you can get in as the main player with \`!resp ${args.respawn}\`!`);
        } else {
          let key = Object.keys(claimed.val())[0];
          let username = message.guild.members.find('id', message.author.id);

          if ( claimed.val()[key].uid == message.author.id ) {
            message.channel.send(`You are already hunting at ${respawn_name}(#${args.respawn})!`);
          } else {
            if (claimed.val()[key].nextUid == null) { // There's no next. Let the user join.
              let updates = {}
              updates[`/${message.guild.id}/${key}/nextUid`] = message.author.id;
              db.child('claimed-list').update(updates);
              message.channel.send(`${username} just joined as the next in line for ${respawn_name} (#${args.respawn}).`);
            } else { // There's a next already, can only have one at a time
              message.channel.send(`I'm sorry ${username}. There's already someone in line for ${respawn_name} (#${args.respawn}) and I can only handle one of you at a time.`);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = RespnextCommand;
