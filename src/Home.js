import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import Paper from 'material-ui/Paper'
import { orange500,amberA700 } from "material-ui/styles/colors";


const style ={
  backgroundImage: "url(background3.svg)",
  position: "relative",
  textAlign: "center",
  paddingBottom: "500px"
}

class Home extends Component {

  constructor(props) {
    super(props)

    this.flags = require.context("./flags/4x3/", false, /.*\.svg$/);

  }


  flagSvg(iso2code) {
    return <div style={{width:"80px",height: "60px", background:`url(${this.flags(`./${iso2code}.svg`)}) no-repeat top left`,backgroundSize: "contain"}}></div>

  }

  render() {
    return (


      <div style={style}>


      <Paper style={{ width: "80%",margin: "auto" ,marginTop: "100px", display: 'inline-block'}} zDepth={2} >
            <div style={{
              margin: "auto", 
              color: "black",
              fontSize: "50px",
              fontFamily: "Playfair Display",
              textAlign: "center",
              marginLeft: "50px",
              marginRight: "50px",
            }}><p> Bolão <span style={{ fontFamily: "Lato"}}>EISENMANN</span> da Copa do Mundo 2018</p></div>

            <div style={{width: "100%", paddingTop:  "20px", paddingBottom: "20px", backgroundColor: amberA700}}>
    
            <div style={{paddingTop: "50px", margin: "auto", textAlign: "center", display: "inline-block"}}>
              <div style={{float: "left"}}>{this.flagSvg("br")}</div>
              <div style={{float: "left"}}>{this.flagSvg("ar")}</div>
              <div style={{float: "left"}}>{this.flagSvg("gr")}</div>
              <div style={{float: "left"}}>{this.flagSvg("al")}</div>
              <div style={{float: "left"}}>{this.flagSvg("us")}</div>
            </div>

              <div style={{width: "70%", margin: "auto"}}>
                <p style={{fontFamily: "Playfair Display",fontSize: "30px", textAlign: "center"}}>
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ullamcorper sodales velit a venenatis. Aliquam hendrerit pulvinar turpis, et rutrum neque mollis at. Nullam consectetur vulputate arcu eget venenatis. Nam sed sodales velit. Morbi tortor massa, lacinia sed tellus vel, finibus interdum sapien. Proin dolor justo, hendrerit in pulvinar vel, porttitor vitae purus. Curabitur in justo sit amet lacus placerat convallis. Proin in iaculis mauris. Integer sit amet dictum metus. In nec enim feugiat, imperdiet leo eget, suscipit erat.</p>
              </div>
              
              </div>
            </Paper>




      </div>


    );
  }
}

export default Home;
