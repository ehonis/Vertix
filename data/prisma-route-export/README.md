# Prisma Route Export Drop Folder

Put Prisma/Neon JSON exports for the route-domain migration in this folder.

Use plain JSON arrays unless we decide otherwise later.

## Required now

These are the tables needed for the current route-domain Convex migration:

- `users.json`
- `routes.json`
- `routeTags.json`
- `routeTagJoins.json`
- `routeImages.json`
- `routeAttempts.json`
- `routeCompletions.json`
- `routeStars.json`
- `communityGrades.json`
- `monthlyXp.json`

## Optional now

- `routeCounts.json` - optional validation snapshot with row counts by table

## Likely needed later

These are not part of the current first-pass import, but may be useful for later migration phases:

- `tvSlides.json`
- `tvSlideRouteJoins.json`
- `bounties.json`
- `routeImagesExtra.json` if route image metadata expands

## Expected file shapes

### `users.json`

```json
[
  {
    "id": "clx123",
    "email": "user@example.com"
  }
]
```

### `routes.json`

```json
[
  {
    "id": "clx_route",
    "title": "Green Arete",
    "setDate": "2026-01-05T00:00:00.000Z",
    "color": "green",
    "grade": "V4",
    "type": "BOULDER",
    "isArchive": false,
    "xp": 120,
    "location": "boulderMiddle",
    "createdByUserID": "clx123",
    "order": 12,
    "bonusXp": 0,
    "x": 143.2,
    "y": 98.4
  }
]
```

### `routeTags.json`

```json
[
  {
    "id": "tag1",
    "name": "slopers"
  }
]
```

### `routeTagJoins.json`

```json
[
  {
    "routeId": "clx_route",
    "tagId": "tag1"
  }
]
```

### `routeImages.json`

```json
[
  {
    "id": "img1",
    "url": "https://...",
    "routeId": "clx_route",
    "createdAt": "2026-01-05T00:00:00.000Z"
  }
]
```

### `routeAttempts.json`

```json
[
  {
    "id": 1,
    "userId": "clx123",
    "routeId": "clx_route",
    "attempts": 3,
    "attemptDate": "2026-01-05T00:00:00.000Z"
  }
]
```

### `routeCompletions.json`

```json
[
  {
    "id": 1,
    "userId": "clx123",
    "routeId": "clx_route",
    "flash": false,
    "completionDate": "2026-01-05T00:00:00.000Z",
    "xpEarned": 120
  }
]
```

### `routeStars.json`

```json
[
  {
    "id": 1,
    "userId": "clx123",
    "routeId": "clx_route",
    "stars": 4,
    "comment": "fun",
    "starDate": "2026-01-05T00:00:00.000Z"
  }
]
```

### `communityGrades.json`

```json
[
  {
    "id": 1,
    "userId": "clx123",
    "routeId": "clx_route",
    "grade": "V5",
    "createdAt": "2026-01-05T00:00:00.000Z",
    "updatedAt": "2026-01-05T00:00:00.000Z"
  }
]
```

### `monthlyXp.json`

```json
[
  {
    "id": 1,
    "userId": "clx123",
    "month": 1,
    "year": 2026,
    "xp": 420
  }
]
```

## Notes

- Keep keys exactly as shown above where possible.
- Date fields should be ISO strings.
- If you give me these files, I can switch the migration script to file-based import instead of live Neon reads.
