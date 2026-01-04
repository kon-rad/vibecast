# Firestore Collection Structure

## Collection: `streams`

This collection stores all data related to live stream sessions. Each document represents a single completed live stream.

### Document ID
- Auto-generated string by Firestore.

### Fields

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `userId` | `string` | The UID of the user who hosted the stream. |
| `title` | `string` | Title of the stream (e.g., "Tech Talk Session"). |
| `description` | `string` | Description of the stream context. |
| `status` | `string` | Current status of the stream record (e.g., "COMPLETED"). |
| `startTime` | `Timestamp` | The Server Timestamp when the stream started. |
| `endTime` | `Timestamp` | The Server Timestamp when the stream ended. |
| `durationSeconds` | `number` | Total duration of the stream in seconds. |
| `commentCount` | `number` | Total number of comments/messages in the session. |
| `vibe` | `string` | Qualitative assessment of the stream (e.g., "🔥 Intense"). |
| `comments` | `Array<Object>` | An array containing the full chat history of the session. |

### `comments` Array Object Structure

Each object in the `comments` array has the following structure:

```json
{
  "id": "string (unique message id)",
  "personaId": "string (id of the persona or 'user')",
  "name": "string (display name)",
  "avatar": "string (url)",
  "text": "string (message content)",
  "timestamp": "number (javascript Date.now())"
}
```

## Future Considerations
- **Sub-collections**: If chat history becomes very large (>1MB document limit), we may migrate `comments` to a sub-collection named `messages`.
