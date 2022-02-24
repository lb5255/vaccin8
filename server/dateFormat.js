function mysqlFormat(normDate) {
    const [month, day, year] = normDate.split('/');
    const formattedDate = [year, month, day].join('-');
    return formattedDate;
}

module.exports = {mysqlFormat};