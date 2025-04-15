import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { users } from '../shared/schema';

// Configure passport to use local strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // Find user by email
    const userResults = await db.select().from(users).where(eq(users.email, email));
    
    if (!userResults.length) {
      return done(null, false, { message: 'Incorrect email or password' });
    }
    
    const user = userResults[0];
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect email or password' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize user to store in session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const userResults = await db.select().from(users).where(eq(users.id, id));
    
    if (!userResults.length) {
      return done(null, false);
    }
    
    const user = userResults[0];
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware to hash password before saving
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Auth service with methods for registration, login, etc.
export const authService = {
  
  // Register a new user
  async register(email: string, name: string, password: string) {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user with username field set to the same as email to satisfy any remaining
    // constraints while we transition the schema
    const result = await db.insert(users).values({
      email,
      name,
      username: email, // Use email as username for compatibility
      password: hashedPassword,
    }).returning();
    
    return result[0];
  },
  
  // Get user by ID
  async getUserById(id: number) {
    const userResults = await db.select().from(users).where(eq(users.id, id));
    
    if (!userResults.length) {
      return null;
    }
    
    return userResults[0];
  },
  
  // Get user by email
  async getUserByEmail(email: string) {
    const userResults = await db.select().from(users).where(eq(users.email, email));
    
    if (!userResults.length) {
      return null;
    }
    
    return userResults[0];
  }
};

export default passport;