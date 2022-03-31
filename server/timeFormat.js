function formatTime(mysqlTime) {
    const [hours, minutes, seconds] = mysqlTime.split(":");
    var pm = false;
    newHours = parseInt(hours);
    if(newHours >= 12) {
        newHours -= 12;
        pm = true;
    }
    if(newHours === 0) {
        newHours = 12;
    }
    time = newHours + ":" + minutes + (pm ? " PM" : " AM");   
    return time;
}

module.exports = {formatTime}