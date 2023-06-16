const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { createAccNo } = require('./acno.js');
const fs = require('fs');
const cors = require('cors')
const path = require('path');
app.use(cors())

require("dotenv").config();


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Load user data from JSON file
// Load user data from JSON file
const loadUsers = () => {
    try {
      const userData = fs.readFileSync('users.json');
      return JSON.parse(userData);
    } catch (err) {
      return [];
    }
  };
  
  // Save user data to JSON file
  const saveUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  };
  
  // Load savings data from JSON file
  const loadSavings = () => {
    try {
      const savingsData = fs.readFileSync('savings.json');
      return JSON.parse(savingsData);
    } catch (err) {
      return [];
    }
  };
  
  // Save savings data to JSON file
  const saveSavings = (savings) => {
    fs.writeFileSync('savings.json', JSON.stringify(savings, null, 2));
  };
  
  // Load credit card data from JSON file
  function loadCreditCards() {
    const data = fs.readFileSync('creditCards.json', 'utf8');
    return JSON.parse(data).cards;
  }
  
  // Save credit card data to JSON file
  function saveCreditCards(cards) {
    const data = JSON.stringify({ cards });
    fs.writeFileSync('creditCards.json', data, 'utf8');
  }
  
    



// User Authentication
app.post("/auth", (req, res) => {
  const { email, password } = req.body;
  console.log(email)
  console.log(password)
  const users = loadUsers();

  const user = users.find((user) => user.email === email && user.password === password);

  const secretKey = require('crypto').randomBytes(64).toString('hex');

  if (user) {
    const token = jwt.sign({
        firstName : user.fname,
        lastName : user.lname,
        account : user.acno,
        userName : user.fname+" "+user.mname+" "+user.lname,
        email: user.email
    },
    secretKey,
    { expiresIn:"1hr"}
    );

    res.status(200).json({idToken: token, 
        expiresIn:"1hr"});
}else{
    res.sendStatus(401);
}
});

// Register Page


// Add User
app.post('/adduser', (req, res) => {
  const { fname, mname, lname, email, phone, address, pwd } = req.body;
  const acno = createAccNo();

  const users = loadUsers();

  users.push({
    fname,
    mname,
    lname,
    email,
    phone,
    address,
    password: pwd,
    acno,
    balance: 0
  });

  saveUsers(users);

  console.log('New user created successfully');
  res.status(200).json({message: 'registeration sucessfull'})
});

// Home page
app.get("/home", (req, res) => {
  const acno = req.query.acno;
  const fname = req.query.fname;
  const mname = req.query.mname;
  const lname = req.query.lname;
  
});

// Savings
app.get("/savings", (req, res) => {
  const acno = req.query.acno;
  const fname = req.query.fname;
  const mname = req.query.mname;
  const lname= req.query.lname;
  const savings = loadSavings();

const userSavings = savings.filter((s) => s.acno === acno);


});

// Add Savings
app.post("/addSavings", (req, res) => {
  const { acno, savingsAmount } = req.body;

  const savings = loadSavings();
  const userSavings = savings.find((s) => s.acno === acno);

  if (userSavings) {
    userSavings.savingsAmount += parseFloat(savingsAmount);
  } else {
    savings.push({
      acno,
      savingsAmount: parseFloat(savingsAmount),
    });
  }

  saveSavings(savings);

  
});

// Deposit
app.post("/deposit", (req, res) => {
    const { acno, depositAmount } = req.body;
  
    const savings = loadSavings();
    const userSavings = savings.find((s) => s.acno === acno);
  
    if (userSavings) {
      userSavings.savingsAmount += parseFloat(depositAmount);
  
      saveSavings(savings);
  
      res.redirect("/savings?acno=" + acno + "&fname=" + fname + "&mname=" + mname + "&lname=" + lname);
    } else {
      res.send("Invalid account number. Please try again.");
    }
  });

  // Withdrawal
app.post("/withdrawal", (req, res) => {
    const { acno, withdrawalAmount } = req.body;
  
    const savings = loadSavings();
    const userSavings = savings.find((s) => s.acno === acno);
  
    if (userSavings) {
      if (userSavings.savingsAmount >= parseFloat(withdrawalAmount)) {
        userSavings.savingsAmount -= parseFloat(withdrawalAmount);
  
        saveSavings(savings);
  
        res.redirect("/savings?acno=" + acno + "&fname=" + fname + "&mname=" + mname + "&lname=" + lname);
      } else {
        res.send("Insufficient funds. Please try again.");
      }
    } else {
      res.send("Invalid account number. Please try again.");
    }
  });
    // Transfer
app.post("/transfer", (req, res) => {
    const { fromAcno, toAcno, transferAmount } = req.body;
  
    const savings = loadSavings();
    const fromUserSavings = savings.find((s) => s.acno === fromAcno);
    const toUserSavings = savings.find((s) => s.acno === toAcno);
  
    if (fromUserSavings && toUserSavings) {
      if (fromUserSavings.savingsAmount >= parseFloat(transferAmount)) {
        fromUserSavings.savingsAmount -= parseFloat(transferAmount);
        toUserSavings.savingsAmount += parseFloat(transferAmount);
  
        saveSavings(savings);
  
        res.redirect("/savings?acno=" + fromAcno + "&fname=" + fname + "&mname=" + mname + "&lname=" + lname);
      } else {
        res.send("Insufficient funds. Please try again.");
      }
    } else {
      res.send("Invalid account number(s). Please try again.");
    }
  });
    // Credit Cards
    app.get("/creditcard", (req, res) => {
        const acno = req.query.acno;
        const fname = req.query.fname;
        const mname = req.query.mname;
        const lname = req.query.lname;
      
        const cards = loadCreditCards().filter((card) => card.acno === acno);
      
       
      });
      
      // New card
      app.get('/newCard', (req, res) => {
        const acno = req.query.acno;
        const fname = req.query.fname;
        const mname = req.query.mname;
        const lname = req.query.lname;
      
        
      });
      
      // Add new card
      app.post('/cards', (req, res) => {
        const { cardNumber, expiryDate, cvv, cardLimit, dueDate } = req.body;
        const acno = req.query.acno;
        const fname = req.query.fname;
        const mname = req.query.mname;
        const lname = req.query.lname;
      
        const creditCards = loadCreditCards();
      
        const newCard = {
          acno,
          expiryDate,
          dueAmount: 0,
          cardLimit,
          dueDate,
          avalBalance: cardLimit,
          cardNum: cardNumber,
          cvv
        };
      
        creditCards.push(newCard);
        saveCreditCards(creditCards);
      
        res.redirect(`/creditcard?acno=${acno}&fname=${fname}&mname=${mname}&lname=${lname}`);
      });

// Loan
app.get("/loan", (req, res) => {
    const acno = req.query.acno;
    const fname = req.query.fname;
    const mname = req.query.mname;
    const lname = req.query.lname;
  
    const loans = loadLoans();
    const userLoans = loans.filter((loan) => loan.acno === acno);
  
    res.render("loan", { acno, fname, mname, lname, loans: userLoans });
  });
// Investment
app.get("/investment", (req, res) => {
    const acno = req.query.acno;
    const fname = req.query.fname;
    const mname = req.query.mname;
    const lname = req.query.lname;
  
    const investments = loadInvestments();
    const userInvestments = investments.filter((investment) => investment.acno === acno);
  
    res.render("investment", { acno, fname, mname, lname, investments: userInvestments });
  });
            

// Logout
app.get("/logout", (req, res) => {
  res.redirect("/");
});

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
  });
