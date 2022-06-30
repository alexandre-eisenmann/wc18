
let data = require('./data.json')
var fs = require('fs');


let groups = []
for(g of Object.keys(data.groups)) {
    groups.push(...data.groups[g].matches.map(e => {
        return {...e,
         ...{home: data.teams.find(team => team.id == e.home_team).name,
             away: data.teams.find(team => team.id == e.away_team).name, 
             group: g},
        }}))
}



groups = groups.sort(function(a, b){return b.date >= a.date ? -1 : b==a ? 0 : 1}).map((element, index) => {return {...element, name: index+1}});


groups = groups.reduce((acc, el) => {
    const arr = (acc[el.group] ?? [])
    arr.push(el)
    acc[el.group] = arr
    return acc
}  ,{})


let final_groups = {}
for(g of Object.keys(groups)) {
    final_groups[g] = { matches: groups[g] }
}

final_groups = {groups: final_groups}
console.log('-------')
console.log(final_groups)

var json = JSON.stringify(final_groups);

console.log(json)

// fs.writeFile('data2.json', json);

