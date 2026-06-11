// Shared loader/cache for the heavy "bids" payload used by the leaderboard
// (Leaderboard3) and the ranking (Ranking).
//
// Why this exists: the bids (every participant's score predictions) are by far
// the largest thing these screens load — hundreds of participants x 72 matches.
// Once bids close (see BIDS_CLOSE_AT in constants.js) that payload NEVER changes;
// only the official results (master/gabarito) and the rendered scores change.
//
// So we:
//   1. Fetch the bids exactly ONCE per mount instead of re-reading the whole
//      database every time a result is entered.
//   2. Persist them to localStorage (only when bids are closed, i.e. frozen) so
//      a returning visitor renders instantly from cache while we refresh in the
//      background.

import firebase from 'firebase/compat/app'
import { DATABASE_ROOT_NODE, areBidsClosed } from './constants'

// Bump the version suffix if the cached shape ever changes.
const CACHE_KEY = `bbb-bids-${DATABASE_ROOT_NODE}-v1`

// Pull the "payed" bids out of a full root snapshot value. Mirrors the original
// loadGames() filtering: walk every user, keep games whose status is "payed".
function extractGames(rootVal) {
  const games = []
  if (!rootVal) return games
  Object.keys(rootVal).forEach((userId) => {
    const childData = rootVal[userId]
    if (!childData || typeof childData !== 'object') return
    Object.keys(childData).forEach((gameId) => {
      const details = childData[gameId]
      if (details && details.status === 'payed') {
        games.push(Object.assign({}, details, { gameId, userId }))
      }
    })
  })
  return games
}

// Synchronous read of the cached bids. Returns null when there is no usable
// cache, or when bids are still open (in which case the set could still grow and
// a stale cache would be wrong).
export function getCachedBids() {
  if (!areBidsClosed()) return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

// Fetch the bids from Firebase once. Caches the result to localStorage when bids
// are closed (and therefore safe to persist forever).
export function fetchBids() {
  return firebase
    .database()
    .ref(DATABASE_ROOT_NODE)
    .once('value')
    .then((snapshot) => {
      const games = extractGames(snapshot.val())
      if (areBidsClosed()) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(games))
        } catch (e) {
          // localStorage may be full or unavailable (private mode) — ignore.
        }
      }
      return games
    })
}
