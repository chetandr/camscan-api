var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');


const users = [
    {
        username: 'john',
        password: 'password123admin',
        role: 'admin'
    }, {
        username: 'anna',
        password: 'password123member',
        role: 'member'
    }
  ];


/* GET home page. */
router.post('/login', (req, res) => {
    // Read username and password from request body
    const { username, password } = req.body;
    const refreshTokens = req.app.get('refreshTokens');

    // Filter user from the users array by username and password
    const user = users.find(u => { return u.username === username && u.password === password });
  
    if (user) {
        const accessToken = jwt.sign({ username: user.username, role: user.role }, req.app.get("accessTokenSecret"), { expiresIn: '1m' });
        const refreshToken = jwt.sign({ username: user.username, role: user.role }, req.app.get("refreshTokenSecret"));

        refreshTokens.push(refreshToken);
        req.app.set('refreshTokens',refreshTokens);
        res.json({
            accessToken,
            refreshToken
        });
    } else {
        res.send('Username or password incorrect');
    }
  });

  router.post('/token', (req, res) => {
    const { token } = req.body;
    const refreshTokens = req.app.get('refreshTokens');

    if (!token) {
        return res.sendStatus(401);
    }

    if (!refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }
    jwt.verify(token, req.app.get("refreshTokenSecret"), (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        const accessToken = jwt.sign({ username: user.username, role: user.role }, req.app.get("accessTokenSecret"), { expiresIn: '1m' });

        res.json({
            accessToken
        });
    });
});
router.post('/logout', (req, res) => {
    const { token } = req.body;
    let refreshTokens = req.app.get('refreshTokens');
    refreshTokens = refreshTokens.filter(t => t !== token);
    req.app.set("refreshTokens", refreshTokens)
    res.send("Logout successful");
});
module.exports = router;