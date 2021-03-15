// **********************************************
// ******************************* Setup SVG AREA
// **********************************************
let svgWidth = 1000,
    svgHeight = 750;

let margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 80
};
//  chart effective size
let width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;
//  append svg
let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
//   append chart group and shift top and left margin
let chartGroup = svg
.append('g')
.attr('transform',`translate(${margin.left},${margin.top})`);

// **********************************************
// ******************************* Functions
// **********************************************
// ******************************* scaleXdata
/** function scaleXdata
 * 
 * @param {*} data 
 * @param {*} axis 
 * @returns 
 */
function scaleXdata(data,axis){
    console.log('scaleXdata',data,axis)
    let xScale=d3.scaleLinear()
        .domain(d3.extent(data,d=>d[axis]))
        .range([0,width]);
        console.log('scaleXdata return',xScale)
    return xScale;
}

// ******************************* scaleYdata
/** function scaleYdata
 * 
 * @param {*} data 
 * @param {*} axis 
 * @returns 
 */
function scaleYdata(data,axis){
    console.log('scaleYdata',data,axis)
    let yScale=d3.scaleLinear()
        .domain(d3.extent(data,d=>d[axis]))
        .range([height,0]);
    return yScale;
}
// ******************************* updateXaxis
function renderXaxes(xScale, xAxis){
    console.log(xAxis);
    let bottomAxis = d3.axisBottom(xScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// ******************************* updateYaxis
function renderYaxes(yScale, yAxis){
    console.log(yAxis);
    let leftAxis = d3.axisLeft(yScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
// ******************************* updatexCircles
function renderXcircles(circlesGroup,textCircleGroup, xScale, xAxisChoice) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => xScale(d[xAxisChoice]));
    textCircleGroup.transition()
        .duration(1000)
        .attr("x",d=>xScale(d[xAxisChoice]));
  
    return circlesGroup,textCircleGroup;
  }

  // ******************************* updateyCircles
function renderYcircles(circlesGroup,textCircleGroup, yScale, yAxisChoice) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => yScale(d[yAxisChoice]));
    textCircleGroup.transition()
        .duration(1000)
        .attr("y",d=>yScale(d[yAxisChoice])+5);
  
    return circlesGroup,textCircleGroup;
  }

// ******************************* main block -  x
// read csv, bind data, append chart elements
// **********************************************
// data from csv
let xyData=['poverty','age','income','healthcare','obesity','smokes']
let csvLocation='./static/data/data.csv'
d3.csv(csvLocation).then((data,err)=>{
    if (err) throw `ERROR ${err}`;

    // set first choice for x and y data - poverty and healthcare
    let xAxisChoice=xyData[0], 
        yAxisChoice=xyData[3];

    // converting to number format
    data.forEach(record=>{
        xyData.forEach(entry=>{
            record[entry]=+record[entry]
        });
    });
    // scale x and y
    let xScale=scaleXdata(data,xAxisChoice),
        yScale=scaleYdata(data,yAxisChoice);

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xScale),
        leftAxis = d3.axisLeft(yScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    let yAxis = chartGroup.append("g")
        .call(leftAxis);
    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d[xAxisChoice]))
        .attr("cy", d => yScale(d[yAxisChoice]))
        .attr("r", 15)
        .attr("fill", "dodgerblue")
        .attr("opacity", ".5");
    
    // append text state abbr to chartGroup
    let textCircleGroup=chartGroup.selectAll("#StateAbbr")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xScale(d[xAxisChoice]))
        .attr("y", d => yScale(d[yAxisChoice])+5)
        .text(d=>d.abbr)
        .classed('stateText',true);

    // Create group for all x-axis labels
    let xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    xyData.slice(0,3).forEach((element,i) => {
        let switchStyle=(element==xAxisChoice ? "active":"inactive");
        xLabelsGroup.append('text')
        .attr("x", 0)
        .attr("y", 20+i*20)
        .attr("value", element) // value to grab for event listener
        .classed(switchStyle, true)
        .text(element);
    });
        // Create group for all y-axis labels
    let yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(-90, ${height/2 + 20})`);
    xyData.slice(3,7).forEach((element,i) => {
        let switchStyle=(element==yAxisChoice ? "active":"inactive");
        yLabelsGroup.append('text')
        .attr("transform", "rotate(-90)")
        .attr("y", -(i-3)*20)
        .attr("x",0)
        .attr("value", element) // value to grab for event listener
        .classed(switchStyle, true)
        .text(element);
    });
// x axis labels event listener
xLabelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  let value = d3.select(this).attr("value");
  if (value !== xAxisChoice) {

    // replaces chosenXAxis with value
    xAxisChoice = value;

    console.log(xAxisChoice)

    // functions here found above csv import
    // updates x scale for new data
    xScale = scaleXdata(data, xAxisChoice);

    // updates x axis with transition
    xAxis = renderXaxes(xScale, xAxis);

    // updates circles and Text with new x values 
    circlesGroup,textCircleGroup = renderXcircles(circlesGroup,textCircleGroup, xScale, xAxisChoice);

    // changes classes to change bold text
        xLabelsGroup.selectAll('text')
            // d3.select(this)
           .classed('active',(d,i)=>xyData[i]==xAxisChoice)
           .classed('inactive',(d,i)=>xyData[i]!==xAxisChoice)
        
        
  }
});
// y axis labels event listener
yLabelsGroup.selectAll("text")
.on("click", function() {
  // get value of selection
  let value = d3.select(this).attr("value");
  if (value !== yAxisChoice) {

    // replaces chosenXAxis with value
    yAxisChoice = value;

    console.log(yAxisChoice)

    // functions here found above csv import
    // updates x scale for new data
    yScale = scaleYdata(data,yAxisChoice);

    // updates x axis with transition
    yAxis = renderYaxes(yScale, yAxis);

    // updates circles and Text with new x values 
    circlesGroup,textCircleGroup = renderYcircles(circlesGroup,textCircleGroup, yScale, yAxisChoice);

    // changes classes to change bold text
    yLabelsGroup.selectAll('text')
   .classed('active',(d,i)=>xyData[i+3]==yAxisChoice)
   .classed('inactive',(d,i)=>xyData[i+3]!==yAxisChoice)
  }
});



})