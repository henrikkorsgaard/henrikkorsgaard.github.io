/**
 * Electricity Data Visualization - Observable/D3.js Code
 *
 * This file contains the Observable code from the original Quarto documents.
 * The code was used with Observable's reactive runtime and D3.js for creating
 * interactive visualizations of household electricity consumption data.
 *
 * Original files:
 * - notes/electricity-data-visualisation-experiments.qmd
 * - notes/annual-rhythms-in-electricity-consumption.qmd
 *
 * Data source: El Overblik (https://eloverblik.dk/welcome)
 * Location coordinates: Aarhus, Denmark (lat: 56.16, long: 10.20)
 *
 * Dependencies:
 * - D3.js (https://d3js.org/)
 * - Observable runtime
 * - SunCalc.js (for daylight calculations)
 * - simple-statistics (for correlation calculations)
 */

// =============================================================================
// DATA LOADING AND TRANSFORMATION
// =============================================================================

/**
 * Load and transform monthly electricity consumption data
 * Filters out 2017 data and transforms dates
 */
const loadMonthlyData = async (FileAttachment) => {
    const raw = await FileAttachment("/public/data/el-consumption-months-all.csv").csv({typed: true});

    return raw
        .filter(o => {
            const str = o["Fra_dato"].substring(6, 10);
            return o["Type"] === "Tidsserie" && str !== "2017";
        })
        .map(o => {
            const d_str = o["Fra_dato"].replace(" 00:00:00", "").split("-");
            const d = new Date(d_str[2], parseInt(d_str[1]) - 1);
            const v = typeof o["Mængde"] === "string" ? parseInt(o["Mængde"]) : o["Mængde"];
            return {
                date: d,
                kwhs: v,
                year: d.getFullYear(),
                month: d.getMonth(),
                fakedate: new Date(2022, d.getMonth())
            };
        })
        .sort((a, b) => a["date"] > b["date"]);
};

/**
 * Load daily data with median calculations
 */
const loadDailyDataWithMedian = async (FileAttachment, d3) => {
    const raw = await FileAttachment("/public/data/el-consumption-days-all.csv").csv({typed: true});

    const filtered = raw.filter(o => {
        const str = o["Fra_dato"].substring(6, 10);
        return o["Type"] === "Tidsserie" && str !== "2017";
    });

    const median = {};

    const days = filtered.map(o => {
        const d_str = o["Fra_dato"].replace(" 00:00:00", "").split("-");
        const d = new Date(d_str[2], parseInt(d_str[1]) - 1, d_str[0]);
        const f = new Date(2022, parseInt(d_str[1]) - 1, d_str[0]);
        const v = typeof o["Mængde"] === "string" ? parseInt(o["Mængde"]) : o["Mængde"];

        if (!median[f]) {
            median[f] = {date: f, values: [], median: 0};
        }
        median[f].values.push(v);

        return {
            date: d,
            kwhs: v,
            year: d.getFullYear(),
            month: d.getMonth(),
            fakedate: f
        };
    });

    days.sort((a, b) => a["date"] > b["date"]);

    const medianArray = Object.values(median).sort((a, b) => a["date"] > b["date"]);
    medianArray.forEach(o => {
        o.median = d3.median(o.values);
    });

    return [days, medianArray];
};

/**
 * Load and calculate weekly consumption data
 */
const loadWeeklyData = async (FileAttachment, d3) => {
    const raw = await FileAttachment("/public/data/el-consumption-days-all.csv").csv({typed: true});

    const filtered = raw.filter(o => {
        const str = o["Fra_dato"].substring(6, 10);
        return o["Type"] === "Tidsserie" && str !== "2017";
    });

    const weeks = {};

    filtered.forEach(o => {
        const d_str = o["Fra_dato"].replace(" 00:00:00", "").split("-");
        const d = new Date(d_str[2], parseInt(d_str[1]) - 1, d_str[0]);
        const firstday = new Date(d.getFullYear(), 0, 1);
        const pastdays = (d - firstday) / 86400000;
        const week = Math.ceil((pastdays + firstday.getDay() + 1) / 7);
        const v = typeof o["Mængde"] === "string" ? parseInt(o["Mængde"]) : o["Mængde"];
        const year = d_str[2];

        if (!weeks[week]) {
            weeks[week] = {2018: 0, 2019: 0, 2020: 0, 2021: 0, 2022: 0, week: week};
        }

        weeks[week][year] += v;
    });

    const weekArray = Object.values(weeks).sort((a, b) => a["week"] > b["week"]);

    return weekArray.flatMap(o => {
        const inner = [];
        const vals = [];
        for (const key in o) {
            if (key === "week") continue;
            vals.push(o[key]);
            inner.push({year: key, kwhs: o[key], week: o["week"]});
        }
        inner.push({year: "median", median: d3.median(vals), week: o["week"]});
        return inner;
    });
};

/**
 * Load daily data with daylight calculations
 */
const loadDailyDataWithDaylight = async (FileAttachment, SunCalc) => {
    const lat = 56.16, long = 10.20;
    const raw = await FileAttachment("/public/data/el-consumption-days-all.csv").csv({typed: true});

    return raw
        .filter(o => {
            const str = o["Fra_dato"].substring(6, 10);
            return o["Type"] === "Tidsserie" && str !== "2017";
        })
        .map(o => {
            const dstr = o["Fra_dato"].replace(" 00:00:00", "").split("-");
            const date = new Date(`${dstr[2]}-${dstr[1]}-${dstr[0]}`);
            const sun = SunCalc.getTimes(new Date(date), lat, long);
            const daylight = (sun.sunset - sun.sunrise) / 1000 / 60;
            const v = typeof o["Mængde"] === "string" ? parseInt(o["Mængde"]) : o["Mængde"];

            return {date: date, kwhs: v, daylight: daylight};
        })
        .sort((a, b) => a["date"] > b["date"]);
};

// =============================================================================
// VISUALIZATION 1: Monthly Consumption Line Chart
// =============================================================================

const plotMonthlyConsumption = (Plot, months) => {
    return Plot.plot({
        width: 860,
        height: 400,
        marginLeft: 50,
        legend: true,
        x: {
            ticks: 20,
            grid: true,
            label: "Months",
            domain: [months[0]["date"], months[months.length - 1]["date"]]
        },
        y: {
            label: "Consumption (kwhs)",
            grid: true,
            domain: [200, 550]
        },
        marks: [
            Plot.line(months, {x: "date", y: "kwhs", stroke: "darkblue", strokeWidth: 1, curve: "natural"}),
        ]
    });
};

// =============================================================================
// VISUALIZATION 2: Yearly Comparison (overlaid by year)
// =============================================================================

const plotYearlyComparison = (Plot, months) => {
    return Plot.plot({
        width: 860,
        height: 400,
        marginLeft: 50,
        color: {
            type: "categorical",
            scheme: "Dark2",
            legend: true
        },
        x: {
            ticks: 12,
            grid: true,
            label: "Months",
            type: "time",
            tickFormat: "%B",
            domain: [new Date(2022, 0, 1), new Date(2022, 11, 1)]
        },
        y: {
            label: "Consumption (kwhs)",
            grid: true,
            domain: [200, 550]
        },
        marks: [
            Plot.line(months, {filter: d => d.year === 2018, x: "fakedate", y: "kwhs", stroke: "year", strokeWidth: 2, curve: "natural"}),
            Plot.line(months, {filter: d => d.year === 2019, x: "fakedate", y: "kwhs", stroke: "year", strokeWidth: 2, curve: "natural"}),
            Plot.line(months, {filter: d => d.year === 2020, x: "fakedate", y: "kwhs", stroke: "year", strokeWidth: 2, curve: "natural"}),
            Plot.line(months, {filter: d => d.year === 2021, x: "fakedate", y: "kwhs", stroke: "year", strokeWidth: 2, curve: "natural"}),
            Plot.line(months, {filter: d => d.year === 2022, x: "fakedate", y: "kwhs", stroke: "year", strokeWidth: 2, curve: "natural"})
        ]
    });
};

// =============================================================================
// VISUALIZATION 3: Weekly Consumption
// =============================================================================

const plotWeeklyConsumption = (Plot, weeks) => {
    return Plot.plot({
        width: 860,
        height: 400,
        marginLeft: 50,
        color: {
            type: "categorical",
            scheme: "Dark2",
            legend: true
        },
        x: {
            ticks: 26,
            grid: true,
            label: "Weeks",
            domain: [1, 53]
        },
        y: {
            label: "Consumption (kwhs)",
            grid: true,
            domain: [0, 150]
        },
        marks: [
            Plot.line(weeks, {filter: d => d.year === 2018, x: "week", y: "kwhs", stroke: "year", strokeWidth: 1, curve: "natural"}),
            Plot.line(weeks, {filter: d => d.year === 2019, x: "week", y: "kwhs", stroke: "year", strokeWidth: 1, curve: "natural"}),
            Plot.line(weeks, {filter: d => d.year === 2020, x: "week", y: "kwhs", stroke: "year", strokeWidth: 1, curve: "natural"}),
            Plot.line(weeks, {filter: d => d.year === 2021, x: "week", y: "kwhs", stroke: "year", strokeWidth: 1, curve: "natural"}),
            Plot.line(weeks, {filter: d => d.year === 2022, x: "week", y: "kwhs", stroke: "year", strokeWidth: 1, curve: "natural"}),
            Plot.line(weeks, {filter: d => d.year === "median", x: "week", y: "median", stroke: "darkgreen", strokeWidth: 2, curve: "natural"}),
        ]
    });
};

// =============================================================================
// VISUALIZATION 4: Scatterplot - Consumption vs Daylight
// =============================================================================

const plotDaylightScatter = (d3, days_daylight) => {
    const margin = {top: 30, right: 30, bottom: 50, left: 50};
    const width = 800;
    const height = 600;

    const x = d3.scaleLinear().domain([0, 40]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([400, 1100]).range([height - margin.bottom, margin.top]);

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.append("g")
        .selectAll(".dot")
        .data(days_daylight)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.kwhs))
        .attr("cy", (d) => y(d.daylight))
        .attr("r", 2)
        .style("fill", "steelblue");

    svg.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "start")
        .attr("y", 0)
        .attr("dy", ".75em")
        .style("fill", "grey")
        .text("↓ Daylight in minutes");

    svg.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "end")
        .attr("y", height - margin.bottom / 2)
        .attr("x", width - margin.right)
        .attr("dy", ".75em")
        .style("fill", "grey")
        .text("← Consumption in Kilowatt hours");

    return svg.node();
};

// =============================================================================
// VISUALIZATION 5: Radial Annual Chart (main visualization)
// =============================================================================

const plotRadialAnnualChart = (d3, DOM, data) => {
    const width = 900;
    const height = 900;
    const innerRadius = width / 5;
    const outerRadius = width / 2;

    const x = d3.scaleTime()
        .domain([new Date(2022, 0, 1), new Date(2022, 11, 31)])
        .range([0, 2 * Math.PI]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.kwhs_min), d3.max(data, d => d.kwhs_max) + 2])
        .range([innerRadius, outerRadius]);

    const area = d3.areaRadial()
        .curve(d3.curveBasis)
        .angle(d => x(d.date));

    const line = d3.lineRadial()
        .curve(d3.curveBasis)
        .angle(d => x(d.date));

    const xAxis = g => g
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .call(g => g.selectAll("g")
            .data(x.ticks())
            .join("g")
            .each((d, i) => d.id = DOM.uid("month"))
            .call(g => g.append("path")
                .attr("stroke", "#000")
                .attr("stroke-opacity", 0.2)
                .attr("d", d => `
                    M${d3.pointRadial(x(d), innerRadius)}
                    L${d3.pointRadial(x(d), outerRadius)}
                `))
            .call(g => g.append("path")
                .attr("id", d => d.id.id)
                .datum(d => [d, d3.timeMonth.offset(d, 1)])
                .attr("fill", "none")
                .attr("d", ([a, b]) => `
                    M${d3.pointRadial(x(a), innerRadius - 15)}
                    A${innerRadius},${innerRadius} 0,0,1 ${d3.pointRadial(x(b), innerRadius - 15)}
                `))
            .call(g => g.append("text")
                .append("textPath")
                .attr("startOffset", 2)
                .attr("xlink:href", d => d.id.href)
                .text(d3.timeFormat("%B"))));

    const yAxis = g => g
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .call(g => g.append("circle")
            .attr("stroke", "#000")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.2)
            .attr("r", y(0)))
        .call(g => g.selectAll("g")
            .data(y.ticks().reverse())
            .join("g")
            .attr("fill", "none")
            .call(g => g.append("circle")
                .attr("stroke", "#000")
                .attr("stroke-opacity", 0.2)
                .attr("r", y))
            .call(g => g.append("text")
                .attr("y", d => -y(d))
                .attr("dy", "0.5em")
                .attr("stroke", "#fff")
                .attr("stroke-width", 5)
                .text((x, i) => `${x.toFixed(0)}${i ? "" : " kwhs"}`)
                .clone(true)
                .attr("y", d => y(d))
                .selectAll(function () {
                    return [this, this.previousSibling];
                })
                .clone(true)
                .attr("fill", "currentColor")
                .attr("stroke", "none")));

    const svg = d3.create("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

    // Daylight hours (yellow background)
    svg.append("path")
        .attr("fill", "lightyellow")
        .attr("d", area
            .innerRadius(d => y(0))
            .outerRadius(d => y(d.day_hs))
            (data));

    // Min/max range (light blue)
    svg.append("path")
        .attr("fill", "lightsteelblue")
        .attr("fill-opacity", 1)
        .attr("d", area
            .innerRadius(d => y(d.kwhs_min))
            .outerRadius(d => y(d.kwhs_max))
            (data));

    // Quartile range (darker blue)
    svg.append("path")
        .attr("fill", "steelblue")
        .attr("fill-opacity", 1)
        .attr("d", area
            .innerRadius(d => y(d.kwhs_q_lower))
            .outerRadius(d => y(d.kwhs_q_upper))
            (data));

    // Median line
    svg.append("path")
        .attr("fill", "none")
        .attr("class", "median")
        .attr("stroke", "darkblue")
        .attr("stroke-width", 1)
        .attr("d", line
            .radius(d => y(d.kwhs_median))
            (data));

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${-width / 2},${-height / 2})`);
    legend.attr("font-family", "sans-serif").attr("font-size", 16);

    const legendItems = [
        {color: "lightsteelblue", text: "Minimum and maximum consumption 2018 - 2022"},
        {color: "steelblue", text: "Upper and lower quartiles consumption (kwhs)"},
        {color: "darkblue", text: "Median consumption (kwhs)"},
        {color: "lightyellow", text: "Daylight hours", stroke: "grey"}
    ];

    legendItems.forEach((item, i) => {
        legend.append("rect")
            .attr("x", 2)
            .attr("y", i * 25)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", item.color)
            .attr("stroke", item.stroke || "none");

        legend.append("text")
            .attr("x", 27)
            .attr("y", i * 25)
            .attr("dy", "1em")
            .text(item.text);
    });

    return svg.node();
};

// =============================================================================
// DATA TRANSFORMATION FOR RADIAL CHART
// =============================================================================

const loadRadialData = async (FileAttachment, d3, SunCalc) => {
    const lat = 56.16, long = 10.20;
    const raw = await FileAttachment("/public/data/el-consumption-days-all.csv").csv({typed: true});

    const filtered = raw.filter(o => {
        const str = o["Fra_dato"].substring(6, 10);
        return o["Type"] === "Tidsserie" && str !== "2017";
    });

    const days = {};

    filtered.forEach(o => {
        const dstr = o["Fra_dato"].replace(" 00:00:00", "").split("-");

        // Skip leap year day
        if (dstr[1] === "02" && dstr[0] === "29") return;

        const date = new Date(`2022-${dstr[1]}-${dstr[0]}`);

        if (!days[date]) {
            const sun = SunCalc.getTimes(new Date(date), lat, long);
            const day_hs = sun.sunset.getHours() - sun.sunrise.getHours();
            days[date] = {
                date: date,
                kwhs_min: 100,
                kwhs_max: 0,
                kwhs_values: [],
                kwhs_median: 0,
                kwhs_q_lower: 0,
                kwhs_q_upper: 0,
                day_hs: day_hs
            };
        }

        const v = typeof o["Mængde"] === "string" ? parseInt(o["Mængde"]) : o["Mængde"];
        days[date].kwhs_values.push(v);
        days[date].kwhs_min = v < days[date].kwhs_min ? v : days[date].kwhs_min;
        days[date].kwhs_max = v > days[date].kwhs_max ? v : days[date].kwhs_max;
    });

    const result = Object.values(days)
        .sort((a, b) => a["date"] > b["date"])
        .map(o => {
            o.kwhs_median = d3.median(o.kwhs_values);
            o.kwhs_q_lower = d3.quantile(o.kwhs_values, 0.25);
            o.kwhs_q_upper = d3.quantile(o.kwhs_values, 0.75);
            return o;
        });

    return result;
};

// =============================================================================
// CORRELATION CALCULATION
// =============================================================================

const calculateCorrelation = (simplestats, days) => {
    const kwhs_array = days.map(d => d.kwhs);
    const daylight_array = days.map(d => d.daylight);
    return simplestats.sampleCorrelation(kwhs_array, daylight_array);
};

// =============================================================================
// EXPORTS (for potential future use)
// =============================================================================

// Note: In Observable, these would be reactive cells.
// To use in a standalone context, you would need to:
// 1. Include D3.js and Observable Plot
// 2. Include SunCalc.js for daylight calculations
// 3. Include simple-statistics for correlation
// 4. Load the CSV data files
// 5. Call the visualization functions with the appropriate data
