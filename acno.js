exports.createAccNo = () => {
    // creating account number
    let timestamp = new Date();
    let date = timestamp.getDate();
    let hrs = timestamp.getHours();
    let min = timestamp.getMinutes();
    let sec = timestamp.getSeconds();
    let year = timestamp.getFullYear();
  
    if (date < 10) {
      date = "0" + date;
    }
  
    if (hrs < 10) {
      hrs = "0" + hrs;
    }
  
    if (min < 10) {
      min = "0" + min;
    }
  
    if (sec < 10) {
      sec = "0" + sec;
    }
  
    // acc number
    const accNo = "" + year + date + hrs + min + sec;
  
    return accNo;
  };
