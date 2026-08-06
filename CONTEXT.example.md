<!--
  WORKED EXAMPLE — not loaded by any agent, and not about this repository.
  Depot is a fictional order-intake API. Read this for shape, density and length.
  Your own CONTEXT.md starts empty and fills up through `/grill-with-docs`.
-->

# Depot

Order intake: accepting orders from merchants, deciding whether they can be fulfilled, and handing accepted ones to a carrier. Pricing, invoicing and returns are other people's problems.

## Language

**Order**:
A merchant's request to send one shipment to one address. Immutable once accepted — a change is a cancellation and a new Order.
_Avoid_: purchase, transaction, job

**Acceptance**:
The decision that an Order can be fulfilled: address resolvable, carrier available, merchant in good standing. Distinct from creation, which only records intent.
_Avoid_: validation, approval

**Dispatch**:
Handing an accepted Order to a carrier. Happens at most once per Order; the retry lives inside a single Dispatch, not as a second one.
_Avoid_: send, submit, ship

**Merchant**:
The party that places Orders and is billed for them. Not the person who receives the parcel.
_Avoid_: customer, client, account, user

**Recipient**:
The person the parcel goes to. Has no account and never authenticates.
_Avoid_: customer, end user

**Carrier**:
A third party that physically moves parcels. Each has its own contract, its own failure modes, and its own directory.
_Avoid_: provider, shipper, vendor

**Good standing**:
A Merchant state, computed at Acceptance rather than stored, meaning they have no unpaid invoice older than 30 days. The threshold is commercial and has changed twice.
_Avoid_: active, valid, enabled

### Failure vocabulary

**Rejection**:
An Order that failed Acceptance. Terminal, and the reason is shown to the Merchant.
_Avoid_: error, failure, decline

**Dispatch failure**:
A Carrier refused or timed out on an accepted Order. Retried, and invisible to the Merchant until it exhausts.
_Avoid_: error, rejection

The distinction is load-bearing: a Rejection is the Merchant's problem and a Dispatch failure is ours. Naming both "failure" in code is how they got confused in the first place.
