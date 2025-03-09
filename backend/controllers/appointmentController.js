import Appointment from "../models/appointmentModel.js";
import Department from "../models/departmentModel.js";
import Doctor from "../models/doctorModel.js";

// Function to format date properly
const formatDate = (date) => date.toISOString().split("T")[0].replace(/-/g, "/");

// Function to validate and parse date
const parseDate = (dateStr) => new Date(dateStr.replace(/\//g, "-"));

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor")
      .populate("department")
      .sort({ date: -1 });

    // Format date before sending response
    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment.toObject(),
      date: formatDate(appointment.date),
    }));

    res.status(200).json(formattedAppointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments", error: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctor")
      .populate("department");

    if (!appointment) {
      return res.status(400).json({ message: "Appointment not found" });
    }

    res.status(200).json({ ...appointment.toObject(), date: formatDate(appointment.date) });
  } catch (error) {
    res.status(500).json({ message: "Failed fetching appointment by ID", error: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { patientName, doctor, department, date } = req.body;
    const appointmentDate = parseDate(date);

    // Validate appointment date isn't in the past
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < currentDate) {
      return res.status(400).json({ message: "Cannot book an appointment in the past" });
    }

    const newAppointment = new Appointment({
      patientName,
      doctor,
      department,
      date: formatDate(appointmentDate), // Ensure formatted date is saved
      status: "Pending",
    });

    const savedAppointment = await newAppointment.save();

    await Department.findByIdAndUpdate(department, {
      $push: { appointments: savedAppointment._id },
      updatedAt: Date.now(),
    });

    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate("doctor")
      .populate("department");

    res.status(201).json({ ...populatedAppointment.toObject(), date: formatDate(populatedAppointment.date) });
  } catch (error) {
    res.status(500).json({ message: "Failed to create appointment", error: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { patientName, doctor, department, date } = req.body;

    if (date) {
      const appointmentDate = parseDate(date);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (appointmentDate < currentDate) {
        return res.status(400).json({ message: "Cannot update appointment to a past date" });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        patientName,
        doctor,
        department,
        date: date ? formatDate(parseDate(date)) : undefined,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).populate("doctor").populate("department");

    if (!updatedAppointment) {
      return res.status(400).json({ message: "Appointment not found" });
    }

    res.status(200).json({ ...updatedAppointment.toObject(), date: formatDate(updatedAppointment.date) });
  } catch (error) {
    res.status(500).json({ message: "Failed to update the appointment", error: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Confirmed", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedAppointmentStatus = await Appointment.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: Date.now(),
      },
      { new: true }
    ).populate("doctor").populate("department");

    if (!updatedAppointmentStatus) {
      return res.status(400).json({ message: "Appointment not found" });
    }

    res.status(200).json({ ...updatedAppointmentStatus.toObject(), date: formatDate(updatedAppointmentStatus.date) });
  } catch (error) {
    res.status(500).json({ message: "Failed to update appointment status", error: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: Date.now(),
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(400).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete the appointment", error: error.message });
  }
};

export const getAppointmentsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const appointments = await Appointment.find({ department: departmentId })
      .populate("doctor")
      .populate("department")
      .sort({ date: -1 });

    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment.toObject(),
      date: formatDate(appointment.date),
    }));

    res.status(200).json(formattedAppointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching department appointments", error: error.message });
  }
};

export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("doctor")
      .populate("department")
      .sort({ date: -1 });

    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment.toObject(),
      date: formatDate(appointment.date),
    }));

    res.status(200).json(formattedAppointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor appointments", error: error.message });
  }
};
