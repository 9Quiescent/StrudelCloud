import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useStrudel } from "../context/StrudelProvider";

export default function GainGraph({
    width = 520,
    height = 180,
    maxPoints = 90,   // around 20s at 8 samples/sec
    sampleMs = 125,   
}) {
    const { controls } = useStrudel();
    const svgRef = useRef(null);
    const dataRef = useRef([]);      
    const bootRef = useRef(false);
    const gainRef = useRef(controls.gain ?? 1.2);

    // this is to always grab the latest gain which therefore has the interval read fresh values
    useEffect(() => { gainRef.current = Number(controls.gain ?? 1.2); }, [controls.gain]);

    // sampler
    useEffect(() => {
        const id = setInterval(() => {
            const v = gainRef.current;          
            const t = Date.now();
            const arr = dataRef.current;
            arr.push({ t, v });
            if (arr.length > maxPoints) arr.shift();
            draw();
        }, sampleMs);
        return () => clearInterval(id);
    }, [maxPoints, sampleMs]);

    // one-time SVG scaffolding
    useEffect(() => {
        if (bootRef.current) return;
        bootRef.current = true;

        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        svg.append("g").attr("class", "plot");
        svg.append("g").attr("class", "x-axis");
        svg.append("g").attr("class", "y-axis");

        draw();
    }, [width, height]);

    function draw() {
        const svg = d3.select(svgRef.current);
        const plot = svg.select(".plot");

        const margin = { top: 8, right: 12, bottom: 22, left: 36 };
        const w = width - margin.left - margin.right;
        const h = height - margin.top - margin.bottom;

        const data = dataRef.current.length
            ? dataRef.current
            : [{ t: Date.now(), v: gainRef.current }];

        // X uses “index space” and therefore bars stay evenly spaced + just scroll
        const x = d3.scaleBand()
            .domain(d3.range(data.length))
            .range([0, w])
            .paddingInner(0.15);

        // Y maps gain 
        const yMax = Math.max(3, d3.max(data, d => d.v) || 1.2);
        const y = d3.scaleLinear().domain([0, yMax]).nice().range([h, 0]);

        // axes 
        svg.select(".x-axis")
            .attr("transform", `translate(${margin.left},${margin.top + h})`)
            .call(d3.axisBottom(d3.scaleLinear().domain([0, data.length]).range([0, w])).ticks(4).tickFormat(() => ""));

        svg.select(".y-axis")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(d3.axisLeft(y).ticks(4));

        const bars = plot
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .selectAll("rect.vu")
            .data(data, (_, i) => i);

        bars.join(
            enter => enter.append("rect")
                .attr("class", "vu")
                .attr("x", (_, i) => x(i))
                .attr("width", x.bandwidth())
                .attr("y", y(0))
                .attr("height", 0)
                .attr("rx", 2).attr("ry", 2)
                .attr("fill", "#26c281")            // this produces the green for the bars
                .transition().duration(sampleMs * 0.9)
                .attr("y", d => y(d.v))
                .attr("height", d => h - y(d.v)),
            update => update
                .attr("x", (_, i) => x(i))
                .attr("width", x.bandwidth())
                .transition().duration(sampleMs * 0.9)
                .attr("y", d => y(d.v))
                .attr("height", d => h - y(d.v)),
            exit => exit
                .transition().duration(sampleMs * 0.6)
                .attr("y", y(0))
                .attr("height", 0)
                .remove()
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">Try Moving the Gain Slider!</span>
            </div>
            <svg ref={svgRef} className="w-100 rounded border" />
        </div>
    );
}
