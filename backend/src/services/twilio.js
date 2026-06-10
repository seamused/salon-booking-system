const twilio = require("twilio");
const branding = require("../../../config/branding");

let client = null;

function getClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
}

function formatTime(time) {
  const [hour, minute] = time.split(":");
  const h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minute} ${ampm}`;
}

async function sendClientConfirmation(appointment) {
  if (!process.env.TWILIO_ACCOUNT_SID) return;

  const message =
    `Hi ${appointment.client_name}! Your appointment at ${branding.salonName} is confirmed.\n` +
    `📅 ${appointment.appointment_date} at ${formatTime(appointment.appointment_time)}\n` +
    `✂️ ${appointment.service_name}\n` +
    `Questions? Call us at ${branding.phone}`;

  return getClient().messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: appointment.client_phone,
  });
}

async function sendOwnerNotification(appointment) {
  if (!process.env.TWILIO_ACCOUNT_SID) return;

  const message =
    `New booking at ${branding.salonName}!\n` +
    `👤 ${appointment.client_name} (${appointment.client_phone})\n` +
    `📅 ${appointment.appointment_date} at ${formatTime(appointment.appointment_time)}\n` +
    `✂️ ${appointment.service_name} (${appointment.service_duration} min)`;

  return getClient().messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: branding.ownerPhone,
  });
}

async function sendCancellationConfirmation(appointment) {
  if (!process.env.TWILIO_ACCOUNT_SID) return;

  const message =
    `Hi ${appointment.client_name}, your appointment at ${branding.salonName} on ` +
    `${appointment.appointment_date} at ${formatTime(appointment.appointment_time)} has been cancelled.\n` +
    `To rebook, visit our website or call ${branding.phone}.`;

  return getClient().messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: appointment.client_phone,
  });
}

module.exports = {
  sendClientConfirmation,
  sendOwnerNotification,
  sendCancellationConfirmation,
};
