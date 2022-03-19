async function buildConfAppt(date, time, vaccine) {
    var confString = "Your vaccine appointment has been scheduled. \n" + 
                     "Location: " + "\n" + 
                     "Vaccine: " + vaccine + "\n" + 
                     "Date: " + date + "\n" +
                     "Time: " + time + "\n";
    return confString; 
}

async function buildCancelAppt() {
    var cancelString = "Your vaccine appointment has been cancelled.";
    return cancelString;
}


module.exports = {buildConfAppt, buildCancelAppt};