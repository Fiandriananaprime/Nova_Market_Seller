# Canvas AI endpoint

The studio sends JSON `POST` requests to `VITE_AI_API_ORIGIN` plus
`VITE_AI_API_PATH` (default: `/api/novamarket-ai`). The proxy is responsible for
provider credentials, request validation, and mapping this provider-neutral
contract to the selected model.

```json
{
  "model": "model-name",
  "system": "System instructions",
  "messages": [
    {
      "role": "user",
      "content": "Review this image for my ad.",
      "attachments": [
        {
          "name": "product.png",
          "mimeType": "image/png",
          "dataUrl": "data:image/png;base64,..."
        }
      ]
    }
  ],
  "maxTokens": 1000,
  "stream": true
}
```

`attachments` is optional and is sent only with the newest user message. Each
request can include up to four JPEG, PNG, WebP, or GIF images, with a 5 MiB
limit per image. The proxy must validate attachment MIME type and size itself,
then map each data URL to the selected provider's supported image input format.
Earlier image attachments remain visible in the chat but are not resent in
later requests; users should attach them again when referring to them.

For streaming requests, return `text/event-stream` with one `data: {"text":
"..."}` event per text delta, a final `data: [DONE]` event, and
`data: {"error": "..."}` for provider errors.
