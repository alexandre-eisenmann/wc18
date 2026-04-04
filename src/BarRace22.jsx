import React, { useEffect, useState } from "react"
import BarChart from './BarChart'
import dayjs from 'dayjs'
import firebase from 'firebase/compat/app'
import { DATABASE_WC22 } from "./constants"
import data_file from './data.json'

const _teams = data_file.teams.reduce((acc, ele) => { acc[ele.id] = ele; return acc }, {})
const _matches_raw = Object.keys(data_file.groups)
  .map((group) => data_file.groups[group].matches)
  .reduce((acc, ele) => acc.concat(ele), [])

const sortedMatches = [..._matches_raw].sort((a, b) => {
  if (dayjs(a.date).isBefore(dayjs(b.date))) return -1
  else if (dayjs(a.date).isAfter(dayjs(b.date))) return 1
  return 0
})

const time = sortedMatches.map(m => `${_teams[m.home_team].name} x ${_teams[m.away_team].name}`)

export default function BarRace22() {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    const _bids = []

    firebase.database().ref(`${DATABASE_WC22}`).once('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        const childData = childSnapshot.val()
        Object.keys(childData).forEach(key => {
          const details = childData[key]
          if (details.status === "payed") {
            Object.assign(details, { gameId: key, userId: childSnapshot.key })
            _bids.push(details)
          }
        })
      })

      firebase.database().ref(`${DATABASE_WC22}/master/gabarito`).once('value', gabaritoSnap => {
        const gabarito = {}
        gabaritoSnap.forEach(child => { gabarito[child.key] = child.val() })

        const matchesWithResults = sortedMatches.map(m => ({
          ...m,
          home_result: gabarito[m.name] ? gabarito[m.name].h : null,
          away_result: gabarito[m.name] ? gabarito[m.name].a : null,
        }))

        const _data = {}
        _bids.forEach(bid => {
          let total = 0
          const track = matchesWithResults.map(match => {
            const rh = match.home_result
            const ra = match.away_result
            if (rh != null && ra != null && bid[match.name]) {
              const h = bid[match.name].h
              const a = bid[match.name].a
              if (h === rh && a === ra) total += 8
              else if (rh - ra === h - a) total += 5
              else if (Math.sign(rh - ra) === Math.sign(h - a)) total += 3
            }
            return total
          })
          _data[bid.name] = track
        })

        setChartData(_data)
      })
    })
  }, [])

  if (!chartData) {
    return <div style={{ textAlign: 'center', marginTop: '20%', fontFamily: 'Lato', color: '#aaa' }}>Loading...</div>
  }

  const keys = Object.keys(chartData)
  const len = chartData[keys[0]].length
  const maxPts = Math.max(...keys.map(k => chartData[k][len - 1])) || 1

  const colors = keys.reduce((res, item) => ({
    ...res,
    [item]: `rgb(${Math.round(200 * chartData[item][len - 1] / maxPts)}, ${Math.round(200 * (1 - chartData[item][len - 1] / maxPts))}, 255)`
  }), {})

  const labels = keys.reduce((res, item) => ({
    ...res,
    [item]: (
      <div style={{ marginLeft: "10px", marginTop: "3px", marginRight: "10px", textAlign: "left", fontSize: "10px", whiteSpace: "nowrap" }}>
        <div>{item}</div>
      </div>
    )
  }), {})

  return (
    <div style={{ margin: "auto", width: "calc(100% - 10px)", marginLeft: "10px", marginTop: "30px" }}>
      <BarChart
        start={true}
        data={chartData}
        timeline={time}
        labels={labels}
        colors={colors}
        len={len}
        timeout={400}
        delay={1200}
        timelineStyle={{ textAlign: "center", fontSize: "20px", color: "rgb(133, 131, 131)", marginBottom: "30px", fontWeight: "bold" }}
        textBoxStyle={{ textAlign: "left", color: "rgb(133, 131, 131)", fontSize: "8px", whiteSpace: "nowrap" }}
        barStyle={{ height: "18px", marginTop: "4px", borderRadius: "8px" }}
        width={[15, 75, 10]}
        maxItems={keys.length}
      />
    </div>
  )
}
