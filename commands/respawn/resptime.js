const commando = require('discord.js-commando');
const util = require('../../utils/utils.js');
const firebase = require("firebase");
let db = firebase.database().ref();

class ResptimeCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'resptime',
      group: 'respawn',
      memberName: 'resptime',
      description: 'How long is this player hunting at the same place for?',
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

          if ( claimed.val() === null ) { // There's nobody at this respawn. Let's assign it to the user
            message.channel.send(`There's nobody hunting at ${respawn_name} (#${id})!`);
          } else {
            let key = Object.keys(claimed.val())[0];
            let dateDiff = Date.now() - claimed.val()[key].createdAt;
            let username = message.guild.members.find('id', claimed.val()[key].uid);

            if ( claimed.val()[key].uid == message.author.id ) {
              message.channel.send(`You have been hunting ${respawn_name} (#${id}) for :stopwatch: ${util.msToTime(dateDiff)}!`);
            } else {
              message.channel.send(`${username} is hunting ${respawn_name} (#${id}) for :stopwatch: ${util.msToTime(dateDiff)}.`);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = ResptimeCommand;
