const commando = require('discord.js-commando');
const util = require('../../utils/utils.js');
const firebase = require("firebase");
let db = firebase.database().ref();

class RespkickCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'respkick',
      group: 'respawn',
      memberName: 'respkick',
      description: 'Kick the user from the spawn',
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

  hasPermission(msg) {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('KICK_MEMBERS');
	}

  async run(message, args) {
    try {
      let respawns = await db.child('respawn-list').once('value');
      if ( util.getRespawnName(args.respawn, respawns.val()) ) { // Does this respawn exist? If so, return it's name.
        let respawn_name = util.getRespawnName(args.respawn, respawns.val());
        let claimed = await db.child(`claimed-list/${message.guild.id}`).orderByChild('respawnID').equalTo(args.respawn).once('value');
        if ( claimed.val() === null ) { // There's nobody at this respawn. You can get in as the main player.
          message.channel.send(`${message.author}, the ${respawn_name} (#${args.respawn}) is empty.`);
        } else {
          let key = Object.keys(claimed.val())[0];
          let username = message.guild.members.find('id', message.author.id);
          let kicked_username = message.guild.members.find('id', claimed.val()[key].uid);

          if ( claimed.val()[key].uid == message.author.id ) {
            message.channel.send(`You can't kick yourself.`);
          } else {
            if (claimed.val()[key].nextUid) { // There's no next. Let the user join.
              let next_username = message.guild.members.find('id', claimed.val()[key].nextUid);
              message.channel.send(`${username} just kicked ${kicked_username} from ${respawn_name} (#${args.respawn}). ${next_username} Took over!`);
              let updates = {}
              updates[`/${message.guild.id}/${key}/uid`] = claimed.val()[key].nextUid;
              updates[`/${message.guild.id}/${key}/nextUid`] = null;
              updates[`/${message.guild.id}/${key}/createdAt`] = Date.now();
              db.child('claimed-list').update(updates);
            } else { // There's a next already, can only have one at a time
              db.child(`claimed-list/${message.guild.id}/${key}`).remove();
              message.channel.send(`${username} just kicked ${kicked_username} from ${respawn_name} (#${args.respawn}).`);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = RespkickCommand;
