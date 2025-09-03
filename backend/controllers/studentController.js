const { generateToken, verifyToken } = require("../utils/auth");
const { validationResult } = require("express-validator");
const { Student, Hostel, User } = require("../models");
const bcrypt = require("bcryptjs");
const Parser = require("json2csv").Parser;
const mongoose = require("mongoose");
const QRCode = require("qrcode");

// add near top where other imports exist (if mongoose already imported, ignore)

// Add this function in the same file
const getStats = async (req, res) => {
  try {
    // total students
    const totalStudents = await Student.countDocuments();

    // hostels + capacity
    const hostels = await Hostel.find().lean();

    // students grouped by hostel id
    const studentsPerHostelAgg = await Student.aggregate([
      { $group: { _id: "$hostel", count: { $sum: 1 } } },
    ]);

    // map counts for quick lookup
    const countsByHostel = {};
    studentsPerHostelAgg.forEach((h) => {
      countsByHostel[String(h._id)] = h.count;
    });

    const hostelsWithStats = hostels.map((h) => {
      const occupied = countsByHostel[String(h._id)] || 0;
      const capacity = h.capacity || 0;
      const vacant = Math.max(capacity - occupied, 0);
      return {
        _id: h._id,
        name: h.name,
        capacity,
        occupied,
        vacant,
      };
    });

    // students by department
    const byDeptAgg = await Student.aggregate([
      { $group: { _id: "$dept", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // students by batch/year
    const byBatchAgg = await Student.aggregate([
      { $group: { _id: "$batch", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return res.json({
      success: true,
      totalStudents,
      hostels: hostelsWithStats,
      byDept: byDeptAgg,
      byBatch: byBatchAgg,
    });
  } catch (err) {
    console.error("Get Stats Error:", err);
    return res
      .status(500)
      .json({ success: false, errors: [{ msg: "Server error" }] });
  }
};

// Escape regex helper
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Resolve hostel by _id or name (case-insensitive)
async function resolveHostel(hostelValue) {
  if (!hostelValue) return null;
  const v = String(hostelValue).trim();

  if (mongoose.Types.ObjectId.isValid(v)) {
    return Hostel.findById(v);
  }
  return Hostel.findOne({ name: { $regex: `^${esc(v)}$`, $options: "i" } });
}

const registerStudent = async (req, res) => {
  // console.log(req.body);
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors);
    return res.status(400).json({ success, errors: errors.array() });
  }

  const {
    name,
    cms_id,
    room_no,
    batch,
    dept,
    course,
    email,
    father_name,
    contact,
    address,
    dob,
    cnic,
    hostel,
    password,
  } = req.body;
  try {
    let student = await Student.findOne({ cms_id });

    if (student) {
      return res
        .status(400)
        .json({ success, errors: [{ msg: "Student already exists" }] });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success,
        errors: [{ msg: "Email already registered" }],
      });
    }
    let shostel = await resolveHostel(hostel);
    if (!shostel) {
      return res.status(400).json({
        success,
        errors: [{ msg: "Invalid hostel name" }],
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = new User({
      email,
      password: hashedPassword,
      isAdmin: false,
    });

    await user.save();

    student = new Student({
      name,
      cms_id,
      room_no,
      batch,
      dept,
      course,
      email,
      father_name,
      contact,
      address,
      dob,
      cnic,
      user: user._id,
      hostel: shostel._id,
    });

    // inside registerStudent, right before student.save()

    // generate QR data (customize fields as you want)
    const qrData = `CMS:${cms_id}, Name:${name}, Room:${room_no}, Hostel:${shostel.name}`;
    const qrImage = await QRCode.toDataURL(qrData);

    // attach QR code to student
    student.qrCode = qrImage;

    // await student.save();

    await student.save();

    success = true;
    return res.status(201).json({ success, student });
  } catch (err) {
    console.error("Register Student Error:", err.message);
    res.status(500).json({ success, errors: "Server error" });
  }
};

const getStudent = async (req, res) => {
  try {
    // console.log(req.body);
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors);
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { isAdmin } = req.body;

    if (isAdmin) {
      return res
        .status(400)
        .json({ success, errors: "Admin cannot access this route" });
    }

    const { token } = req.body;

    const decoded = verifyToken(token);

    const student = await Student.findOne({ user: decoded.userId }).select(
      "-password"
    );

    if (!student) {
      return res
        .status(400)
        .json({ success, errors: "Student does not exist" });
    }

    success = true;
    res.json({ success, student });
  } catch (err) {
    res.status(500).json({ success, errors: "Server error" });
  }
};

const getAllStudents = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors);
    return res.status(400).json({ success, errors: errors.array() });
  }

  let { hostel } = req.body;

  try {
    // const shostel = await Hostel.findById(hostel);
    const shostel = await resolveHostel(hostel);
    if (!shostel) {
      return res
        .status(400)
        .json({ success, errors: [{ msg: "Invalid hostel" }] });
    }
    const students = await Student.find({ hostel: shostel.id }).select(
      "-password"
    );

    success = true;
    res.json({ success, students });
  } catch (err) {
    res.status(500).json({ success, errors: [{ msg: "Server error" }] });
  }
};

const updateStudent = async (req, res) => {
  let success = false;
  try {
    // const student = await Student.findById(req.student.id).select('-password');
    const student = await Student.findById(req.body._id || req.body.id).select(
      "-password"
    );
    const {
      name,
      cms_id,
      room_no,
      batch,
      dept,
      course,
      email,
      father_name,
      contact,
      address,
      dob,
      cnic,
      user,
      hostel,
    } = req.body;

    student.name = name;
    student.cms_id = cms_id;
    student.room_no = room_no;
    student.batch = batch;
    student.dept = dept;
    student.course = course;
    student.email = email;
    student.father_name = father_name;
    student.contact = contact;
    student.address = address;
    student.dob = dob;
    student.cnic = cnic;
    student.hostel = hostel;

    await student.save();

    success = true;
    res.json({ success, student });
  } catch (err) {
    res.status(500).json({ success, errors: [{ msg: "Server error" }] });
  }
};

const deleteStudent = async (req, res) => {
  try {
    // console.log(req.body);
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors);
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { id } = req.body;

    const student = await Student.findById(id).select("-password");

    if (!student) {
      return res
        .status(400)
        .json({ success, errors: [{ msg: "Student does not exist" }] });
    }

    const user = await User.findByIdAndDelete(student.user);

    await Student.deleteOne(student);

    success = true;
    res.json({ success, msg: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ success, errors: [{ msg: "Server error" }] });
  }
};

const csvStudent = async (req, res) => {
  let success = false;
  try {
    // console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors);
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { hostel } = req.body;

    const shostel = await Hostel.findById(hostel);

    const students = await Student.find({ hostel: shostel.id }).select(
      "-password"
    );

    students.forEach((student) => {
      student.hostel_name = shostel.name;
      student.d_o_b = new Date(student.dob).toDateString().slice(4);
      student.cnic_no =
        student.cnic.slice(0, 5) +
        "-" +
        student.cnic.slice(5, 12) +
        "-" +
        student.cnic.slice(12);
      student.contact_no = "+92 " + student.contact.slice(1);
    });

    const fields = [
      "name",
      "cms_id",
      "room_no",
      "batch",
      "dept",
      "course",
      "email",
      "father_name",
      "contact_no",
      "address",
      "d_o_b",
      "cnic_no",
      "hostel_name",
    ];

    const opts = { fields };

    const parser = new Parser(opts);

    const csv = parser.parse(students);

    success = true;
    res.json({ success, csv });
  } catch (err) {
    res.status(500).json({ success, errors: [{ msg: "Server error" }] });
  }
};

module.exports = {
  registerStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  getAllStudents,
  csvStudent,
  getStats,
};
