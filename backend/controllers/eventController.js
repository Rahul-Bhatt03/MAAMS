import Event from '../models/eventsModel.js';

// Get all events
export const getEvents = async (req, res) => {
  try {
    // Fetch all events that aren't deleted
    const events = await Event.find({ isDeleted: false });

    // Send the events as the response
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get a single event by its ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the event by ID
    const event = await Event.findById(id);

    // If the event doesn't exist
    if (!event || event.isDeleted) {
      return res.status(404).json({ message: 'Event not found or deleted' });
    }

    // Send the event as the response
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Create an Event
export const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, reason, location } = req.body;

    // Create a new event with only the required fields and safe defaults
    const event = new Event({
      title,
      description,
      startDate,
      endDate,
      reason,
      location,
      createdBy: req.user._id,
      // No role field here
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update an Event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    // Only extract the fields we need to update
    const { title, description, startDate, endDate, reason, location } = req.body;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only update the fields we need
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (reason !== undefined) event.reason = reason;
    if (location !== undefined) event.location = location;
    // No role field here

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Soft Delete an Event
export const softDeleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Soft delete - set isDeleted flag to true
    event.isDeleted = true;
    await event.save();

    res.json({ message: 'Event soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};