// import './config/env.js'
import jwt from "jsonwebtoken";
// import crypto from 'crypto';
import bcrypt from 'bcrypt';
import sequelize from "../common/database.js";
import defineUser from '../common/models/Users.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const User = defineUser(sequelize);

// const encryptPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');
const encryptPassword = async (password) => await bcrypt.hash(password, 10); 

console.log("Secret Key:", process.env.JWT_SECRET)

const generateAccessToken = (username, userId) => 
    jwt.sign({ username, userId }, process.env.JWT_SECRET, { expiresIn: '24h' });

const ajv = new Ajv();
addFormats(ajv, ['email']);

const schema = {
    // Type
    type: 'object',
    // Required columns
    required: ['username', 'email', 'password'],
    // Do this after altering the schema as required
    // additionalProperties: false,
    // details about those columns
    properties: {
        username: { type: 'string', minLength: 3 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6}
    }
};
// creating a validation function that takes in request body as input
const validate = ajv.compile(schema);

export const register = async (req, res) => {
    try {
        // debugging
        // console.log("request:", req);
        
        // Creating a new Ajv object
        // Creating a schema that should be followed by the request body
        if (!validate(req.body)) {
            return res.status(400).json({ error: 'Invalid Input', details: validate.errors });
        }
        const {username, email, password, firstName, lastName, age} = req.body;
        const encryptedPassword = await encryptPassword(password);
        let role = req.body?.role;
        role = (role === undefined ? 'USER' : role);
        console.log(`role: ${role}`);
        const user = await User.create({
            username,
            email,
            password: encryptedPassword,
            firstName,
            lastName,
            role,
            age
        });
        const accessToken = generateAccessToken(username, user.id);
        res.status(201).json({
            success: true,
            user: { id: user.id, username: user.username, email: user.email, role: user.role },
            token: accessToken
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: {username} });
    
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
            return res.status(401).json({ error: "Invalid credentials" });

    const token = generateAccessToken(username, user.id);
    res.json({ success: true, data: user, token: token});
};