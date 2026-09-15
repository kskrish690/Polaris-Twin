const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain at least 2 characters'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      `INSERT INTO users
        (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, 'RESEARCHER', TRUE)`,
      [
        name.trim(),
        normalizedEmail,
        passwordHash
      ]
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      role: 'RESEARCHER'
    };

    const token = createToken(user);

    await pool.execute(
      `INSERT INTO audit_logs
        (user_id, action, ip_address, user_agent)
       VALUES (?, ?, ?, ?)`,
      [
        user.id,
        'SIGNUP',
        req.ip || null,
        req.get('user-agent') || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user
    });

  } catch (error) {
    console.error('SIGNUP ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      `SELECT
        id,
        name,
        email,
        password_hash,
        role,
        is_active
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const dbUser = users[0];

    if (!dbUser.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account is inactive'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      dbUser.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    await pool.execute(
      `UPDATE users
       SET last_login_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [dbUser.id]
    );

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role
    };

    const token = createToken(user);

    await pool.execute(
      `INSERT INTO audit_logs
        (user_id, action, ip_address, user_agent)
       VALUES (?, ?, ?, ?)`,
      [
        user.id,
        'LOGIN',
        req.ip || null,
        req.get('user-agent') || null
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


module.exports = {
  signup,
  login
};