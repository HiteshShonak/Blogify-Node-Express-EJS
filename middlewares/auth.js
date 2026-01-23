const { validateToken } = require('../services/authentication');


//authentication middleware
function checkAuthentication(req, res, next) {
    const tokenFromCookie = req.cookies?.uid; 
    
    req.user = null;
    res.locals.user = null;

    if (!tokenFromCookie) return next();

    const user = validateToken(tokenFromCookie);
    
    req.user = user;      
    res.locals.user = user;

    return next();
}

//authorization middleware
function restrictTo(roles = []) {
    return function(req, res, next) {
        if (!req.user) {
            if (roles.includes('GUEST')) return next();
            
            if (req.headers['accept']?.includes('application/json')) {
                return res.status(401).json({ error: "Please log in to continue.", redirect: "/user/login" });
            }
            
            return res.redirect('/user/login');
        }
        
        if (!roles.includes(req.user.role)) {
            return res.redirect('/');
        }

        return next();
    }
}

module.exports = { checkAuthentication, restrictTo };