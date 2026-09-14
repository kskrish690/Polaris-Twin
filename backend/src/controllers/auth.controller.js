const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');


/* =========================
   SIGNUP
   ========================= */

async function signup(req, res) {

  try {

    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {

      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });

    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (password.length < 8) {

      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters.'
      });

    }

    const [existingUsers] =
      await pool.execute(
        `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [normalizedEmail]
      );

    if (existingUsers.length > 0) {

      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });

    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const [result] =
      await pool.execute(
        `
        INSERT INTO users
        (
          name,
          email,
          password_hash
        )
        VALUES (?, ?, ?)
        `,
        [
          name.trim(),
          normalizedEmail,
          passwordHash
        ]
      );

    const userId = result.insertId;

    const token =
      jwt.sign(
        {
          id: userId,
          email: normalizedEmail,
          role: 'RESEARCHER'
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '8h'
        }
      );

    await pool.execute(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action
      )
      VALUES (?, ?)
      `,
      [
        userId,
        'ACCOUNT_CREATED'
      ]
    );

    return res.status(201).json({

      success: true,

      message:
        'POLARIS-TWIN account created successfully.',

      token,

      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        role: 'RESEARCHER'
      }

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Unable to create account.'
    });

  }

}


/* =========================
   LOGIN
   ========================= */

async function login(req, res) {

  try {

    const {
      email,
      password
    } = req.body;

    const normalizedEmail =
      email.trim().toLowerCase();

    const [users] =
      await pool.execute(
        `
        SELECT
          id,
          name,
          email,
          password_hash,
          role,
          is_active
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [normalizedEmail]
      );

    if (users.length === 0) {

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });

    }

    const user = users[0];

    if (!user.is_active) {

      return res.status(403).json({
        success: false,
        message: 'This account has been disabled.'
      });

    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!validPassword) {

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });

    }

    const token =
      jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '8h'
        }
      );

    await pool.execute(
      `
      UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [user.id]
    );

    await pool.execute(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action
      )
      VALUES (?, ?)
      `,
      [
        user.id,
        'LOGIN_SUCCESS'
      ]
    );

    return res.json({

      success: true,

      message:
        'Authentication successful.',

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Authentication service unavailable.'
    });

  }

}


/* =========================
   EXPORT
   ========================= */

module.exports = {
  signup,
  login
};