import * as R from 'ramda';
import * as d3 from 'd3';
import Sigma from 'sigma';
import { UndirectedGraph } from 'graphology';
import noverlap from 'graphology-layout-noverlap';
import forceLayout from 'graphology-layout-force';

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
    labelDensity: 1,
    labelGridCellSize: 1,
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

