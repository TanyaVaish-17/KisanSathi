import Notification from "../models/Notification.js";
import Token from "../models/Token.js";
import { getIO } from "../socket.js";

const templates = {
  created: ({ code, center, service, serviceHi, wait }) => ({
    type: "token_created",
    title: "Token booked",
    message: `Token #${code} is booked for ${service} at ${center}. Estimated wait: ${wait} min.`,
    messageHi: `टोकन #${code} ${center} में ${serviceHi} के लिए बुक हो गया है। अनुमानित प्रतीक्षा: ${wait} मिनट।`,
  }),
  called: ({ code, counter }) => ({
    type: "token_called",
    title: "It's your turn",
    message: `Token #${code} is being called. Please go to ${counter} now.`,
    messageHi: `टोकन #${code} की बारी आ गई है। कृपया अभी ${counter} पर जाएँ।`,
  }),
  completed: ({ code, center }) => ({
    type: "token_completed",
    title: "Visit completed",
    message: `Token #${code} is completed. Thank you for visiting ${center}.`,
    messageHi: `टोकन #${code} पूरा हुआ। ${center} आने के लिए धन्यवाद।`,
  }),
  skipped: ({ code }) => ({
    type: "token_skipped",
    title: "Token skipped",
    message: `You were not at the counter, so token #${code} was moved to the back of the queue.`,
    messageHi: `आप काउंटर पर नहीं थे, इसलिए टोकन #${code} को कतार में सबसे पीछे कर दिया गया है।`,
  }),
  no_show: ({ code }) => ({
    type: "token_no_show",
    title: "Marked as no-show",
    message: `Token #${code} was marked as no-show. Please book a new token if you still need service.`,
    messageHi: `टोकन #${code} को अनुपस्थित दर्ज किया गया है। सेवा चाहिए तो कृपया नया टोकन बुक करें।`,
  }),
  cancelled: ({ code }) => ({
    type: "token_cancelled",
    title: "Token cancelled",
    message: `Token #${code} has been cancelled.`,
    messageHi: `टोकन #${code} रद्द कर दिया गया है।`,
  }),
};

export const createNotification = async ({ recipient, type, title, message, messageHi, token }) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    messageHi,
    token: token || null,
  });

  const io = getIO();
  if (io) io.to(`user:${recipient}`).emit("notification:new", notification);

  return notification;
};

export const notifyTokenEvent = async (event, tokenOrId) => {
  try {
    const id = tokenOrId?._id ?? tokenOrId;
    const token = await Token.findById(id)
      .populate("center", "name")
      .populate("service", "name nameHi")
      .populate("counter", "name");

    if (!token || !token.farmer || !templates[event]) return;

    const content = templates[event]({
      code: token.tokenCode,
      center: token.center?.name || "the center",
      service: token.service?.name || "your service",
      serviceHi: token.service?.nameHi || token.service?.name || "आपकी सेवा",
      counter: token.counter?.name || "the counter",
      wait: token.estimatedWaitMinutes ?? 0,
    });

    await createNotification({ recipient: token.farmer, token: token._id, ...content });
  } catch (error) {
    console.error("Notification failed:", error.message);
  }
};