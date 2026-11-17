import mongoose from "mongoose";
import Token from "../models/Token.js";
import Counter from "../models/Counter.js";
import Service from "../models/Service.js";
import ServiceCenter from "../models/ServiceCenter.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import { getDateKey } from "../utils/dateKey.js";

const STATUSES = ["waiting", "serving", "completed", "cancelled", "skipped", "no_show", "expired"];
const FINISHED = ["completed", "cancelled", "skipped", "no_show", "expired"];

const round1 = (value) =>
  value === null || value === undefined ? null : Math.round(value * 10) / 10;

const percent = (part, whole) => (whole > 0 ? round1((part / whole) * 100) : 0);

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const shiftDateKey = (dateKey, days) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};

export const daysBetween = (from, to) => {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  return Math.round((Date.UTC(toYear, toMonth - 1, toDay) - Date.UTC(fromYear, fromMonth - 1, fromDay)) / 86400000) + 1;
};

const completedOnly = (expression) => ({
  $cond: [{ $eq: ["$status", "completed"] }, expression, null],
});

const countIf = (status) => ({ $sum: { $cond: [{ $eq: ["$status", status] }, 1, 0] } });

export const buildTokenPipeline = (match) => [
  { $match: match },
  {
    $addFields: {
      waitMinutes: completedOnly({
        $divide: [{ $subtract: ["$servingStartedAt", "$queuedAt"] }, 60000],
      }),
      serviceMinutes: completedOnly({
        $ifNull: [
          "$actualServiceMinutes",
          { $divide: [{ $subtract: ["$completedAt", "$servingStartedAt"] }, 60000] },
        ],
      }),
    },
  },
  {
    $facet: {
      statusCounts: [
        { $group: { _id: { status: "$status", source: "$source" }, count: { $sum: 1 } } },
      ],
      times: [
        {
          $group: {
            _id: null,
            avgWait: { $avg: "$waitMinutes" },
            maxWait: { $max: "$waitMinutes" },
            avgService: { $avg: "$serviceMinutes" },
          },
        },
      ],
      daily: [
        {
          $group: {
            _id: "$dateKey",
            total: { $sum: 1 },
            completed: countIf("completed"),
            noShow: countIf("no_show"),
            cancelled: countIf("cancelled"),
            avgWait: { $avg: "$waitMinutes" },
          },
        },
        { $sort: { _id: 1 } },
      ],
      hourly: [
        {
          $group: {
            _id: { $hour: { date: "$createdAt", timezone: "Asia/Kolkata" } },
            count: { $sum: 1 },
          },
        },
      ],
      byCenter: [
        {
          $group: {
            _id: "$center",
            total: { $sum: 1 },
            completed: countIf("completed"),
            noShow: countIf("no_show"),
            avgWait: { $avg: "$waitMinutes" },
          },
        },
      ],
      byService: [
        {
          $group: {
            _id: "$service",
            total: { $sum: 1 },
            completed: countIf("completed"),
            noShow: countIf("no_show"),
            avgWait: { $avg: "$waitMinutes" },
            avgService: { $avg: "$serviceMinutes" },
          },
        },
      ],
      byCounter: [
        { $match: { counter: { $ne: null } } },
        {
          $group: {
            _id: "$counter",
            total: { $sum: 1 },
            completed: countIf("completed"),
            busyMinutes: { $sum: "$serviceMinutes" },
            days: { $addToSet: "$dateKey" },
          },
        },
      ],
    },
  },
];

const rowMap = (rows) => new Map(rows.map((row) => [String(row._id), row]));

export const buildAnalytics = async ({ from, to, center }) => {
  const centerId = center ? new mongoose.Types.ObjectId(center) : null;
  const centerScope = centerId ? { center: centerId } : {};
  const today = getDateKey();

  const match = { dateKey: { $gte: from, $lte: to }, ...centerScope };
  const feedbackMatch = {
    createdAt: {
      $gte: new Date(`${from}T00:00:00.000+05:30`),
      $lte: new Date(`${to}T23:59:59.999+05:30`),
    },
    ...centerScope,
  };

  const [
    [facets],
    centers,
    services,
    counters,
    userRoles,
    counterStatuses,
    activeServices,
    liveQueue,
    feedback,
  ] = await Promise.all([
    Token.aggregate(buildTokenPipeline(match)),
    ServiceCenter.find(centerId ? { _id: centerId } : {}).sort("name"),
    Service.find(centerScope).populate("center", "name").sort("name"),
    Counter.find(centerScope)
      .populate("center", "name openTime closeTime")
      .populate("service", "name")
      .populate("operator", "name")
      .sort("name"),
    User.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$role", count: { $sum: 1 } } }]),
    Counter.aggregate([{ $match: centerScope }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Service.countDocuments({ isActive: true, ...centerScope }),
    Token.aggregate([
      { $match: { dateKey: today, status: { $in: ["waiting", "serving"] }, ...centerScope } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Feedback.aggregate([
      { $match: feedbackMatch },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: "$rating" } } },
    ]),
  ]);

  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  let walkIns = 0;
  let online = 0;

  facets.statusCounts.forEach((row) => {
    byStatus[row._id.status] = (byStatus[row._id.status] || 0) + row.count;
    if (row._id.source === "walk_in") walkIns += row.count;
    else online += row.count;
  });

  const totalTokens = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
  const finished = FINISHED.reduce((sum, status) => sum + byStatus[status], 0);
  const times = facets.times[0] || {};

  const dailyMap = rowMap(facets.daily);
  const daily = [];
  for (let key = from; key <= to; key = shiftDateKey(key, 1)) {
    const row = dailyMap.get(key);
    daily.push({
      date: key,
      total: row?.total || 0,
      completed: row?.completed || 0,
      noShow: row?.noShow || 0,
      cancelled: row?.cancelled || 0,
      avgWaitMinutes: round1(row?.avgWait ?? null),
    });
  }

  const hourlyMap = new Map(facets.hourly.map((row) => [row._id, row.count]));
  const peakHours = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourlyMap.get(hour) || 0,
  }));
  const busiest = peakHours.reduce((best, item) => (item.count > best.count ? item : best), {
    hour: null,
    count: 0,
  });

  const centerRows = rowMap(facets.byCenter);
  const serviceRows = rowMap(facets.byService);
  const counterRows = rowMap(facets.byCounter);

  const counterStats = counters.map((counter) => {
    const row = counterRows.get(String(counter._id));
    const windowMinutes =
      counter.center?.openTime && counter.center?.closeTime
        ? toMinutes(counter.center.closeTime) - toMinutes(counter.center.openTime)
        : 0;
    const activeDays = row?.days?.length || 0;
    const availableMinutes = activeDays * windowMinutes;
    const busyMinutes = row?.busyMinutes || 0;

    return {
      id: counter._id,
      name: counter.name,
      centerId: counter.center?._id,
      centerName: counter.center?.name,
      serviceName: counter.service?.name,
      operatorName: counter.operator?.name || null,
      status: counter.status,
      totalTokens: row?.total || 0,
      completed: row?.completed || 0,
      activeDays,
      busyMinutes: round1(busyMinutes),
      availableMinutes,
      utilizationPercent:
        availableMinutes > 0 ? Math.min(100, round1((busyMinutes / availableMinutes) * 100)) : 0,
    };
  });

  const roleCount = (role) => userRoles.find((row) => row._id === role)?.count || 0;
  const counterCount = (status) => counterStatuses.find((row) => row._id === status)?.count || 0;
  const liveCount = (status) => liveQueue.find((row) => row._id === status)?.count || 0;

  return {
    range: { from, to, days: daysBetween(from, to) },
    filters: { center: center || null },
    overview: {
      farmers: roleCount("farmer"),
      operators: roleCount("operator"),
      admins: roleCount("admin"),
      centers: {
        total: centers.length,
        active: centers.filter((item) => item.status === "active").length,
      },
      services: activeServices,
      counters: {
        total: counterStatuses.reduce((sum, row) => sum + row.count, 0),
        active: counterCount("active"),
        paused: counterCount("paused"),
        inactive: counterCount("inactive"),
      },
      liveQueue: { date: today, waiting: liveCount("waiting"), serving: liveCount("serving") },
    },
    summary: {
      totalTokens,
      byStatus,
      walkIns,
      online,
      completionRate: percent(byStatus.completed, finished),
      noShowRate: percent(byStatus.no_show, finished),
      avgWaitMinutes: round1(times.avgWait ?? null),
      maxWaitMinutes: round1(times.maxWait ?? null),
      avgServiceMinutes: round1(times.avgService ?? null),
    },
    daily,
    peakHours,
    peakHour: busiest.hour === null ? null : busiest,
    centers: centers.map((item) => {
      const row = centerRows.get(String(item._id));
      return {
        id: item._id,
        name: item.name,
        district: item.district,
        totalTokens: row?.total || 0,
        completed: row?.completed || 0,
        noShow: row?.noShow || 0,
        avgWaitMinutes: round1(row?.avgWait ?? null),
      };
    }),
    services: services.map((item) => {
      const row = serviceRows.get(String(item._id));
      return {
        id: item._id,
        name: item.name,
        centerName: item.center?.name,
        totalTokens: row?.total || 0,
        completed: row?.completed || 0,
        noShow: row?.noShow || 0,
        avgWaitMinutes: round1(row?.avgWait ?? null),
        avgServiceMinutes: round1(row?.avgService ?? null),
      };
    }),
    counters: counterStats,
    feedback: {
      count: feedback[0]?.count || 0,
      average: feedback[0] ? round1(feedback[0].average) : null,
    },
  };
};