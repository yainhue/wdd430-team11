# SkillLink Data Model

## 1. Overview

SkillLink uses MongoDB as its database. The marketplace data model has three main collections: users, services, and bookings.

The users collection already exists. Services and bookings are proposed collections.

## 2. Users Collection (Existing)

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique user ID |
| name | String | Full name |
| email | String | Unique email |
| passwordHash | String | Hashed password |
| role | String | customer or provider |
| image | String or null | Profile image |
| emailVerified | Date or null | Verification date |
| createdAt | Date | Registration date |

## 3. Services Collection (Proposed)

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique service ID |
| providerId | ObjectId | References users._id |
| title | String | Service name |
| description | String | Service details |
| category | String | Service category |
| price | Number | Service price |
| currency | String | Price currency |
| location | String | Service location |
| status | String | active or inactive |
| createdAt | Date | Creation date |
| updatedAt | Date | Last update |

## 4. Bookings Collection (Proposed)

| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique booking ID |
| customerId | ObjectId | References users._id |
| providerId | ObjectId | References users._id |
| serviceId | ObjectId | References services._id |
| requestedDate | Date | Requested service date |
| status | String | pending, accepted, rejected, or completed |
| createdAt | Date | Creation date |
| updatedAt | Date | Last update |

## 5. Relationships

- One provider can create many services.
- One customer can make many bookings.
- One provider can receive many bookings.
- One service can have many bookings.
- Each booking connects one customer, one provider, and one service.

## 6. Relationship Diagram

```text
USERS
  |
  +----< SERVICES
  |         |
  |         +----< BOOKINGS
  |
  +----------------< BOOKINGS

A booking references:
- One customer in USERS
- One provider in USERS
- One service in SERVICES