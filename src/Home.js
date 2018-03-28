import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import NumberRing from "./NumberRing"


const style ={
  backgroundImage: "url(background3.svg)",
}

class Home extends Component {
  render() {
    return (


      <div style={style}>
        <div style={{postion: "absolute",top: "50px",left: "50px", width: "200px", height: "200px"}} >
          <NumberRing  value={7} match={3} team="h" onChange={(a,b,c) => {console.log(a,b,c)}}/>
        </div>
        <h2 style={{paddingTop: "50px", paddingBottom: "20px"}}>Hello</h2>
        <div style={{width: "50%", margin: "auto", marginBottom: "50px"}}>
          <p style={{textAlign: "center"}}>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga</p>
        </div>
        <div style={{ width: "100%", margin: "auto"}}>
          <div style={{textAlign: "center"}} >

            <div style={{display: "inline-block",  marginRight: "50px"}} >
              <NavLink to="/bid" className="homelink"  >
              <div style={{background: "url(images/radar.png)",
                          position: "relative",
                          backgroundSize: "contain",
                          marginBottom:"20px",
                          width: "150px", height: "150px"}}>
                  <div style={{ position: "relative",top:"150px"}}>Bid</div>
                </div>
              </NavLink>
            </div>


            <div style={{display: "inline-block", marginRight: "50px"}} >
              <NavLink to="/leaderboard" className="homelink">
                <div style={{background: "url(images/pipeline.png)",
                            position: "relative",
                            backgroundSize: "contain",
                            marginBottom:"20px",
                            width: "150px", height: "150px"}}>
                  <div style={{position: "relative", top:"150px"}}>Leaderboard</div>
                </div>
              </NavLink>
            </div>



          </div>

        </div>
      </div>


    );
  }
}

export default Home;
