import sequelize from '../common/database.js';
import defineUser from '../common/models/Users.js';
const User = defineUser(sequelize);

export const getUser = async (req, res) => {
    const user = await User.findByPk(req.user.userId);
    // console.log(`req.user: ${req.user}, user: ${user}`);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ success: true, data: user });
};

export const getAll = async (req, res) => {
    const user = await User.findByPk(req.user.userId);

    // console.log("requester role:", user.role);
    // if (user.role != "ADMIN" || !user.role) return res.status(404).json({ error: "Access denied" });
    const users = await User.findAll();

    console.log(`users: ${users}`);
    return res.json({ success: true, data: users });
};
