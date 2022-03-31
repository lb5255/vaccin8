async function buildConfAppt(location, vaccine, date, time) {
    var confString = "Your vaccine appointment has been scheduled. <br />" + 
                     "Location: " + location + "<br />" +
                     "Vaccine: " + vaccine + "<br />" + 
                     "Date: " + date + "<br />" +
                     "Time: " + time + "<br />";
    return confString; 
}

async function buildCancelAppt(location, date, time) {
    var cancelString = "Your vaccine appointment at " + location + " on " + date + ", " + time + " has been cancelled.";
    return cancelString;
}


module.exports = {buildConfAppt, buildCancelAppt};