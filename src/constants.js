// export const DATABASE_ROOT_NODE = "wc18"
// export const DATABASE_ROOT_NODE = "wc22"
export const DATABASE_ROOT_NODE = "wc26"
export const DATABASE_WC18 = "wc18"
export const DATABASE_WC22 = "wc22"
export const DATABASE_WC26 = "wc26"

export const PRICE_PER_BID = 30.00

// The first WC2026 match (Mexico × South Africa) kicks off 2026-06-11T19:00:00Z.
// New bids close 10 minutes before kickoff. We anchor to a UTC instant on
// purpose: UTC has no daylight saving, and Brazil dropped horário de verão in
// 2019, so this comparison is correct in every timezone with no DST math.
export const BIDS_CLOSE_AT = Date.parse('2026-06-11T18:50:00Z')
export const areBidsClosed = () => Date.now() >= BIDS_CLOSE_AT

// Home hero mode. true  -> "upcoming games" coverflow carousel (tournament mode)
//                  false -> classic hero with the intro paragraph (off-season)
// Flip this single flag to revert the home page to the previous experience.
export const HERO_NEXT_GAME_CAROUSEL = true
