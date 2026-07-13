import { account, ID } from '../config';

/** Appwrite SDK models are class instances (methods like `toString` break Redux serial checks). */
export function toPlainUser(user) {
  if (!user) return null;
  return {
    $id: user.$id,
    $createdAt: user.$createdAt,
    $updatedAt: user.$updatedAt,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    emailVerification: user.emailVerification,
    phoneVerification: user.phoneVerification,
    prefs: user.prefs && typeof user.prefs === 'object' ? { ...user.prefs } : user.prefs,
    registration: user.registration,
    passwordUpdate: user.passwordUpdate,
    accessedAt: user.accessedAt,
  };
}

class AuthService {
  // Register new user (NO auto-login) - FIXED: Return plain user
  async register(email, password, name) {
    try {
      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required');
      }

      const user = await account.create(ID.unique(), email, password, name);
      return {
        success: true,
        user: toPlainUser(user), // FIX 1: Convert to plain object
        message: 'Registration successful. Please login with your credentials.'
      };
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login user — returns plain user object - FIXED: Structured response
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // A session already active on this browser (e.g. from an earlier visit)
      // makes Appwrite reject createEmailPasswordSession() with 401
      // user_session_already_exists. Clear it first so the credentials just
      // submitted are always properly validated and a new session can always
      // be created — no active session means this is a no-op.
      try {
        await account.deleteSession('current');
      } catch {
        // No active session to clear — expected on a normal first login.
      }

      await account.createEmailPasswordSession(email, password);
      return {
        success: true,
        user: toPlainUser(await account.get()), // FIX 2: Structured response
        message: 'Login successful'
      };
    } catch (error) {
      throw new Error(error.message || 'Invalid email or password');
    }
  }

  // Get current logged-in user
  async getCurrentUser() {
    try {
      return toPlainUser(await account.get());
    } catch {
      return null;
    }
  }

  // Logout user
  async logout() {
    try {
      await account.deleteSession('current');
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Update user name - FIXED: Return structured response with plain user
  async updateName(name) {
    try {
      if (!name || name.trim().length === 0) {
        throw new Error('Name is required');
      }

      const updated = await account.updateName(name); // FIX 3: Convert response
      return {
        success: true,
        user: toPlainUser(updated),
        message: 'Name updated successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update name');
    }
  }

  // Update user email - FIXED: Return structured response with plain user
  async updateEmail(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const updated = await account.updateEmail(email, password); // FIX 4: Convert response
      return {
        success: true,
        user: toPlainUser(updated),
        message: 'Email updated successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update email');
    }
  }

  // Update password - FIXED: Return structured response
  async updatePassword(newPassword, oldPassword) {
    try {
      if (!newPassword || !oldPassword) {
        throw new Error('New password and old password are required');
      }

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      await account.updatePassword(newPassword, oldPassword); // FIX 5: Add return
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update password');
    }
  }

  // Send password recovery email - FIXED: Return structured response
  async forgotPassword(email, resetUrl) {
    try {
      if (!email || !resetUrl) {
        throw new Error('Email and reset URL are required');
      }

      const recovery = await account.createRecovery(email, resetUrl); // FIX 6: Structure response
      return {
        success: true,
        recovery,
        message: 'Recovery email sent successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to send recovery email');
    }
  }

  // Complete password recovery - FIXED: Return structured response
  async resetPassword(userId, secret, newPassword, confirmPassword) {
    try {
      if (!userId || !secret || !newPassword || !confirmPassword) {
        throw new Error('All fields are required');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      await account.updateRecovery(userId, secret, newPassword, confirmPassword); // FIX 7: Structure response
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Send email verification - FIXED: Return structured response
  async sendVerification(url) {
    try {
      if (!url) {
        throw new Error('Verification URL is required');
      }

      const verification = await account.createVerification(url); // FIX 8: Structure response
      return {
        success: true,
        verification,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to send verification email');
    }
  }

  // Verify email - FIXED: Return structured response with plain user
  async verifyEmail(userId, secret) {
    try {
      if (!userId || !secret) {
        throw new Error('User ID and secret are required');
      }

      const verified = await account.updateVerification(userId, secret); // FIX 9: Convert response
      return {
        success: true,
        user: toPlainUser(verified),
        message: 'Email verified successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Email verification failed');
    }
  }

  // Delete current session - FIXED: Return structured response
  async deleteCurrentSession() {
    try {
      await account.deleteSession('current'); // FIX 10: Add return
      return {
        success: true,
        message: 'Session deleted successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to delete session');
    }
  }

  // Delete all sessions - FIXED: Return structured response
  async deleteAllSessions() {
    try {
      await account.deleteSessions(); // FIX 11: Add return
      return {
        success: true,
        message: 'All sessions deleted successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to logout from all devices');
    }
  }
}

const authService = new AuthService();
export default authService;