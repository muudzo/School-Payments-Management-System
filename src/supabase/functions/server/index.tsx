import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client for auth
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Health check endpoint
app.get("/make-server-fcce6e64/health", (c) => {
  return c.json({ status: "ok" });
});

// Helper function to verify authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Helper function to generate IDs
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

// Helper function to generate receipt numbers
function generateReceiptNumber() {
  const timestamp = Date.now();
  return `REC${timestamp.toString().slice(-6)}`;
}

// Authentication Routes

// Sign up new user
app.post("/make-server-fcce6e64/auth/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (!['admin', 'staff', 'parent'].includes(role)) {
      return c.json({ error: "Invalid role" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true // Auto-confirm since email server isn't configured
    });

    if (error) {
      console.log(`Sign up error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user info in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      message: "User created successfully",
      userId: data.user.id 
    });

  } catch (error) {
    console.log(`Sign up error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get current user profile
app.get("/make-server-fcce6e64/auth/profile", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    return c.json(userProfile);

  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Student Management Routes

// Get all students
app.get("/make-server-fcce6e64/students", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    // Parents can only see their own children
    if (userProfile.role === 'parent') {
      const studentIds = await kv.getByPrefix(`student_parent:${user.id}:`);
      const students = await Promise.all(
        studentIds.map(async (entry) => {
          const studentId = entry.key.split(':')[2];
          return await kv.get(`student:${studentId}`);
        })
      );
      return c.json(students.filter(Boolean));
    }

    // Admin and staff can see all students
    const students = await kv.getByPrefix('student:');
    const studentData = students.map(entry => entry.value);
    
    return c.json(studentData);

  } catch (error) {
    console.log(`Get students error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create new student
app.post("/make-server-fcce6e64/students", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role === 'parent') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const studentData = await c.req.json();
    const studentId = generateId();
    
    const student = {
      id: studentId,
      name: studentData.name,
      class: studentData.class,
      guardianName: studentData.guardianName,
      guardianPhone: studentData.guardianPhone,
      guardianEmail: studentData.guardianEmail,
      balance: studentData.balance || 0,
      lastPayment: studentData.lastPayment || null,
      status: studentData.status || 'pending',
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    await kv.set(`student:${studentId}`, student);

    // If parent email provided, link to parent account
    if (studentData.guardianEmail) {
      const parentUsers = await kv.getByPrefix('user:');
      const parentUser = parentUsers.find(entry => 
        entry.value.email === studentData.guardianEmail && 
        entry.value.role === 'parent'
      );
      
      if (parentUser) {
        await kv.set(`student_parent:${parentUser.value.id}:${studentId}`, true);
      }
    }

    return c.json(student);

  } catch (error) {
    console.log(`Create student error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update student
app.put("/make-server-fcce6e64/students/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role === 'parent') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const studentId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingStudent = await kv.get(`student:${studentId}`);
    if (!existingStudent) {
      return c.json({ error: "Student not found" }, 404);
    }

    const updatedStudent = {
      ...existingStudent,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };

    await kv.set(`student:${studentId}`, updatedStudent);
    return c.json(updatedStudent);

  } catch (error) {
    console.log(`Update student error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Payment Management Routes

// Get payments
app.get("/make-server-fcce6e64/payments", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    const studentId = c.req.query('studentId');

    if (userProfile.role === 'parent') {
      // Parents can only see payments for their children
      const studentIds = await kv.getByPrefix(`student_parent:${user.id}:`);
      const parentStudentIds = studentIds.map(entry => entry.key.split(':')[2]);
      
      const allPayments = await kv.getByPrefix('payment:');
      const payments = allPayments
        .map(entry => entry.value)
        .filter(payment => parentStudentIds.includes(payment.studentId));
      
      return c.json(studentId ? payments.filter(p => p.studentId === studentId) : payments);
    }

    // Admin and staff can see all payments
    const payments = await kv.getByPrefix('payment:');
    const paymentData = payments.map(entry => entry.value);
    
    return c.json(studentId ? paymentData.filter(p => p.studentId === studentId) : paymentData);

  } catch (error) {
    console.log(`Get payments error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create new payment
app.post("/make-server-fcce6e64/payments", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    const paymentData = await c.req.json();
    const paymentId = generateId();
    
    // Get student to update balance
    const student = await kv.get(`student:${paymentData.studentId}`);
    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }

    // For parents, verify they can pay for this student
    if (userProfile.role === 'parent') {
      const studentParentLink = await kv.get(`student_parent:${user.id}:${paymentData.studentId}`);
      if (!studentParentLink) {
        return c.json({ error: "Forbidden" }, 403);
      }
    }

    const payment = {
      id: paymentId,
      studentId: paymentData.studentId,
      studentName: student.name,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      reference: paymentData.reference || null,
      description: paymentData.description,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      recordedBy: userProfile.name,
      receiptNumber: generateReceiptNumber(),
      status: paymentData.status || 'completed',
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    await kv.set(`payment:${paymentId}`, payment);

    // Update student balance
    const newBalance = Math.max(0, student.balance - paymentData.amount);
    const status = newBalance === 0 ? 'paid' : 
                   newBalance > 0 ? 'pending' : 'pending';
    
    await kv.set(`student:${paymentData.studentId}`, {
      ...student,
      balance: newBalance,
      status,
      lastPayment: payment.date,
      updatedAt: new Date().toISOString()
    });

    return c.json(payment);

  } catch (error) {
    console.log(`Create payment error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Generate receipt
app.post("/make-server-fcce6e64/receipts/generate", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { paymentId } = await c.req.json();
    
    const payment = await kv.get(`payment:${paymentId}`);
    if (!payment) {
      return c.json({ error: "Payment not found" }, 404);
    }

    const student = await kv.get(`student:${payment.studentId}`);
    const receiptId = generateId();
    
    const receipt = {
      id: receiptId,
      paymentId,
      receiptNumber: payment.receiptNumber,
      studentName: payment.studentName,
      amount: payment.amount,
      date: payment.date,
      description: payment.description,
      paymentMethod: payment.paymentMethod,
      issuedBy: payment.recordedBy,
      parentEmail: student?.guardianEmail,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    await kv.set(`receipt:${receiptId}`, receipt);
    return c.json(receipt);

  } catch (error) {
    console.log(`Generate receipt error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get payment statistics
app.get("/make-server-fcce6e64/stats/payments", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role === 'parent') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const payments = await kv.getByPrefix('payment:');
    const paymentData = payments
      .map(entry => entry.value)
      .filter(payment => payment.status === 'completed');

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayPayments = paymentData.filter(p => p.date === today);
    const weekPayments = paymentData.filter(p => new Date(p.date) >= weekStart);
    const monthPayments = paymentData.filter(p => new Date(p.date) >= monthStart);

    const stats = {
      today: {
        amount: todayPayments.reduce((sum, p) => sum + p.amount, 0),
        count: todayPayments.length
      },
      thisWeek: {
        amount: weekPayments.reduce((sum, p) => sum + p.amount, 0),
        count: weekPayments.length
      },
      thisMonth: {
        amount: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        count: monthPayments.length
      }
    };

    return c.json(stats);

  } catch (error) {
    console.log(`Get payment stats error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Send payment reminder
app.post("/make-server-fcce6e64/notifications/reminder", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role === 'parent') {
      return c.json({ error: "Forbidden" }, 403);
    }

    const { studentId } = await c.req.json();
    
    const student = await kv.get(`student:${studentId}`);
    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }

    // In a real app, this would send an actual email/SMS
    const reminder = {
      id: generateId(),
      studentId,
      studentName: student.name,
      guardianEmail: student.guardianEmail,
      guardianPhone: student.guardianPhone,
      balance: student.balance,
      message: `Payment reminder for ${student.name}. Outstanding balance: ${student.balance}`,
      sentBy: userProfile.name,
      sentAt: new Date().toISOString()
    };

    await kv.set(`reminder:${reminder.id}`, reminder);
    
    console.log(`Payment reminder sent for student ${studentId} to ${student.guardianEmail}`);
    return c.json({ message: "Reminder sent successfully", reminder });

  } catch (error) {
    console.log(`Send reminder error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Initialize sample data
app.post("/make-server-fcce6e64/init-sample-data", async (c) => {
  try {
    // Create sample students
    const sampleStudents = [
      {
        id: '1',
        name: 'Michael Chen',
        class: 'Grade 11B',
        guardianName: 'Linda Chen',
        guardianPhone: '+263 77 123 4567',
        guardianEmail: 'linda.chen@email.com',
        balance: 1250,
        lastPayment: '2024-01-10',
        status: 'overdue',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Sarah Williams',
        class: 'Grade 9A',
        guardianName: 'John Williams',
        guardianPhone: '+263 77 234 5678',
        guardianEmail: 'john.williams@email.com',
        balance: 850,
        lastPayment: '2024-01-15',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'David Brown',
        class: 'Grade 12C',
        guardianName: 'Mary Brown',
        guardianPhone: '+263 77 345 6789',
        guardianEmail: 'mary.brown@email.com',
        balance: 2100,
        lastPayment: '2023-12-20',
        status: 'overdue',
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Emma Davis',
        class: 'Grade 10A',
        guardianName: 'Robert Davis',
        guardianPhone: '+263 77 456 7890',
        guardianEmail: 'robert.davis@email.com',
        balance: 0,
        lastPayment: '2024-01-20',
        status: 'paid',
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'James Wilson',
        class: 'Grade 11A',
        guardianName: 'Jennifer Wilson',
        guardianPhone: '+263 77 567 8901',
        guardianEmail: 'jennifer.wilson@email.com',
        balance: 1200,
        lastPayment: '2024-01-12',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Sophie Miller',
        class: 'Grade 9B',
        guardianName: 'Mark Miller',
        guardianPhone: '+263 77 678 9012',
        guardianEmail: 'mark.miller@email.com',
        balance: 0,
        lastPayment: '2024-01-18',
        status: 'paid',
        createdAt: new Date().toISOString()
      }
    ];

    // Create sample payments
    const samplePayments = [
      {
        id: 'p1',
        studentId: '1',
        studentName: 'Michael Chen',
        amount: 1200,
        paymentMethod: 'ecocash',
        reference: 'EC12345',
        description: 'School Fees - January',
        date: '2024-01-10',
        recordedBy: 'Admin',
        receiptNumber: 'REC001',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'p2',
        studentId: '2',
        studentName: 'Sarah Williams',
        amount: 1200,
        paymentMethod: 'bank_transfer',
        reference: 'BT67890',
        description: 'School Fees - January',
        date: '2024-01-15',
        recordedBy: 'Admin',
        receiptNumber: 'REC002',
        status: 'completed',
        createdAt: new Date().toISOString()
      }
    ];

    // Store sample data
    for (const student of sampleStudents) {
      await kv.set(`student:${student.id}`, student);
    }

    for (const payment of samplePayments) {
      await kv.set(`payment:${payment.id}`, payment);
    }

    return c.json({ message: "Sample data initialized successfully" });

  } catch (error) {
    console.log(`Init sample data error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);