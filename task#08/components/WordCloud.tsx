
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { WordData } from '../types.ts';

interface WordCloudProps {
  words: WordData[];
  width?: number;
  height?: number;
}

const WordCloud: React.FC<WordCloudProps> = ({ words, width = 800, height = 500 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!words || words.length === 0 || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const maxVal = d3.max(words, d => d.size) || 1;
    const minVal = d3.min(words, d => d.size) || 1;
    
    const fontSizeScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([24, 100]);

    // Premium music-themed color scale
    const colorScale = d3.scaleOrdinal()
      .range(["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#f43f5e", "#10b981"]);

    const layout = cloud()
      .size([width, height])
      .words(words.map(d => ({ text: d.text, size: fontSizeScale(d.size) })))
      .padding(8)
      .rotate(() => (~~(Math.random() * 2) * 90) - 45) // Better tilt angles
      .font("Outfit")
      .fontSize(d => d.size!)
      .on("end", draw);

    layout.start();

    function draw(wordsArr: any[]) {
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      svg.selectAll("text")
        .data(wordsArr)
        .enter().append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Outfit")
        .style("font-weight", "900")
        .style("fill", (_, i) => colorScale(i.toString()) as string)
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text)
        .style("cursor", "pointer")
        .style("transition", "all 0.3s ease")
        .on("mouseover", function() {
            d3.select(this)
              .transition().duration(200)
              .style("opacity", 0.5)
              .style("filter", "brightness(1.5)");
        })
        .on("mouseout", function() {
            d3.select(this)
              .transition().duration(200)
              .style("opacity", 1)
              .style("filter", "none");
        });
    }
  }, [words, width, height]);

  return (
    <div className="word-cloud-container">
      <svg ref={svgRef} className="word-cloud-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};

export default WordCloud;
