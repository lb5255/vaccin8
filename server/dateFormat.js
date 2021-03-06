function mysqlFormat(normDate) {
    if(normDate.indexOf("/") < 0) { // if it doesn't use any slashes anyways, it doesn't need to be formatted
        return normDate;
    }
    const [month, day, year] = normDate.split('/');
    const formattedDate = [year, month, day].join('-');
    return formattedDate;
}

//Function to change date returned to mm/dd/yyyy
function normalFormat(mysqlDate) {
                                                      //Month is a value from 0-11, added 1 to get the actual month
    const [year, month, day] = [mysqlDate.getFullYear(), mysqlDate.getMonth()+1, mysqlDate.getDate()]
    const formattedDate = [month, day, year].join('/');
    return formattedDate;
}


module.exports = {mysqlFormat, normalFormat};