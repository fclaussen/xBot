const commando = require('discord.js-commando');
const util = require('../../utils/utils.js');
const firebase = require("firebase");
let db = firebase.database().ref();

class RespdelCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'respdel',
      group: 'respawn',
      memberName: 'respdel',
      description: 'Removes you from the respawn',
      args: [
        {
          key: 'respawn',
          label: 'respawn ID',
          prompt: 'I need an ID to work with',
          type: 'integer',
          min: 1,
          infinite: true
        }
      ]
    });
  }

  async run(message, args) {
    try {
      let respawns = await db.child('respawn-list').once('value');
      for (let id of args.respawn) {
        if ( util.getRespawnName(id, respawns.val()) ) { // Does this respawn exist? If so, return it's name.
          let respawn_name = util.getRespawnName(id, respawns.val());
          let claimed = await db.child(`claimed-list/${message.guild.id}`).orderByChild('respawnID').equalTo(id).once('value');

          if ( claimed.val() === null ) { // There's nobody at this respawn.
            message.channel.send(`There's nobody hunting at ${respawn_name} (#${id})!`);
          } else { // Found someone at the spawn
            let key = Object.keys(claimed.val())[0];
            let username = message.guild.members.find('id', claimed.val()[key].uid);
            if (claimed.val()[key].uid === message.author.id) { // Is it the same player? Good!

              let dateDiff = Date.now() - claimed.val()[key].createdAt;
              if (claimed.val()[key].nextUid) { // Is there someone to take his place?
                let updates = {}
                updates[`/${message.guild.id}/${key}/uid`] = claimed.val()[key].nextUid;
                updates[`/${message.guild.id}/${key}/nextUid`] = null;
                updates[`/${message.guild.id}/${key}/createdAt`] = Date.now();
                db.child('claimed-list').update(updates);
                let next_username = message.guild.members.find('id', claimed.val()[key].nextUid);
                message.channel.send(`${username} finally left ${respawn_name} (#${id}) after :stopwatch: ${util.msToTime(dateDiff)}. Your time has come ${next_username}`);
              } else { // Remove him
                db.child(`claimed-list/${message.guild.id}/${key}`).remove();
                message.channel.send(`${username} finally left ${respawn_name} (#${id}) after :stopwatch: ${util.msToTime(dateDiff)}.`);
              }
            } else { // It's not the same player. Do nothing!
              message.channel.send(`${respawn_name} (#${id}) does not belong to you!`);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = RespdelCommand;
