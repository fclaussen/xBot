exports.getRespawnName = ( needle, haystack ) => {
  if ( Object.keys(haystack).indexOf(needle.toString()) >= 0 ) {
    let index = Object.keys(haystack).indexOf(needle.toString());
    return haystack[index + 1];
  }
}

exports.msToTime = (duration) => {
  var seconds = parseInt((duration/1000)%60),
      minutes = parseInt((duration/(1000*60))%60),
      hours = parseInt((duration/(1000*60*60))%24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return `${hours}:${minutes}:${seconds}`;
};

exports.uniqueArray = array => {
  var result = Array.from(new Set(array));
  return result;
}
