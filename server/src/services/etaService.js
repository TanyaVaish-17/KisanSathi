const serviceMinutesFor = (token, defaultDuration) =>
  Number(token.estimatedServiceMinutes) || defaultDuration;

export const calculateQueueETA = (tokens, defaultDuration, now = new Date()) => {
  const nowMs = now.getTime();
  let availableAt = now;
  const updates = [];
  const servingTokens = tokens.filter((token) => token.status === "serving");
  const waitingTokens = tokens.filter((token) => token.status === "waiting");

  for (const token of servingTokens) {
    const duration = serviceMinutesFor(token, defaultDuration);
    const startedAt = token.servingStartedAt || token.calledAt || token.queuedAt || now;
    const elapsedMinutes = Math.max(0, (nowMs - new Date(startedAt).getTime()) / 60000);
    const remainingMinutes = Math.max(0, duration - elapsedMinutes);
    const completionAt = new Date(nowMs + remainingMinutes * 60000);

    updates.push({
      token,
      estimatedWaitMinutes: 0,
      estimatedStartAt: new Date(startedAt),
      estimatedCompletionAt: completionAt,
      etaUpdatedAt: now,
    });
    if (completionAt > availableAt) availableAt = completionAt;
  }

  for (const token of waitingTokens) {
    const duration = serviceMinutesFor(token, defaultDuration);
    const startAt = availableAt;
    const completionAt = new Date(startAt.getTime() + duration * 60000);

    updates.push({
      token,
      estimatedWaitMinutes: Math.max(0, Math.ceil((startAt.getTime() - nowMs) / 60000)),
      estimatedStartAt: startAt,
      estimatedCompletionAt: completionAt,
      etaUpdatedAt: now,
    });
    availableAt = completionAt;
  }

  return updates;
};
