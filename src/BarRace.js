import React, { Component, useEffect, useState } from "react";
import './App.css';
import BarChart from './BarChart';


import data from './data_bar_race.json'
import moment from 'moment'
import firebase from 'firebase/compat/app';
import { DATABASE_WC18 } from "./constants"
import data_file from './data2018.json';



const randomColor = () => {return `rgb(${Math.min(180,255 * Math.random())}, ${Math.min(180,255 * Math.random())}, ${255})`}
const pickColor = (pts) => {return `rgb(${200 * ((pts/151))}, ${200 * (1-(pts/151))}, ${255})`}

const _teams = data_file.teams.reduce((acc,ele) => {acc[ele.id] = ele; return acc}, {})
const _matches_raw = ['a','b','c','d','e','f','g','h'].map((group) => data_file.groups[group].matches).reduce((acc,ele) => acc.concat(ele),[])
const sortedMatches = _matches_raw.sort((a,b) => {
  if (moment(a.date).isBefore(moment(b.date) )) 
    return -1
  else if (moment(a.date).isAfter(moment(b.date)))
    return 1 
  return 0
})
const _matches = sortedMatches.reduce((acc, ele, i) => {acc[ele.name] = ele; return acc}, {})
const matches = Object.values(_matches).map(ele => { return {...ele, home: _teams[_matches[ele.name].home_team].name, away: _teams[_matches[ele.name].away_team].name}})
console.log(matches)




const number_of_bids = Object.keys(data).length
const len = data[Object.keys(data)[0]].length;
const keys = Object.keys(data);
const colors = keys.reduce((res, item) => ({ 
    ...res, 
    // ...{ [item]: randomColor() } 
    ...{ [item]: pickColor(data[item][47]) } 
}), {});

const labels = keys.reduce((res, item, idx) => {
  return{
  ...res, 
  ...{[item]: (
    <div style={{marginLeft: "10px", marginTop: "3px", marginRight: "10px", textAlign:"left", fontSize: "10px", whiteSpace: "nowrap"}}>
      <div>{item}</div>
    </div>
    )}
}}, {});




const time = Array(len).fill(0).map((itm, idx) => `${matches[idx].home} x ${matches[idx].away}`);

export default function BarRace()  { 

  // useEffect(() => {

  //   const _teams = data_file.teams.reduce((acc,ele) => {acc[ele.id] = ele; return acc}, {})
  //   const _matches_raw = ['a','b','c','d','e','f','g','h'].map((group) => data_file.groups[group].matches).reduce((acc,ele) => acc.concat(ele),[])
  //   const sortedMatches = _matches_raw.sort((a,b) => {
  //     if (moment(a.date).isBefore(moment(b.date) )) 
  //       return -1
  //     else if (moment(a.date).isAfter(moment(b.date)))
  //       return 1 
  //     return 0
  //   })
  //   const _matches = sortedMatches.reduce((acc, ele, i) => {acc[ele.name] = ele; return acc}, {})

  //   const _bids = []
  //   firebase.database().ref(`${DATABASE_WC18}`).once('value', snapshot => {
  //     snapshot.forEach(function(childSnapshot) {
  //       var childKey = childSnapshot.key
  //       var childData = childSnapshot.val()
  //       Object.keys(childData).map((key) => {
  //         const id = key
  //         const details = childData[key]
          
  //         if (details.status == "payed") {
  //           Object.assign(details, {gameId: id, userId: childKey})
  //           _bids.push(details)
  //         }
  //       })

  //     });
      
  //     firebase.database().ref(`${DATABASE_WC18}/master/gabarito`).once('value', snapshot => {
  //       snapshot.forEach(function(childSnapshot) {
  //         var childKey = childSnapshot.key
  //         var childData = childSnapshot.val()
  //         _matches[childKey] = {..._matches[childKey], ...{away_result: childData['a'], home_result: childData['h'], home: _teams[_matches[childKey].home_team].name,away:_teams[_matches[childKey].away_team].name}}
  //       })
  //       _bids.map((bid) => {

  //         let total = 0
  //         Object.values(_matches).map((match) => {
  //           const rh = match.home_result
  //           const ra = match.away_result
  
  //           if (rh != null && ra != null) {
  
  //               const h = bid[match.name].h 
  //               const a = bid[match.name].a
  //               if (h == rh && a == ra) {
  //                 bid[match.name].pts = 8
  //               } else if (rh-ra == h-a ) {
  //                 bid[match.name].pts = 5
  //               } else if (Math.sign(rh-ra) == Math.sign(h-a)) {
  //                 bid[match.name].pts = 3
  //               } else {
  //                 bid[match.name].pts = 0
  //               }
  //               total += bid[match.name].pts || 0 
  //               bid["track"] = (bid["track"] || []).concat([total])
  
  //           }
  //         })
  //         bid["total"] = total
          
          
  //       })

  //       console.log(_matches)        
  //       console.log(_bids)

  //       const _data = _bids.reduce((acc, bid) => {
  //         acc[bid.name] = bid.track
  //         return acc
  //       }, {})
  //       console.log(_data)
        // setData(_data)

        // setData(['apple', 'banana', 'orange'].reduce((res, item) => ({...res, ...{[item]: Array(20).fill(0).map(_ => Math.floor(20 * Math.random()))}}), {}))



        // console.log(_data[Object.keys(_data)[0]].length)
        // const len = data[Object.keys(data)[0]].length;
        // const keys = Object.keys(data);

        // const _data = ['apple', 'banana', 'orange'].reduce((res, item) => ({...res, ...{[item]: Array(20).fill(0).map(_ => Math.floor(20 * Math.random()))}}), {});

        // // const len = _data[Object.keys(_data)[0]].length;
        // const keys = Object.keys(_data);
        // const _colors = keys.reduce((res, item) => ({ 
        //     ...res, 
        //     ...{ [item]: randomColor() } 
        // }), {});
        
        // const _labels = keys.reduce((res, item, idx) => {
        //   return{
        //   ...res, 
        //   ...{[item]: (
        //     <div style={{textAlign:"center",}}>
        //       <div>{item}</div>
        //     </div>
        //     )}
        // }}, {});

        // setData(_data)
        // setLabels(_labels)
        // setColors(_colors)
        
        
        // const labels = keys.reduce((res, item, idx) => {
        //   return{
        //   ...res, 
        //   ...{[item]: (
        //     <div style={{textAlign:"center",}}>
        //       <div>{item}</div>
        //     </div>
        //     )}
        // }}, {});

        

  //     });      



      


  //   })
  
  // },[])


    return (
      // <div className="App">
        <div style={{margin: "auto", width: "calc(100% - 10px)", marginLeft: "10px", marginTop: "30px", }}>
          <BarChart 
            start={true}
            data={data} 
            timeline={time}
            labels={labels}
            colors={colors}
            len={len}
            timeout={400}
            delay={1200}
            timelineStyle={{
              textAlign: "center",
              fontSize: "20px",
              color: "rgb(133, 131, 131)",
              marginBottom: "30px",
              fontWeight: "bold"
              
            }}
            textBoxStyle={{
              textAlign: "left",
              color: "rgb(133, 131, 131)",
              fontSize: "8px",
              whiteSpace: "nowrap",
            }}
            barStyle={{
              height: "18px",
              marginTop: "4px",
              borderRadius: "8px",
            }}
            width={[15, 75, 10]}
            maxItems={number_of_bids}
          />
        </div>
      // </div>
    );
}

