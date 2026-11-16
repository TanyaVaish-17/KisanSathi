import Notification from "../models/Notification.js";
import Token from "../models/Token.js";
import { getIO } from "../socket.js";
import { getDateKey } from "../utils/dateKey.js";

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

export const createNotification = async ({ recipient, type, title, message, messageHi, token, key }) => {
  let notification;

  try {
    notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      messageHi,
      token: token || null,
      key,
    });
  } catch (error) {
    if (error.code === 11000) return null;
    throw error;
  }

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

export const notifyQueueProgress = async (entries) => {
  try {
    for (const entry of entries) {
      const farmer = entry.token.farmer;
      if (!farmer || ![1, 3].includes(entry.position)) continue;

      const code = entry.token.tokenCode;
      const ahead = entry.aheadCount ?? entry.position - 1;
      const wait = entry.estimatedWaitMinutes ?? 0;

      const content =
        entry.position === 1
          ? {
              title: "You are next",
              message: `Token #${code} is next in line. Please be at the counter now.`,
              messageHi: `टोकन #${code} अगला है। कृपया अभी काउंटर पर पहुँचें।`,
            }
          : {
              title: "Your turn is coming up",
              message: `Only ${ahead} farmers are ahead of token #${code}. Estimated wait: ${wait} min. Please start heading to the center.`,
              messageHi: `टोकन #${code} से पहले केवल ${ahead} किसान हैं। अनुमानित प्रतीक्षा: ${wait} मिनट। कृपया केंद्र की ओर निकलें।`,
            };

      await createNotification({
        recipient: farmer,
        token: entry.token._id,
        type: "queue_progress",
        key: `progress:${entry.position}`,
        ...content,
      });
    }
  } catch (error) {
    console.error("Progress notification failed:", error.message);
  }
};

export const notifyCounterStatusChange = async (counter, status) => {
  try {
    const tokens = await Token.find({
      counter: counter._id,
      dateKey: getDateKey(),
      status: "waiting",
      farmer: { $ne: null },
    }).select("tokenCode farmer");

    for (const token of tokens) {
      const code = token.tokenCode;
      const name = counter.name;

      const content =
        status === "paused"
          ? {
              type: "delay",
              title: "Counter paused",
              message: `${name} is paused for a short while, so your wait for token #${code} may be longer. We will keep you updated.`,
              messageHi: `${name} कुछ समय के लिए रुका हुआ है, इसलिए टोकन #${code} की प्रतीक्षा बढ़ सकती है। हम आपको अपडेट देते रहेंगे।`,
            }
          : status === "inactive"
            ? {
                type: "delay",
                title: "Counter closed",
                message: `${name} is closed, so your wait for token #${code} may be much longer. Please check with the center.`,
                messageHi: `${name} बंद है, इसलिए टोकन #${code} की प्रतीक्षा काफ़ी बढ़ सकती है। कृपया केंद्र से पूछें।`,
              }
            : {
                type: "queue_progress",
                title: "Counter resumed",
                message: `${name} is serving again. Token #${code} is back on track.`,
                messageHi: `${name} फिर से सेवा दे रहा है। टोकन #${code} की कतार फिर चल पड़ी है।`,
              };

      await createNotification({ recipient: token.farmer, token: token._id, ...content });
    }
  } catch (error) {
    console.error("Counter notification failed:", error.message);
  }
};