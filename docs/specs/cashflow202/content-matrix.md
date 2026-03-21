# Cashflow 202 Content Matrix

## Scope
This document is the source-of-truth summary for the currently implemented `cashflow202` mode in the app.
It captures the initial rollout data set, not a claim of full official deck parity.

## Professions
- Reuses the full `Cashflow 101 classic` profession set.
- Every profession receives a deterministic starter portfolio in `cashflow202`.

## Starter Portfolios
- `teacher`: ALPHA starter stock + ALPHA call.
- `engineer`: TECH core stock + TECH straddle.
- `nurse`: BETA put + duplex exchange.
- `cop`: RETAIL short.
- `manager`: ALPHA scale stock.
- `truck_driver`: logistics duplex exchange.
- `secretary`: ALPHA call.
- `janitor`: RETAIL short.
- `lawyer`: TECH stock + apartment exchange.
- `doctor`: OIL short + BETA put.
- `pilot`: TECH straddle.

## Advanced Deal Types
- `option_call`
- `option_put`
- `short_sale`
- `straddle`
- `exchange`
- advanced real estate
- advanced business
- advanced stock entries

## Implemented Market Behaviors
- repricing via `stock_price`
- short settlement after repricing
- option settlement after repricing
- straddle settlement after repricing
- exchange settlement via `exchange_offer`
- classic `real_estate_boom`

## Current Gaps
- No claim of one-to-one official card list parity.
- No dedicated `cashflow202` tutorial yet.
- Backend validates variant metadata and professions, but does not authoritatively simulate rules.

## File Mapping
- Variant registry: `apps/frontend/src/modules/game-variants/`
- `cashflow202` data: `apps/frontend/src/modules/game-variants/cashflow202/data/index.ts`
- backend variant registry: `apps/backend/app/GameVariants/`
