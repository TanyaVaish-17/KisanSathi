# KisanSathi API examples

This guide walks through the main flows with real requests and responses. The full list of endpoints is in the [API overview](../README.md#-api-overview) in the README.

- Base URL: `http://localhost:5000/api`
- Protected endpoints need the header `Authorization: Bearer <token>`
- Every response has `success: true` or `success: false`
- IDs are MongoDB ObjectIds (24 hex characters). Invalid IDs return `400`

## Status codes

| Code | Meaning |
| --- | --- |
| `200` / `201` | Success / created |
| `400` | Validation failed, invalid ID, or no active counter for the service |
| `401` | Missing, invalid or expired token, or wrong login details |
| `403` | Logged in but the role is not allowed, or the account is deactivated |
| `404` | Record or route not found |
| `409` | Duplicate record, or the farmer already has an active token |

Errors look like this:

```json
{ "success": false, "message": "You already have an active token" }
```

In development the error also has a `stack` field. It is hidden when `NODE_ENV=production`.

---

## 1. Register a farmer

`POST /auth/register` · Public

```json
{
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "password": "secret123"
}
```

Rules:

- `name` needs at least 2 characters
- Give an `email` or a `phone`, or both
- `phone` must be a 10-digit Indian mobile number starting with 6 to 9
- `password` needs at least 6 characters
- `preferredLanguage` (`en` or `hi`), `village` and `district` are optional
- New accounts are always farmers. Sending `role` in the body has no effect

Response `201`:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6aff1e9b78ff619f48aa7ae4",
    "name": "Ramesh Kumar",
    "phone": "9876543210",
    "role": "farmer",
    "preferredLanguage": "en"
  }
}
```

The same email or phone a second time returns `409`.

## 2. Log in

`POST /auth/login` · Public

```json
{ "identifier": "9876543210", "password": "secret123" }
```

`identifier` can be the email or the phone number. The response has the same shape as register. A wrong password returns `401`, and a deactivated account returns `403`.

## 3. Current user

`GET /auth/me` · Logged in

```json
{ "success": true, "user": { "id": "...", "name": "Ramesh Kumar", "role": "farmer" } }
```

---

## 4. Book a token

`POST /tokens` · Farmer

```json
{
  "center": "6aff1e9b78ff619f48aa7ae1",
  "service": "6aff1e9b78ff619f48aa7ae2"
}
```

What the server does:

1. Checks that the center is active and offers the service
2. Expires the farmer's tokens from earlier days, so they never block a booking
3. Refuses a second active token with `409`
4. Picks the active counter for that service with the fewest active tokens
5. Gives the next token number for the center and day, and works out the wait

Response `201` (trimmed):

```json
{
  "success": true,
  "token": {
    "_id": "6aff1e9b78ff619f48aa7ae6",
    "tokenNumber": 1,
    "tokenCode": "001",
    "dateKey": "2026-11-19",
    "center": { "name": "Agra Mandi", "district": "Agra" },
    "service": { "name": "Wheat sale", "estimatedDuration": 10 },
    "counter": { "name": "Counter 1" },
    "status": "waiting",
    "estimatedWaitMinutes": 0
  },
  "queueInfo": {
    "position": 1,
    "aheadCount": 0,
    "estimatedWaitMinutes": 0,
    "estimatedStartAt": "2026-11-19T16:06:51.409Z",
    "estimatedCompletionAt": "2026-11-19T16:16:51.409Z",
    "nowServing": null,
    "counterStatus": "active",
    "delayed": false
  },
  "arrivalAdvice": {
    "arriveInMinutes": 0,
    "arriveAt": "2026-11-19T16:06:51.424Z",
    "message": "Your turn is close. Please reach the center now."
  }
}
```

### How the wait is estimated

- Each token takes the service's average duration from past visits, or its estimated duration if there is no history yet
- A token being served takes its duration minus the time it has already been served, and never less than zero
- Waiting tokens are lined up one after another behind it
- `arrivalAdvice` tells the farmer to come 15 minutes before their estimated turn, or straight away if the wait is 15 minutes or less

Example with a 10 minute service, where the current token started 4 minutes ago:

| Token | Status | Estimated wait |
| --- | --- | --- |
| 001 | serving | 0 |
| 002 | waiting | 6 |
| 003 | waiting | 16 |

## 5. My tokens

`GET /tokens/mine` · Farmer

```json
{
  "success": true,
  "activeToken": { "tokenCode": "001", "status": "waiting" },
  "queueInfo": { "position": 1, "estimatedWaitMinutes": 0 },
  "arrivalAdvice": { "message": "Your turn is close. Please reach the center now." },
  "pastTokens": []
}
```

`activeToken`, `queueInfo` and `arrivalAdvice` are `null` when the farmer has no active token.

## 6. Cancel a token

`PATCH /tokens/:id/cancel` · Farmer

Only the farmer's own `waiting` tokens can be cancelled. Another farmer's token returns `404`, and a token that is not waiting returns `400`. Everyone behind the cancelled token moves up, and the farmer can book again.

---

## 7. Operator console

These routes are for the operator assigned to a counter. They work on that operator's own counter.

| Request | What it does | Response |
| --- | --- | --- |
| `GET /counters/mine/queue` | Live queue | `{ counter, serving, waiting }` |
| `POST /counters/mine/call-next` | Serve the next waiting token | `{ serving }` |
| `POST /counters/mine/complete` | Finish the token being served | `{ token, outcome }` |
| `POST /counters/mine/skip` | Skip the token. The third skip makes it a no-show | `{ token, outcome }` |
| `POST /counters/mine/no-show` | Mark the token as a no-show | `{ token, outcome }` |
| `POST /counters/mine/walk-in` | Issue a token for a farmer at the counter | `{ token }` |

Walk-in body:

```json
{ "walkInName": "Suresh", "walkInPhone": "9123456780" }
```

`walkInPhone` is optional.

### Pausing a counter

`PATCH /counters/:id/status` · Admin or Operator

```json
{ "status": "paused" }
```

Allowed values are `active`, `paused` and `inactive`. Operators can only pause or resume. When a counter stops being active, its waiting tokens move to another active counter for the same service, and the response has a `transfer` summary.

---

## 8. Live updates

The server also sends Socket.IO events, so screens update without a refresh. Connect with the same JWT, then join the center you want to watch:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { auth: { token } });
socket.emit("center:join", centerId);
socket.on("queue:updated", (data) => console.log(data.nowServing, data.waitingCount));
socket.on("token:updated", (data) => console.log(data.position, data.estimatedWaitMinutes));
```

| Event | Sent to | Main fields |
| --- | --- | --- |
| `queue:updated` | Everyone watching the center | `counterName`, `nowServing`, `waitingCount`, `counterStatus` |
| `token:updated` | The farmer who owns the token | `status`, `position`, `estimatedWaitMinutes` |

Run `npm run listen:socket` in the `server` folder to watch the events in the terminal.
