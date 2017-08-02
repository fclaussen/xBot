const commando = require('discord.js-commando');
const util = require('../../utils/utils.js');
const settings = require('../../settings.js');


class RashidCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'rashid',
      group: 'util',
      memberName: 'rashid',
      description: 'Checks where Rashid is',
    });
  }

  run(message, args) {
    let rashidObj = {
      color: parseInt('296E28', 16).toString(10),
      timestamp: new Date(),
      title: 'Rashid',
      thumbnail: {
        url: 'http://www.tibiawiki.com.br/images/f/f5/Rashid.gif'
      },
      image: {},
      url:'http://tibia.wikia.com',
      footer: {
        icon_url: 'https://pbs.twimg.com/profile_images/190151919/CM_400x400.png',
        text: "Tibia Wiki"
      },
    };

    let day_of_week = new Date().getDay();
    let hour = new Date().getHours();

    let index = day_of_week;
    if (hour < settings.saveServerTime) {
      index = day_of_week - 1;
      if (index == -1) {
        index = 6;
      }
    }

    switch (index) {
      case 0:
        rashidObj.description = 'On Sundays you can find him in Carlin depot, one floor above.';
        rashidObj.image.url = 'http://i.imgur.com/RbPCa9t.png';
        break;
      case 1:
        rashidObj.description = 'On Mondays you can find him in Svargrond, in Dankwart\'s tavern, south of the temple.';
        rashidObj.image.url = 'http://i.imgur.com/SzT8dXn.png';
        break;
      case 2:
        rashidObj.description = 'On Tuesdays you can find him in Liberty Bay, in Lyonel\'s tavern, west of the depot.';
        rashidObj.image.url = 'http://i.imgur.com/byUemJK.png';
        break;
      case 3:
        rashidObj.description = 'On Wednesdays you can find him in Port Hope, in Clyde\'s tavern, west of the depot.';
        rashidObj.image.url = 'http://i.imgur.com/MqebrKo.png';
        break;
      case 4:
        rashidObj.description = 'On Thursdays you can find him in Ankrahmun, in Arito\'s tavern, above the post office.';
        rashidObj.image.url = 'http://i.imgur.com/vCdpwIr.png';
        break;
      case 5:
        rashidObj.description = 'On Fridays you can find him in Darashia, in Miraia\'s tavern, south of the guildhalls.';
        rashidObj.image.url = 'http://i.imgur.com/eFanA5A.png';
        break;
      case 6:
        rashidObj.description = 'On Saturdays you can find him in Edron, in Mirabell\'s tavern, above the depot.';
        rashidObj.image.url = 'http://i.imgur.com/elFiThY.png';
        break;
    }

    message.channel.send({embed: rashidObj});


    // try {
    //   let respawns = await db.child('respawn-list').once('value');
    //   let id = args.respawn;
    //   if ( util.getRespawnName(id, respawns.val()) ) { // Does this respawn exist? If so, return it's name.
    //     let respawn_name = util.getRespawnName(id, respawns.val());
    //     let claimed = await db.child(`claimed-list/${message.guild.id}`).orderByChild('respawnID').equalTo(id).once('value');
    //
    //     if ( claimed.val() === null ) { // There's nobody at this respawn. Let's assign it to the user
    //       db.child(`claimed-list/${message.guild.id}`).push({
    //         createdAt: Date.now(),
    //         respawnID: id,
    //         respawnName: respawn_name,
    //         uid: message.author.id
    //       });
    //       message.channel.send(`${message.author}, the ${respawn_name} (#${id}) respawn is now yours!`);
    //     } else {
    //       let key = Object.keys(claimed.val())[0];
    //       if ( claimed.val()[key].uid == message.author.id ) {
    //         message.channel.send(`You are already hunting at ${respawn_name}(#${id})!`);
    //       } else {
    //         let username = message.guild.members.find('id', claimed.val()[key].uid);
    //         message.channel.send(`${username} is still hunting at ${respawn_name} (#${id}). Get in line with \`!respnext ${id}\`.`);
    //       }
    //     }
    //   }
    // } catch (e) {
    //   console.error(e);
    // }
  }
}

module.exports = RashidCommand;
