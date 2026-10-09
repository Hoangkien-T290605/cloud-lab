
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// LOG REQUEST HTTP
// Đặt trước CORS để ghi nhận cả request bị chặn
// =========================
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
  );
  next();
});

// =========================
// CẤU HÌNH CORS PRODUCTION
// =========================
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
]
  .filter(Boolean)
  .map((url) => url.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép curl và request không có Origin
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// =========================
// MODEL SINH VIÊN
// =========================
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

// =========================
// ROUTE KIỂM TRA BACKEND
// =========================
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

// =========================
// READ: LẤY DANH SÁCH SINH VIÊN
// =========================
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    console.error("Lỗi lấy danh sách sinh viên:", error.message);
    res.status(500).json({
      message: "Không thể tải danh sách sinh viên!",
    });
  }
});

// =========================
// CREATE: THÊM SINH VIÊN
// =========================
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

    const existingStudent = await Student.findOne({
      studentId: studentId.trim(),
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "MSSV đã tồn tại!",
      });
    }

    const student = await Student.create({
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim(),
    });

    console.log("Đã thêm sinh viên:", student.studentId);

    res.status(201).json({
      message: "Thêm sinh viên thành công!",
      student,
    });
  } catch (error) {
    console.error("Lỗi thêm sinh viên:", error.message);
    res.status(500).json({
      message: "Không thể thêm sinh viên!",
    });
  }
});

// =========================
// UPDATE: CẬP NHẬT SINH VIÊN
// =========================
app.put("/api/students/:id", async (req, res) => {
  try {
    const { name, email, studentId } = req.body;
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

    console.log("Đã cập nhật sinh viên:", student.studentId);

    res.status(200).json({
      message: "Cập nhật sinh viên thành công!",
      student,
    });
  } catch (error) {
    console.error("Lỗi cập nhật sinh viên:", error.message);
    res.status(500).json({
      message: "Không thể cập nhật sinh viên!",
    });
  }
});

// =========================
// DELETE: XÓA SINH VIÊN
// =========================
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên!",
      });
    }

    console.log("Đã xóa sinh viên:", student.studentId);

    res.status(200).json({
      message: "Xóa sinh viên thành công!",
      student,
    });
  } catch (error) {
    console.error("Lỗi xóa sinh viên:", error.message);
    res.status(500).json({
      message: "Không thể xóa sinh viên!",
    });
  }
});

// =========================
// XỬ LÝ LỖI CORS VÀ MÁY CHỦ
// =========================
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Nguồn truy cập không được phép bởi CORS.",
    });
  }

  console.error("Lỗi máy chủ:", err.message);

  res.status(500).json({
    message: "Đã xảy ra lỗi máy chủ.",
  });
});

// =========================
// KẾT NỐI MONGODB ATLAS
// =========================
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