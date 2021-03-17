// **********************************************
// ******************************* Setup SVG AREA
// **********************************************
let svgWidth = 1000,
    svgHeight = 750;

let margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 100
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
      .domain([d3.min(data,d=>d[axis])*.9,d3.max(data,d=>d[axis])*1.1])
        // .domain(d3.extent(data,d=>d[axis]))
      .range([0,width]);
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
      .domain([d3.min(data,d=>d[axis])*.85,d3.max(data,d=>d[axis])*1.1])
      // .domain(d3.extent(data,d=>d[axis]))
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
  };
// ******************************* updateToolTips
function updateToolTip(xAxisChoice,xLabel,yAxisChoice,yLabel,mouseOverGroup) {

  let toolTip = d3.select('body').append('div').classed('d3-tip', true);

  mouseOverGroup.on("mouseover", function(event, d) {
    //toolTip.show(data);
    toolTip.transition().duration(200).style("opacity", .9);
    toolTip.style('display', 'block')
          .html(`<strong>${d.state}</strong><br>${xLabel} : ${d[xAxisChoice]},<br>${yLabel} : ${d[yAxisChoice]}`)
          .style('left',( event.pageX)+'px')
          .style('top', (event.pageY)+'px');
  })
    // on mouseout event
    .on("mouseout", function(data, index) {
      //toolTip.hide(data);
      toolTip.style('display', 'none');
    });

  return ;
}

// ******************************* main block -  x
// read csv, bind data, append chart elements
// **********************************************
// data from csv
let xData={'poverty':'In Poverty (%)',
          'age':'Age (Median, Years)',
          'income':'Household Inclome (Median, $)'},
    yData={'healthcare':'Lacks Healthcare (%)',
           'obesity':'Obese(%)',
           'smokes':'Smokes(%)'},
    xyData={...xData,...yData};
let csvLocation='./static/data/data.csv'
d3.csv(csvLocation).then((data,err)=>{
  if (err) throw `ERROR ${err}`;

  // set first choice for x and y data - poverty and healthcare
  let xAxisChoice='poverty', 
      yAxisChoice='healthcare';

  // converting to number format
  data.forEach(record=>{
    Object.keys(xyData).forEach(entry=>{
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
    .attr("opacity", ".5")
    .attr("id",'circleText');
    
  // append text state abbr to chartGroup
  let textCircleGroup=chartGroup.selectAll("#StateAbbr")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xScale(d[xAxisChoice]))
    .attr("y", d => yScale(d[yAxisChoice])+5)
    .text(d=>d.abbr)
    .classed('stateText',true)
    .attr("id",'circleText');

  // Create group for all x-axis labels
  let xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  Object.keys(xData).forEach((element,i) => {
    let switchStyle=(element==xAxisChoice ? "active":"inactive");
    xLabelsGroup.append('text')
      .attr("x", 0)
      .attr("y", 20+i*20)
      .attr("value", element) // value to grab for event listener
      .classed(switchStyle, true)
      .text(xData[element]);
  });
  // Create group for all y-axis labels
  let yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(-90, ${height/2 + 20})`);
    Object.keys(yData).forEach((element,i) => {
    let switchStyle=(element==yAxisChoice ? "active":"inactive");
    yLabelsGroup.append('text')
      .attr("transform", "rotate(-90)")
      .attr("y",(3-i)*20)
      .attr("x",0)
      .attr("value", element) // value to grab for event listener
      .classed(switchStyle, true)
      .text(yData[element]);
  });
  // Select all circles and circle text for easy mouse hovering
  let toolTipGroup=d3.selectAll("#circleText")
  // insert tooltips 
  updateToolTip(xAxisChoice,xData[xAxisChoice],yAxisChoice,yData[yAxisChoice],toolTipGroup);
  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      let value = d3.select(this).attr("value");
      if (value !== xAxisChoice) {
        // replaces xAxisChoice with value
        xAxisChoice = value;
        // updates x scale for new data
        xScale = scaleXdata(data, xAxisChoice);
        // updates x axis with transition
        xAxis = renderXaxes(xScale, xAxis);
        // updates circles and Text with new x values 
        circlesGroup,textCircleGroup = renderXcircles(circlesGroup,textCircleGroup, xScale, xAxisChoice);
        // changes classes to change bold text
        xLabelsGroup.selectAll('text')
          .classed('active',(d,i)=>Object.keys(xData)[i]==xAxisChoice)
          .classed('inactive',(d,i)=>Object.keys(xData)[i]!==xAxisChoice)  
        //  update tooltips with new axis info
        updateToolTip(xAxisChoice,xData[xAxisChoice],yAxisChoice,yData[yAxisChoice],toolTipGroup)
      }
    });
  // y axis labels event listener
  yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      let value = d3.select(this).attr("value");
      if (value !== yAxisChoice) {
        // replaces yAxisChoice with value
        yAxisChoice = value;
      // updates y scale for new data
    yScale = scaleYdata(data,yAxisChoice);

    // updates y axis with transition
    yAxis = renderYaxes(yScale, yAxis);

    // updates circles and Text with new y values 
    circlesGroup,textCircleGroup = renderYcircles(circlesGroup,textCircleGroup, yScale, yAxisChoice);

    // changes classes to change bold text
    yLabelsGroup.selectAll('text')
   .classed('active',(d,i)=>Object.keys(yData)[i]==yAxisChoice)
   .classed('inactive',(d,i)=>Object.keys(yData)[i]!==yAxisChoice)
  //  update tooltips with new axis info
     updateToolTip(xAxisChoice,xData[xAxisChoice],yAxisChoice,yData[yAxisChoice],toolTipGroup)
  }
});



})