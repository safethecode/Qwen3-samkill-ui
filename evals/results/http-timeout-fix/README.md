# Long response timeout reproduction

On Node v24.19.0 with bundled Undici 7.29.0, a local HTTP server delayed its complete JSON response for 310 seconds. Both clients had a 360-second explicit deadline. No model inference was used.

- Built-in fetch failed after 305,043 ms with `UND_ERR_HEADERS_TIMEOUT`.
- The new Node HTTP transport completed after 310,029 ms and received the expected JSON.

Run `node evals/results/http-timeout-fix/reproduce.mjs` from the repository root. It takes approximately 310 seconds and writes a new report under runs unless HTTP_REPRO_OUTPUT is set. Timing varies by machine.

The production adapter preserves explicit cancellation, rejects incomplete JSON and disconnected responses, handles HTTP failures, and bounds response bytes. It introduces no hidden 300-second header deadline. Generation and component repair default to a 600-second total deadline, configurable with QWEN_REQUEST_TIMEOUT_MS. General bounded repairs retain their shorter default deadlines.

This resolves the reproduced transport failure. The original model error logs did not retain nested cause codes, so their attribution is supported by matching timing and this reproduction rather than a directly recorded original cause. It does not establish model quality or guarantee completion within the explicit deadline.
