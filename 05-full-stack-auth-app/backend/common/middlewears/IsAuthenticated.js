import jwt from 'jsonwebtoken';

export const check = (req, res, next) => {
    // get the authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: "No Authorization Header provided" });
    }
    // split the header into type and token
    const [type, token] = authHeader.split(' '); 
    console.log(`type: ${type}, token: ${token}, actual Token: ${process.env.JWT_SECRET}`);
    // validate type and token
    if (type != 'Bearer')
        return res.status(401).json({ error: "Invalid authorization format" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Debugging (curious)
        console.log("-----------------------------decoded:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: `Invalid or expired token, error: ${err.message}` });
    }
};