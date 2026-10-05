# Local-model booking behavior

Status: **INCOMPLETE**. Host supplied a native dialog and its CSS around a locally generated static page. The local model generated app.js; no host-written behavior implementation was supplied to it. Two later bounded local patch requests changed only app.js. This remains host-assisted, not autonomous end-to-end generation.

Initial browser workflow failed: confirmation omitted the selected class; saved bookings could not reopen; favorite code invented an unavailable HeartFilled.svg. Static inspection also found weak stored-state validation and cancellation that falsely cleared UI after storage removal failure. Original source and raw generation evidence are preserved.

The first repair fixed icon/reopen/confirmation behavior. The second hardened guest/slot validation and preserved the booking on cancellation storage failure. Fresh browser captures verify favorite both directions, required form validation, successful booking details after reload, cancellation persistence, and Escape focus restoration at296/320/390/1440. The390px confirmation screenshot was directly inspected.

Additional browser fault-injection tests improved from2/7 to6/7: malformed JSON, blank/non-string guest, invalid slot, write failure and cancellation storage failure now pass. Impossible calendar dates still fail because validation checks only the string pattern. A separate narrow calendar repair is underway and is not approved in this record. The storage write-failure test selects the14:00 option. Another diagnostic observed the10:00 option absent from live DOM despite the source declaration; availability of every option remains unverified and needs follow-up.

The booking is a browser-local demonstration, not a real reservation or payment. Full guide/catalog compliance, polished enlarged layouts, independent services and repeatable autonomous reference quality remain unverified. Functional checks are not visual parity.
