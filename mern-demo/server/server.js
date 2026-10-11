
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// 1. LOG REQUEST HTTP
// Ghi log trước CORS để thấy cả request bị chặn
// =====================================
app.use((req, res, next) => {
  const startTime = Date.now();

  console.log(
    `[HTTP] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`
  );

  res.on("finish", () => {
    console.log(
      `[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${Date.now() - startTime}ms`
    );
  });

  next();
});

// =====================================
// 2. CẤU HÌNH CORS
// =====================================
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://mern-frontend-237536.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
]
  .filter(Boolean)
  .map((url) => url.trim().replace(/\/+$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép curl và request không có Origin
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error("[CORS] Blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// =====================================
// 3. MODEL SINH VIÊN
// =====================================
const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student =
  mongoose.models.Student ||
  mongoose.model("Student", studentSchema);

// =====================================
// 4. ROUTE KIỂM TRA BACKEND
// =====================================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend MERN đang hoạt động!",
  });
});

app.get("/api/hello", (req, res) => {
  res.status(200).json({
    message: "Backend MERN đang hoạt động!",
  });
});

// =====================================
// 5. READ: LẤY DANH SÁCH SINH VIÊN
// GET /api/students
// =====================================
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    return res.status(200).json(students);
  } catch (error) {
    console.error("[READ] Lỗi lấy danh sách:", error.message);

    return res.status(500).json({
      message: "Không thể tải danh sách sinh viên!",
    });
  }
});

// =====================================
// 6. CREATE: THÊM SINH VIÊN
// POST /api/students
// =====================================
app.post("/api/students", async (req, res) => {
  try {
    const { studentId, name, email } = req.body;

    if (
      typeof studentId !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      !studentId.trim() ||
      !name.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ MSSV, họ tên và email.",
      });
    }

    const cleanStudentId = studentId.trim();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    const existingStudent = await Student.findOne({
      studentId: cleanStudentId,
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "MSSV đã tồn tại!",
      });
    }

    const student = await Student.create({
      studentId: cleanStudentId,
      name: cleanName,
      email: cleanEmail,
    });

    console.log("[CREATE] Đã thêm sinh viên:", student.studentId);

    return res.status(201).json({
      message: "Thêm sinh viên thành công!",
      student,
    });
  } catch (error) {
    console.error("[CREATE] Lỗi thêm sinh viên:", error.message);

    return res.status(500).json({
      message: "Không thể thêm sinh viên!",
    });
  }
});

// =====================================
// 7. UPDATE: CẬP NHẬT SINH VIÊN
// PUT /api/students/:id
// =====================================
app.put("/api/students/:id", async (req, res) => {
  try {
    const { studentId, name, email } = req.body;
    const updates = {};

    if (studentId !== undefined) {
      if (typeof studentId !== "string" || !studentId.trim()) {
        return res.status(400).json({
          message: "MSSV không hợp lệ.",
        });
      }

      updates.studentId = studentId.trim();
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Họ tên không hợp lệ.",
        });
      }

      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          message: "Email không hợp lệ.",
        });
      }

      updates.email = email.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Không có thông tin cần cập nhật.",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên!",
      });
    }

    console.log("[UPDATE] Đã cập nhật sinh viên:", student.studentId);

    return res.status(200).json({
      message: "Cập nhật sinh viên thành công!",
      student,
    });
  } catch (error) {
    console.error("[UPDATE] Lỗi cập nhật:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID sinh viên không hợp lệ.",
      });
    }

    return res.status(500).json({
      message: "Không thể cập nhật sinh viên!",
    });
  }
});

// =====================================
// 8. DELETE: XÓA SINH VIÊN
// DELETE /api/students/:id
// =====================================
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên!",
      });
    }

    console.log("[DELETE] Đã xóa sinh viên:", student.studentId);

    return res.status(200).json({
      message: "Xóa sinh viên thành công!",
      student,
    });
  } catch (error) {
    console.error("[DELETE] Lỗi xóa sinh viên:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "ID sinh viên không hợp lệ.",
      });
    }

    return res.status(500).json({
      message: "Không thể xóa sinh viên!",
    });
  }
});

// =====================================
// 9. XỬ LÝ LỖI
// =====================================
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Nguồn truy cập không được phép bởi CORS.",
    });
  }

  console.error("[SERVER ERROR]", err.message);

  return res.status(500).json({
    message: "Đã xảy ra lỗi máy chủ.",
  });
});

// =====================================
// 10. KẾT NỐI MONGODB ATLAS VÀ KHỞI ĐỘNG
// =====================================
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Chưa cấu hình biến môi trường MONGODB_URI.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Đã kết nối MongoDB Atlas");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server đang chạy tại port ${PORT}`);
      console.log("Allowed CORS origins:", allowedOrigins);
    });
  } catch (error) {
    console.error("Không thể khởi động Backend:", error.message);
    process.exit(1);
  }
}

startServer();