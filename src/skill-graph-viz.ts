import * as R from 'ramda';
import * as d3 from 'd3';
import Sigma from 'sigma';
import { UndirectedGraph } from 'graphology';

type JobId = string;
type SkillId = string;

type JobRecommendation = {
  scores: {job: {id: JobId, name: string}, score: number}[],
  skill_graph: {
    edges: [SkillId, SkillId][],
    layout: Record<SkillId, [number, number]>,
    centrality: Record<SkillId, number>,
  },
};

type Skills = Record<string, {name: string}>

export function skillGraphViz(
    jobRecommendation: JobRecommendation,
    skills: Skills,
    skillGraphVizElementId: string,
    zoomInElementId: string,
    zoomOutElementId: string,
    nodeSize: number = 10,
  ) {

  const graph = new UndirectedGraph();

  const centralityExtent = d3.extent(
    R.values(jobRecommendation.skill_graph.centrality)
  )

  const colorScale = d3.scaleSequential()
  colorScale.domain(centralityExtent[0] === undefined ? [1, 1] : centralityExtent);
  colorScale.range([0, 0.1]);
  colorScale.clamp(true);
  colorScale.interpolator(d3.interpolateCool);

  for (let [u, v] of jobRecommendation.skill_graph.edges ) {
    for (let n of [u, v]) {
      const [x, y] = jobRecommendation.skill_graph.layout[n];
      graph.mergeNode(n, {
        label: skills[n].name,
        color: colorScale(jobRecommendation.skill_graph.centrality[n]),
        size: nodeSize,
        x: x,
        y: y,
      })
    }
    graph.mergeEdge(u, v)
  }

  const container = document.getElementById(skillGraphVizElementId);
  const zoomInBtn = document.getElementById(zoomInElementId);
  const zoomOutBtn = document.getElementById(zoomOutElementId);

  const renderer = new Sigma(graph, container, {
    minCameraRatio: 0.1,
    maxCameraRatio: 10,
    labelRenderedSizeThreshold: 0,
  });

  const camera = renderer.getCamera();

  zoomInBtn.addEventListener("click", () => {
    camera.animatedZoom({ duration: 100 });
  });
  zoomOutBtn.addEventListener("click", () => {
    camera.animatedUnzoom({ duration: 100 });
  });
}


// export function skillGraphViz(jobRecommendation: JobRecommendation, skills: Skills) {
//   const circleRadius=0.02
// 
//   const xScale = d3.scaleLinear();
//   xScale.domain([-1, 1]);
//   xScale.range([0 + circleRadius, 1 - circleRadius]);
// 
//   const yScale = d3.scaleLinear()
//   yScale.domain([-1, 1 + circleRadius]);
//   yScale.range([0 + circleRadius, 1 - circleRadius]);
// 
//   const centralityExtent = d3.extent(R.map(({score}) => score,
//                                            jobRecommendation.scores)
//                                     )
// 
//   const colorScale = d3.scaleSequential()
//   colorScale.domain(centralityExtent[0] === undefined ? [1, 1] : centralityExtent);
//   colorScale.range([0, 0.1]);
//   colorScale.clamp(true);
//   colorScale.interpolator(d3.interpolateGnBu);
// 
//   const svg = d3.create("svg:svg")
//     .attr("viewBox", "0 0 1 1");
// 
//   const nodes = svg.append("g");
//   const edges = svg.append("g");
// 
//   // Nodes
//   nodes.selectAll("g")
//     .data(Object.entries(jobRecommendation.skill_graph.layout))
//     .join("g")
//     .append(([skillId, coords]) => d3.create("svg:circle")
//       .attr("cx", xScale(coords[0]))
//       .attr("cy", yScale(coords[1]))
//       .attr("r", circleRadius)
//       .attr("fill", `${colorScale(jobRecommendation.skill_graph.centrality[skillId])}`)
//       .node())
// 
//   nodes.selectAll("g")
//     .data(Object.entries(jobRecommendation.skill_graph.layout))
//     .join("g")
//     .append(([skillId, coords]) => d3.create("svg:text")
//       .attr("x", xScale(coords[0]))
//       .attr("y", yScale(coords[1]))
//       .attr("font-size", "0.2%")
//       .attr("fill", "black")
//       .text(skills?.[skillId].name)
//       .node());
// 
//   // Edges
//   edges.selectAll("line")
//     .data(jobRecommendation.skill_graph.edges)
//     .join("line")
//     .attr("x1", ([u, _]) => xScale(jobRecommendation.skill_graph.layout[u][0]))
//     .attr("y2", ([u, _]) => yScale(jobRecommendation.skill_graph.layout[u][1]))
//     .attr("x2", ([_, v]) => xScale(jobRecommendation.skill_graph.layout[v][0]))
//     .attr("y2", ([_, v]) => yScale(jobRecommendation.skill_graph.layout[v][1]))
//     .attr("stroke-width", circleRadius / 10)
//     .attr("stroke", "steelblue");
// 
//  return svg.node();
// }
