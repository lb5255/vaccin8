//Function to check age to verify min and max age between 
function ageCheck(dob, minAge, maxAge) {
    //Convert dob to years.
    //Comes in as yyyy-mm-dd
    var years = getAge(dob);
    console.log(typeof(minAge));
    console.log(typeof(maxAge));

    if (typeof(minAge) === 'number' && typeof(maxAge) === 'number') {
        console.log("In first check");
        if (years >= minAge && years <= maxAge) {
            console.log("s");
            return true;
        }
    }
    else if (typeof(minAge === 'number')) {
        if (years >= minAge) {
            return true;
        }
    }
    else if (typeof(maxAge === 'number')) {
        if (years <= maxAge) {
            return true;
        }
    }
    return false;
}

//Function to get the age from a date of birth
function getAge(dob) {
    var today = new Date();
    var bDate = new Date(dob);
    var age = today.getFullYear() - bDate.getFullYear();
    var month = today.getMonth() - bDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < bDate.getDate())) {
        age--;
    }
    return age;
}


module.exports = {ageCheck};