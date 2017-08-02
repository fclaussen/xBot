const commando = require('discord.js-commando');
const util = require('../../utils/utils.js');
const firebase = require("firebase");
let db = firebase.database().ref();

class RespnextdelCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'respnextdel',
      group: 'respawn',
      memberName: 'respnextdel',
      description: 'Removes you from the respawn wait list',
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
            if (claimed.val()[key].nextUid) {
              let username = message.guild.members.find('id', claimed.val()[key].nextUid);

              if (claimed.val()[key].nextUid === message.author.id) { // Is it the same player? Good!
                let updates = {}
                updates[`/${message.guild.id}/${key}/nextUid`] = null;
                db.child('claimed-list').update(updates);
                message.channel.send(`${username} is no longer waiting to hunt at ${respawn_name} (#${id}).`);
              } else { // It's not the same player. Do nothing!
                message.channel.send(`You are not waiting to hunt at ${respawn_name} (#${id})!`);
              }
            } else {
              message.channel.send(`No one is waiting to hunt at ${respawn_name} (#${id})!`);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = RespnextdelCommand;
